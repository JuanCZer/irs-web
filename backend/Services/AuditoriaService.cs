using Backend.DTOs;
using Backend.Models;
using IRS.API.Data;
using IRS.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class AuditService : IAuditoriaService
    {
        private readonly IRSDbContext _context;

        public AuditService(IRSDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(int? userId, RegistroAuditoriaDTO entry)
        {
            User? user = null;
            if (userId.HasValue)
            {
                user = await _context.Users
                    .AsNoTracking()
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.UserId == userId.Value);
            }

            var fullName = user == null
                ? null
                : string.Join(" ", new[] { user.Name, user.FirstSurname, user.SecondSurname }
                    .Where(value => !string.IsNullOrWhiteSpace(value)));

            var auditEvent = new AuditoriaEvento
            {
                UserId = user?.UserId,
                User = Sanitize(user?.Username ?? entry.FallbackUser, 100) ?? "ANONIMO",
                FullName = Sanitize(fullName, 300),
                Role = Sanitize(user?.Role?.RoleName, 100),
                Action = Sanitize(entry.Action, 100) ?? "PETICION_API",
                Module = Sanitize(entry.Module, 100) ?? "SISTEMA",
                Description = Sanitize(entry.Description, 600) ?? "Evento de auditoría",
                HttpMethod = Sanitize(entry.HttpMethod, 10),
                Path = Sanitize(entry.Path, 500),
                Entity = Sanitize(entry.Entity, 100),
                EntityId = Sanitize(entry.EntityId, 100),
                IpAddress = Sanitize(entry.IpAddress, 64),
                UserAgent = Sanitize(entry.UserAgent, 500),
                StatusCode = entry.StatusCode,
                Successful = entry.Successful,
                DateTime = DateTimeOffset.UtcNow,
                Details = entry.Details
            };

            _context.Set<AuditoriaEvento>().Add(auditEvent);
            await _context.SaveChangesAsync();
        }

        public async Task<AuditoriaPaginaDTO> QueryAsync(AuditoriaConsultaDTO filters)
        {
            var page = Math.Max(1, filters.Page);
            var pageSize = Math.Clamp(filters.PageSize, 10, 100);
            var query = _context.Set<AuditoriaEvento>().AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(filters.Search))
            {
                var term = $"%{EscapeLikePattern(filters.Search.Trim())}%";
                query = query.Where(e =>
                    EF.Functions.ILike(e.User, term, "\\") ||
                    (e.FullName != null && EF.Functions.ILike(e.FullName, term, "\\")) ||
                    EF.Functions.ILike(e.Description, term, "\\") ||
                    EF.Functions.ILike(e.Action, term, "\\") ||
                    EF.Functions.ILike(e.Module, term, "\\"));
            }

            if (filters.UserId.HasValue)
                query = query.Where(e => e.UserId == filters.UserId.Value);

            if (!string.IsNullOrWhiteSpace(filters.Module))
                query = query.Where(e => e.Module == filters.Module);

            if (!string.IsNullOrWhiteSpace(filters.Action))
                query = query.Where(e => e.Action == filters.Action);

            if (filters.Successful.HasValue)
                query = query.Where(e => e.Successful == filters.Successful.Value);

            if (filters.StartDate.HasValue)
                query = query.Where(e => e.DateTime >= filters.StartDate.Value);

            if (filters.EndDate.HasValue)
                query = query.Where(e => e.DateTime < filters.EndDate.Value.AddDays(1));

            var total = await query.CountAsync();
            var successfulItems = await query.CountAsync(e => e.Successful);
            var distinctUsers = await query
                .Where(e => e.UserId.HasValue)
                .Select(e => e.UserId)
                .Distinct()
                .CountAsync();

            var events = await query
                .OrderByDescending(e => e.DateTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(e => new AuditoriaEventoDTO
                {
                    AuditId = e.AuditId,
                    UserId = e.UserId,
                    User = e.User,
                    FullName = e.FullName,
                    Role = e.Role,
                    Action = e.Action,
                    Module = e.Module,
                    Description = e.Description,
                    HttpMethod = e.HttpMethod,
                    Path = e.Path,
                    Entity = e.Entity,
                    EntityId = e.EntityId,
                    IpAddress = e.IpAddress,
                    StatusCode = e.StatusCode,
                    Successful = e.Successful,
                    DateTime = e.DateTime,
                    Details = e.Details
                })
                .ToListAsync();

            return new AuditoriaPaginaDTO
            {
                Items = events,
                Summary = new AuditoriaResumenDTO
                {
                    TotalEvents = total,
                    SuccessfulEvents = successfulItems,
                    FailedEvents = total - successfulItems,
                    DistinctUsers = distinctUsers
                },
                Page = page,
                PageSize = pageSize,
                TotalPages = total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize)
            };
        }

        private static string EscapeLikePattern(string value) => value
            .Replace("\\", "\\\\", StringComparison.Ordinal)
            .Replace("%", "\\%", StringComparison.Ordinal)
            .Replace("_", "\\_", StringComparison.Ordinal);

        private static string? Sanitize(string? value, int maximumLength)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;

            var sanitized = new string(value
                .Where(character => !char.IsControl(character))
                .ToArray())
                .Trim();
            if (sanitized.Length == 0) return null;

            return sanitized.Length <= maximumLength
                ? sanitized
                : sanitized[..maximumLength];
        }

    }
}
