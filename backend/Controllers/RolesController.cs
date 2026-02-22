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
                var roles = await _rolService.ObtenerTodosLosRolesAsync();
                return Ok(roles);
            }
            catch (Exception ex)
            {
                if (ex.InnerException != null)
                {
                }
                return StatusCode(500, new { error = "Error al obtener los roles", detalle = ex.Message });
            }
        }
    }
}
