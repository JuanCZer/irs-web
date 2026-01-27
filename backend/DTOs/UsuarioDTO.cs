namespace Backend.DTOs
{
    public class UsuarioDTO
    {
        public int IdUsuario { get; set; }
        public string? Nombre { get; set; }
        public string? App { get; set; }
        public string? Apm { get; set; }
        public string? Alias { get; set; }
        public string Usuario { get; set; } = string.Empty;
        public int? Status { get; set; }
        public int? StatusList { get; set; }
        public DateTime? UltimoAcceso { get; set; }
        public int? Intento { get; set; }
        public string? Ip { get; set; }
        public DateTime? FechaHoraCreacion { get; set; }
        public int? IdRol { get; set; }
        public string? NombreRol { get; set; }
    }

    public class CrearUsuarioDTO
    {
        public string? Nombre { get; set; }
        public string? App { get; set; }
        public string? Apm { get; set; }
        public string? Alias { get; set; }
        public string Usuario { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int? Status { get; set; } = 1;
        public int? IdRol { get; set; }
    }

    public class ActualizarUsuarioDTO
    {
        public string? Nombre { get; set; }
        public string? App { get; set; }
        public string? Apm { get; set; }
        public string? Alias { get; set; }
        public string? Usuario { get; set; }
        public string? Password { get; set; }
        public int? Status { get; set; }
        public int? IdRol { get; set; }
    }

    public class LoginDTO
    {
        public string Usuario { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
