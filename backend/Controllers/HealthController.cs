using IRS.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IRS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly IRSDbContext _context;

    public HealthController(IRSDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Verificar estado de la API
    /// </summary>
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "API funcionando correctamente",
            timestamp = DateTime.Now
        });
    }

    /// <summary>
    /// Verificar conexión a la base de datos
    /// </summary>
    [HttpGet("database")]
    public async Task<IActionResult> CheckDatabase()
    {
        try
        {
            // Obtener información de la conexión
            var connectionString = _context.Database.GetConnectionString();
            
            // Intentar conectarse
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

            // Intentar consultar la tabla
            int fichasCount = 0;
            string consultaExitosa = "No";
            try
            {
                fichasCount = await _context.Fichas.CountAsync();
                consultaExitosa = "Sí";
            }
            catch (Exception ex)
            {
                consultaExitosa = $"Error: {ex.Message}";
            }

            // Contar tablas
            var tablas = new
            {
                fichas = fichasCount,
                consultaExitosa = consultaExitosa
            };

            return Ok(new
            {
                status = "success",
                message = "Conexión exitosa a la base de datos",
                database = connectionString?.Split(';').FirstOrDefault(x => x.Contains("Database"))?.Split('=').LastOrDefault(),
                tablas = tablas,
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

    /// <summary>
    /// Verificar estructura de tablas
    /// </summary>
    [HttpGet("tables")]
    public async Task<IActionResult> CheckTables()
    {
        try
        {
            var tables = new List<object>();

            // Verificar tabla ficha
            try
            {
                var fichasCount = await _context.Fichas.CountAsync();
                tables.Add(new { tabla = "ficha", registros = fichasCount, existe = true });
            }
            catch (Exception ex)
            {
                tables.Add(new { tabla = "ficha", registros = 0, existe = false, error = ex.Message });
            }

            return Ok(new
            {
                status = "success",
                tablas = tables,
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
