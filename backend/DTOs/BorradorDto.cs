namespace IRS.API.DTOs;

public class BorradorDto
{
    public string DraftId { get; set; } = string.Empty;
    public DateTime CreationDate { get; set; }
    public DateTime EventDate { get; set; }
    public string State { get; set; } = string.Empty;
    public string EventStartTime { get; set; } = string.Empty;
    public string EventEndTime { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Sector { get; set; } = string.Empty;
    public int? AttendeeCount { get; set; }
    public string CurrentStatus { get; set; } = string.Empty;
    public string DraftUser { get; set; } = string.Empty;
    public object? CompleteData { get; set; }
}

public class BorradorResponseDto
{
    public int Id { get; set; }
    public string DraftId { get; set; } = string.Empty;
    public DateTime CreationDate { get; set; }
    public DateTime EventDate { get; set; }
    public string State { get; set; } = string.Empty;
    public string CurrentStatus { get; set; } = string.Empty;
}
