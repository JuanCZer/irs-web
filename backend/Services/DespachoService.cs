using IRS.API.Data;
using IRS.API.Interfaces;
using IRS.API.Models;
using Microsoft.EntityFrameworkCore;

namespace IRS.API.Services;

public class DespachoService : IDespachoService
{
    private readonly IRSDbContext _context;

    public DespachoService(IRSDbContext context)
    {
        _context = context;
    }

    public async Task<FichaDespacho> CrearFichaDespachoAsync(FichaDespacho fichaDespacho)
    {
        fichaDespacho.FechaValidacion = DateTime.UtcNow;
        
        _context.FichasDespacho.Add(fichaDespacho);
        await _context.SaveChangesAsync();
        
        return fichaDespacho;
    }

    public async Task<List<FichaDespacho>> ObtenerPorIdFichaAsync(int idFicha)
    {
        return await _context.FichasDespacho
            .Include(fd => fd.FichaInformativa)
            .Include(fd => fd.CatMedidaSeguridad)
            .Include(fd => fd.Usuario)
            .Where(fd => fd.IdFicha == idFicha)
            .OrderByDescending(fd => fd.FechaValidacion)
            .ToListAsync();
    }

    public async Task<FichaDespacho?> ObtenerPorIdAsync(int idFichaDespacho)
    {
        return await _context.FichasDespacho
            .Include(fd => fd.FichaInformativa)
            .Include(fd => fd.CatMedidaSeguridad)
            .Include(fd => fd.Usuario)
            .FirstOrDefaultAsync(fd => fd.IdFichaDespacho == idFichaDespacho);
    }
}
