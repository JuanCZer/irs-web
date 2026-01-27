using IRS.API.Models;

namespace IRS.API.Services;

public interface ICatalogosService
{
    Task<List<CatSector>> ObtenerSectoresAsync();
    Task<List<CatSubsector>> ObtenerSubsectoresAsync();
    Task<List<CatSubsector>> ObtenerSubsectoresPorSectorAsync(int idSector);
    Task<List<CatPrioridad>> ObtenerPrioridadesAsync();
    Task<List<CatCondicion>> ObtenerCondicionesAsync();
    Task<List<CatInformacion>> ObtenerInformacionesAsync();
    Task<List<CatMunicipio>> ObtenerMunicipiosAsync();
    Task<List<CatDelegacion>> ObtenerDelegacionesAsync();
    Task<List<CatMedidaSeguridad>> ObtenerMedidasSeguridadAsync();
}
