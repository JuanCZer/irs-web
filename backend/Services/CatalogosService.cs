using IRS.API.Data;
using IRS.API.Interfaces;
using IRS.API.Models;
using Microsoft.EntityFrameworkCore;

namespace IRS.API.Services;

public class CatalogsService : ICatalogosService
{
    private readonly IRSDbContext _context;

    public CatalogsService(IRSDbContext context)
    {
        _context = context;
    }

    public async Task<List<SectorCategory>> GetSectorsAsync()
    {
        return await _context.Sectors
            .OrderBy(s => s.Sector)
            .ToListAsync();
    }

    public async Task<List<CatSubsector>> GetSubsectorsAsync()
    {
        return await _context.Subsectors
            .Include(ss => ss.SectorCategory)
            .Where(ss => ss.Status == 1)
            .OrderBy(ss => ss.Subsector)
            .ToListAsync();
    }

    public async Task<List<CatSubsector>> GetSubsectorsBySectorAsync(int sectorId)
    {
        return await _context.Subsectors
            .Include(ss => ss.SectorCategory)
            .Where(ss => ss.SectorCategoryId == sectorId && ss.Status == 1)
            .OrderBy(ss => ss.Subsector)
            .ToListAsync();
    }

    public async Task<List<CatPrioridad>> GetPrioritiesAsync()
    {
        return await _context.Priorities
            .OrderBy(p => p.Priority)
            .ToListAsync();
    }

    public async Task<List<CatCondicion>> GetConditionsAsync()
    {
        return await _context.Conditions
            .OrderBy(c => c.Condition)
            .ToListAsync();
    }

    public async Task<List<CatInformacion>> GetInformationItemsAsync()
    {
        return await _context.InformationItems
            .OrderBy(i => i.Information)
            .ToListAsync();
    }

    public async Task<List<CatMunicipio>> GetMunicipalitiesAsync()
    {
        return await _context.Municipalities
            .OrderBy(m => m.Municipality)
            .ToListAsync();
    }

    public async Task<List<CatDelegacion>> GetDelegationsAsync()
    {
        return await _context.Delegations
            .OrderBy(d => d.Delegation)
            .ToListAsync();
    }

    public async Task<List<CatMedidaSeguridad>> GetSecurityMeasuresAsync()
    {
        return await _context.SecurityMeasures
            .Where(m => m.Status == 1)
            .OrderBy(m => m.Measure)
            .ToListAsync();
    }
}
