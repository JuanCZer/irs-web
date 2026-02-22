using Backend.DTOs;

namespace IRS.API.Interfaces
{
  public interface IUsuariosService
  {
    Task<List<UsuarioDTO>> ObtenerTodosLosUsuariosAsync();
    Task<UsuarioDTO?> ObtenerUsuarioPorIdAsync(int id);
    Task<UsuarioDTO> CrearUsuarioAsync(CrearUsuarioDTO usuarioDto);
    Task<bool> ActualizarUsuarioAsync(int id, ActualizarUsuarioDTO usuarioDto);
    Task<bool> EliminarUsuarioAsync(int id);
    Task<UsuarioDTO?> ValidarCredencialesAsync(string usuario, string password);
    Task<RespuestaCambioContrasenaDTO> CambiarContrasenaAsync(CambiarContrasenaDTO cambioContraseñaDto);
  }
}
