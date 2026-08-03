namespace Backend.DTOs
{
    public class TokenSesionDTO
    {
        public string Token { get; set; } = string.Empty;
        public Guid SessionId { get; set; }
        public DateTimeOffset ExpirationDate { get; set; }
    }
}
