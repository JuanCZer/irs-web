namespace Backend.DTOs
{
    public class AuditoriaConsultaDTO
    {
        public string? Search { get; set; }
        public int? UserId { get; set; }
        public string? Module { get; set; }
        public string? Action { get; set; }
        public bool? Successful { get; set; }
        public DateTimeOffset? StartDate { get; set; }
        public DateTimeOffset? EndDate { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 25;
    }

    public class AuditoriaEventoDTO
    {
        public long AuditId { get; set; }
        public int? UserId { get; set; }
        public string User { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Role { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? HttpMethod { get; set; }
        public string? Path { get; set; }
        public string? Entity { get; set; }
        public string? EntityId { get; set; }
        public string? IpAddress { get; set; }
        public int StatusCode { get; set; }
        public bool Successful { get; set; }
        public DateTimeOffset DateTime { get; set; }
        public string? Details { get; set; }
    }

    public class AuditoriaResumenDTO
    {
        public int TotalEvents { get; set; }
        public int SuccessfulEvents { get; set; }
        public int FailedEvents { get; set; }
        public int DistinctUsers { get; set; }
    }

    public class AuditoriaPaginaDTO
    {
        public List<AuditoriaEventoDTO> Items { get; set; } = new();
        public AuditoriaResumenDTO Summary { get; set; } = new();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class RegistrarEventoAuditoriaDTO
    {
        public string Path { get; set; } = string.Empty;
    }

    public class RegistroAuditoriaDTO
    {
        public string Action { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? HttpMethod { get; set; }
        public string? Path { get; set; }
        public string? Entity { get; set; }
        public string? EntityId { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public int StatusCode { get; set; }
        public bool Successful { get; set; }
        public string? Details { get; set; }
        public string? FallbackUser { get; set; }
    }
}
