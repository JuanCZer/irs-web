namespace Backend.DTOs
{
    public class EstadisticasResumenDto
    {
        public int TotalFichas { get; set; }
        public int FichasHoy { get; set; }
        public int FichasSemana { get; set; }
        public int FichasMes { get; set; }
        public decimal PromedioMensual { get; set; }
        public decimal CrecimientoMensual { get; set; }
    }

    public class FichasEstadisticasDto
    {
        public EstadisticasResumenDto Resumen { get; set; } = new();
        public FichasPorEstadoDto FichasPorEstado { get; set; } = new();
        public FichasPorMesDto FichasPorMes { get; set; } = new();
        public TendenciaMensualDto TendenciaMensual { get; set; } = new();
    }

    public class FichasPorEstadoDto
    {
        public List<string> Labels { get; set; } = new();
        public List<int> Data { get; set; } = new();
    }

    public class FichasPorMesDto
    {
        public List<string> Labels { get; set; } = new();
        public List<int> Data { get; set; } = new();
    }

    public class TendenciaMensualDto
    {
        public List<string> Labels { get; set; } = new();
        public List<DatasetDto> Datasets { get; set; } = new();
    }

    public class DatasetDto
    {
        public string Label { get; set; } = string.Empty;
        public List<int> Data { get; set; } = new();
    }
}
