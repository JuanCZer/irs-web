using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models
{
    [Table("delegacion")]
    public class Delegacion
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }
        
        [Column("nombre")]
        [MaxLength(255)]
        public string Nombre { get; set; } = string.Empty;
        
        [Column("estado")]
        [MaxLength(255)]
        public string Estado { get; set; } = string.Empty;
        
        [Column("municipio")]
        [MaxLength(255)]
        public string Municipio { get; set; } = string.Empty;
        
        [Column("direccion")]
        [MaxLength(500)]
        public string Direccion { get; set; } = string.Empty;
        
        [Column("telefono")]
        [MaxLength(50)]
        public string Telefono { get; set; } = string.Empty;
        
        [Column("activo")]
        public bool Activo { get; set; } = true;
    }

    [Table("informante")]
    public class Informante
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }
        
        [Column("nombre")]
        [MaxLength(255)]
        public string Nombre { get; set; } = string.Empty;
        
        [Column("cargo")]
        [MaxLength(255)]
        public string Cargo { get; set; } = string.Empty;
        
        [Column("telefono")]
        [MaxLength(50)]
        public string Telefono { get; set; } = string.Empty;
        
        [Column("email")]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;
        
        [Column("dependencia")]
        [MaxLength(255)]
        public string Dependencia { get; set; } = string.Empty;
        
        [Column("activo")]
        public bool Activo { get; set; } = true;
    }

    [Table("sector")]
    public class Sector
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }
        
        [Column("nombre")]
        [MaxLength(255)]
        public string Nombre { get; set; } = string.Empty;
        
        [Column("descripcion")]
        [MaxLength(500)]
        public string Descripcion { get; set; } = string.Empty;
        
        [Column("activo")]
        public bool Activo { get; set; } = true;
    }

    [Table("prioridad")]
    public class Prioridad
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }
        
        [Column("nombre")]
        [MaxLength(255)]
        public string Nombre { get; set; } = string.Empty;
        
        [Column("nivel")]
        [MaxLength(50)]
        public string Nivel { get; set; } = string.Empty;
        
        [Column("color")]
        [MaxLength(50)]
        public string Color { get; set; } = string.Empty;
        
        [Column("activo")]
        public bool Activo { get; set; } = true;
    }

    [Table("tipo_evento")]
    public class TipoEvento
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }
        
        [Column("nombre")]
        [MaxLength(255)]
        public string Nombre { get; set; } = string.Empty;
        
        [Column("categoria")]
        [MaxLength(255)]
        public string Categoria { get; set; } = string.Empty;
        
        [Column("activo")]
        public bool Activo { get; set; } = true;
    }
}
