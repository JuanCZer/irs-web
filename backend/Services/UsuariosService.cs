using System.Text;
using Backend.DTOs;
using Backend.Exceptions;
using Backend.Models;
using IRS.API.Data;
using IRS.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class UsersService : IUsuariosService
{
    private const int BcryptWorkFactor = 12;
    private static readonly string DummyPasswordHash =
        BCrypt.Net.BCrypt.HashPassword("IRS-dummy-password-for-timing-only", BcryptWorkFactor);

    private readonly IRSDbContext _context;

    public UsersService(IRSDbContext context)
    {
        _context = context;
    }

    public async Task<List<UsuarioDTO>> GetAllUsersAsync()
    {
        var users = await _context.Users
            .AsNoTracking()
            .Include(user => user.Role)
            .Where(user => user.Status == 1)
            .OrderByDescending(user => user.CreatedAt)
            .ToListAsync();

        return users.Select(MapToUserDto).ToList();
    }

    public async Task<UsuarioDTO?> GetUserByIdAsync(int id)
    {
        var user = await _context.Users
            .AsNoTracking()
            .Include(item => item.Role)
            .FirstOrDefaultAsync(item => item.UserId == id);

        return user == null ? null : MapToUserDto(user);
    }

    public async Task<UsuarioDTO> CreateUserAsync(CrearUsuarioDTO userDto)
    {
        if (!userDto.CreatorUserId.HasValue)
            throw new ConflictException("No fue posible identificar al usuario administrador");

        var creatingUser = await _context.Users
            .AsNoTracking()
            .Include(user => user.Role)
            .FirstOrDefaultAsync(user =>
                user.UserId == userDto.CreatorUserId.Value && user.Status == 1);

        if (!string.Equals(
                creatingUser?.Role?.RoleName,
                "ADMIN",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new ConflictException("Solo los administradores pueden crear usuarios");
        }

        var username = userDto.User.Trim();
        var normalizedUsername = username.ToUpperInvariant();
        var existingUser = await _context.Users
            .AsNoTracking()
            .AnyAsync(user => user.Username.ToUpper() == normalizedUsername);

        if (existingUser)
            throw new ConflictException("El nombre de usuario ya está registrado");

        var newUser = new User
        {
            Name = NormalizeOptional(userDto.Name),
            FirstSurname = NormalizeOptional(userDto.FirstSurname),
            SecondSurname = NormalizeOptional(userDto.SecondSurname),
            Alias = NormalizeOptional(userDto.Alias),
            Username = username,
            Password = BCrypt.Net.BCrypt.HashPassword(userDto.Password, BcryptWorkFactor),
            Status = userDto.Status ?? 1,
            StatusList = 1,
            RoleId = userDto.RoleId,
            CreatedAt = DateTime.UtcNow,
            LastAccess = DateTime.UtcNow,
            Attempt = 0,
            Ip = Limit(userDto.CreatorIp, 50) ?? "0.0.0.0"
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        var userWithRole = await _context.Users
            .AsNoTracking()
            .Include(user => user.Role)
            .FirstOrDefaultAsync(user => user.UserId == newUser.UserId);

        return MapToUserDto(userWithRole ?? newUser);
    }

    public async Task<bool> UpdateUserAsync(int id, ActualizarUsuarioDTO userDto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        if (userDto.User != null)
        {
            var username = userDto.User.Trim();
            var normalizedUsername = username.ToUpperInvariant();
            var duplicated = await _context.Users
                .AsNoTracking()
                .AnyAsync(item =>
                    item.UserId != id && item.Username.ToUpper() == normalizedUsername);
            if (duplicated)
                throw new ConflictException("El nombre de usuario ya está registrado");

            user.Username = username;
        }

        if (userDto.Name != null) user.Name = NormalizeOptional(userDto.Name);
        if (userDto.FirstSurname != null) user.FirstSurname = NormalizeOptional(userDto.FirstSurname);
        if (userDto.SecondSurname != null) user.SecondSurname = NormalizeOptional(userDto.SecondSurname);
        if (userDto.Alias != null) user.Alias = NormalizeOptional(userDto.Alias);
        if (userDto.Status.HasValue) user.Status = userDto.Status.Value;
        if (userDto.RoleId.HasValue) user.RoleId = userDto.RoleId.Value;

        if (!string.IsNullOrEmpty(userDto.Password))
            user.Password = BCrypt.Net.BCrypt.HashPassword(userDto.Password, BcryptWorkFactor);

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        user.Status = 0;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<UsuarioDTO?> ValidateCredentialsAsync(string user, string password)
    {
        var username = user.Trim();
        var foundUser = await _context.Users
            .Include(item => item.Role)
            .FirstOrDefaultAsync(item => item.Username == username && item.Status == 1);

        if (foundUser == null)
        {
            BCrypt.Net.BCrypt.Verify(password, DummyPasswordHash);
            return null;
        }

        if (Encoding.UTF8.GetByteCount(password) > 72 ||
            !BCrypt.Net.BCrypt.Verify(password, foundUser.Password))
        {
            foundUser.Attempt = foundUser.Attempt >= int.MaxValue
                ? int.MaxValue
                : (foundUser.Attempt ?? 0) + 1;
            await _context.SaveChangesAsync();
            return null;
        }

        if (BCrypt.Net.BCrypt.PasswordNeedsRehash(foundUser.Password, BcryptWorkFactor))
            foundUser.Password = BCrypt.Net.BCrypt.HashPassword(password, BcryptWorkFactor);

        foundUser.LastAccess = DateTime.UtcNow;
        foundUser.Attempt = 0;
        await _context.SaveChangesAsync();

        return MapToUserDto(foundUser);
    }

    public async Task<RespuestaCambioContrasenaDTO> ChangePasswordAsync(
        int userId,
        CambiarContrasenaDTO passwordChangeDto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(item => item.UserId == userId && item.Status == 1);

        if (user == null)
            return Failure("No fue posible cambiar la contraseña");

        if (Encoding.UTF8.GetByteCount(passwordChangeDto.CurrentPassword) > 72 ||
            !BCrypt.Net.BCrypt.Verify(passwordChangeDto.CurrentPassword, user.Password))
            return Failure("La contraseña actual es incorrecta");

        if (BCrypt.Net.BCrypt.Verify(passwordChangeDto.NewPassword, user.Password))
            return Failure("La nueva contraseña debe ser diferente a la actual");

        user.Password = BCrypt.Net.BCrypt.HashPassword(
            passwordChangeDto.NewPassword,
            BcryptWorkFactor);
        user.LastAccess = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return new RespuestaCambioContrasenaDTO
        {
            Successful = true,
            Message = "Contraseña actualizada exitosamente"
        };
    }

    private static RespuestaCambioContrasenaDTO Failure(string message) => new()
    {
        Successful = false,
        Message = message,
        Errors = [message]
    };

    private static UsuarioDTO MapToUserDto(User user) => new()
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

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string? Limit(string? value, int maximumLength)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        return value.Length <= maximumLength ? value : value[..maximumLength];
    }
}
