using IRS.API.Data;
using IRS.API.Interfaces;
using IRS.API.Models;
using Microsoft.EntityFrameworkCore;

namespace IRS.API.Services;

public class DispatchService : IDespachoService
{
    private readonly IRSDbContext _context;

    public DispatchService(IRSDbContext context)
    {
        _context = context;
    }

    public async Task<DispatchReport> CreateDispatchReportAsync(DispatchReport dispatchReport)
    {
        dispatchReport.ValidationDate = DateTime.UtcNow;

        _context.DispatchReports.Add(dispatchReport);
        await _context.SaveChangesAsync();

        return dispatchReport;
    }

    public async Task<List<DispatchReport>> GetByReportIdAsync(int reportId)
    {
        return await _context.DispatchReports
            .Include(fd => fd.InformationReport)
            .Include(fd => fd.SecurityMeasure)
            .Include(fd => fd.User)
            .Where(fd => fd.ReportId == reportId)
            .OrderByDescending(fd => fd.ValidationDate)
            .ToListAsync();
    }

    public async Task<DispatchReport?> GetByIdAsync(int dispatchReportId)
    {
        return await _context.DispatchReports
            .Include(fd => fd.InformationReport)
            .Include(fd => fd.SecurityMeasure)
            .Include(fd => fd.User)
            .FirstOrDefaultAsync(fd => fd.DispatchReportId == dispatchReportId);
    }
}
