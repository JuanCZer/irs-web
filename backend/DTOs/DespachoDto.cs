namespace IRS.API.DTOs;

public class ValidarFichaDespachoDto
{
    public int IdFicha { get; set; }
    public List<int> IdsMedidasSeguridad { get; set; } = new List<int>();
    public string Comentario { get; set; } = string.Empty;
    public string? Evidencia { get; set; }
    public int? IdUsuario { get; set; }
}

public class FichaDespachoResponseDto
{
    public int IdFichaDespacho { get; set; }
    public int IdFicha { get; set; }
    public int IdCatMedida { get; set; }
    public string MedidaSeguridad { get; set; } = string.Empty;
    public string Comentario { get; set; } = string.Empty;
    public string? Evidencia { get; set; }
    public DateTime FechaValidacion { get; set; }
    public int? IdUsuario { get; set; }
    public string? NombreUsuario { get; set; }
}
