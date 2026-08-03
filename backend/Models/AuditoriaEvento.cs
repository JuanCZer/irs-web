using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("auditoria_evento", Schema = "public")]
    public class AuditoriaEvento
    {
        [Key]
        [Column("id_auditoria")]
        public long AuditId { get; set; }

        [Column("id_usuario")]
        public int? UserId { get; set; }

        [Column("usuario")]
        [MaxLength(100)]
        public string User { get; set; } = "ANONIMO";

        [Column("nombre_completo")]
        [MaxLength(300)]
        public string? FullName { get; set; }

        [Column("rol")]
        [MaxLength(100)]
        public string? Role { get; set; }

        [Column("accion")]
        [MaxLength(100)]
        public string Action { get; set; } = string.Empty;

        [Column("modulo")]
        [MaxLength(100)]
        public string Module { get; set; } = string.Empty;

        [Column("descripcion")]
        [MaxLength(600)]
        public string Description { get; set; } = string.Empty;

        [Column("metodo_http")]
        [MaxLength(10)]
        public string? HttpMethod { get; set; }

        [Column("ruta")]
        [MaxLength(500)]
        public string? Path { get; set; }

        [Column("entidad")]
        [MaxLength(100)]
        public string? Entity { get; set; }

        [Column("id_entidad")]
        [MaxLength(100)]
        public string? EntityId { get; set; }

        [Column("direccion_ip")]
        [MaxLength(64)]
        public string? IpAddress { get; set; }

        [Column("agente_usuario")]
        [MaxLength(500)]
        public string? UserAgent { get; set; }

        [Column("codigo_estado")]
        public int StatusCode { get; set; }

        [Column("exitoso")]
        public bool Successful { get; set; }

        [Column("fecha_hora")]
        public DateTimeOffset DateTime { get; set; } = DateTimeOffset.UtcNow;

        [Column("detalles", TypeName = "jsonb")]
        public string? Details { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User? RelatedUser { get; set; }
    }
}
