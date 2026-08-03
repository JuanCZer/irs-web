using Backend.DTOs;
using Backend.Services;
using IRS.API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    public class UsuariosController : ControllerBase
    {
        private readonly IUsuariosService _usersService;

        public UsuariosController(IUsuariosService usersService)
        {
            _usersService = usersService;
        }


        [HttpGet]
        public async Task<ActionResult<List<UsuarioDTO>>> GetAllUsers()
        {
            try
            {
                var users = await _usersService.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al obtener los usuarios", details = ex.Message });
            }
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<UsuarioDTO>> GetUserById(int id)
        {
            try
            {
                var user = await _usersService.GetUserByIdAsync(id);

                if (user == null)
                {
                    return NotFound(new { error = $"Usuario con ID {id} no encontrado" });
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al obtener el usuario", details = ex.Message });
            }
        }


        [HttpPost]
        public async Task<ActionResult<UsuarioDTO>> CreateUser([FromBody] CrearUsuarioDTO userDto)
        {
            try
            {
                userDto.CreatorUserId = int.Parse(
                    User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                if (string.IsNullOrWhiteSpace(userDto.User))
                {
                    return BadRequest(new { error = "El campo 'usuario' es requerido" });
                }

                if (string.IsNullOrWhiteSpace(userDto.Password))
                {
                    return BadRequest(new { error = "El campo 'password' es requerido" });
                }

                var user = await _usersService.CreateUserAsync(userDto);
                HttpContext.Items["AuditoriaEntidadId"] = user.UserId;
                return CreatedAtAction(nameof(GetUserById), new { id = user.UserId }, user);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al crear el usuario", details = ex.Message });
            }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] ActualizarUsuarioDTO userDto)
        {
            try
            {
                var result = await _usersService.UpdateUserAsync(id, userDto);

                if (!result)
                {
                    return NotFound(new { error = $"Usuario con ID {id} no encontrado" });
                }

                return Ok(new { message = "Usuario actualizado correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al actualizar el usuario", details = ex.Message });
            }
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var result = await _usersService.DeleteUserAsync(id);

                if (!result)
                {
                    return NotFound(new { error = $"Usuario con ID {id} no encontrado" });
                }

                return Ok(new { message = "Usuario eliminado correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al eliminar el usuario", details = ex.Message });
            }
        }
    }
}
