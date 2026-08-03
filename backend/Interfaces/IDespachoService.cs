using IRS.API.Models;

namespace IRS.API.Interfaces;

public interface IDespachoService
{
  Task<DispatchReport> CreateDispatchReportAsync(DispatchReport dispatchReport);
  Task<List<DispatchReport>> GetByReportIdAsync(int reportId);
  Task<DispatchReport?> GetByIdAsync(int dispatchReportId);
  Task<List<DispatchReport>> GetDroneReportsAsync();
  Task<List<DispatchMeasureDraft>> GetMeasureDraftsAsync(int userId);
  Task<List<DispatchMeasureDraft>> GetDroneMeasureDraftsAsync(int userId);
  Task<DispatchMeasureDraft?> SaveMeasureDraftAsync(
    int reportId,
    int userId,
    IReadOnlyCollection<int> securityMeasureIds,
    string comment);
  Task DeleteMeasureDraftAsync(int reportId, int userId);
}
