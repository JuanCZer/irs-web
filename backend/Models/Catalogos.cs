using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models
{
    [Table("delegacion")]
    public class Delegation
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [Column("estado")]
        [MaxLength(255)]
        public string State { get; set; } = string.Empty;

        [Column("municipio")]
        [MaxLength(255)]
        public string Municipality { get; set; } = string.Empty;

        [Column("direccion")]
        [MaxLength(500)]
        public string Address { get; set; } = string.Empty;

        [Column("telefono")]
        [MaxLength(50)]
        public string Phone { get; set; } = string.Empty;

        [Column("activo")]
        public bool Active { get; set; } = true;
    }

    [Table("informante")]
    public class Informante
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [Column("cargo")]
        [MaxLength(255)]
        public string Position { get; set; } = string.Empty;

        [Column("telefono")]
        [MaxLength(50)]
        public string Phone { get; set; } = string.Empty;

        [Column("email")]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Column("dependencia")]
        [MaxLength(255)]
        public string Department { get; set; } = string.Empty;

        [Column("activo")]
        public bool Active { get; set; } = true;
    }

    [Table("sector")]
    public class Sector
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [Column("descripcion")]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [Column("activo")]
        public bool Active { get; set; } = true;
    }

    [Table("prioridad")]
    public class Priority
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [Column("nivel")]
        [MaxLength(50)]
        public string Level { get; set; } = string.Empty;

        [Column("color")]
        [MaxLength(50)]
        public string Color { get; set; } = string.Empty;

        [Column("activo")]
        public bool Active { get; set; } = true;
    }

    [Table("tipo_evento")]
    public class TipoEvento
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [Column("categoria")]
        [MaxLength(255)]
        public string Category { get; set; } = string.Empty;

        [Column("activo")]
        public bool Active { get; set; } = true;
    }
}
