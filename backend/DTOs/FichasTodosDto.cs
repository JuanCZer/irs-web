namespace IRS.API.DTOs;

public class FichasTodosDto
{
    public int Id { get; set; }
    public string CreationDate { get; set; } = string.Empty;
    public string ReferenceNumber { get; set; } = string.Empty;
    public string EventDate { get; set; } = string.Empty;
    public string EventTime { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Municipality { get; set; } = string.Empty;
    public string Place { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Sector { get; set; } = string.Empty;
    public int Attendees { get; set; }
    public string CurrentStatus { get; set; } = string.Empty;
    public string? Latitude { get; set; }
    public string? Longitude { get; set; }
}
