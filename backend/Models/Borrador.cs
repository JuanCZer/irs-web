using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models
{
    [Table("borrador")]
    public class Borrador
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }
        
        [Column("borrador_id")]
        [MaxLength(255)]
        public string BorradorId { get; set; } = string.Empty;
        
        [Column("fecha_elaboracion")]
        public DateTime FechaElaboracion { get; set; }
        
        [Column("fecha_suceso")]
        public DateTime FechaSuceso { get; set; }
        
        [Column("estado")]
        [MaxLength(255)]
        public string Estado { get; set; } = string.Empty;
        
        [Column("hora_inicio_suceso")]
        [MaxLength(50)]
        public string HoraInicioSuceso { get; set; } = string.Empty;
        
        [Column("hora_fin_suceso")]
        [MaxLength(50)]
        public string HoraFinSuceso { get; set; } = string.Empty;
        
        [Column("prioridad")]
        [MaxLength(100)]
        public string Prioridad { get; set; } = string.Empty;
        
        [Column("sector")]
        [MaxLength(255)]
        public string Sector { get; set; } = string.Empty;
        
        [Column("numero_asistentes")]
        public int? NumeroAsistentes { get; set; }
        
        [Column("estado_actual")]
        [MaxLength(100)]
        public string EstadoActual { get; set; } = string.Empty;
        
        [Column("borrador_usuario")]
        [MaxLength(255)]
        public string BorradorUsuario { get; set; } = string.Empty;
        
        [Column("datos_completos")]
        public string DatosCompletos { get; set; } = string.Empty;
        
        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; }
        
        [Column("fecha_modificacion")]
        public DateTime? FechaModificacion { get; set; }
    }
}
