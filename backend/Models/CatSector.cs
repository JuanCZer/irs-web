using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models;

[Table("cat_sector")]
public class SectorCategory
{
    [Key]
    [Column("id_cat_sector")]
    public int SectorCategoryId { get; set; }

    [Column("sector")]
    [MaxLength(255)]
    public string Sector { get; set; } = string.Empty;
}
