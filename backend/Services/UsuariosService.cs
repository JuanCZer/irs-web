using Backend.DTOs;
using Backend.Models;
using IRS.API.Data;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Text.RegularExpressions;
using IRS.API.Interfaces;

namespace Backend.Services
{
    public class UsersService : IUsuariosService
    {
        private readonly IRSDbContext _context;

        public UsersService(IRSDbContext context)
        {
            _context = context;
        }

        private string GetLocalIp()
        {
            try
            {

                var processStartInfo = new ProcessStartInfo
                {
                    FileName = "ipconfig",
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using var process = Process.Start(processStartInfo);
                if (process == null)
                {
                    return "0.0.0.0";
                }

                var output = process.StandardOutput.ReadToEnd();
                process.WaitForExit();


                var ipv4Pattern = @"IPv4.*?: (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})";
                var matches = Regex.Matches(output, ipv4Pattern);

                foreach (Match match in matches)
                {
                    var ip = match.Groups[1].Value;

                    if (ip != "127.0.0.1" && !ip.StartsWith("169.254"))
                    {
                        return ip;
                    }
                }
                return "0.0.0.0";
            }
            catch (Exception)
            {
                return "0.0.0.0";
            }
        }

        public async Task<List<UsuarioDTO>> GetAllUsersAsync()
        {

            var users = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.Status == 1)
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            return users.Select(u => MapToUserDto(u)).ToList();
        }

        public async Task<UsuarioDTO?> GetUserByIdAsync(int id)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
            {
                return null;
            }
            return MapToUserDto(user);
        }

        public async Task<UsuarioDTO> CreateUserAsync(CrearUsuarioDTO userDto)
        {
            try
            {
                if (userDto.CreatorUserId.HasValue)
                {
                    var creatingUser = await _context.Users
                        .Include(u => u.Role)
                        .FirstOrDefaultAsync(u => u.UserId == userDto.CreatorUserId.Value);

                    if (creatingUser == null)
                    {
                        throw new InvalidOperationException("El usuario que intenta crear no fue encontrado");
                    }


                    if (creatingUser.Role?.RoleName?.ToUpper() != "ADMIN")
                    {
                        throw new InvalidOperationException("Solo los administradores pueden crear nuevos usuarios");
                    }
                }
                else
                {
                    throw new InvalidOperationException("El ID del usuario que crea es requerido");
                }


                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == userDto.User);

                if (existingUser != null)
                {
                    throw new InvalidOperationException($"El usuario '{userDto.User}' ya existe");
                }


                var passwordHash = BCrypt.Net.BCrypt.HashPassword(userDto.Password);


                var localIp = GetLocalIp();

                var newUser = new User
                {
                    Name = userDto.Name,
                    FirstSurname = userDto.FirstSurname,
                    SecondSurname = userDto.SecondSurname,
                    Alias = userDto.Alias,
                    Username = userDto.User,
                    Password = passwordHash,
                    Status = userDto.Status ?? 1,
                    StatusList = 1,
                    RoleId = userDto.RoleId,
                    CreatedAt = DateTime.UtcNow,
                    LastAccess = DateTime.UtcNow,
                    Attempt = 0,
                    Ip = localIp
                };
                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();


                var userWithRole = await _context.Users
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.UserId == newUser.UserId);

                return MapToUserDto(userWithRole ?? newUser);
            }
            catch
            {
                throw;
            }
        }

        public async Task<bool> UpdateUserAsync(int id, ActualizarUsuarioDTO userDto)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return false;
            }


            if (userDto.Name != null) user.Name = userDto.Name;
            if (userDto.FirstSurname != null) user.FirstSurname = userDto.FirstSurname;
            if (userDto.SecondSurname != null) user.SecondSurname = userDto.SecondSurname;
            if (userDto.Alias != null) user.Alias = userDto.Alias;
            if (userDto.User != null) user.Username = userDto.User;
            if (userDto.Status.HasValue) user.Status = userDto.Status.Value;
            if (userDto.RoleId.HasValue) user.RoleId = userDto.RoleId.Value;


            if (!string.IsNullOrEmpty(userDto.Password))
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(userDto.Password);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return false;
            }


            user.Status = 0;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<UsuarioDTO?> ValidateCredentialsAsync(string user, string password)
        {
            try
            {
                var foundUser = await _context.Users
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Username == user && u.Status == 1);

                if (foundUser == null)
                {
                    return null;
                }


                bool passwordValid = BCrypt.Net.BCrypt.Verify(password, foundUser.Password);

                if (!passwordValid)
                {
                    foundUser.Attempt = (foundUser.Attempt ?? 0) + 1;
                    await _context.SaveChangesAsync();

                    return null;
                }


                foundUser.LastAccess = DateTime.UtcNow;
                foundUser.Attempt = 0;
                await _context.SaveChangesAsync();

                return MapToUserDto(foundUser);
            }
            catch (Exception)
            {
                throw;
            }
        }

        private UsuarioDTO MapToUserDto(User user)
        {
            return new UsuarioDTO
            {
                UserId = user.UserId,
                Name = user.Name,
                FirstSurname = user.FirstSurname,
                SecondSurname = user.SecondSurname,
                Alias = user.Alias,
                User = user.Username,
                Status = user.Status,
                StatusList = user.StatusList,
                LastAccess = user.LastAccess,
                Attempt = user.Attempt,
                Ip = user.Ip,
                CreatedAt = user.CreatedAt,
                RoleId = user.RoleId,
                RoleName = user.Role?.RoleName ?? "Sin rol"
            };
        }

        public async Task<RespuestaCambioContrasenaDTO> ChangePasswordAsync(int userId, CambiarContrasenaDTO passwordChangeDto)
        {
            try
            {
                var errors = new List<string>();

                if (string.IsNullOrWhiteSpace(passwordChangeDto.NewPassword))
                {
                    errors.Add("La nueva contraseña es requerida");
                }

                if (passwordChangeDto.NewPassword != passwordChangeDto.ConfirmPassword)
                {
                    errors.Add("Las contraseñas nuevas no coinciden");
                }

                if (passwordChangeDto.NewPassword?.Length < 8)
                {
                    errors.Add("La nueva contraseña debe tener al menos 8 caracteres");
                }

                if (errors.Count > 0)
                {
                    return new RespuestaCambioContrasenaDTO
                    {
                        Successful = false,
                        Message = "Errores de validación",
                        Errors = errors
                    };
                }


                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

                if (user == null)
                {
                    return new RespuestaCambioContrasenaDTO
                    {
                        Successful = false,
                        Message = "Usuario no encontrado",
                        Errors = new List<string> { "El usuario especificado no existe" }
                    };
                }


                bool samePassword = BCrypt.Net.BCrypt.Verify(passwordChangeDto.NewPassword, user.Password);
                if (samePassword)
                {
                    return new RespuestaCambioContrasenaDTO
                    {
                        Successful = false,
                        Message = "La nueva contraseña debe ser diferente a la actual",
                        Errors = new List<string> { "La nueva contraseña no puede ser igual a la anterior" }
                    };
                }


                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(passwordChangeDto.NewPassword);


                user.Password = hashedPassword;
                user.LastAccess = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return new RespuestaCambioContrasenaDTO
                {
                    Successful = true,
                    Message = "Contraseña actualizada exitosamente"
                };
            }
            catch (Exception ex)
            {
                return new RespuestaCambioContrasenaDTO
                {
                    Successful = false,
                    Message = "Error al cambiar la contraseña",
                    Errors = new List<string> { ex.Message }
                };
            }
        }
    }
}
