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
            
            var roles = await _context.CatRoles
                .OrderBy(r => r.IdCatRol)
                .ToListAsync();

            return roles;
        }
    }
}
