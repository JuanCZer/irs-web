using Microsoft.AspNetCore.Mvc;
using IRS.API.Models;
using IRS.API.DTOs;
using IRS.API.Interfaces;
using System.Security.Claims;

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
}
