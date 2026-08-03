using IRS.API.Interfaces;
using IRS.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace IRS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CatalogosController : ControllerBase
{
    private readonly ICatalogosService _catalogService;

    public CatalogosController(ICatalogosService catalogsService)
    {
        _catalogService = catalogsService;
    }




    [HttpGet("sectores")]
    public async Task<ActionResult<List<SectorCategory>>> GetSectors()
    {
        try
        {
            var sectors = await _catalogService.GetSectorsAsync();
            return Ok(sectors);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Error al obtener sectores", error = ex.Message });
        }
    }




    [HttpGet("subsectores")]
    public async Task<ActionResult<List<CatSubsector>>> GetSubsectors()
    {
        try
        {
            var subsectors = await _catalogService.GetSubsectorsAsync();
            return Ok(subsectors);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Error al obtener subsectores", error = ex.Message });
        }
    }




    [HttpGet("subsectores/sector/{sectorId}")]
    public async Task<ActionResult<List<CatSubsector>>> GetSubsectorsBySector(int sectorId)
    {
        try
        {
            var subsectors = await _catalogService.GetSubsectorsBySectorAsync(sectorId);
            return Ok(subsectors);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Error al obtener subsectores", error = ex.Message });
        }
    }




    [HttpGet("prioridades")]
    public async Task<ActionResult<List<CatPrioridad>>> GetPriorities()
    {
        try
        {
            var priorities = await _catalogService.GetPrioritiesAsync();
            return Ok(priorities);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Error al obtener prioridades", error = ex.Message });
        }
    }




    [HttpGet("condiciones")]
    public async Task<ActionResult<List<CatCondicion>>> GetConditions()
    {
        try
        {
            var conditions = await _catalogService.GetConditionsAsync();
            return Ok(conditions);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Error al obtener condiciones", error = ex.Message });
        }
    }




    [HttpGet("informaciones")]
    public async Task<ActionResult<List<CatInformacion>>> GetInformationItems()
    {
        try
        {
            var informationItems = await _catalogService.GetInformationItemsAsync();
            return Ok(informationItems);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Error al obtener informaciones", error = ex.Message });
        }
    }




    [HttpGet("municipios")]
    public async Task<ActionResult<List<CatMunicipio>>> GetMunicipalities()
    {
        try
        {
            var municipalities = await _catalogService.GetMunicipalitiesAsync();
            return Ok(municipalities);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Error al obtener municipios", error = ex.Message });
        }
    }




    [HttpGet("delegaciones")]
    public async Task<ActionResult<List<CatDelegacion>>> GetDelegations()
    {
        try
        {
            var delegations = await _catalogService.GetDelegationsAsync();
            return Ok(delegations);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Error al obtener delegaciones", error = ex.Message });
        }
    }




    [HttpGet("medidas-seguridad")]
    public async Task<ActionResult<List<CatMedidaSeguridad>>> GetSecurityMeasures()
    {
        try
        {
            var measures = await _catalogService.GetSecurityMeasuresAsync();
            return Ok(measures);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Error al obtener medidas de seguridad", error = ex.Message });
        }
    }
}
