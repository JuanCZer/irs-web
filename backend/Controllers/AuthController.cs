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
        private readonly IUsuariosService _usuariosService;
        private readonly ISesionService _sesionService;
        private readonly IConfiguration _configuration;

        public AuthController(
            IUsuariosService usuariosService,
            ISesionService sesionService,
            IConfiguration configuration)
        {
            _usuariosService = usuariosService;
            _sesionService = sesionService;
            _configuration = configuration;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<UsuarioDTO>> Login([FromBody] LoginDTO loginDto)
        {
            HttpContext.Items["AuditoriaUsuarioNombre"] = loginDto.Usuario;

            if (string.IsNullOrWhiteSpace(loginDto.Usuario))
                return BadRequest(new { error = "El campo 'usuario' es requerido" });

            if (string.IsNullOrWhiteSpace(loginDto.Password))
                return BadRequest(new { error = "El campo 'password' es requerido" });

            var usuario = await _usuariosService.ValidarCredencialesAsync(
                loginDto.Usuario,
                loginDto.Password);

            if (usuario == null)
                return Unauthorized(new { error = "Usuario o contraseña incorrectos" });

            var sesion = await _sesionService.CrearSesionAsync(
                usuario,
                HttpContext.Connection.RemoteIpAddress?.ToString(),
                Request.Headers.UserAgent.ToString());

            HttpContext.Items["AuditoriaUsuarioId"] = usuario.IdUsuario;
            EscribirCookieJwt(sesion);
            return Ok(usuario);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UsuarioDTO>> ObtenerSesionActual()
        {
            var idUsuario = ObtenerIdUsuario();
            if (!idUsuario.HasValue) return Unauthorized();

            var usuario = await _usuariosService.ObtenerUsuarioPorIdAsync(idUsuario.Value);
            return usuario == null ? Unauthorized() : Ok(usuario);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var idSesion = ObtenerIdSesion();
            if (idSesion.HasValue)
                await _sesionService.RevocarSesionAsync(idSesion.Value, "Cierre de sesión del usuario");

            EliminarCookieJwt();
            return NoContent();
        }

        [HttpPost("cambiar-contrasena")]
        [Authorize]
        public async Task<ActionResult<RespuestaCambioContrasenaDTO>> CambiarContrasena(
            [FromBody] CambiarContrasenaDTO cambioContraseñaDto)
        {
            var idUsuario = ObtenerIdUsuario();
            if (!idUsuario.HasValue) return Unauthorized();

            var resultado = await _usuariosService.CambiarContrasenaAsync(
                idUsuario.Value,
                cambioContraseñaDto);

            if (!resultado.Exitoso) return BadRequest(resultado);

            await _sesionService.RevocarOtrasSesionesAsync(
                idUsuario.Value,
                ObtenerIdSesion(),
                "Contraseña modificada");

            return Ok(resultado);
        }

        private int? ObtenerIdUsuario()
        {
            return int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
                ? id
                : null;
        }

        private Guid? ObtenerIdSesion()
        {
            return Guid.TryParse(User.FindFirstValue("sid"), out var idSesion)
                ? idSesion
                : null;
        }

        private void EscribirCookieJwt(TokenSesionDTO sesion)
        {
            Response.Cookies.Append(
                _configuration["Jwt:CookieName"] ?? "irs_access_token",
                sesion.Token,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    IsEssential = true,
                    Path = "/",
                    Expires = sesion.FechaExpiracion
                });
        }

        private void EliminarCookieJwt()
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
