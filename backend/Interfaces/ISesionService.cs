using Backend.DTOs;

namespace IRS.API.Interfaces
{
    public interface ISesionService
    {
        Task<TokenSesionDTO> CreateSessionAsync(
            UsuarioDTO user,
            string? ipAddress,
            string? userAgent);
        Task<bool> ValidateSessionAsync(Guid sessionId, string jti, int userId, string role);
        Task RevokeSessionAsync(Guid sessionId, string reason);
        Task RevokeOtherSessionsAsync(int userId, Guid? currentSessionId, string reason);
    }
}
