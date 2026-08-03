using Backend.Models;
using Backend.Services;
using IRS.API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    public class RolesController : ControllerBase
    {
        private readonly ICatRolService _roleService;

        public RolesController(ICatRolService roleService)
        {
            _roleService = roleService;
        }


        [HttpGet]
        public async Task<ActionResult<List<CatRol>>> GetAllRoles()
        {
            try
            {
                var roles = await _roleService.GetAllRolesAsync();
                return Ok(roles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al obtener los roles", details = ex.Message });
            }
        }
    }
}
