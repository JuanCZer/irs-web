namespace IRS.API.DTOs;

public class FichaInformativaDto
{
    public int? Id { get; set; }
    public int? Cedula { get; set; }
    public string Delegacion { get; set; } = string.Empty;
    public string Municipio { get; set; } = string.Empty;
    public string Lugar { get; set; } = string.Empty;
    public string? Latitud { get; set; }
    public string? Longitud { get; set; }
    public string HoraSucesoInicio { get; set; } = string.Empty;
    public string HoraSucesoFin { get; set; } = string.Empty;
    public DateTime? FechaSuceso { get; set; }
    public string Sector { get; set; } = string.Empty;
    public string Subsector { get; set; } = string.Empty;
    public int? NumAsistentes { get; set; }
    public DateTime? FechaElaboracion { get; set; }
    public string HoraElaboracion { get; set; } = string.Empty;
    public string Prioridad { get; set; } = string.Empty;
    public string Condicion { get; set; } = string.Empty;
    public string Informacion { get; set; } = string.Empty;
    public string Asunto { get; set; } = string.Empty;
    public string Hechos { get; set; } = string.Empty;
    public string Acuerdos { get; set; } = string.Empty;
    public int? IdInformo { get; set; }
    public int? IdUsuario { get; set; }
    public int? IdAutorizo { get; set; }
    public DateTime? FechaRecepcion { get; set; }
    public string HoraRecepcion { get; set; } = string.Empty;
    public int? IdEstadoActual { get; set; }
    public string? MotivoCancelacion { get; set; }
    public int Activo { get; set; } = 0;
    public string? FolioInterno { get; set; }
    public string Direccion { get; set; } = string.Empty;
    public int Visto { get; set; } = 0;
    public int? IdFichaAnterior { get; set; }
}

public class FichaResponseDto
{
    public int Id { get; set; }
    public string Delegacion { get; set; } = string.Empty;
    public string Lugar { get; set; } = string.Empty;
    public string Sector { get; set; } = string.Empty;
    public DateTime? FechaSuceso { get; set; }
    public string Prioridad { get; set; } = string.Empty;
    public string Condicion { get; set; } = string.Empty;
    public DateTime? FechaElaboracion { get; set; }
}
