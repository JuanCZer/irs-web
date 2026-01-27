using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models;

[Table("cat_subsector")]
public class CatSubsector
{
    [Key]
    [Column("id_cat_subsector")]
    public int IdCatSubsector { get; set; }
    
    [Column("subsector")]
    [MaxLength(255)]
    public string Subsector { get; set; } = string.Empty;
    
    [Column("id_cat_sector")]
    public int? IdCatSector { get; set; }
    
    [Column("estatus")]
    public int Estatus { get; set; } = 1;
    
    // Navigation Property hacia Sector
    [ForeignKey("IdCatSector")]
    public virtual CatSector? CatSector { get; set; }
}
