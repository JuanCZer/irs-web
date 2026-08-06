using System.Globalization;
using System.Security.Claims;
using Backend.DTOs;
using Backend.Exceptions;
using IRS.API.DTOs;
using IRS.API.Interfaces;
using IRS.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace IRS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FichasController : ControllerBase
{
    private const int MaximumSearchLength = 200;
    private readonly IFichaService _reportService;

    public FichasController(IFichaService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet]
    public async Task<ActionResult<List<FichasTodosDto>>> GetAll() =>
        Ok(await _reportService.GetAllDtosAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetById(int id)
    {
        var report = await _reportService.GetByIdAsync(id);
        return report == null
            ? NotFound(new { message = "Ficha no encontrada" })
            : Ok(report);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] FichaInformativa report)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized();

        if (report.Active is not (2 or 3))
            return BadRequest(new { message = "El estado inicial de la ficha no es válido" });

        report.Id = 0;
        report.UserId = userId;
        var createdReport = await _reportService.CreateAsync(
            report,
            User.FindFirstValue(ClaimTypes.Name) ?? "Usuario");

        HttpContext.Items["AuditoriaEntidadId"] = createdReport.Id;
        return CreatedAtAction(nameof(GetById), new { id = createdReport.Id }, createdReport);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, [FromBody] FichaInformativa report)
    {
        try
        {
            report.Id = id;
            var updatedReport = await _reportService.UpdateAsync(id, report);
            return updatedReport == null
                ? NotFound(new { message = "Ficha no encontrada" })
                : Ok(updatedReport);
        }
        catch (ConflictException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        var result = await _reportService.DeleteAsync(id);
        return result
            ? Ok(new { message = "Ficha eliminada correctamente" })
            : NotFound(new { message = "Ficha no encontrada" });
    }

    [HttpGet("buscar")]
    public async Task<ActionResult<List<FichaResponseDto>>> Search([FromQuery] string? criteria)
    {
        if (criteria?.Length > MaximumSearchLength)
            return BadRequest(new { message = "El criterio de búsqueda es demasiado largo" });

        return Ok(await _reportService.SearchAsync(criteria?.Trim() ?? string.Empty));
    }

    [HttpGet("rango-fechas")]
    public async Task<ActionResult<List<FichasTodosDto>>> GetByDateRange(
        [FromQuery] string? startDate,
        [FromQuery] string? endDate)
    {
        if (!TryParseDate(startDate, out var parsedStartDate) ||
            !TryParseDate(endDate, out var parsedEndDate))
        {
            return BadRequest(new
            {
                message = "Las fechas son obligatorias y deben usar el formato yyyy-MM-dd"
            });
        }

        if (parsedEndDate < parsedStartDate)
            return BadRequest(new { message = "La fecha final no puede ser anterior a la inicial" });

        if ((parsedEndDate - parsedStartDate).TotalDays > 366)
            return BadRequest(new { message = "El rango consultado no puede exceder 366 días" });

        return Ok(await _reportService.GetReportsByDateRangeAsync(
            parsedStartDate,
            parsedEndDate));
    }

    [HttpGet("dia-actual")]
    public async Task<ActionResult<List<FichasTodosDto>>> GetForToday() =>
        Ok(await _reportService.GetReportsForTodayAsync());

    [HttpGet("concluidas")]
    public async Task<ActionResult<List<FichasTodosDto>>> GetCompleted() =>
        Ok(await _reportService.GetCompletedReportsAsync());

    [HttpGet("borradores")]
    public async Task<ActionResult<List<FichasBorradorDto>>> GetDrafts() =>
        Ok(await _reportService.GetDraftsAsync());

    [HttpGet("borradores/buscar")]
    public async Task<ActionResult<List<FichasBorradorDto>>> SearchDrafts(
        [FromQuery] string? criteria)
    {
        if (criteria?.Length > MaximumSearchLength)
            return BadRequest(new { message = "El criterio de búsqueda es demasiado largo" });

        if (string.IsNullOrWhiteSpace(criteria))
            return Ok(await _reportService.GetDraftsAsync());

        return Ok(await _reportService.SearchDraftsAsync(criteria.Trim()));
    }

    [HttpGet("estadisticas")]
    public async Task<ActionResult<FichasEstadisticasDto>> GetStatistics() =>
        Ok(await _reportService.GetStatisticsAsync());

    private static bool TryParseDate(string? value, out DateTime result) =>
        DateTime.TryParseExact(
            value,
            "yyyy-MM-dd",
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out result);
}
