namespace IRS.API.DTOs;

public class FichasTodosDto
{
    public int Id { get; set; }
    public string FechaElaboracion { get; set; } = string.Empty;
    public string Folio { get; set; } = string.Empty;
    public string FechaSuceso { get; set; } = string.Empty;
    public string HoraSuceso { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty; // Delegación
    public string Municipio { get; set; } = string.Empty;
    public string Lugar { get; set; } = string.Empty;
    public string Asunto { get; set; } = string.Empty;
    public string Prioridad { get; set; } = string.Empty;
    public string Sector { get; set; } = string.Empty;
    public int Asistentes { get; set; }
    public string EstadoActual { get; set; } = string.Empty; // Condición
    public string? Latitud { get; set; }
    public string? Longitud { get; set; }
}
