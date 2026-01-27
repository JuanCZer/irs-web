using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models
{
    [Table("cat_medida_seguridad")]
    public class CatMedidaSeguridad
    {
        [Key]
        [Column("id_cat_medida")]
        public int IdCatMedida { get; set; }
        
        [Column("medida")]
        [MaxLength(255)]
        public string Medida { get; set; } = string.Empty;
        
        [Column("estatus")]
        public int Estatus { get; set; } = 1;
    }
}
