using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models;

[Table("cat_prioridad")]
public class CatPrioridad
{
    [Key]
    [Column("id_cat_prioridad")]
    public int IdCatPrioridad { get; set; }
    
    [Column("prioridad")]
    [MaxLength(255)]
    public string Prioridad { get; set; } = string.Empty;
}
