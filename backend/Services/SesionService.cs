using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.DTOs;
using Backend.Models;
using IRS.API.Data;
using IRS.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Services
{
    public class SesionService : ISesionService
    {
        private readonly IRSDbContext _context;
        private readonly IConfiguration _configuration;

        public SesionService(IRSDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<TokenSesionDTO> CrearSesionAsync(
            UsuarioDTO usuario,
            string? direccionIp,
            string? agenteUsuario)
        {
            var ahora = DateTimeOffset.UtcNow;
            var horasExpiracion = _configuration.GetValue<int?>("Jwt:HorasExpiracion") ?? 8;
            var expiracion = ahora.AddHours(Math.Clamp(horasExpiracion, 1, 24));
            var idSesion = Guid.NewGuid();
            var jti = Guid.NewGuid().ToString("N");

            _context.Set<SesionUsuario>().Add(new SesionUsuario
            {
                IdSesion = idSesion,
                IdUsuario = usuario.IdUsuario,
                Jti = jti,
                FechaInicio = ahora,
                FechaExpiracion = expiracion,
                FechaUltimoAcceso = ahora,
                DireccionIp = direccionIp,
                AgenteUsuario = agenteUsuario,
                Revocada = false
            });

            await _context.SaveChangesAsync();

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
                new(ClaimTypes.Name, usuario.Usuario),
                new(ClaimTypes.Role, usuario.NombreRol?.ToUpperInvariant() ?? "SIN_ROL"),
                new(JwtRegisteredClaimNames.Jti, jti),
                new("sid", idSesion.ToString())
            };

            var llave = _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("La llave JWT no está configurada");
            var credenciales = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(llave)),
                SecurityAlgorithms.HmacSha256);

            var jwt = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                notBefore: ahora.UtcDateTime,
                expires: expiracion.UtcDateTime,
                signingCredentials: credenciales);

            return new TokenSesionDTO
            {
                Token = new JwtSecurityTokenHandler().WriteToken(jwt),
                IdSesion = idSesion,
                FechaExpiracion = expiracion
            };
        }

        public async Task<bool> ValidarSesionAsync(Guid idSesion, string jti, int idUsuario, string rol)
        {
            var ahora = DateTimeOffset.UtcNow;
            var sesion = await _context.Set<SesionUsuario>()
                .Include(s => s.Usuario)
                .ThenInclude(u => u.Rol)
                .FirstOrDefaultAsync(s =>
                    s.IdSesion == idSesion &&
                    s.IdUsuario == idUsuario &&
                    s.Jti == jti);

            if (sesion == null || sesion.Revocada ||
                sesion.FechaExpiracion <= ahora || sesion.Usuario.Status != 1 ||
                !string.Equals(sesion.Usuario.Rol?.NombreRol, rol, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            if (sesion.FechaUltimoAcceso < ahora.AddMinutes(-5))
            {
                sesion.FechaUltimoAcceso = ahora;
                await _context.SaveChangesAsync();
            }

            return true;
        }

        public async Task RevocarSesionAsync(Guid idSesion, string motivo)
        {
            var sesion = await _context.Set<SesionUsuario>()
                .FirstOrDefaultAsync(s => s.IdSesion == idSesion && !s.Revocada);

            if (sesion == null) return;

            sesion.Revocada = true;
            sesion.FechaRevocacion = DateTimeOffset.UtcNow;
            sesion.MotivoRevocacion = motivo;
            await _context.SaveChangesAsync();
        }

        public async Task RevocarOtrasSesionesAsync(
            int idUsuario,
            Guid? idSesionActual,
            string motivo)
        {
            var sesiones = await _context.Set<SesionUsuario>()
                .Where(s =>
                    s.IdUsuario == idUsuario &&
                    !s.Revocada &&
                    (!idSesionActual.HasValue || s.IdSesion != idSesionActual.Value))
                .ToListAsync();

            if (sesiones.Count == 0) return;

            var ahora = DateTimeOffset.UtcNow;
            foreach (var sesion in sesiones)
            {
                sesion.Revocada = true;
                sesion.FechaRevocacion = ahora;
                sesion.MotivoRevocacion = motivo;
            }

            await _context.SaveChangesAsync();
        }
    }
}
