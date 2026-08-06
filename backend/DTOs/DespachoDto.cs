using System.ComponentModel.DataAnnotations;
using Backend.Security;

namespace IRS.API.DTOs;

public class ValidarFichaDespachoDto
{
    [Range(1, int.MaxValue)]
    public int ReportId { get; set; }

    [Required]
    [MinLength(1)]
    [MaxLength(50)]
    public List<int> SecurityMeasureIds { get; set; } = new List<int>();

    [StringLength(4000)]
    public string Comment { get; set; } = string.Empty;

    [Required]
    [PngEvidence]
    public string? Evidence { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
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

public class FichaDronResponseDto
{
    public int DispatchReportId { get; set; }
    public int ReportId { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public DateTime? EventDate { get; set; }
    public DateTime ValidationDate { get; set; }
    public string Delegation { get; set; } = string.Empty;
    public string Municipality { get; set; } = string.Empty;
    public string Place { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public string SecurityMeasure { get; set; } = string.Empty;
    public bool PendingValidation { get; set; }
}

public class GuardarBorradorMedidasDto
{
    [MaxLength(50)]
    public List<int> SecurityMeasureIds { get; set; } = new();

    [StringLength(4000)]
    public string Comment { get; set; } = string.Empty;
}

public class BorradorMedidasResponseDto
{
    public int ReportId { get; set; }
    public List<int> SecurityMeasureIds { get; set; } = new();
    public string Comment { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
}
