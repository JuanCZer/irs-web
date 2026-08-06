using IRS.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IRS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public class HealthController : ControllerBase
{
    private readonly IRSDbContext _context;
    private readonly ILogger<HealthController> _logger;

    public HealthController(IRSDbContext context, ILogger<HealthController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    [AllowAnonymous]
    public IActionResult Get() => Ok(new
    {
        status = "healthy",
        timestamp = DateTimeOffset.UtcNow
    });

    [HttpGet("database")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> CheckDatabase(CancellationToken cancellationToken)
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync(cancellationToken);
            if (!canConnect)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new
                {
                    status = "unhealthy",
                    timestamp = DateTimeOffset.UtcNow
                });
            }

            return Ok(new
            {
                status = "healthy",
                timestamp = DateTimeOffset.UtcNow
            });
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Falló la comprobación de salud de la base de datos");
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status = "unhealthy",
                timestamp = DateTimeOffset.UtcNow
            });
        }
    }

    [HttpGet("tables")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> CheckTables(CancellationToken cancellationToken)
    {
        try
        {
            var reportCount = await _context.Reports
                .AsNoTracking()
                .CountAsync(cancellationToken);

            return Ok(new
            {
                status = "healthy",
                tables = new[]
                {
                    new { table = "ficha", records = reportCount, exists = true }
                },
                timestamp = DateTimeOffset.UtcNow
            });
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Falló la comprobación de tablas");
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status = "unhealthy",
                timestamp = DateTimeOffset.UtcNow
            });
        }
    }
}
