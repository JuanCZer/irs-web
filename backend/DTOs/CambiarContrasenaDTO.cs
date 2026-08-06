using System.ComponentModel.DataAnnotations;
using Backend.Security;

namespace Backend.DTOs;

public class CambiarContrasenaDTO
{
    [Required(ErrorMessage = "La contraseña actual es requerida")]
    [StringLength(128)]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "La nueva contraseña es requerida")]
    [SecurePassword]
    public string NewPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "La confirmación de contraseña es requerida")]
    [StringLength(
        SecurePasswordAttribute.MaximumLength,
        MinimumLength = SecurePasswordAttribute.MinimumLength)]
    [Compare(nameof(NewPassword), ErrorMessage = "Las contraseñas no coinciden")]
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class RespuestaCambioContrasenaDTO
{
    public bool Successful { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string>? Errors { get; set; }
}
