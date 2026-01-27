using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models;

[Table("cat_delegacion")]
public class CatDelegacion
{
    [Key]
    [Column("id_delegacion")]
    public int IdCatDelegacion { get; set; }
    
    [Column("delegacion")]
    [MaxLength(255)]
    public string Delegacion { get; set; } = string.Empty;
}
