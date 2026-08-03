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
        private readonly IAuditoriaService _auditService;

        public AuditoriaController(IAuditoriaService auditService)
        {
            _auditService = auditService;
        }

        [HttpGet]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<AuditoriaPaginaDTO>> Query(
            [FromQuery] AuditoriaConsultaDTO filters)
        {
            return Ok(await _auditService.QueryAsync(filters));
        }

        [HttpPost("eventos")]
        public async Task<IActionResult> LogNavigation(
            [FromBody] RegistrarEventoAuditoriaDTO navigationEvent)
        {
            var userId = GetUserId();
            if (!userId.HasValue) return Unauthorized();

            var path = string.IsNullOrWhiteSpace(navigationEvent.Path)
                ? "/"
                : navigationEvent.Path.Trim();
            if (path.Length > 500) path = path[..500];

            await _auditService.LogAsync(userId, new RegistroAuditoriaDTO
            {
                Action = "ABRIR_PANTALLA",
                Module = "NAVEGACION",
                Description = $"Abrió la pantalla {GetScreenName(path)}",
                HttpMethod = Request.Method,
                Path = path,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = Request.Headers.UserAgent.ToString(),
                StatusCode = StatusCodes.Status201Created,
                Successful = true,
                Details = JsonSerializer.Serialize(new { path })
            });

            return StatusCode(StatusCodes.Status201Created);
        }

        private int? GetUserId()
        {
            return int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
                ? id
                : null;
        }

        private static string GetScreenName(string path)
        {
            if (path.StartsWith("/inicio")) return "Resumen operativo";
            if (path.StartsWith("/fichas/registrar")) return "Registrar ficha";
            if (path.StartsWith("/fichas/borradores")) return "Borradores de fichas";
            if (path.StartsWith("/consultar-fichas")) return "Consulta de fichas";
            if (path.StartsWith("/mapa-fichas")) return "Mapa de fichas";
            if (path.StartsWith("/despacho")) return "Despacho";
            if (path.StartsWith("/drones")) return "Operación de drones";
            if (path.StartsWith("/estadisticas")) return "Estadísticas";
            if (path.StartsWith("/admin-usuarios")) return "Administración de usuarios";
            if (path.StartsWith("/auditoria")) return "Bitácora de actividad";
            if (path.StartsWith("/perfil")) return "Seguridad de la cuenta";
            return path;
        }
    }
}
