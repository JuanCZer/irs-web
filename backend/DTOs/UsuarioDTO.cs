namespace Backend.DTOs
{
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
        public int? CreatorUserId { get; set; }
        public string? Name { get; set; }
        public string? FirstSurname { get; set; }
        public string? SecondSurname { get; set; }
        public string? Alias { get; set; }
        public string User { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int? Status { get; set; } = 1;
        public int? RoleId { get; set; }
    }

    public class ActualizarUsuarioDTO
    {
        public string? Name { get; set; }
        public string? FirstSurname { get; set; }
        public string? SecondSurname { get; set; }
        public string? Alias { get; set; }
        public string? User { get; set; }
        public string? Password { get; set; }
        public int? Status { get; set; }
        public int? RoleId { get; set; }
    }

    public class LoginDTO
    {
        public string User { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
