using System.Security.Claims;
using Backend.DTOs;
using IRS.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IUsuariosService _usersService;
    private readonly ISesionService _sessionService;
    private readonly IConfiguration _configuration;

    public AuthController(
        IUsuariosService usersService,
        ISesionService sessionService,
        IConfiguration configuration)
    {
        _usersService = usersService;
        _sessionService = sessionService;
        _configuration = configuration;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("login")]
    public async Task<ActionResult<UsuarioDTO>> Login([FromBody] LoginDTO loginDto)
    {
        HttpContext.Items["AuditoriaUsuarioNombre"] = Limit(loginDto.User.Trim(), 100);

        var user = await _usersService.ValidateCredentialsAsync(
            loginDto.User,
            loginDto.Password);

        if (user == null)
            return Unauthorized(new { error = "Usuario o contraseña incorrectos" });

        var session = await _sessionService.CreateSessionAsync(
            user,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString());

        HttpContext.Items["AuditoriaUsuarioId"] = user.UserId;
        WriteJwtCookie(session);
        return Ok(user);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UsuarioDTO>> GetCurrentSession()
    {
        var userId = GetUserId();
        if (!userId.HasValue) return Unauthorized();

        var user = await _usersService.GetUserByIdAsync(userId.Value);
        return user == null ? Unauthorized() : Ok(user);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var sessionId = GetSessionId();
        if (sessionId.HasValue)
            await _sessionService.RevokeSessionAsync(sessionId.Value, "Cierre de sesión del usuario");

        DeleteJwtCookie();
        return NoContent();
    }

    [HttpPost("cambiar-contrasena")]
    [Authorize]
    public async Task<ActionResult<RespuestaCambioContrasenaDTO>> ChangePassword(
        [FromBody] CambiarContrasenaDTO passwordChangeDto)
    {
        var userId = GetUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await _usersService.ChangePasswordAsync(
            userId.Value,
            passwordChangeDto);

        if (!result.Successful) return BadRequest(result);

        await _sessionService.RevokeOtherSessionsAsync(
            userId.Value,
            GetSessionId(),
            "Contraseña modificada");

        return Ok(result);
    }

    private int? GetUserId() =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
            ? id
            : null;

    private Guid? GetSessionId() =>
        Guid.TryParse(User.FindFirstValue("sid"), out var sessionId)
            ? sessionId
            : null;

    private void WriteJwtCookie(TokenSesionDTO session)
    {
        Response.Cookies.Append(
            GetCookieName(),
            session.Token,
            BuildCookieOptions(session.ExpirationDate));

        if (!string.Equals(GetCookieName(), "irs_access_token", StringComparison.Ordinal))
            Response.Cookies.Delete("irs_access_token", BuildCookieOptions(null));
    }

    private void DeleteJwtCookie()
    {
        Response.Cookies.Delete(GetCookieName(), BuildCookieOptions(null));
        Response.Cookies.Delete("irs_access_token", BuildCookieOptions(null));
    }

    private CookieOptions BuildCookieOptions(DateTimeOffset? expiration)
    {
        var sameSiteText = _configuration["Jwt:CookieSameSite"] ?? "Lax";
        Enum.TryParse<SameSiteMode>(sameSiteText, true, out var sameSite);

        return new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = sameSite,
            IsEssential = true,
            Path = "/",
            Expires = expiration,
            MaxAge = expiration.HasValue
                ? expiration.Value - DateTimeOffset.UtcNow
                : null
        };
    }

    private string GetCookieName() =>
        _configuration["Jwt:CookieName"] ?? "__Host-irs_access_token";

    private static string Limit(string value, int maximumLength) =>
        value.Length <= maximumLength ? value : value[..maximumLength];
}
