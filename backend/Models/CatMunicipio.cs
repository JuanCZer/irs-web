using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models;

[Table("cat_municipio")]
public class CatMunicipio
{
    [Key]
    [Column("id_municipio")]
    public int IdCatMunicipio { get; set; }
    
    [Column("municipio")]
    [MaxLength(255)]
    public string Municipio { get; set; } = string.Empty;
    
    [Column("id_delegacion")]
    public int? IdDelegacion { get; set; }
    
    // Navigation Property hacia Delegación
    [ForeignKey("IdDelegacion")]
    public virtual CatDelegacion? CatDelegacion { get; set; }
}
