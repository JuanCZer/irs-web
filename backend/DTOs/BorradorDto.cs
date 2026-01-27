namespace IRS.API.DTOs;

public class BorradorDto
{
    public string BorradorId { get; set; } = string.Empty;
    public DateTime FechaElaboracion { get; set; }
    public DateTime FechaSuceso { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string HoraInicioSuceso { get; set; } = string.Empty;
    public string HoraFinSuceso { get; set; } = string.Empty;
    public string Prioridad { get; set; } = string.Empty;
    public string Sector { get; set; } = string.Empty;
    public int? NumeroAsistentes { get; set; }
    public string EstadoActual { get; set; } = string.Empty;
    public string BorradorUsuario { get; set; } = string.Empty;
    public object? DatosCompletos { get; set; }
}

public class BorradorResponseDto
{
    public int Id { get; set; }
    public string BorradorId { get; set; } = string.Empty;
    public DateTime FechaElaboracion { get; set; }
    public DateTime FechaSuceso { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string EstadoActual { get; set; } = string.Empty;
}
