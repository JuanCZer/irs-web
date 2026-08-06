using System.Security.Claims;
using Backend.DTOs;
using Backend.Exceptions;
using IRS.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "ADMIN")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuariosService _usersService;
    private readonly ISesionService _sessionService;

    public UsuariosController(
        IUsuariosService usersService,
        ISesionService sessionService)
    {
        _usersService = usersService;
        _sessionService = sessionService;
    }

    [HttpGet]
    public async Task<ActionResult<List<UsuarioDTO>>> GetAllUsers() =>
        Ok(await _usersService.GetAllUsersAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UsuarioDTO>> GetUserById(int id)
    {
        var user = await _usersService.GetUserByIdAsync(id);
        return user == null
            ? NotFound(new { error = "Usuario no encontrado" })
            : Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<UsuarioDTO>> CreateUser([FromBody] CrearUsuarioDTO userDto)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var creatorId))
            return Unauthorized();

        userDto.CreatorUserId = creatorId;
        userDto.CreatorIp = HttpContext.Connection.RemoteIpAddress?.ToString();

        try
        {
            var user = await _usersService.CreateUserAsync(userDto);
            HttpContext.Items["AuditoriaEntidadId"] = user.UserId;
            return CreatedAtAction(nameof(GetUserById), new { id = user.UserId }, user);
        }
        catch (ConflictException exception)
        {
            return Conflict(new { error = exception.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] ActualizarUsuarioDTO userDto)
    {
        try
        {
            var result = await _usersService.UpdateUserAsync(id, userDto);
            if (!result) return NotFound(new { error = "Usuario no encontrado" });

            if (userDto.Password != null || userDto.RoleId.HasValue || userDto.Status.HasValue)
            {
                await _sessionService.RevokeOtherSessionsAsync(
                    id,
                    null,
                    "Credenciales o permisos modificados por un administrador");
            }

            return Ok(new { message = "Usuario actualizado correctamente" });
        }
        catch (ConflictException exception)
        {
            return Conflict(new { error = exception.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var result = await _usersService.DeleteUserAsync(id);
        if (!result) return NotFound(new { error = "Usuario no encontrado" });

        await _sessionService.RevokeOtherSessionsAsync(
            id,
            null,
            "Usuario desactivado por un administrador");

        return Ok(new { message = "Usuario eliminado correctamente" });
    }
}
