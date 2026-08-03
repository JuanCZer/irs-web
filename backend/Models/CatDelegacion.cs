using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models;

[Table("cat_delegacion")]
public class CatDelegacion
{
    [Key]
    [Column("id_delegacion")]
    public int DelegationCategoryId { get; set; }

    [Column("delegacion")]
    [MaxLength(255)]
    public string Delegation { get; set; } = string.Empty;
}
