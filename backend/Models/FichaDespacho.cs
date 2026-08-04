using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend.Models;

namespace IRS.API.Models
{
    [Table("fichas_despacho")]
    public class DispatchReport
    {
        [Key]
        [Column("id_ficha_despacho")]
        public int DispatchReportId { get; set; }

        [Column("id_ficha")]
        public int ReportId { get; set; }

        [Column("id_cat_medida")]
        public int MeasureCategoryId { get; set; }

        [Column("comentario")]
        public string Comment { get; set; } = string.Empty;

        [Column("evidencia")]
        public string? Evidence { get; set; }

        [Column("fecha_validacion")]
        public DateTime ValidationDate { get; set; } = DateTime.UtcNow;

        [Column("id_usuario")]
        public int? UserId { get; set; }


        [ForeignKey(nameof(ReportId))]
        public virtual FichaInformativa? InformationReport { get; set; }

        [ForeignKey(nameof(MeasureCategoryId))]
        public virtual CatMedidaSeguridad? SecurityMeasure { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
    }
}
