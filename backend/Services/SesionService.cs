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
    public class SessionService : ISesionService
    {
        private readonly IRSDbContext _context;
        private readonly IConfiguration _configuration;

        public SessionService(IRSDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<TokenSesionDTO> CreateSessionAsync(
            UsuarioDTO user,
            string? ipAddress,
            string? userAgent)
        {
            var now = DateTimeOffset.UtcNow;
            var expirationHours = _configuration.GetValue<int?>("Jwt:HorasExpiracion") ?? 8;
            var expiration = now.AddHours(Math.Clamp(expirationHours, 1, 24));
            var sessionId = Guid.NewGuid();
            var jti = Guid.NewGuid().ToString("N");

            _context.Set<SesionUsuario>().Add(new SesionUsuario
            {
                SessionId = sessionId,
                UserId = user.UserId,
                Jti = jti,
                StartDate = now,
                ExpirationDate = expiration,
                LastAccessDate = now,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                Revoked = false
            });

            await _context.SaveChangesAsync();

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new(ClaimTypes.Name, user.User),
                new(ClaimTypes.Role, user.RoleName?.ToUpperInvariant() ?? "SIN_ROL"),
                new(JwtRegisteredClaimNames.Jti, jti),
                new("sid", sessionId.ToString())
            };

            var key = _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("La llave JWT no está configurada");
            var credentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                SecurityAlgorithms.HmacSha256);

            var jwt = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                notBefore: now.UtcDateTime,
                expires: expiration.UtcDateTime,
                signingCredentials: credentials);

            return new TokenSesionDTO
            {
                Token = new JwtSecurityTokenHandler().WriteToken(jwt),
                SessionId = sessionId,
                ExpirationDate = expiration
            };
        }

        public async Task<bool> ValidateSessionAsync(Guid sessionId, string jti, int userId, string role)
        {
            var now = DateTimeOffset.UtcNow;
            var session = await _context.Set<SesionUsuario>()
                .Include(s => s.User)
                .ThenInclude(u => u.Role)
                .FirstOrDefaultAsync(s =>
                    s.SessionId == sessionId &&
                    s.UserId == userId &&
                    s.Jti == jti);

            if (session == null || session.Revoked ||
                session.ExpirationDate <= now || session.User.Status != 1 ||
                !string.Equals(session.User.Role?.RoleName, role, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            if (session.LastAccessDate < now.AddMinutes(-5))
            {
                session.LastAccessDate = now;
                await _context.SaveChangesAsync();
            }

            return true;
        }

        public async Task RevokeSessionAsync(Guid sessionId, string reason)
        {
            var session = await _context.Set<SesionUsuario>()
                .FirstOrDefaultAsync(s => s.SessionId == sessionId && !s.Revoked);

            if (session == null) return;

            session.Revoked = true;
            session.RevocationDate = DateTimeOffset.UtcNow;
            session.RevocationReason = reason;
            await _context.SaveChangesAsync();
        }

        public async Task RevokeOtherSessionsAsync(
            int userId,
            Guid? currentSessionId,
            string reason)
        {
            var sessions = await _context.Set<SesionUsuario>()
                .Where(s =>
                    s.UserId == userId &&
                    !s.Revoked &&
                    (!currentSessionId.HasValue || s.SessionId != currentSessionId.Value))
                .ToListAsync();

            if (sessions.Count == 0) return;

            var now = DateTimeOffset.UtcNow;
            foreach (var session in sessions)
            {
                session.Revoked = true;
                session.RevocationDate = now;
                session.RevocationReason = reason;
            }

            await _context.SaveChangesAsync();
        }
    }
}
