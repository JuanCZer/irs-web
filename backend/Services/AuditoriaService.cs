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
                User = user?.Username ?? entry.FallbackUser ?? "ANONIMO",
                FullName = string.IsNullOrWhiteSpace(fullName) ? null : fullName,
                Role = user?.Role?.RoleName,
                Action = entry.Action,
                Module = entry.Module,
                Description = entry.Description,
                HttpMethod = entry.HttpMethod,
                Path = entry.Path,
                Entity = entry.Entity,
                EntityId = entry.EntityId,
                IpAddress = entry.IpAddress,
                UserAgent = entry.UserAgent,
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
                var term = $"%{filters.Search.Trim()}%";
                query = query.Where(e =>
                    EF.Functions.ILike(e.User, term) ||
                    (e.FullName != null && EF.Functions.ILike(e.FullName, term)) ||
                    EF.Functions.ILike(e.Description, term) ||
                    EF.Functions.ILike(e.Action, term) ||
                    EF.Functions.ILike(e.Module, term));
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

    }
}
