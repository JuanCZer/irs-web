using System.Security.Claims;
using System.Text.Json;
using Backend.DTOs;
using IRS.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AuditoriaController : ControllerBase
    {
        private readonly IAuditoriaService _auditoriaService;

        public AuditoriaController(IAuditoriaService auditoriaService)
        {
            _auditoriaService = auditoriaService;
        }

        [HttpGet]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<AuditoriaPaginaDTO>> Consultar(
            [FromQuery] AuditoriaConsultaDTO consulta)
        {
            return Ok(await _auditoriaService.ConsultarAsync(consulta));
        }

        [HttpPost("eventos")]
        public async Task<IActionResult> RegistrarNavegacion(
            [FromBody] RegistrarEventoAuditoriaDTO evento)
        {
            var idUsuario = ObtenerIdUsuario();
            if (!idUsuario.HasValue) return Unauthorized();

            var ruta = string.IsNullOrWhiteSpace(evento.Ruta) ? "/" : evento.Ruta.Trim();
            if (ruta.Length > 500) ruta = ruta[..500];

            await _auditoriaService.RegistrarAsync(idUsuario, new RegistroAuditoriaDTO
            {
                Accion = "ABRIR_PANTALLA",
                Modulo = "NAVEGACION",
                Descripcion = $"Abrió la pantalla {ObtenerNombrePantalla(ruta)}",
                MetodoHttp = Request.Method,
                Ruta = ruta,
                DireccionIp = HttpContext.Connection.RemoteIpAddress?.ToString(),
                AgenteUsuario = Request.Headers.UserAgent.ToString(),
                CodigoEstado = StatusCodes.Status201Created,
                Exitoso = true,
                Detalles = JsonSerializer.Serialize(new { ruta })
            });

            return StatusCode(StatusCodes.Status201Created);
        }

        private int? ObtenerIdUsuario()
        {
            return int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
                ? id
                : null;
        }

        private static string ObtenerNombrePantalla(string ruta)
        {
            if (ruta.StartsWith("/inicio")) return "Resumen operativo";
            if (ruta.StartsWith("/fichas/registrar")) return "Registrar ficha";
            if (ruta.StartsWith("/fichas/borradores")) return "Borradores de fichas";
            if (ruta.StartsWith("/consultar-fichas")) return "Consulta de fichas";
            if (ruta.StartsWith("/mapa-fichas")) return "Mapa de fichas";
            if (ruta.StartsWith("/despacho")) return "Despacho";
            if (ruta.StartsWith("/estadisticas")) return "Estadísticas";
            if (ruta.StartsWith("/admin-usuarios")) return "Administración de usuarios";
            if (ruta.StartsWith("/auditoria")) return "Bitácora de actividad";
            if (ruta.StartsWith("/perfil")) return "Seguridad de la cuenta";
            return ruta;
        }
    }
}
