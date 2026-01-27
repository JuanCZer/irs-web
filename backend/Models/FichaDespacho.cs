using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IRS.API.Models
{
    [Table("fichas_despacho")]
    public class FichaDespacho
    {
        [Key]
        [Column("id_ficha_despacho")]
        public int IdFichaDespacho { get; set; }
        
        [Column("id_ficha")]
        public int IdFicha { get; set; }
        
        [Column("id_cat_medida")]
        public int IdCatMedida { get; set; }
        
        [Column("comentario")]
        public string Comentario { get; set; } = string.Empty;
        
        [Column("evidencia")]
        public string? Evidencia { get; set; }
        
        [Column("fecha_validacion")]
        public DateTime FechaValidacion { get; set; } = DateTime.UtcNow;
        
        [Column("id_usuario")]
        public int? IdUsuario { get; set; }
        
        // Navigation Properties
        [ForeignKey("IdFicha")]
        public virtual FichaInformativa? FichaInformativa { get; set; }
        
        [ForeignKey("IdCatMedida")]
        public virtual CatMedidaSeguridad? CatMedidaSeguridad { get; set; }
        
        [ForeignKey("IdUsuario")]
        public virtual int? Usuario { get; set; }
    }
}
