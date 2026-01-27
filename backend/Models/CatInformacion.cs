using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models;

[Table("cat_informacion")]
public class CatInformacion
{
    [Key]
    [Column("id_cat_informacion")]
    public int IdCatInformacion { get; set; }
    
    [Column("informacion")]
    [MaxLength(255)]
    public string Informacion { get; set; } = string.Empty;
}
