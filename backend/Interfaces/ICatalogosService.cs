using IRS.API.Models;

namespace IRS.API.Interfaces;

public interface ICatalogosService
{
  Task<List<SectorCategory>> GetSectorsAsync();
  Task<List<CatSubsector>> GetSubsectorsAsync();
  Task<List<CatSubsector>> GetSubsectorsBySectorAsync(int sectorId);
  Task<List<CatPrioridad>> GetPrioritiesAsync();
  Task<List<CatCondicion>> GetConditionsAsync();
  Task<List<CatInformacion>> GetInformationItemsAsync();
  Task<List<CatMunicipio>> GetMunicipalitiesAsync();
  Task<List<CatDelegacion>> GetDelegationsAsync();
  Task<List<CatMedidaSeguridad>> GetSecurityMeasuresAsync();
}
