using Microsoft.AspNetCore.Mvc;
using IRS.API.Models;
using IRS.API.DTOs;
using IRS.API.Interfaces;
using System.Security.Claims;
using System.Globalization;

namespace IRS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
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

            var createdDispatchReports = new List<FichaDespachoResponseDto>();


            foreach (var measureId in dto.SecurityMeasureIds)
            {
                var dispatchReport = new DispatchReport
                {
                    ReportId = dto.ReportId,
                    MeasureCategoryId = measureId,
                    Comment = dto.Comment,
                    Evidence = dto.Evidence,
                    UserId = dto.UserId
                };

                var createdReport = await _dispatchService.CreateDispatchReportAsync(dispatchReport);


                var fullReport = await _dispatchService.GetByIdAsync(createdReport.DispatchReportId);

                if (fullReport != null)
                {
                    createdDispatchReports.Add(new FichaDespachoResponseDto
                    {
                        DispatchReportId = fullReport.DispatchReportId,
                        ReportId = fullReport.ReportId,
                        MeasureCategoryId = fullReport.MeasureCategoryId,
                        SecurityMeasure = fullReport.SecurityMeasure?.Measure ?? "",
                        Comment = fullReport.Comment,
                        Evidence = fullReport.Evidence,
                        ValidationDate = fullReport.ValidationDate,
                        UserId = fullReport.UserId,
                    });
                }
            }

            _logger.LogInformation($"Ficha {dto.ReportId} validada con {dto.SecurityMeasureIds.Count} medidas de seguridad");
            await _dispatchService.DeleteMeasureDraftAsync(dto.ReportId, userId);

            return Ok(createdDispatchReports);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al validar ficha de despacho");
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
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
            _logger.LogError(ex, $"Error al obtener fichas de despacho para ficha {reportId}");
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
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
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (!string.Equals(role, "DESPACHO", StringComparison.OrdinalIgnoreCase))
            return Forbid();
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
