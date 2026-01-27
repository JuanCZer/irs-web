using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models;

[Table("cat_sector")]
public class CatSector
{
    [Key]
    [Column("id_cat_sector")]
    public int IdCatSector { get; set; }
    
    [Column("sector")]
    [MaxLength(255)]
    public string Sector { get; set; } = string.Empty;
}
