using IRS.API.Interfaces;
using IRS.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace IRS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CatalogosController : ControllerBase
{
    private readonly ICatalogosService _catalogService;

    public CatalogosController(ICatalogosService catalogService)
    {
        _catalogService = catalogService;
    }

    [HttpGet("sectores")]
    public async Task<ActionResult<List<SectorCategory>>> GetSectors() =>
        Ok(await _catalogService.GetSectorsAsync());

    [HttpGet("subsectores")]
    public async Task<ActionResult<List<CatSubsector>>> GetSubsectors() =>
        Ok(await _catalogService.GetSubsectorsAsync());

    [HttpGet("subsectores/sector/{sectorId:int}")]
    public async Task<ActionResult<List<CatSubsector>>> GetSubsectorsBySector(int sectorId) =>
        Ok(await _catalogService.GetSubsectorsBySectorAsync(sectorId));

    [HttpGet("prioridades")]
    public async Task<ActionResult<List<CatPrioridad>>> GetPriorities() =>
        Ok(await _catalogService.GetPrioritiesAsync());

    [HttpGet("condiciones")]
    public async Task<ActionResult<List<CatCondicion>>> GetConditions() =>
        Ok(await _catalogService.GetConditionsAsync());

    [HttpGet("informaciones")]
    public async Task<ActionResult<List<CatInformacion>>> GetInformationItems() =>
        Ok(await _catalogService.GetInformationItemsAsync());

    [HttpGet("municipios")]
    public async Task<ActionResult<List<CatMunicipio>>> GetMunicipalities() =>
        Ok(await _catalogService.GetMunicipalitiesAsync());

    [HttpGet("delegaciones")]
    public async Task<ActionResult<List<CatDelegacion>>> GetDelegations() =>
        Ok(await _catalogService.GetDelegationsAsync());

    [HttpGet("medidas-seguridad")]
    public async Task<ActionResult<List<CatMedidaSeguridad>>> GetSecurityMeasures() =>
        Ok(await _catalogService.GetSecurityMeasuresAsync());
}
