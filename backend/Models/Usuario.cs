using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("usuario")]
    public class User
    {
        [Key]
        [Column("id_usuario")]
        public int UserId { get; set; }

        [Column("nombre")]
        [MaxLength(255)]
        public string? Name { get; set; }

        [Column("app")]
        [MaxLength(255)]
        public string? FirstSurname { get; set; }

        [Column("apm")]
        [MaxLength(255)]
        public string? SecondSurname { get; set; }

        [Column("alias")]
        [MaxLength(255)]
        public string? Alias { get; set; }

        [Column("usuario")]
        [Required]
        [MaxLength(100)]
        public string Username { get; set; } = string.Empty;

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
        public DateTime LastAccess { get; set; }

        [Column("intento")]
        public int? Attempt { get; set; }

        [Column("ip")]
        [Required]
        [MaxLength(50)]
        public string Ip { get; set; } = string.Empty;

        [Column("fecha_hora_creacion")]
        public DateTime? CreatedAt { get; set; }

        [Column("id_rol")]
        [ForeignKey(nameof(Role))]
        public int? RoleId { get; set; }


        public virtual CatRol? Role { get; set; }
    }
}
