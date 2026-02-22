using IRS.API.Models;

namespace IRS.API.Interfaces;

public interface IDespachoService
{
  Task<FichaDespacho> CrearFichaDespachoAsync(FichaDespacho fichaDespacho);
  Task<List<FichaDespacho>> ObtenerPorIdFichaAsync(int idFicha);
  Task<FichaDespacho?> ObtenerPorIdAsync(int idFichaDespacho);
}
