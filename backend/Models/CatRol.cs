using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("cat_rol")]
    public class CatRol
    {
        [Key]
        [Column("id_cat_rol")]
        public int IdCatRol { get; set; }

        [Column("rol")]
        [Required]
        [MaxLength(100)]
        public string NombreRol { get; set; } = string.Empty;
    }
}
