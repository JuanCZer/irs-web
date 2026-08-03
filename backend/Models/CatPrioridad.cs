using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models;

[Table("cat_prioridad")]
public class CatPrioridad
{
    [Key]
    [Column("id_cat_prioridad")]
    public int PriorityCategoryId { get; set; }

    [Column("prioridad")]
    [MaxLength(255)]
    public string Priority { get; set; } = string.Empty;
}
