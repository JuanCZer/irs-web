using IRS.API.DTOs;
using IRS.API.Models;
using Microsoft.AspNetCore.Mvc;
using Backend.DTOs;
using IRS.API.Interfaces;
using System.Security.Claims;

namespace IRS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FichasController : ControllerBase
{
    private readonly IFichaService _reportService;

    public FichasController(IFichaService reportService)
    {
        _reportService = reportService;
    }




    [HttpGet]
    public async Task<ActionResult<List<FichasTodosDto>>> GetAll()
    {
        var reports = await _reportService.GetAllDtosAsync();
        return Ok(reports);
    }




    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(int id)
    {
        var report = await _reportService.GetByIdAsync(id);
        if (report == null)
            return NotFound(new { message = "Ficha no encontrada" });

        return Ok(report);
    }




    [HttpPost]
    public async Task<ActionResult> Create([FromBody] FichaInformativa report)
    {
        try
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            report.UserId = userId;
            var createdReport = await _reportService.CreateAsync(
                report,
                User.FindFirstValue(ClaimTypes.Name) ?? "Usuario");
            HttpContext.Items["AuditoriaEntidadId"] = createdReport.Id;
            return CreatedAtAction(nameof(GetById), new { id = createdReport.Id }, createdReport);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Error al crear la ficha", error = ex.Message });
        }
    }




    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, [FromBody] FichaInformativa report)
    {
        try
        {
            var updatedReport = await _reportService.UpdateAsync(id, report);
            if (updatedReport == null)
                return NotFound(new { message = "Ficha no encontrada" });

            return Ok(updatedReport);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Error al actualizar la ficha", error = ex.Message });
        }
    }




    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var result = await _reportService.DeleteAsync(id);
        if (!result)
            return NotFound(new { message = "Ficha no encontrada" });

        return Ok(new { message = "Ficha eliminada correctamente" });
    }




    [HttpGet("buscar")]
    public async Task<ActionResult<List<FichaResponseDto>>> Search([FromQuery] string criteria)
    {
        var reports = await _reportService.SearchAsync(criteria);
        return Ok(reports);
    }




    [HttpGet("rango-fechas")]
    public async Task<ActionResult<List<FichasTodosDto>>> GetByDateRange(
        [FromQuery] string? startDate,
        [FromQuery] string? endDate)
    {
        try {

            if (string.IsNullOrWhiteSpace(startDate))
            {
                return BadRequest(new { message = "El parámetro 'fechaInicio' es requerido. Use formato: yyyy-MM-dd (ejemplo: 2024-11-01)" });
            }

            if (string.IsNullOrWhiteSpace(endDate))
            {
                return BadRequest(new { message = "El parámetro 'fechaFin' es requerido. Use formato: yyyy-MM-dd (ejemplo: 2024-11-30)" });
            }


            if (!DateTime.TryParse(startDate, out DateTime parsedStartDate))
            {
                return BadRequest(new { message = $"Formato de fechaInicio inválido: '{startDate}'. Use formato: yyyy-MM-dd (ejemplo: 2024-11-01)" });
            }

            if (!DateTime.TryParse(endDate, out DateTime parsedEndDate))
            {
                return BadRequest(new { message = $"Formato de fechaFin inválido: '{endDate}'. Use formato: yyyy-MM-dd (ejemplo: 2024-11-30)" });
            }

            var reports = await _reportService.GetReportsByDateRangeAsync(parsedStartDate, parsedEndDate);

            return Ok(reports);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Error al obtener fichas por rango de fechas", error = ex.Message, stackTrace = ex.StackTrace });
        }
    }




    [HttpGet("dia-actual")]
    public async Task<ActionResult<List<FichasTodosDto>>> GetForToday()
    {
        try
        {
            var reports = await _reportService.GetReportsForTodayAsync();
            return Ok(reports);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Error al obtener fichas del día", error = ex.Message });
        }
    }




    [HttpGet("concluidas")]
    public async Task<ActionResult<List<FichasTodosDto>>> GetCompleted()
    {
        try
        {
            var reports = await _reportService.GetCompletedReportsAsync();
            return Ok(reports);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Error al obtener fichas concluidas", error = ex.Message });
        }
    }




    [HttpGet("borradores")]
    public async Task<ActionResult<List<FichasBorradorDto>>> GetDrafts()
    {
        try
        {
            var drafts = await _reportService.GetDraftsAsync();
            return Ok(drafts);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Error al obtener borradores", error = ex.Message });
        }
    }




    [HttpGet("borradores/buscar")]
    public async Task<ActionResult<List<FichasBorradorDto>>> SearchDrafts([FromQuery] string criteria)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(criteria))
            {
                var allDrafts = await _reportService.GetDraftsAsync();
                return Ok(allDrafts);
            }

            var drafts = await _reportService.SearchDraftsAsync(criteria);
            return Ok(drafts);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Error al buscar borradores", error = ex.Message });
        }
    }




    [HttpGet("estadisticas")]
    public async Task<ActionResult<FichasEstadisticasDto>> GetStatistics()
    {
        try
        {
            var statistics = await _reportService.GetStatisticsAsync();
            return Ok(statistics);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = "Error de validación", error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al obtener estadísticas", error = ex.Message, type = ex.GetType().Name });
        }
    }
}
