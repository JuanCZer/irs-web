using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models;

[Table("cat_subsector")]
public class CatSubsector
{
    [Key]
    [Column("id_cat_subsector")]
    public int SubsectorCategoryId { get; set; }

    [Column("subsector")]
    [MaxLength(255)]
    public string Subsector { get; set; } = string.Empty;

    [Column("id_cat_sector")]
    public int? SectorCategoryId { get; set; }

    [Column("estatus")]
    public int Status { get; set; } = 1;


    [ForeignKey(nameof(SectorCategoryId))]
    public virtual SectorCategory? SectorCategory { get; set; }
}
