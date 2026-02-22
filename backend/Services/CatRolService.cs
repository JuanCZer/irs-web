using Backend.Models;
using IRS.API.Data;
using Microsoft.EntityFrameworkCore;
using IRS.API.Interfaces;

namespace Backend.Services
{
    public class CatRolService : ICatRolService
    {
        private readonly IRSDbContext _context;

        public CatRolService(IRSDbContext context)
        {
            _context = context;
        }

        public async Task<List<CatRol>> ObtenerTodosLosRolesAsync()
        {
            Console.WriteLine("📋 Obteniendo catálogo de roles...");
            
            var roles = await _context.CatRoles
                .OrderBy(r => r.IdCatRol)
                .ToListAsync();

            Console.WriteLine($"✅ Total roles encontrados: {roles.Count}");

            return roles;
        }
    }
}
