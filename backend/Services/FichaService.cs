using IRS.API.Data;
using IRS.API.DTOs;
using IRS.API.Models;
using Microsoft.EntityFrameworkCore;
using Backend.DTOs;
using IRS.API.Interfaces;

namespace IRS.API.Services;

public class ReportService : IFichaService
{
    private readonly IRSDbContext _context;

    public ReportService(IRSDbContext context)
    {
        _context = context;
    }

    public async Task<List<FichaResponseDto>> GetAllAsync()
    {
        return await _context.Reports
            .OrderByDescending(f => f.CreationDate)
            .Select(f => new FichaResponseDto
            {
                Id = f.Id,
                Delegation = f.Delegation,
                Place = f.Place,
                Sector = f.Sector,
                EventDate = f.EventDate,
                Priority = f.Priority,
                Condition = f.Condition,
                CreationDate = f.CreationDate
            })
            .ToListAsync();
    }

    public async Task<List<FichasTodosDto>> GetAllDtosAsync()
    {
        var reports = await _context.Reports

            .Where(f => (f.Active == 2 || f.Active == 3 || f.Active == 6) &&
                       (f.CurrentStatusId == 2 || f.CurrentStatusId == 3 ||
                        f.CurrentStatusId == 4 || f.CurrentStatusId == 6 ||
                        f.CurrentStatusId == 7))
            .OrderByDescending(f => f.CreationDate)
            .ToListAsync();

        return reports.Select(f => MapToReportListDto(f)).ToList();
    }

    public async Task<List<FichasTodosDto>> GetReportsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {


        var startDateUtc = startDate.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(startDate, DateTimeKind.Utc)
            : startDate.ToUniversalTime();

        var endDateUtc = endDate.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(endDate, DateTimeKind.Utc)
            : endDate.ToUniversalTime();


        var adjustedEndDate = endDateUtc.Date.AddDays(1).AddTicks(-1);

        var reports = await _context.Reports
            .Where(f => (f.Active == 2 || f.Active == 3 || f.Active == 6) &&
                       (f.CurrentStatusId == 2 || f.CurrentStatusId == 3 ||
                        f.CurrentStatusId == 4 || f.CurrentStatusId == 6 ||
                        f.CurrentStatusId == 7) &&
                       f.CreationDate >= startDateUtc &&
                       f.CreationDate <= adjustedEndDate)
            .OrderByDescending(f => f.CreationDate)
            .ToListAsync();

        var result = reports.Select(f => MapToReportListDto(f)).ToList();

        return result;
    }

    public async Task<List<FichasTodosDto>> GetReportsForTodayAsync()
    {

        var today = DateTime.UtcNow.Date;
        var endOfDay = today.AddDays(1).AddTicks(-1);

        var reports = await _context.Reports
            .Where(f => (f.Active == 3 || f.Active == 6) &&
                       (f.CurrentStatusId == 2 || f.CurrentStatusId == 3 ||
                        f.CurrentStatusId == 4 || f.CurrentStatusId == 6 ||
                        f.CurrentStatusId == 7) &&
                       f.CreationDate >= today &&
                       f.CreationDate <= endOfDay)
            .OrderByDescending(f => f.CreationDate)
            .ToListAsync();

        return reports.Select(f => MapToReportListDto(f)).ToList();
    }

    public async Task<List<FichasTodosDto>> GetCompletedReportsAsync()
    {
      var reports = await _context.Reports
          .Where(f =>
              f.CurrentStatusId == 2 &&
              f.Active == 3 &&
              f.CertificateNumber.HasValue &&
              f.CertificateNumber.Value > 0 &&
              f.Condition == "CONCLUIDO"
          )
          .OrderByDescending(f => f.CreationDate)
          .ToListAsync();

      return reports.Select(f => MapToReportListDto(f)).ToList();
    }

    public async Task<List<FichasBorradorDto>> GetDraftsAsync()
    {
        var drafts = await _context.Reports
            .Where(f => f.Active == 2)
            .OrderByDescending(f => f.CreationDate)
            .ToListAsync();

        if (drafts.Any())
        {
            var first = drafts.First();
        }

        return drafts.Select(f => MapToDraftReportDto(f)).ToList();
    }

