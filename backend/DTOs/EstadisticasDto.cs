namespace Backend.DTOs
{
    public class EstadisticasResumenDto
    {
        public int TotalReports { get; set; }
        public int ReportsToday { get; set; }
        public int ReportsThisWeek { get; set; }
        public int ReportsThisMonth { get; set; }
        public decimal MonthlyAverage { get; set; }
        public decimal MonthlyGrowth { get; set; }
    }

    public class FichasEstadisticasDto
    {
        public EstadisticasResumenDto Summary { get; set; } = new();
        public FichasPorEstadoDto ReportsByState { get; set; } = new();
        public FichasPorMesDto ReportsByMonth { get; set; } = new();
        public TendenciaMensualDto MonthlyTrend { get; set; } = new();
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
