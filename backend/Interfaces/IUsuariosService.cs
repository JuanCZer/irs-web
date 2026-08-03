using Backend.DTOs;

namespace IRS.API.Interfaces
{
  public interface IUsuariosService
  {
    Task<List<UsuarioDTO>> GetAllUsersAsync();
    Task<UsuarioDTO?> GetUserByIdAsync(int id);
    Task<UsuarioDTO> CreateUserAsync(CrearUsuarioDTO userDto);
    Task<bool> UpdateUserAsync(int id, ActualizarUsuarioDTO userDto);
    Task<bool> DeleteUserAsync(int id);
    Task<UsuarioDTO?> ValidateCredentialsAsync(string user, string password);
    Task<RespuestaCambioContrasenaDTO> ChangePasswordAsync(int userId, CambiarContrasenaDTO passwordChangeDto);
  }
}