    public async Task<List<FichasBorradorDto>> SearchDraftsAsync(string criteria)
    {
        var drafts = await _context.Reports
            .Where(f => f.Active == 2 &&
                (f.Delegation.Contains(criteria) ||
                 f.Sector.Contains(criteria) ||
                 f.Priority.Contains(criteria) ||
                 f.Condition.Contains(criteria) ||
                 f.Place.Contains(criteria) ||
                 f.Subject.Contains(criteria)))
            .OrderByDescending(f => f.CreationDate)
            .ToListAsync();

        return drafts.Select(f => MapToDraftReportDto(f)).ToList();
    }

    private FichasTodosDto MapToReportListDto(FichaInformativa report)
    {
        var referenceNumber = report.InternalReference ?? $"F-{report.Id.ToString().PadLeft(6, '0')}";

        var startTime = FormatTimeSpan(report.EventStartTime, report.Id, "HoraSucesoInicio");
        var endTime = FormatTimeSpan(report.EventEndTime, report.Id, "HoraSucesoFin");

        var eventTime = startTime != null && endTime != null
            ? $"{startTime} - {endTime}"
            : startTime ?? endTime ?? "N/A";

        return new FichasTodosDto
        {
            Id = report.Id,
            CreationDate = report.CreationDate?.ToString("yyyy-MM-dd") ?? "",
            ReferenceNumber = referenceNumber,
            EventDate = report.EventDate?.ToString("yyyy-MM-dd") ?? "",
            EventTime = eventTime,
            State = report.Delegation,
            Municipality = report.Municipality,
            Place = report.Place ?? "",
            Subject = report.Subject ?? "",
            Priority = report.Priority,
            Sector = report.Sector,
            Attendees = report.AttendeeCount ?? 0,
            CurrentStatus = report.Condition,
            Latitude = report.Latitude,
            Longitude  = report.Longitude,
};
    }

    private string? FormatTimeSpan(TimeSpan? timeSpan, int reportId, string fieldName)
    {
        if (timeSpan == null) return null;

        try
        {
            return timeSpan.Value.ToString(@"hh\:mm");
        }
        catch (Exception)
        {
            return null;
        }
    }

    private FichasBorradorDto MapToDraftReportDto(FichaInformativa report)
    {

        var eventTime = report.EventEndTime?.ToString(@"HH\:mm") ?? "Sin hora";

        return new FichasBorradorDto
        {
            Id = report.Id,
            CreationDate = report.CreationDate?.ToString("yyyy-MM-dd") ?? "Sin fecha",
            EventDate = report.EventDate?.ToString("yyyy-MM-dd") ?? "Sin fecha",
            EventTime = eventTime,
            State = !string.IsNullOrWhiteSpace(report.Delegation) ? report.Delegation : "Sin delegación",
            Priority = !string.IsNullOrWhiteSpace(report.Priority) ? report.Priority : "Sin prioridad",
            Sector = !string.IsNullOrWhiteSpace(report.Sector) ? report.Sector : "Sin sector",
            Attendees = report.AttendeeCount ?? 0,
            CurrentStatus = !string.IsNullOrWhiteSpace(report.Condition) ? report.Condition : "Sin condición",
            DraftUser = report.UserId?.ToString() ?? "Sin usuario"
        };
    }
    public async Task<FichaInformativa?> GetByIdAsync(int id)
    {
        return await _context.Reports.FindAsync(id);
    }

    public async Task<FichaInformativa> CreateAsync(FichaInformativa report, string user)
    {

        int.TryParse(user, out var userId);
        if (userId == 0) userId = 1;


        if (report.UserId == null || report.UserId == 0)
            report.UserId = userId;

        if (report.CreationDate == null)
            report.CreationDate = DateTime.UtcNow;

        _context.Reports.Add(report);
        await _context.SaveChangesAsync();

        return report;
    }

