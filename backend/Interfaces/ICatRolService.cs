using Backend.Models;

namespace IRS.API.Interfaces
{
  public interface ICatRolService
  {
    Task<List<CatRol>> ObtenerTodosLosRolesAsync();
  }
}
