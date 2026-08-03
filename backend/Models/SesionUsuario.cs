using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("sesion_usuario", Schema = "public")]
    public class SesionUsuario
    {
        [Key]
        [Column("id_sesion")]
        public Guid SessionId { get; set; }

        [Column("id_usuario")]
        public int UserId { get; set; }

        [Column("jti")]
        [MaxLength(64)]
        public string Jti { get; set; } = string.Empty;

        [Column("fecha_inicio")]
        public DateTimeOffset StartDate { get; set; }

        [Column("fecha_expiracion")]
        public DateTimeOffset ExpirationDate { get; set; }

        [Column("fecha_ultimo_acceso")]
        public DateTimeOffset LastAccessDate { get; set; }

        [Column("direccion_ip")]
        [MaxLength(64)]
        public string? IpAddress { get; set; }

        [Column("agente_usuario")]
        [MaxLength(500)]
        public string? UserAgent { get; set; }

        [Column("revocada")]
        public bool Revoked { get; set; }

        [Column("fecha_revocacion")]
        public DateTimeOffset? RevocationDate { get; set; }

        [Column("motivo_revocacion")]
        [MaxLength(250)]
        public string? RevocationReason { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; } = null!;
    }
}
