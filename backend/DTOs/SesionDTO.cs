namespace Backend.DTOs
{
    public class TokenSesionDTO
    {
        public string Token { get; set; } = string.Empty;
        public Guid IdSesion { get; set; }
        public DateTimeOffset FechaExpiracion { get; set; }
    }
}
