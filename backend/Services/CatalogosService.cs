using IRS.API.Data;
using IRS.API.Interfaces;
using IRS.API.Models;
using Microsoft.EntityFrameworkCore;

namespace IRS.API.Services;

public class CatalogosService : ICatalogosService
{
    private readonly IRSDbContext _context;

    public CatalogosService(IRSDbContext context)
    {
        _context = context;
    }

    public async Task<List<CatSector>> ObtenerSectoresAsync()
    {
        return await _context.CatSectores
            .OrderBy(s => s.Sector)
            .ToListAsync();
    }

    public async Task<List<CatSubsector>> ObtenerSubsectoresAsync()
    {
        return await _context.CatSubsectores
            .Include(ss => ss.CatSector)
            .Where(ss => ss.Estatus == 1)
            .OrderBy(ss => ss.Subsector)
            .ToListAsync();
    }

    public async Task<List<CatSubsector>> ObtenerSubsectoresPorSectorAsync(int idSector)
    {
        return await _context.CatSubsectores
            .Include(ss => ss.CatSector)
            .Where(ss => ss.IdCatSector == idSector && ss.Estatus == 1)
            .OrderBy(ss => ss.Subsector)
            .ToListAsync();
    }

    public async Task<List<CatPrioridad>> ObtenerPrioridadesAsync()
    {
        return await _context.CatPrioridades
            .OrderBy(p => p.Prioridad)
            .ToListAsync();
    }

    public async Task<List<CatCondicion>> ObtenerCondicionesAsync()
    {
        return await _context.CatCondiciones
            .OrderBy(c => c.Condicion)
            .ToListAsync();
    }

    public async Task<List<CatInformacion>> ObtenerInformacionesAsync()
    {
        return await _context.CatInformaciones
            .OrderBy(i => i.Informacion)
            .ToListAsync();
    }

    public async Task<List<CatMunicipio>> ObtenerMunicipiosAsync()
    {
        return await _context.CatMunicipios
            .OrderBy(m => m.Municipio)
            .ToListAsync();
    }

    public async Task<List<CatDelegacion>> ObtenerDelegacionesAsync()
    {
        return await _context.CatDelegaciones
            .OrderBy(d => d.Delegacion)
            .ToListAsync();
    }

    public async Task<List<CatMedidaSeguridad>> ObtenerMedidasSeguridadAsync()
    {
        return await _context.CatMedidasSeguridad
            .Where(m => m.Estatus == 1)
            .OrderBy(m => m.Medida)
            .ToListAsync();
    }
}
