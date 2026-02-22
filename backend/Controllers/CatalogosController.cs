using IRS.API.Interfaces;
using IRS.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace IRS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CatalogosController : ControllerBase
{
    private readonly ICatalogosService _catalogosService;

    public CatalogosController(ICatalogosService catalogosService)
    {
        _catalogosService = catalogosService;
    }

    /// <summary>
    /// Obtener todos los sectores activos
    /// </summary>
    [HttpGet("sectores")]
    public async Task<ActionResult<List<CatSector>>> ObtenerSectores()
    {
        try
        {
            var sectores = await _catalogosService.ObtenerSectoresAsync();
            return Ok(sectores);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = "Error al obtener sectores", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtener todos los subsectores activos
    /// </summary>
    [HttpGet("subsectores")]
    public async Task<ActionResult<List<CatSubsector>>> ObtenerSubsectores()
    {
        try
        {
            var subsectores = await _catalogosService.ObtenerSubsectoresAsync();
            return Ok(subsectores);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = "Error al obtener subsectores", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtener subsectores por sector
    /// </summary>
    [HttpGet("subsectores/sector/{idSector}")]
    public async Task<ActionResult<List<CatSubsector>>> ObtenerSubsectoresPorSector(int idSector)
    {
        try
        {
            var subsectores = await _catalogosService.ObtenerSubsectoresPorSectorAsync(idSector);
            return Ok(subsectores);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = "Error al obtener subsectores", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtener todas las prioridades activas
    /// </summary>
    [HttpGet("prioridades")]
    public async Task<ActionResult<List<CatPrioridad>>> ObtenerPrioridades()
    {
        try
        {
            var prioridades = await _catalogosService.ObtenerPrioridadesAsync();
            return Ok(prioridades);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = "Error al obtener prioridades", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtener todas las condiciones activas
    /// </summary>
    [HttpGet("condiciones")]
    public async Task<ActionResult<List<CatCondicion>>> ObtenerCondiciones()
    {
        try
        {
            var condiciones = await _catalogosService.ObtenerCondicionesAsync();
            return Ok(condiciones);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = "Error al obtener condiciones", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtener todas las informaciones activas
    /// </summary>
    [HttpGet("informaciones")]
    public async Task<ActionResult<List<CatInformacion>>> ObtenerInformaciones()
    {
        try
        {
            var informaciones = await _catalogosService.ObtenerInformacionesAsync();
            return Ok(informaciones);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = "Error al obtener informaciones", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtener todos los municipios activos
    /// </summary>
    [HttpGet("municipios")]
    public async Task<ActionResult<List<CatMunicipio>>> ObtenerMunicipios()
    {
        try
        {
            var municipios = await _catalogosService.ObtenerMunicipiosAsync();
            return Ok(municipios);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = "Error al obtener municipios", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtener todas las delegaciones activas
    /// </summary>
    [HttpGet("delegaciones")]
    public async Task<ActionResult<List<CatDelegacion>>> ObtenerDelegaciones()
    {
        try
        {
            var delegaciones = await _catalogosService.ObtenerDelegacionesAsync();
            return Ok(delegaciones);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = "Error al obtener delegaciones", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtener todas las medidas de seguridad activas
    /// </summary>
    [HttpGet("medidas-seguridad")]
    public async Task<ActionResult<List<CatMedidaSeguridad>>> ObtenerMedidasSeguridad()
    {
        try
        {
            var medidas = await _catalogosService.ObtenerMedidasSeguridadAsync();
            return Ok(medidas);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = "Error al obtener medidas de seguridad", error = ex.Message });
        }
    }
}
