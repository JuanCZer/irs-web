namespace IRS.API.DTOs;

public class EstadisticaDto
{
    public Dictionary<string, int> FichasPorEstado { get; set; } = new();
    public Dictionary<string, int> FichasPorPrioridad { get; set; } = new();
    public Dictionary<string, int> FichasPorSector { get; set; } = new();
    public List<EvolucionMensualDto> EvolucionMensual { get; set; } = new();
    public int TotalFichas { get; set; }
    public int FichasActivas { get; set; }
    public int FichasFinalizadas { get; set; }
}

public class EvolucionMensualDto
{
    public string Mes { get; set; } = string.Empty;
    public int Cantidad { get; set; }
}
