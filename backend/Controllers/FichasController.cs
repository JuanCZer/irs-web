using IRS.API.DTOs;
using IRS.API.Models;
using IRS.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace IRS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FichasController : ControllerBase
{
    private readonly IFichaService _fichaService;

    public FichasController(IFichaService fichaService)
    {
        _fichaService = fichaService;
    }

    /// <summary>
    /// Obtener todas las fichas informativas con formato simplificado
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<FichasTodosDto>>> ObtenerTodas()
    {
        var fichas = await _fichaService.ObtenerTodosDtoAsync();
        return Ok(fichas);
    }

    /// <summary>
    /// Obtener una ficha por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult> ObtenerPorId(int id)
    {
        var ficha = await _fichaService.ObtenerPorIdAsync(id);
        if (ficha == null)
            return NotFound(new { mensaje = "Ficha no encontrada" });

        return Ok(ficha);
    }

    /// <summary>
    /// Crear una nueva ficha informativa
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> Crear([FromBody] FichaInformativa ficha)
    {
        try
        {
            var fichaCreada = await _fichaService.CrearAsync(ficha, "UsuarioDemo");
            return CreatedAtAction(nameof(ObtenerPorId), new { id = fichaCreada.Id }, fichaCreada);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = "Error al crear la ficha", error = ex.Message });
        }
    }

    /// <summary>
    /// Actualizar una ficha existente
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult> Actualizar(int id, [FromBody] FichaInformativa ficha)
    {
        try
        {
            var fichaActualizada = await _fichaService.ActualizarAsync(id, ficha);
            if (fichaActualizada == null)
                return NotFound(new { mensaje = "Ficha no encontrada" });

            return Ok(fichaActualizada);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = "Error al actualizar la ficha", error = ex.Message });
        }
    }

    /// <summary>
    /// Eliminar una ficha
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Eliminar(int id)
    {
        var resultado = await _fichaService.EliminarAsync(id);
        if (!resultado)
            return NotFound(new { mensaje = "Ficha no encontrada" });

        return Ok(new { mensaje = "Ficha eliminada correctamente" });
    }

    /// <summary>
    /// Buscar fichas por criterio
    /// </summary>
    [HttpGet("buscar")]
    public async Task<ActionResult<List<FichaResponseDto>>> Buscar([FromQuery] string criterio)
    {
        var fichas = await _fichaService.BuscarAsync(criterio);
        return Ok(fichas);
    }

    /// <summary>
    /// Obtener fichas por rango de fechas
    /// </summary>
    [HttpGet("rango-fechas")]
    public async Task<ActionResult<List<FichasTodosDto>>> ObtenerPorRangoFechas(
        [FromQuery] string? fechaInicio, 
        [FromQuery] string? fechaFin)
    {
        try {           
            // Validar que los parámetros no sean nulos o vacíos
            if (string.IsNullOrWhiteSpace(fechaInicio))
            {
                Console.WriteLine($"❌ Error: fechaInicio es nulo o vacío");
                return BadRequest(new { mensaje = "El parámetro 'fechaInicio' es requerido. Use formato: yyyy-MM-dd (ejemplo: 2024-11-01)" });
            }
            
            if (string.IsNullOrWhiteSpace(fechaFin))
            {
                Console.WriteLine($"❌ Error: fechaFin es nulo o vacío");
                return BadRequest(new { mensaje = "El parámetro 'fechaFin' es requerido. Use formato: yyyy-MM-dd (ejemplo: 2024-11-30)" });
            }
              
            // Parsear las fechas del formato yyyy-MM-dd
            if (!DateTime.TryParse(fechaInicio, out DateTime dtFechaInicio))
            {
                return BadRequest(new { mensaje = $"Formato de fechaInicio inválido: '{fechaInicio}'. Use formato: yyyy-MM-dd (ejemplo: 2024-11-01)" });
            }
            
            if (!DateTime.TryParse(fechaFin, out DateTime dtFechaFin))
            {
                return BadRequest(new { mensaje = $"Formato de fechaFin inválido: '{fechaFin}'. Use formato: yyyy-MM-dd (ejemplo: 2024-11-30)" });
            }

            var fichas = await _fichaService.ObtenerFichasPorRangoFechasAsync(dtFechaInicio, dtFechaFin);
            
            return Ok(fichas);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ ERROR en ObtenerPorRangoFechas: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            Console.WriteLine($"========================================");
            return BadRequest(new { mensaje = "Error al obtener fichas por rango de fechas", error = ex.Message, stackTrace = ex.StackTrace });
        }
    }

    /// <summary>
    /// Obtener fichas del día actual
    /// </summary>
    [HttpGet("dia-actual")]
    public async Task<ActionResult<List<FichasTodosDto>>> ObtenerDelDia()
    {
        try
        {
            var fichas = await _fichaService.ObtenerFichasDelDiaAsync();
            return Ok(fichas);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = "Error al obtener fichas del día", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtener fichas con estado CONCLUIDO (IdEstadoActual = 7)
    /// </summary>
    [HttpGet("concluidas")]
    public async Task<ActionResult<List<FichasTodosDto>>> ObtenerConcluidas()
    {
        try
        {
            var fichas = await _fichaService.ObtenerFichasConcluidasAsync();
            return Ok(fichas);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = "Error al obtener fichas concluidas", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtener borradores de fichas (Activo = 2)
    /// </summary>
    [HttpGet("borradores")]
    public async Task<ActionResult<List<FichasBorradorDto>>> ObtenerBorradores()
    {
        try
        {
            var borradores = await _fichaService.ObtenerBorradoresAsync();
            return Ok(borradores);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = "Error al obtener borradores", error = ex.Message });
        }
    }

    /// <summary>
    /// Buscar borradores por criterio
    /// </summary>
    [HttpGet("borradores/buscar")]
    public async Task<ActionResult<List<FichasBorradorDto>>> BuscarBorradores([FromQuery] string criterio)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(criterio))
            {
                var todosBorradores = await _fichaService.ObtenerBorradoresAsync();
                return Ok(todosBorradores);
            }

            var borradores = await _fichaService.BuscarBorradoresAsync(criterio);
            return Ok(borradores);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = "Error al buscar borradores", error = ex.Message });
        }
    }
}