    public async Task<FichaInformativa?> UpdateAsync(int id, FichaInformativa report)
    {
        var existingReport = await _context.Reports.FindAsync(id);
        if (existingReport == null) return null;


        existingReport.CertificateNumber = report.CertificateNumber;
        existingReport.Delegation = report.Delegation;
        existingReport.Municipality = report.Municipality;
        existingReport.Place = report.Place;
        existingReport.Latitude = report.Latitude;
        existingReport.Longitude = report.Longitude;
        existingReport.Address = report.Address;
        existingReport.Sector = report.Sector;
        existingReport.Subsector = report.Subsector;
        existingReport.EventStartTime = report.EventStartTime;
        existingReport.EventEndTime = report.EventEndTime;
        existingReport.EventDate = report.EventDate;
        existingReport.AttendeeCount = report.AttendeeCount;
        existingReport.CreationDate = report.CreationDate;
        existingReport.CreationTime = report.CreationTime;
        existingReport.Priority = report.Priority;
        existingReport.Condition = report.Condition;
        existingReport.Information = report.Information;
        existingReport.Subject = report.Subject;
        existingReport.Facts = report.Facts;
        existingReport.Agreements = report.Agreements;
        existingReport.ReporterId = report.ReporterId;
        existingReport.UserId = report.UserId;
        existingReport.AuthorizerId = report.AuthorizerId;
        existingReport.ReceptionDate = report.ReceptionDate;
        existingReport.ReceptionTime = report.ReceptionTime;
        existingReport.CurrentStatusId = report.CurrentStatusId;
        existingReport.CancellationReason = report.CancellationReason;
        existingReport.Active = report.Active;
        existingReport.InternalReference = report.InternalReference;
        existingReport.Seen = report.Seen;
        existingReport.PreviousReportId = report.PreviousReportId;
        existingReport.ValidationDate = report.ValidationDate;

        await _context.SaveChangesAsync();
        return existingReport;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var report = await _context.Reports.FindAsync(id);
        if (report == null) return false;

        _context.Reports.Remove(report);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<FichaResponseDto>> SearchAsync(string criteria)
    {
        var query = _context.Reports.AsQueryable();

        if (!string.IsNullOrWhiteSpace(criteria))
        {
            criteria = criteria.ToLower();
            query = query.Where(f =>
                f.Delegation.ToLower().Contains(criteria) ||
                f.Place.ToLower().Contains(criteria) ||
                f.Sector.ToLower().Contains(criteria) ||
                f.Subject.ToLower().Contains(criteria)
            );
        }

        return await query
            .OrderByDescending(f => f.CreationDate)
            .Select(f => new FichaResponseDto
            {
                Id = f.Id,
                Delegation = f.Delegation,
                Place = f.Place,
                Sector = f.Sector,
                EventDate = f.EventDate,
                Priority = f.Priority,
                Condition = f.Condition,
                CreationDate = f.CreationDate
            })
            .ToListAsync();
    }

    public async Task<FichasEstadisticasDto> GetStatisticsAsync()
    {
        try
        {
            var today = DateTime.UtcNow.Date;
            var weekStart = today.AddDays(-(int)today.DayOfWeek);
            var monthStart = new DateTime(today.Year, today.Month, 1);
            var currentYearStart = new DateTime(today.Year, 1, 1);
            var previousYearStart = new DateTime(today.Year - 1, 1, 1);
            var previousYearEnd = new DateTime(today.Year - 1, 12, 31);

            var allReports = await _context.Reports.ToListAsync();

            var totalReports = allReports.Count;
            var reportsToday = allReports.Count(f => f.CreationDate.HasValue && f.CreationDate.Value.Date == today);
            var reportsThisWeek = allReports.Count(f => f.CreationDate.HasValue && f.CreationDate.Value.Date >= weekStart && f.CreationDate.Value.Date <= today);
            var reportsThisMonth = allReports.Count(f => f.CreationDate.HasValue && f.CreationDate.Value >= monthStart && f.CreationDate.Value < monthStart.AddMonths(1));


            var daysInMonth = DateTime.DaysInMonth(today.Year, today.Month);
            var monthlyAverage = reportsThisMonth > 0 ? (decimal)reportsThisMonth / daysInMonth : 0;


            var previousMonthStart = monthStart.AddMonths(-1);
            var reportsPreviousMonth = allReports.Count(f => f.CreationDate.HasValue && f.CreationDate.Value >= previousMonthStart && f.CreationDate.Value < monthStart);
            var daysInPreviousMonth = DateTime.DaysInMonth(previousMonthStart.Year, previousMonthStart.Month);
            var previousMonthAverage = reportsPreviousMonth > 0 ? (decimal)reportsPreviousMonth / daysInPreviousMonth : 0;

            decimal monthlyGrowth = 0;
            if (previousMonthAverage > 0)
            {
                monthlyGrowth = ((monthlyAverage - previousMonthAverage) / previousMonthAverage) * 100;
            }
            else if (monthlyAverage > 0)
            {
                monthlyGrowth = 100;
            }

            var summary = new EstadisticasResumenDto
            {
                TotalReports = totalReports,
                ReportsToday = reportsToday,
                ReportsThisWeek = reportsThisWeek,
                ReportsThisMonth = reportsThisMonth,
                MonthlyAverage = Math.Round(monthlyAverage, 2),
                MonthlyGrowth = Math.Round(monthlyGrowth, 2)
            };

            var reportsByDelegation = allReports
                .GroupBy(f => f.Delegation ?? "Sin delegación")
                .OrderByDescending(g => g.Count())
                .ToList();

            var reportsByState = new FichasPorEstadoDto();
            foreach (var group in reportsByDelegation.Take(6))
            {
                reportsByState.Labels.Add(group.Key);
                reportsByState.Data.Add(group.Count());
            }


            if (reportsByDelegation.Count > 6)
            {
                var others = reportsByDelegation.Skip(6).Sum(g => g.Count());
                reportsByState.Labels.Add("Otros");
                reportsByState.Data.Add(others);
            }

            var reportsByMonth = new FichasPorMesDto();
            var months = new[] { "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic" };

            for (int month = 1; month <= 12; month++)
            {
                var startOfMonth = new DateTime(today.Year, month, 1);
                var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);
                var reportsInMonth = allReports.Count(f => f.CreationDate.HasValue &&
                    f.CreationDate.Value >= startOfMonth &&
                    f.CreationDate.Value <= endOfMonth);

                reportsByMonth.Labels.Add(months[month - 1]);
                reportsByMonth.Data.Add(reportsInMonth);
            }

            var monthlyTrend = new TendenciaMensualDto();
            var previousYearData = new List<int>();
            var currentYearData = new List<int>();

            for (int month = 1; month <= 6; month++)
            {
                var previousYearMonthStart = new DateTime(today.Year - 1, month, 1);
                var previousYearMonthEnd = previousYearMonthStart.AddMonths(1).AddDays(-1);
                var previousYearReports = allReports.Count(f => f.CreationDate.HasValue &&
                    f.CreationDate.Value >= previousYearMonthStart &&
                    f.CreationDate.Value <= previousYearMonthEnd);

                var currentYearMonthStart = new DateTime(today.Year, month, 1);
                var currentYearMonthEnd = currentYearMonthStart.AddMonths(1).AddDays(-1);
                var currentYearReports = allReports.Count(f => f.CreationDate.HasValue &&
                    f.CreationDate.Value >= currentYearMonthStart &&
                    f.CreationDate.Value <= currentYearMonthEnd);

                monthlyTrend.Labels.Add(months[month - 1]);
                previousYearData.Add(previousYearReports);
                currentYearData.Add(currentYearReports);
            }

            monthlyTrend.Datasets.Add(new DatasetDto { Label = (today.Year - 1).ToString(), Data = previousYearData });
            monthlyTrend.Datasets.Add(new DatasetDto { Label = today.Year.ToString(), Data = currentYearData });

            return new FichasEstadisticasDto
            {
                Summary = summary,
                ReportsByState = reportsByState,
                ReportsByMonth = reportsByMonth,
                MonthlyTrend = monthlyTrend
            };
        }
        catch (Exception)
        {
            throw;
        }
    }
}
