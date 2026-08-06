using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Backend.Security;

namespace Backend.DTOs;

public class UsuarioDTO
{
    public int UserId { get; set; }
    public string? Name { get; set; }
    public string? FirstSurname { get; set; }
    public string? SecondSurname { get; set; }
    public string? Alias { get; set; }
    public string User { get; set; } = string.Empty;
    public int? Status { get; set; }
    public int? StatusList { get; set; }
    public DateTime? LastAccess { get; set; }
    public int? Attempt { get; set; }
    public string? Ip { get; set; }
    public DateTime? CreatedAt { get; set; }
    public int? RoleId { get; set; }
    public string? RoleName { get; set; }
}

public class CrearUsuarioDTO
{
    [JsonIgnore]
    public int? CreatorUserId { get; set; }

    [JsonIgnore]
    public string? CreatorIp { get; set; }

    [StringLength(255)]
    public string? Name { get; set; }

    [StringLength(255)]
    public string? FirstSurname { get; set; }

    [StringLength(255)]
    public string? SecondSurname { get; set; }

    [StringLength(255)]
    public string? Alias { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string User { get; set; } = string.Empty;

    [Required]
    [SecurePassword]
    public string Password { get; set; } = string.Empty;

    [Range(0, 1)]
    public int? Status { get; set; } = 1;

    [Required]
    [Range(1, int.MaxValue)]
    public int? RoleId { get; set; }
}

public class ActualizarUsuarioDTO
{
    [StringLength(255)]
    public string? Name { get; set; }

    [StringLength(255)]
    public string? FirstSurname { get; set; }

    [StringLength(255)]
    public string? SecondSurname { get; set; }

    [StringLength(255)]
    public string? Alias { get; set; }

    [StringLength(100, MinimumLength = 3)]
    public string? User { get; set; }

    [SecurePassword]
    public string? Password { get; set; }

    [Range(0, 1)]
    public int? Status { get; set; }

    [Range(1, int.MaxValue)]
    public int? RoleId { get; set; }
}

public class LoginDTO
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string User { get; set; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 1)]
    public string Password { get; set; } = string.Empty;
}
