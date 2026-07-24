using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("sesion_usuario", Schema = "public")]
    public class SesionUsuario
    {
        [Key]
        [Column("id_sesion")]
        public Guid IdSesion { get; set; }

        [Column("id_usuario")]
        public int IdUsuario { get; set; }

        [Column("jti")]
        [MaxLength(64)]
        public string Jti { get; set; } = string.Empty;

        [Column("fecha_inicio")]
        public DateTimeOffset FechaInicio { get; set; }

        [Column("fecha_expiracion")]
        public DateTimeOffset FechaExpiracion { get; set; }

        [Column("fecha_ultimo_acceso")]
        public DateTimeOffset FechaUltimoAcceso { get; set; }

        [Column("direccion_ip")]
        [MaxLength(64)]
        public string? DireccionIp { get; set; }

        [Column("agente_usuario")]
        [MaxLength(500)]
        public string? AgenteUsuario { get; set; }

        [Column("revocada")]
        public bool Revocada { get; set; }

        [Column("fecha_revocacion")]
        public DateTimeOffset? FechaRevocacion { get; set; }

        [Column("motivo_revocacion")]
        [MaxLength(250)]
        public string? MotivoRevocacion { get; set; }

        [ForeignKey(nameof(IdUsuario))]
        public virtual Usuario Usuario { get; set; } = null!;
    }
}
