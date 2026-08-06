using IRS.API.Models;

namespace IRS.API.Interfaces;

public interface IDespachoService
{
  Task<List<DispatchReport>> CreateDispatchReportsAsync(
    int reportId,
    IReadOnlyCollection<int> securityMeasureIds,
    string comment,
    string evidence,
    int userId);
  Task<List<DispatchReport>> GetByReportIdAsync(int reportId);
  Task<List<DispatchReport>> GetDroneReportsAsync();
  Task<List<DispatchMeasureDraft>> GetMeasureDraftsAsync(int userId);
  Task<List<DispatchMeasureDraft>> GetDroneMeasureDraftsAsync(int userId);
  Task<DispatchMeasureDraft?> SaveMeasureDraftAsync(
    int reportId,
    int userId,
    IReadOnlyCollection<int> securityMeasureIds,
    string comment);
}
