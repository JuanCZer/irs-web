using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models
{
    [Table("ficha_informativa")]
    public class FichaInformativa
    {
        [Key]
        [Column("id_ficha")]
        public int Id { get; set; }

        [Column("cedula")]
        public int? CertificateNumber { get; set; }


        [Column("delegacion")]
        [MaxLength(255)]
        public string Delegation { get; set; } = string.Empty;

        [Column("municipio")]
        [MaxLength(255)]
        public string Municipality { get; set; } = string.Empty;

        [Column("lugar")]
        [MaxLength(255)]
        public string Place { get; set; } = string.Empty;

        [Column("latitud")]
        [MaxLength(255)]
        public string? Latitude { get; set; }

        [Column("longitud")]
        [MaxLength(255)]
        public string? Longitude { get; set; }

        [Column("hora_suceso_inicio")]
        public TimeSpan? EventStartTime { get; set; }

        [Column("hora_suceso_fin")]
        public TimeSpan? EventEndTime { get; set; }

        [Column("fecha_suceso")]
        public DateTime? EventDate { get; set; }


        [Column("sector")]
        [MaxLength(255)]
        public string Sector { get; set; } = string.Empty;

        [Column("subsector")]
        [MaxLength(255)]
        public string Subsector { get; set; } = string.Empty;

        [Column("num_asistentes")]
        [Range(0, 10_000_000)]
        public int? AttendeeCount { get; set; }

        [Column("fecha_elaboracion")]
        public DateTime? CreationDate { get; set; }

        [Column("hora_elaboracion")]
        public TimeSpan? CreationTime { get; set; }


        [Column("prioridad")]
        [MaxLength(255)]
        public string Priority { get; set; } = string.Empty;

        [Column("condicion")]
        [MaxLength(255)]
        public string Condition { get; set; } = string.Empty;

        [Column("informacion")]
        [MaxLength(255)]
        public string Information { get; set; } = string.Empty;

        [Column("asunto")]
        [MaxLength(1000)]
        public string Subject { get; set; } = string.Empty;

        [Column("hechos")]
        [MaxLength(10000)]
        public string Facts { get; set; } = string.Empty;

        [Column("acuerdos")]
        [MaxLength(10000)]
        public string Agreements { get; set; } = string.Empty;

        [Column("id_informo")]
        public int? ReporterId { get; set; }

        [Column("id_usuario")]
        public int? UserId { get; set; }

        [Column("id_autorizo")]
        public int? AuthorizerId { get; set; }

        [Column("fecha_recepcion")]
        public DateTime? ReceptionDate { get; set; }

        [Column("hora_recepcion")]
        public TimeSpan? ReceptionTime { get; set; }

        [Column("id_estado_actual")]
        public int? CurrentStatusId { get; set; }

        [Column("motivo_cancelacion")]
        [MaxLength(255)]
        public string? CancellationReason { get; set; }

        [Column("activo")]
        [Range(0, 10)]
        public int Active { get; set; } = 0;

        [Column("folio_interno")]
        [MaxLength(255)]
        public string? InternalReference { get; set; }

        [Column("direccion")]
        [MaxLength(255)]
        public string Address { get; set; } = string.Empty;

        [Column("visto")]
        [Range(0, 1)]
        public int Seen { get; set; } = 0;

        [Column("idfichaanterior")]
        public int? PreviousReportId { get; set; }

        [Column("fecha_validacion")]
        public DateTime? ValidationDate { get; set; }
    }
}
