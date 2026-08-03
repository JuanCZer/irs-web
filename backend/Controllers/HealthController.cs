using IRS.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace IRS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class HealthController : ControllerBase
{
    private readonly IRSDbContext _context;

    public HealthController(IRSDbContext context)
    {
        _context = context;
    }




    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "API funcionando correctamente",
            timestamp = DateTime.Now
        });
    }




    [HttpGet("database")]
    public async Task<IActionResult> CheckDatabase()
    {
        try
        {

            var connectionString = _context.Database.GetConnectionString();


            var canConnect = await _context.Database.CanConnectAsync();

            if (!canConnect)
            {
                return StatusCode(500, new
                {
                    status = "error",
                    message = "No se pudo conectar a la base de datos PostgreSQL",
                    connectionString = connectionString?.Replace("Password=Ee609625574", "Password=***"),
                    timestamp = DateTime.Now
                });
            }


            int reportCount = 0;
            string querySuccessful = "No";
            try
            {
                reportCount = await _context.Reports.CountAsync();
                querySuccessful = "Sí";
            }
            catch (Exception ex)
            {
                querySuccessful = $"Error: {ex.Message}";
            }


            var tableStatus = new
            {
                reports = reportCount,
                querySuccessful = querySuccessful
            };

            return Ok(new
            {
                status = "success",
                message = "Conexión exitosa a la base de datos",
                database = connectionString?.Split(';').FirstOrDefault(x => x.Contains("Database"))?.Split('=').LastOrDefault(),
                tables = tableStatus,
                timestamp = DateTime.Now
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = "error",
                message = "Error al conectar con la base de datos",
                error = ex.Message,
                innerError = ex.InnerException?.Message,
                stackTrace = ex.StackTrace,
                timestamp = DateTime.Now
            });
        }
    }




    [HttpGet("tables")]
    public async Task<IActionResult> CheckTables()
    {
        try
        {
            var tables = new List<object>();


            try
            {
                var reportCount = await _context.Reports.CountAsync();
                tables.Add(new { table = "ficha", records = reportCount, exists = true });
            }
            catch (Exception ex)
            {
                tables.Add(new { table = "ficha", records = 0, exists = false, error = ex.Message });
            }

            return Ok(new
            {
                status = "success",
                tables,
                timestamp = DateTime.Now
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = "error",
                message = "Error al verificar tablas",
                error = ex.Message,
                timestamp = DateTime.Now
            });
        }
    }
}
