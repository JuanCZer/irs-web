using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models;

[Table("cat_condicion")]
public class CatCondicion
{
    [Key]
    [Column("id_cat_condicion")]
    public int ConditionCategoryId { get; set; }

    [Column("condicion")]
    [MaxLength(255)]
    public string Condition { get; set; } = string.Empty;
}
