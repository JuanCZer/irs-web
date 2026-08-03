using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models;

[Table("borradores_medidas_despacho")]
public class DispatchMeasureDraft
{
    [Key]
    [Column("id_borrador_medidas")]
    public int Id { get; set; }

    [Column("id_ficha")]
    public int ReportId { get; set; }

    [Column("id_usuario")]
    public int UserId { get; set; }

    [Column("ids_medidas")]
    public int[] SecurityMeasureIds { get; set; } = Array.Empty<int>();

    [Column("comentario")]
    public string Comment { get; set; } = string.Empty;

    [Column("fecha_actualizacion")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(ReportId))]
    public virtual FichaInformativa? InformationReport { get; set; }
}
