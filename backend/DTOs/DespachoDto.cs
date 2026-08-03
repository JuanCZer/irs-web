namespace IRS.API.DTOs;

public class ValidarFichaDespachoDto
{
    public int ReportId { get; set; }
    public List<int> SecurityMeasureIds { get; set; } = new List<int>();
    public string Comment { get; set; } = string.Empty;
    public string? Evidence { get; set; }
    public int? UserId { get; set; }
}

public class FichaDespachoResponseDto
{
    public int DispatchReportId { get; set; }
    public int ReportId { get; set; }
    public int MeasureCategoryId { get; set; }
    public string SecurityMeasure { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public string? Evidence { get; set; }
    public DateTime ValidationDate { get; set; }
    public int? UserId { get; set; }
    public string? UserName { get; set; }
}
