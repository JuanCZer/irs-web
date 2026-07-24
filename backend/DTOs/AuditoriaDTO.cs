namespace Backend.DTOs
{
    public class AuditoriaConsultaDTO
    {
        public string? Busqueda { get; set; }
        public int? IdUsuario { get; set; }
        public string? Modulo { get; set; }
        public string? Accion { get; set; }
        public bool? Exitoso { get; set; }
        public DateTimeOffset? FechaInicio { get; set; }
        public DateTimeOffset? FechaFin { get; set; }
        public int Pagina { get; set; } = 1;
        public int TamanoPagina { get; set; } = 25;
    }

    public class AuditoriaEventoDTO
    {
        public long IdAuditoria { get; set; }
        public int? IdUsuario { get; set; }
        public string Usuario { get; set; } = string.Empty;
        public string? NombreCompleto { get; set; }
        public string? Rol { get; set; }
        public string Accion { get; set; } = string.Empty;
        public string Modulo { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string? MetodoHttp { get; set; }
        public string? Ruta { get; set; }
        public string? Entidad { get; set; }
        public string? IdEntidad { get; set; }
        public string? DireccionIp { get; set; }
        public int CodigoEstado { get; set; }
        public bool Exitoso { get; set; }
        public DateTimeOffset FechaHora { get; set; }
        public string? Detalles { get; set; }
    }

    public class AuditoriaResumenDTO
    {
        public int TotalEventos { get; set; }
        public int EventosExitosos { get; set; }
        public int EventosConError { get; set; }
        public int UsuariosDistintos { get; set; }
    }

    public class AuditoriaPaginaDTO
    {
        public List<AuditoriaEventoDTO> Elementos { get; set; } = new();
        public AuditoriaResumenDTO Resumen { get; set; } = new();
        public int Pagina { get; set; }
        public int TamanoPagina { get; set; }
        public int TotalPaginas { get; set; }
    }

    public class RegistrarEventoAuditoriaDTO
    {
        public string Ruta { get; set; } = string.Empty;
    }

    public class RegistroAuditoriaDTO
    {
        public string Accion { get; set; } = string.Empty;
        public string Modulo { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string? MetodoHttp { get; set; }
        public string? Ruta { get; set; }
        public string? Entidad { get; set; }
        public string? IdEntidad { get; set; }
        public string? DireccionIp { get; set; }
        public string? AgenteUsuario { get; set; }
        public int CodigoEstado { get; set; }
        public bool Exitoso { get; set; }
        public string? Detalles { get; set; }
        public string? UsuarioAlternativo { get; set; }
    }
}
