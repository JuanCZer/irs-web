using IRS.API.Models;

namespace IRS.API.Services;

public interface IDespachoService
{
    Task<FichaDespacho> CrearFichaDespachoAsync(FichaDespacho fichaDespacho);
    Task<List<FichaDespacho>> ObtenerPorIdFichaAsync(int idFicha);
    Task<FichaDespacho?> ObtenerPorIdAsync(int idFichaDespacho);
}
