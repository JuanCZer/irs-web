namespace IRS.API.DTOs;

public class FichasBorradorDto
{
    public int Id { get; set; }
    public string FechaElaboracion { get; set; } = string.Empty;
    public string FechaSuceso { get; set; } = string.Empty;
    public string HoraSuceso { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty; // Delegación
    public string Prioridad { get; set; } = string.Empty;
    public string Sector { get; set; } = string.Empty;
    public int Asistentes { get; set; }
    public string EstadoActual { get; set; } = string.Empty; // Condición
    public string BorradorUsuario { get; set; } = string.Empty;
}
