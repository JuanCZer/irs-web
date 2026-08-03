using IRS.API.DTOs;
using IRS.API.Models;
using Backend.DTOs;

namespace IRS.API.Interfaces;

public interface IFichaService
{
  Task<List<FichaResponseDto>> GetAllAsync();
  Task<List<FichasTodosDto>> GetAllDtosAsync();
  Task<List<FichasTodosDto>> GetReportsByDateRangeAsync(DateTime startDate, DateTime endDate);
  Task<List<FichasTodosDto>> GetReportsForTodayAsync();
  Task<List<FichasTodosDto>> GetCompletedReportsAsync();
  Task<List<FichasBorradorDto>> GetDraftsAsync();
  Task<List<FichasBorradorDto>> SearchDraftsAsync(string criteria);
  Task<FichaInformativa?> GetByIdAsync(int id);
  Task<FichaInformativa> CreateAsync(FichaInformativa report, string user);
  Task<FichaInformativa?> UpdateAsync(int id, FichaInformativa report);
  Task<bool> DeleteAsync(int id);
  Task<List<FichaResponseDto>> SearchAsync(string criteria);
  Task<FichasEstadisticasDto> GetStatisticsAsync();
}
