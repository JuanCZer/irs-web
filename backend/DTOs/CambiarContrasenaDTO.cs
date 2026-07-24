using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class CambiarContrasenaDTO
    {
        [Required(ErrorMessage = "La nueva contraseña es requerida")]
        [StringLength(255, MinimumLength = 8, ErrorMessage = "La nueva contraseña debe tener al menos 8 caracteres")]
        public string ContraseñaNueva { get; set; } = string.Empty;

        [Required(ErrorMessage = "La confirmación de contraseña es requerida")]
        [StringLength(255, MinimumLength = 8, ErrorMessage = "La confirmación debe tener al menos 8 caracteres")]
        [Compare("ContraseñaNueva", ErrorMessage = "Las contraseñas no coinciden")]
        public string ConfirmarContraseña { get; set; } = string.Empty;
    }

    public class RespuestaCambioContrasenaDTO
    {
        public bool Exitoso { get; set; }
        public string Mensaje { get; set; } = string.Empty;
        public List<string>? Errores { get; set; }
    }
}
