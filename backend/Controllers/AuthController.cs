using System.Security.Claims;
using Backend.DTOs;
using IRS.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
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
        public async Task<ActionResult<UsuarioDTO>> Login([FromBody] LoginDTO loginDto)
        {
            HttpContext.Items["AuditoriaUsuarioNombre"] = loginDto.User;

            if (string.IsNullOrWhiteSpace(loginDto.User))
                return BadRequest(new { error = "El campo 'usuario' es requerido" });

            if (string.IsNullOrWhiteSpace(loginDto.Password))
                return BadRequest(new { error = "El campo 'password' es requerido" });

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
            EscribirCookieJwt(session);
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

        private int? GetUserId()
        {
            return int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
                ? id
                : null;
        }

        private Guid? GetSessionId()
        {
            return Guid.TryParse(User.FindFirstValue("sid"), out var sessionId)
                ? sessionId
                : null;
        }

        private void EscribirCookieJwt(TokenSesionDTO session)
        {
            Response.Cookies.Append(
                _configuration["Jwt:CookieName"] ?? "irs_access_token",
                session.Token,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    IsEssential = true,
                    Path = "/",
                    Expires = session.ExpirationDate
                });
        }

        private void DeleteJwtCookie()
        {
            Response.Cookies.Delete(
                _configuration["Jwt:CookieName"] ?? "irs_access_token",
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    IsEssential = true,
                    Path = "/"
                });
        }
    }
}
