using Backend.Models;
using IRS.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

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
    public async Task<ActionResult<List<CatRol>>> GetAllRoles() =>
        Ok(await _roleService.GetAllRolesAsync());
}
