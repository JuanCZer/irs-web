using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models;

[Table("cat_municipio")]
public class CatMunicipio
{
    [Key]
    [Column("id_municipio")]
    public int MunicipalityCategoryId { get; set; }

    [Column("municipio")]
    [MaxLength(255)]
    public string Municipality { get; set; } = string.Empty;

    [Column("id_delegacion")]
    public int? DelegationId { get; set; }


    [ForeignKey(nameof(DelegationId))]
    public virtual CatDelegacion? Delegation { get; set; }
}
