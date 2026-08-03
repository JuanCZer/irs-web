using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models
{
    [Table("borrador")]
    public class Draft
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("borrador_id")]
        [MaxLength(255)]
        public string DraftId { get; set; } = string.Empty;

        [Column("fecha_elaboracion")]
        public DateTime CreationDate { get; set; }

        [Column("fecha_suceso")]
        public DateTime EventDate { get; set; }

        [Column("estado")]
        [MaxLength(255)]
        public string State { get; set; } = string.Empty;

        [Column("hora_inicio_suceso")]
        [MaxLength(50)]
        public string EventStartTime { get; set; } = string.Empty;

        [Column("hora_fin_suceso")]
        [MaxLength(50)]
        public string EventEndTime { get; set; } = string.Empty;

        [Column("prioridad")]
        [MaxLength(100)]
        public string Priority { get; set; } = string.Empty;

        [Column("sector")]
        [MaxLength(255)]
        public string Sector { get; set; } = string.Empty;

        [Column("numero_asistentes")]
        public int? AttendeeCount { get; set; }

        [Column("estado_actual")]
        [MaxLength(100)]
        public string CurrentStatus { get; set; } = string.Empty;

        [Column("borrador_usuario")]
        [MaxLength(255)]
        public string DraftUser { get; set; } = string.Empty;

        [Column("datos_completos")]
        public string CompleteData { get; set; } = string.Empty;

        [Column("fecha_creacion")]
        public DateTime CreatedAt { get; set; }

        [Column("fecha_modificacion")]
        public DateTime? ModifiedAt { get; set; }
    }
}
