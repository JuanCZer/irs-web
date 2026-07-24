using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("auditoria_evento", Schema = "public")]
    public class AuditoriaEvento
    {
        [Key]
        [Column("id_auditoria")]
        public long IdAuditoria { get; set; }

        [Column("id_usuario")]
        public int? IdUsuario { get; set; }

        [Column("usuario")]
        [MaxLength(100)]
        public string Usuario { get; set; } = "ANONIMO";

        [Column("nombre_completo")]
        [MaxLength(300)]
        public string? NombreCompleto { get; set; }

        [Column("rol")]
        [MaxLength(100)]
        public string? Rol { get; set; }

        [Column("accion")]
        [MaxLength(100)]
        public string Accion { get; set; } = string.Empty;

        [Column("modulo")]
        [MaxLength(100)]
        public string Modulo { get; set; } = string.Empty;

        [Column("descripcion")]
        [MaxLength(600)]
        public string Descripcion { get; set; } = string.Empty;

        [Column("metodo_http")]
        [MaxLength(10)]
        public string? MetodoHttp { get; set; }

        [Column("ruta")]
        [MaxLength(500)]
        public string? Ruta { get; set; }

        [Column("entidad")]
        [MaxLength(100)]
        public string? Entidad { get; set; }

        [Column("id_entidad")]
        [MaxLength(100)]
        public string? IdEntidad { get; set; }

        [Column("direccion_ip")]
        [MaxLength(64)]
        public string? DireccionIp { get; set; }

        [Column("agente_usuario")]
        [MaxLength(500)]
        public string? AgenteUsuario { get; set; }

        [Column("codigo_estado")]
        public int CodigoEstado { get; set; }

        [Column("exitoso")]
        public bool Exitoso { get; set; }

        [Column("fecha_hora")]
        public DateTimeOffset FechaHora { get; set; } = DateTimeOffset.UtcNow;

        [Column("detalles", TypeName = "jsonb")]
        public string? Detalles { get; set; }

        [ForeignKey(nameof(IdUsuario))]
        public virtual Usuario? UsuarioRelacionado { get; set; }
    }
}
