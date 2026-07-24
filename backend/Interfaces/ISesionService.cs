using Backend.DTOs;

namespace IRS.API.Interfaces
{
    public interface ISesionService
    {
        Task<TokenSesionDTO> CrearSesionAsync(
            UsuarioDTO usuario,
            string? direccionIp,
            string? agenteUsuario);
        Task<bool> ValidarSesionAsync(Guid idSesion, string jti, int idUsuario, string rol);
        Task RevocarSesionAsync(Guid idSesion, string motivo);
        Task RevocarOtrasSesionesAsync(int idUsuario, Guid? idSesionActual, string motivo);
    }
}
