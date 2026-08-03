using IRS.API.Data;
using IRS.API.Interfaces;
using IRS.API.Models;
using Microsoft.EntityFrameworkCore;

namespace IRS.API.Services;

public class DispatchService : IDespachoService
{
    private const string DroneSecurityMeasure =
        "monitoreo policial: despliegue de dron";

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

    public async Task<List<DispatchReport>> GetDroneReportsAsync()
    {
        var droneReports = await _context.DispatchReports
            .AsNoTracking()
            .Include(fd => fd.InformationReport)
            .Include(fd => fd.SecurityMeasure)
            .Where(fd =>
                fd.SecurityMeasure != null &&
                fd.SecurityMeasure.Measure.Trim().ToLower() == DroneSecurityMeasure)
            .OrderByDescending(fd => fd.ValidationDate)
            .ToListAsync();

        // Si una ficha se validó más de una vez con despliegue de dron, se
        // conserva la asignación más reciente para evitar duplicarla.
        return droneReports
            .GroupBy(fd => fd.ReportId)
            .Select(group => group.First())
            .ToList();
    }

    public async Task<List<DispatchMeasureDraft>> GetMeasureDraftsAsync(
        int userId)
    {
        return await _context.DispatchMeasureDrafts
            .AsNoTracking()
            .Include(draft => draft.InformationReport)
            .Where(draft => draft.UserId == userId)
            .OrderByDescending(draft => draft.UpdatedAt)
            .ToListAsync();
    }

    public async Task<List<DispatchMeasureDraft>> GetDroneMeasureDraftsAsync(
        int userId)
    {
        var droneMeasureId = await _context.SecurityMeasures
            .Where(measure =>
                measure.Measure.Trim().ToLower() == DroneSecurityMeasure)
            .Select(measure => (int?)measure.MeasureCategoryId)
            .FirstOrDefaultAsync();

        if (!droneMeasureId.HasValue)
            return new List<DispatchMeasureDraft>();

        return await _context.DispatchMeasureDrafts
            .AsNoTracking()
            .Include(draft => draft.InformationReport)
            .Where(draft =>
                draft.UserId == userId &&
                draft.SecurityMeasureIds.Contains(droneMeasureId.Value))
            .OrderByDescending(draft => draft.UpdatedAt)
            .ToListAsync();
    }

    public async Task<DispatchMeasureDraft?> SaveMeasureDraftAsync(
        int reportId,
        int userId,
        IReadOnlyCollection<int> securityMeasureIds,
        string comment)
    {
        var requestedIds = securityMeasureIds.Distinct().ToArray();
        var validIds = await _context.SecurityMeasures
            .Where(measure => requestedIds.Contains(measure.MeasureCategoryId))
            .Select(measure => measure.MeasureCategoryId)
            .ToArrayAsync();
        var draft = await _context.DispatchMeasureDrafts
            .FirstOrDefaultAsync(item =>
                item.ReportId == reportId && item.UserId == userId);

        if (validIds.Length == 0 && string.IsNullOrWhiteSpace(comment))
        {
            if (draft != null)
            {
                _context.DispatchMeasureDrafts.Remove(draft);
                await _context.SaveChangesAsync();
            }
            return null;
        }

        if (draft == null)
        {
            draft = new DispatchMeasureDraft
            {
                ReportId = reportId,
                UserId = userId
            };
            _context.DispatchMeasureDrafts.Add(draft);
        }

        draft.SecurityMeasureIds = validIds;
        draft.Comment = comment;
        draft.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return draft;
    }

    public async Task DeleteMeasureDraftAsync(int reportId, int userId)
    {
        var draft = await _context.DispatchMeasureDrafts
            .FirstOrDefaultAsync(item =>
                item.ReportId == reportId && item.UserId == userId);
        if (draft == null) return;

        _context.DispatchMeasureDrafts.Remove(draft);
        await _context.SaveChangesAsync();
    }
}
