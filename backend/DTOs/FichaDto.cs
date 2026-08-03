namespace IRS.API.DTOs;

public class FichaInformativaDto
{
    public int? Id { get; set; }
    public int? CertificateNumber { get; set; }
    public string Delegation { get; set; } = string.Empty;
    public string Municipality { get; set; } = string.Empty;
    public string Place { get; set; } = string.Empty;
    public string? Latitude { get; set; }
    public string? Longitude { get; set; }
    public string EventStartTime { get; set; } = string.Empty;
    public string EventEndTime { get; set; } = string.Empty;
    public DateTime? EventDate { get; set; }
    public string Sector { get; set; } = string.Empty;
    public string Subsector { get; set; } = string.Empty;
    public int? AttendeeCount { get; set; }
    public DateTime? CreationDate { get; set; }
    public string CreationTime { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string Information { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Facts { get; set; } = string.Empty;
    public string Agreements { get; set; } = string.Empty;
    public int? ReporterId { get; set; }
    public int? UserId { get; set; }
    public int? AuthorizerId { get; set; }
    public DateTime? ReceptionDate { get; set; }
    public string ReceptionTime { get; set; } = string.Empty;
    public int? CurrentStatusId { get; set; }
    public string? CancellationReason { get; set; }
    public int Active { get; set; } = 0;
    public string? InternalReference { get; set; }
    public string Address { get; set; } = string.Empty;
    public int Seen { get; set; } = 0;
    public int? PreviousReportId { get; set; }
}

public class FichaResponseDto
{
    public int Id { get; set; }
    public string Delegation { get; set; } = string.Empty;
    public string Place { get; set; } = string.Empty;
    public string Sector { get; set; } = string.Empty;
    public DateTime? EventDate { get; set; }
    public string Priority { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public DateTime? CreationDate { get; set; }
}
