using Backend.Models;
using Backend.Services;
using IRS.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly ICatRolService _rolService;

        public RolesController(ICatRolService rolService)
        {
            _rolService = rolService;
        }

        // GET: api/roles
        [HttpGet]
        public async Task<ActionResult<List<CatRol>>> ObtenerTodosLosRoles()
        {
            try
            {
                Console.WriteLine("� GET /api/roles - Obteniendo catálogo de roles");
                var roles = await _rolService.ObtenerTodosLosRolesAsync();
                Console.WriteLine($"✅ Retornando {roles.Count} roles");
                return Ok(roles);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al obtener roles: {ex.Message}");
                Console.WriteLine($"   Stack: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"   Inner Exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { error = "Error al obtener los roles", detalle = ex.Message });
            }
        }
    }
}
