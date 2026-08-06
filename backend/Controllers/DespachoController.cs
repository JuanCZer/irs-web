using Microsoft.AspNetCore.Mvc;
using IRS.API.Models;
using IRS.API.DTOs;
using IRS.API.Interfaces;
using System.Security.Claims;
using System.Globalization;
using Backend.Exceptions;
using Microsoft.AspNetCore.Authorization;

namespace IRS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "DESPACHO")]
public class DespachoController : ControllerBase
{
    private readonly IDespachoService _dispatchService;
    private readonly ILogger<DespachoController> _logger;

    public DespachoController(IDespachoService dispatchService, ILogger<DespachoController> logger)
    {
        _dispatchService = dispatchService;
        _logger = logger;
    }

    [HttpPost("validar")]
    public async Task<ActionResult<List<FichaDespachoResponseDto>>> ValidateReport([FromBody] ValidarFichaDespachoDto dto)
    {
        try
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            dto.UserId = userId;
            HttpContext.Items["AuditoriaEntidadId"] = dto.ReportId;

            if (dto.SecurityMeasureIds == null || dto.SecurityMeasureIds.Count == 0)
            {
                return BadRequest(new { message = "Debe seleccionar al menos una medida de seguridad" });
            }

            dto.SecurityMeasureIds = dto.SecurityMeasureIds
                .Where(measureId => measureId > 0)
                .Distinct()
                .ToList();
            if (dto.SecurityMeasureIds.Count == 0)
                return BadRequest(new { message = "Las medidas de seguridad no son válidas" });

            var dispatchReports = await _dispatchService.CreateDispatchReportsAsync(
                dto.ReportId,
                dto.SecurityMeasureIds,
                dto.Comment,
                dto.Evidence!,
                userId);
            var createdDispatchReports = dispatchReports.Select(fullReport =>
                new FichaDespachoResponseDto
                {
                    DispatchReportId = fullReport.DispatchReportId,
                    ReportId = fullReport.ReportId,
                    MeasureCategoryId = fullReport.MeasureCategoryId,
                    SecurityMeasure = fullReport.SecurityMeasure?.Measure ?? "",
                    Comment = fullReport.Comment,
                    Evidence = fullReport.Evidence,
                    ValidationDate = fullReport.ValidationDate,
                    UserId = fullReport.UserId
                }).ToList();

            _logger.LogInformation(
                "Ficha {ReportId} validada con {MeasureCount} medidas de seguridad",
                dto.ReportId,
                dto.SecurityMeasureIds.Count);
            return Ok(createdDispatchReports);
        }
        catch (RequestValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al validar ficha de despacho");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpGet("ficha/{reportId}")]
    public async Task<ActionResult<List<FichaDespachoResponseDto>>> GetByReport(int reportId)
    {
        try
        {
            var dispatchReports = await _dispatchService.GetByReportIdAsync(reportId);

            var response = dispatchReports.Select(fd => new FichaDespachoResponseDto
            {
                DispatchReportId = fd.DispatchReportId,
                ReportId = fd.ReportId,
                MeasureCategoryId = fd.MeasureCategoryId,
                SecurityMeasure = fd.SecurityMeasure?.Measure ?? "",
                Comment = fd.Comment,
                Evidence = fd.Evidence,
                ValidationDate = fd.ValidationDate,
                UserId = fd.UserId,
            }).ToList();

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener fichas de despacho para ficha {ReportId}", reportId);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    [HttpGet("borradores-medidas")]
    public async Task<ActionResult<List<BorradorMedidasResponseDto>>>
        GetMeasureDrafts()
    {
        if (!int.TryParse(
                User.FindFirstValue(ClaimTypes.NameIdentifier),
                out var userId))
            return Unauthorized();

        var drafts = await _dispatchService.GetMeasureDraftsAsync(userId);
        return Ok(drafts.Select(draft => new BorradorMedidasResponseDto
        {
            ReportId = draft.ReportId,
            SecurityMeasureIds = draft.SecurityMeasureIds.ToList(),
            Comment = draft.Comment,
            UpdatedAt = draft.UpdatedAt
        }));
    }

    [HttpPut("borradores-medidas/{reportId:int}")]
    public async Task<ActionResult<BorradorMedidasResponseDto?>>
        SaveMeasureDraft(
            int reportId,
            [FromBody] GuardarBorradorMedidasDto dto)
    {
        if (!int.TryParse(
                User.FindFirstValue(ClaimTypes.NameIdentifier),
                out var userId))
            return Unauthorized();

        var draft = await _dispatchService.SaveMeasureDraftAsync(
            reportId,
            userId,
            dto.SecurityMeasureIds,
            dto.Comment);
        if (draft == null) return NoContent();

        return Ok(new BorradorMedidasResponseDto
        {
            ReportId = draft.ReportId,
            SecurityMeasureIds = draft.SecurityMeasureIds.ToList(),
            Comment = draft.Comment,
            UpdatedAt = draft.UpdatedAt
        });
    }

    [HttpGet("drones/fichas")]
    public async Task<ActionResult<List<FichaDronResponseDto>>> GetDroneReports()
    {
        if (!int.TryParse(
                User.FindFirstValue(ClaimTypes.NameIdentifier),
                out var userId))
            return Unauthorized();

        try
        {
            var dispatchReports = await _dispatchService.GetDroneReportsAsync();
            var selectedDrafts = new List<DispatchMeasureDraft>();
            try
            {
                selectedDrafts =
                    await _dispatchService.GetDroneMeasureDraftsAsync(userId);
            }
            catch (Exception ex)
            {
                // Los borradores son una fuente complementaria: una falla en
                // su almacenamiento no debe ocultar fichas ya validadas.
                _logger.LogWarning(
                    ex,
                    "No fue posible recuperar borradores de medidas para drones");
            }

            var response = dispatchReports.Select(fd =>
            {
                var report = fd.InformationReport;
                return new FichaDronResponseDto
                {
                    DispatchReportId = fd.DispatchReportId,
                    ReportId = fd.ReportId,
                    ReferenceNumber = report?.InternalReference
                        ?? $"F-{fd.ReportId:D6}",
                    EventDate = report?.EventDate,
                    ValidationDate = fd.ValidationDate,
                    Delegation = report?.Delegation ?? string.Empty,
                    Municipality = report?.Municipality ?? string.Empty,
                    Place = report?.Place ?? string.Empty,
                    Latitude = ParseCoordinate(report?.Latitude),
                    Longitude = ParseCoordinate(report?.Longitude),
                    Subject = report?.Subject ?? string.Empty,
                    Comment = fd.Comment,
                    SecurityMeasure = fd.SecurityMeasure?.Measure ?? string.Empty,
                    PendingValidation = false
                };
            }).ToList();

            var validatedReportIds = response
                .Select(report => report.ReportId)
                .ToHashSet();
            response.AddRange(selectedDrafts
                .Where(draft => !validatedReportIds.Contains(draft.ReportId))
                .Select(draft =>
                {
                    var report = draft.InformationReport;
                    return new FichaDronResponseDto
                    {
                        DispatchReportId = -draft.Id,
                        ReportId = draft.ReportId,
                        ReferenceNumber = report?.InternalReference
                            ?? $"F-{draft.ReportId:D6}",
                        EventDate = report?.EventDate,
                        ValidationDate = draft.UpdatedAt,
                        Delegation = report?.Delegation ?? string.Empty,
                        Municipality = report?.Municipality ?? string.Empty,
                        Place = report?.Place ?? string.Empty,
                        Latitude = ParseCoordinate(report?.Latitude),
                        Longitude = ParseCoordinate(report?.Longitude),
                        Subject = report?.Subject ?? string.Empty,
                        Comment = draft.Comment,
                        SecurityMeasure =
                            "Monitoreo Policial: Despliegue de Dron",
                        PendingValidation = true
                    };
                }));

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener las fichas vinculadas a drones");
            return StatusCode(500, new
            {
                message = "Error al obtener la operación de drones"
            });
        }
    }

    private static double? ParseCoordinate(string? value)
    {
        return double.TryParse(
            value,
            NumberStyles.Float,
            CultureInfo.InvariantCulture,
            out var coordinate)
                ? coordinate
                : null;
    }
}
