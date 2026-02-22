using Backend.DTOs;
using Backend.Services;
using IRS.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUsuariosService _usuariosService;

        public AuthController(IUsuariosService usuariosService)
        {
            _usuariosService = usuariosService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<UsuarioDTO>> Login([FromBody] LoginDTO loginDto)
        {
            try
            {

                if (string.IsNullOrWhiteSpace(loginDto.Usuario))
                {
                    return BadRequest(new { error = "El campo 'usuario' es requerido" });
                }

                if (string.IsNullOrWhiteSpace(loginDto.Password))
                {
                    return BadRequest(new { error = "El campo 'password' es requerido" });
                }

                var usuario = await _usuariosService.ValidarCredencialesAsync(loginDto.Usuario, loginDto.Password);

                if (usuario == null)
                {
                    return Unauthorized(new { error = "Usuario o contraseña incorrectos" });
                }
                return Ok(usuario);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al procesar el login", detalle = ex.Message });
            }
        }

        [HttpPost("cambiar-contrasena")]
        public async Task<ActionResult<RespuestaCambioContrasenaDTO>> CambiarContrasena([FromBody] CambiarContrasenaDTO cambioContraseñaDto)
        {
            try
            {

                if (cambioContraseñaDto == null)
                {
                    return BadRequest(new RespuestaCambioContrasenaDTO
                    {
                        Exitoso = false,
                        Mensaje = "Los datos de cambio de contraseña son requeridos",
                        Errores = new List<string> { "El body no puede estar vacío" }
                    });
                }

                var resultado = await _usuariosService.CambiarContrasenaAsync(cambioContraseñaDto);

                if (!resultado.Exitoso)
                {
                    return BadRequest(resultado);
                }
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new RespuestaCambioContrasenaDTO
                {
                    Exitoso = false,
                    Mensaje = "Error al procesar el cambio de contraseña",
                    Errores = new List<string> { ex.Message }
                });
            }
        }
    }
}
