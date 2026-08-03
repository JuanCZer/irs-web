namespace IRS.API.DTOs;

public class EstadisticaDto
{
    public Dictionary<string, int> ReportsByState { get; set; } = new();
    public Dictionary<string, int> ReportsByPriority { get; set; } = new();
    public Dictionary<string, int> ReportsBySector { get; set; } = new();
    public List<EvolucionMensualDto> MonthlyEvolution { get; set; } = new();
    public int TotalReports { get; set; }
    public int ActiveReports { get; set; }
    public int CompletedReports { get; set; }
}

public class EvolucionMensualDto
{
    public string Month { get; set; } = string.Empty;
    public int Count { get; set; }
}
