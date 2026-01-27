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
        public int? Cedula { get; set; }
        
        // Estos campos almacenan valores de texto que vienen de los catálogos
        [Column("delegacion")]
        [MaxLength(255)]
        public string Delegacion { get; set; } = string.Empty;
        
        [Column("municipio")]
        [MaxLength(255)]
        public string Municipio { get; set; } = string.Empty;
        
        [Column("lugar")]
        [MaxLength(255)]
        public string Lugar { get; set; } = string.Empty;
        
        [Column("latitud")]
        [MaxLength(255)]
        public string? Latitud { get; set; }
        
        [Column("longitud")]
        [MaxLength(255)]
        public string? Longitud { get; set; }
        
        [Column("hora_suceso_inicio")]
        public TimeSpan? HoraSucesoInicio { get; set; }
        
        [Column("hora_suceso_fin")]
        public TimeSpan? HoraSucesoFin { get; set; }
        
        [Column("fecha_suceso")]
        public DateTime? FechaSuceso { get; set; }
        
        // Estos campos almacenan valores de texto que vienen de los catálogos
        [Column("sector")]
        [MaxLength(255)]
        public string Sector { get; set; } = string.Empty;
        
        [Column("subsector")]
        [MaxLength(255)]
        public string Subsector { get; set; } = string.Empty;
        
        [Column("num_asistentes")]
        public int? NumAsistentes { get; set; }
        
        [Column("fecha_elaboracion")]
        public DateTime? FechaElaboracion { get; set; }
        
        [Column("hora_elaboracion")]
        public TimeSpan? HoraElaboracion { get; set; }
        
        // Estos campos almacenan valores de texto que vienen de los catálogos
        [Column("prioridad")]
        [MaxLength(255)]
        public string Prioridad { get; set; } = string.Empty;
        
        [Column("condicion")]
        [MaxLength(255)]
        public string Condicion { get; set; } = string.Empty;
        
        [Column("informacion")]
        [MaxLength(255)]
        public string Informacion { get; set; } = string.Empty;
        
        [Column("asunto")]
        public string Asunto { get; set; } = string.Empty;
        
        [Column("hechos")]
        public string Hechos { get; set; } = string.Empty;
        
        [Column("acuerdos")]
        public string Acuerdos { get; set; } = string.Empty;
        
        [Column("id_informo")]
        public int? IdInformo { get; set; }
        
        [Column("id_usuario")]
        public int? IdUsuario { get; set; }
        
        [Column("id_autorizo")]
        public int? IdAutorizo { get; set; }
        
        [Column("fecha_recepcion")]
        public DateTime? FechaRecepcion { get; set; }
        
        [Column("hora_recepcion")]
        public TimeSpan? HoraRecepcion { get; set; }
        
        [Column("id_estado_actual")]
        public int? IdEstadoActual { get; set; }
        
        [Column("motivo_cancelacion")]
        [MaxLength(255)]
        public string? MotivoCancelacion { get; set; }
        
        [Column("activo")]
        public int Activo { get; set; } = 0;
        
        [Column("folio_interno")]
        [MaxLength(255)]
        public string? FolioInterno { get; set; }
        
        [Column("direccion")]
        [MaxLength(255)]
        public string Direccion { get; set; } = string.Empty;
        
        [Column("visto")]
        public int Visto { get; set; } = 0;
        
        [Column("idfichaanterior")]
        public int? IdFichaAnterior { get; set; }
        
        [Column("fecha_validacion")]
        public DateTime? FechaValidacion { get; set; }
    }
}
