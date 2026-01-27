using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("usuario")]
    public class Usuario
    {
        [Key]
        [Column("id_usuario")]
        public int IdUsuario { get; set; }

        [Column("nombre")]
        [MaxLength(255)]
        public string? Nombre { get; set; }

        [Column("app")]
        [MaxLength(255)]
        public string? App { get; set; }

        [Column("apm")]
        [MaxLength(255)]
        public string? Apm { get; set; }

        [Column("alias")]
        [MaxLength(255)]
        public string? Alias { get; set; }

        [Column("usuario")]
        [Required]
        [MaxLength(100)]
        public string Usuario1 { get; set; } = string.Empty;

        [Column("password")]
        [Required]
        [MaxLength(255)]
        public string Password { get; set; } = string.Empty;

        [Column("status")]
        public int? Status { get; set; }

        [Column("status_list")]
        public int? StatusList { get; set; }

        [Column("ultimo_acceso")]
        [Required]
        public DateTime UltimoAcceso { get; set; }

        [Column("intento")]
        public int? Intento { get; set; }

        [Column("ip")]
        [Required]
        [MaxLength(50)]
        public string Ip { get; set; } = string.Empty;

        [Column("fecha_hora_creacion")]
        public DateTime? FechaHoraCreacion { get; set; }

        [Column("id_rol")]
        [ForeignKey("Rol")]
        public int? IdRol { get; set; }

        // Navegación a CatRol
        public virtual CatRol? Rol { get; set; }
    }
}
