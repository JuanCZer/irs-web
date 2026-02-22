using Backend.DTOs;
using Backend.Services;
using IRS.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly IUsuariosService _usuariosService;

        public UsuariosController(IUsuariosService usuariosService)
        {
            _usuariosService = usuariosService;
        }

        // GET: api/usuarios
        [HttpGet]
        public async Task<ActionResult<List<UsuarioDTO>>> ObtenerTodosLosUsuarios()
        {
            try
            {
                var usuarios = await _usuariosService.ObtenerTodosLosUsuariosAsync();
                return Ok(usuarios);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al obtener los usuarios", detalle = ex.Message });
            }
        }

        // GET: api/usuarios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UsuarioDTO>> ObtenerUsuarioPorId(int id)
        {
            try
            {
                var usuario = await _usuariosService.ObtenerUsuarioPorIdAsync(id);

                if (usuario == null)
                {
                    return NotFound(new { error = $"Usuario con ID {id} no encontrado" });
                }

                return Ok(usuario);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al obtener el usuario", detalle = ex.Message });
            }
        }

        // POST: api/usuarios
        [HttpPost]
        public async Task<ActionResult<UsuarioDTO>> CrearUsuario([FromBody] CrearUsuarioDTO usuarioDto)
        {
            try
            {
                
                if (string.IsNullOrWhiteSpace(usuarioDto.Usuario))
                {
                    return BadRequest(new { error = "El campo 'usuario' es requerido" });
                }

                if (string.IsNullOrWhiteSpace(usuarioDto.Password))
                {
                    return BadRequest(new { error = "El campo 'password' es requerido" });
                }

                var usuario = await _usuariosService.CrearUsuarioAsync(usuarioDto);
                return CreatedAtAction(nameof(ObtenerUsuarioPorId), new { id = usuario.IdUsuario }, usuario);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al crear el usuario", detalle = ex.Message });
            }
        }

        // PUT: api/usuarios/5
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarUsuario(int id, [FromBody] ActualizarUsuarioDTO usuarioDto)
        {
            try
            {
                var resultado = await _usuariosService.ActualizarUsuarioAsync(id, usuarioDto);

                if (!resultado)
                {
                    return NotFound(new { error = $"Usuario con ID {id} no encontrado" });
                }

                return Ok(new { mensaje = "Usuario actualizado correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al actualizar el usuario", detalle = ex.Message });
            }
        }

        // DELETE: api/usuarios/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarUsuario(int id)
        {
            try
            {
                var resultado = await _usuariosService.EliminarUsuarioAsync(id);

                if (!resultado)
                {
                    return NotFound(new { error = $"Usuario con ID {id} no encontrado" });
                }

                return Ok(new { mensaje = "Usuario eliminado correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al eliminar el usuario", detalle = ex.Message });
            }
        }
    }
}
