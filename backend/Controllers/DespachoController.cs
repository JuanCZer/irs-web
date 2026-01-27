using Microsoft.AspNetCore.Mvc;
using IRS.API.Services;
using IRS.API.Models;
using IRS.API.DTOs;

namespace IRS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DespachoController : ControllerBase
{
    private readonly IDespachoService _despachoService;
    private readonly ILogger<DespachoController> _logger;

    public DespachoController(IDespachoService despachoService, ILogger<DespachoController> logger)
    {
        _despachoService = despachoService;
        _logger = logger;
    }

    [HttpPost("validar")]
    public async Task<ActionResult<List<FichaDespachoResponseDto>>> ValidarFicha([FromBody] ValidarFichaDespachoDto dto)
    {
        try
        {
            if (dto.IdsMedidasSeguridad == null || dto.IdsMedidasSeguridad.Count == 0)
            {
                return BadRequest(new { message = "Debe seleccionar al menos una medida de seguridad" });
            }

            var fichasDespachoCreadas = new List<FichaDespachoResponseDto>();

            // Crear una entrada por cada medida seleccionada
            foreach (var idMedida in dto.IdsMedidasSeguridad)
            {
                var fichaDespacho = new FichaDespacho
                {
                    IdFicha = dto.IdFicha,
                    IdCatMedida = idMedida,
                    Comentario = dto.Comentario,
                    Evidencia = dto.Evidencia,
                    IdUsuario = dto.IdUsuario
                };

                var fichaCreada = await _despachoService.CrearFichaDespachoAsync(fichaDespacho);

                // Cargar la ficha completa con las relaciones
                var fichaCompleta = await _despachoService.ObtenerPorIdAsync(fichaCreada.IdFichaDespacho);

                if (fichaCompleta != null)
                {
                    fichasDespachoCreadas.Add(new FichaDespachoResponseDto
                    {
                        IdFichaDespacho = fichaCompleta.IdFichaDespacho,
                        IdFicha = fichaCompleta.IdFicha,
                        IdCatMedida = fichaCompleta.IdCatMedida,
                        MedidaSeguridad = fichaCompleta.CatMedidaSeguridad?.Medida ?? "",
                        Comentario = fichaCompleta.Comentario,
                        Evidencia = fichaCompleta.Evidencia,
                        FechaValidacion = fichaCompleta.FechaValidacion,
                        IdUsuario = fichaCompleta.IdUsuario,
                    });
                }
            }

            _logger.LogInformation($"Ficha {dto.IdFicha} validada con {dto.IdsMedidasSeguridad.Count} medidas de seguridad");

            return Ok(fichasDespachoCreadas);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al validar ficha de despacho");
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    [HttpGet("ficha/{idFicha}")]
    public async Task<ActionResult<List<FichaDespachoResponseDto>>> ObtenerPorFicha(int idFicha)
    {
        try
        {
            var fichasDespacho = await _despachoService.ObtenerPorIdFichaAsync(idFicha);

            var response = fichasDespacho.Select(fd => new FichaDespachoResponseDto
            {
                IdFichaDespacho = fd.IdFichaDespacho,
                IdFicha = fd.IdFicha,
                IdCatMedida = fd.IdCatMedida,
                MedidaSeguridad = fd.CatMedidaSeguridad?.Medida ?? "",
                Comentario = fd.Comentario,
                Evidencia = fd.Evidencia,
                FechaValidacion = fd.FechaValidacion,
                IdUsuario = fd.IdUsuario,
            }).ToList();

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al obtener fichas de despacho para ficha {idFicha}");
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }
}
