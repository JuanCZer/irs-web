using IRS.API.Models;

namespace IRS.API.Interfaces;

public interface IDespachoService
{
  Task<DispatchReport> CreateDispatchReportAsync(DispatchReport dispatchReport);
  Task<List<DispatchReport>> GetByReportIdAsync(int reportId);
  Task<DispatchReport?> GetByIdAsync(int dispatchReportId);
}
