using IRS.API.Data;
using IRS.API.Interfaces;
using IRS.API.Models;
using Microsoft.EntityFrameworkCore;
using Backend.Exceptions;

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

    public async Task<List<DispatchReport>> CreateDispatchReportsAsync(
        int reportId,
        IReadOnlyCollection<int> securityMeasureIds,
        string comment,
        string evidence,
        int userId)
    {
        var reportExists = await _context.Reports
            .AsNoTracking()
            .AnyAsync(report => report.Id == reportId && report.Active != 0);
        if (!reportExists)
            throw new RequestValidationException("La ficha indicada no existe o no está activa");

        var requestedIds = securityMeasureIds
            .Where(measureId => measureId > 0)
            .Distinct()
            .ToArray();
        var measures = await _context.SecurityMeasures
            .Where(measure => requestedIds.Contains(measure.MeasureCategoryId))
            .ToDictionaryAsync(measure => measure.MeasureCategoryId);
        if (requestedIds.Length == 0 || measures.Count != requestedIds.Length)
            throw new RequestValidationException("Una o más medidas de seguridad no son válidas");

        await using var transaction = await _context.Database.BeginTransactionAsync();
        var validationDate = DateTime.UtcNow;
        var dispatchReports = requestedIds.Select(measureId => new DispatchReport
        {
            ReportId = reportId,
            MeasureCategoryId = measureId,
            Comment = comment,
            Evidence = evidence,
            UserId = userId,
            ValidationDate = validationDate,
            SecurityMeasure = measures[measureId]
        }).ToList();

        _context.DispatchReports.AddRange(dispatchReports);

        var draft = await _context.DispatchMeasureDrafts
            .FirstOrDefaultAsync(item => item.ReportId == reportId && item.UserId == userId);
        if (draft != null)
            _context.DispatchMeasureDrafts.Remove(draft);

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return dispatchReports;
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

}
