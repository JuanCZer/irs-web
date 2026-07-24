using Backend.DTOs;
using Backend.Models;
using IRS.API.Data;
using IRS.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class AuditoriaService : IAuditoriaService
    {
        private readonly IRSDbContext _context;

        public AuditoriaService(IRSDbContext context)
        {
            _context = context;
        }

        public async Task RegistrarAsync(int? idUsuario, RegistroAuditoriaDTO registro)
        {
            Usuario? usuario = null;
            if (idUsuario.HasValue)
            {
                usuario = await _context.Usuarios
                    .AsNoTracking()
                    .Include(u => u.Rol)
                    .FirstOrDefaultAsync(u => u.IdUsuario == idUsuario.Value);
            }

            var nombreCompleto = usuario == null
                ? null
                : string.Join(" ", new[] { usuario.Nombre, usuario.App, usuario.Apm }
                    .Where(valor => !string.IsNullOrWhiteSpace(valor)));

            var evento = new AuditoriaEvento
            {
                IdUsuario = usuario?.IdUsuario,
                Usuario = usuario?.Usuario1 ?? registro.UsuarioAlternativo ?? "ANONIMO",
                NombreCompleto = string.IsNullOrWhiteSpace(nombreCompleto) ? null : nombreCompleto,
                Rol = usuario?.Rol?.NombreRol,
                Accion = registro.Accion,
                Modulo = registro.Modulo,
                Descripcion = registro.Descripcion,
                MetodoHttp = registro.MetodoHttp,
                Ruta = registro.Ruta,
                Entidad = registro.Entidad,
                IdEntidad = registro.IdEntidad,
                DireccionIp = registro.DireccionIp,
                AgenteUsuario = registro.AgenteUsuario,
                CodigoEstado = registro.CodigoEstado,
                Exitoso = registro.Exitoso,
                FechaHora = DateTimeOffset.UtcNow,
                Detalles = registro.Detalles
            };

            _context.Set<AuditoriaEvento>().Add(evento);
            await _context.SaveChangesAsync();
        }

        public async Task<AuditoriaPaginaDTO> ConsultarAsync(AuditoriaConsultaDTO consulta)
        {
            var pagina = Math.Max(1, consulta.Pagina);
            var tamanoPagina = Math.Clamp(consulta.TamanoPagina, 10, 100);
            var query = _context.Set<AuditoriaEvento>().AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(consulta.Busqueda))
            {
                var termino = $"%{consulta.Busqueda.Trim()}%";
                query = query.Where(e =>
                    EF.Functions.ILike(e.Usuario, termino) ||
                    (e.NombreCompleto != null && EF.Functions.ILike(e.NombreCompleto, termino)) ||
                    EF.Functions.ILike(e.Descripcion, termino) ||
                    EF.Functions.ILike(e.Accion, termino) ||
                    EF.Functions.ILike(e.Modulo, termino));
            }

            if (consulta.IdUsuario.HasValue)
                query = query.Where(e => e.IdUsuario == consulta.IdUsuario.Value);

            if (!string.IsNullOrWhiteSpace(consulta.Modulo))
                query = query.Where(e => e.Modulo == consulta.Modulo);

            if (!string.IsNullOrWhiteSpace(consulta.Accion))
                query = query.Where(e => e.Accion == consulta.Accion);

            if (consulta.Exitoso.HasValue)
                query = query.Where(e => e.Exitoso == consulta.Exitoso.Value);

            if (consulta.FechaInicio.HasValue)
                query = query.Where(e => e.FechaHora >= consulta.FechaInicio.Value);

            if (consulta.FechaFin.HasValue)
                query = query.Where(e => e.FechaHora < consulta.FechaFin.Value.AddDays(1));

            var total = await query.CountAsync();
            var exitosos = await query.CountAsync(e => e.Exitoso);
            var usuariosDistintos = await query
                .Where(e => e.IdUsuario.HasValue)
                .Select(e => e.IdUsuario)
                .Distinct()
                .CountAsync();

            var eventos = await query
                .OrderByDescending(e => e.FechaHora)
                .Skip((pagina - 1) * tamanoPagina)
                .Take(tamanoPagina)
                .Select(e => new AuditoriaEventoDTO
                {
                    IdAuditoria = e.IdAuditoria,
                    IdUsuario = e.IdUsuario,
                    Usuario = e.Usuario,
                    NombreCompleto = e.NombreCompleto,
                    Rol = e.Rol,
                    Accion = e.Accion,
                    Modulo = e.Modulo,
                    Descripcion = e.Descripcion,
                    MetodoHttp = e.MetodoHttp,
                    Ruta = e.Ruta,
                    Entidad = e.Entidad,
                    IdEntidad = e.IdEntidad,
                    DireccionIp = e.DireccionIp,
                    CodigoEstado = e.CodigoEstado,
                    Exitoso = e.Exitoso,
                    FechaHora = e.FechaHora,
                    Detalles = e.Detalles
                })
                .ToListAsync();

            return new AuditoriaPaginaDTO
            {
                Elementos = eventos,
                Resumen = new AuditoriaResumenDTO
                {
                    TotalEventos = total,
                    EventosExitosos = exitosos,
                    EventosConError = total - exitosos,
                    UsuariosDistintos = usuariosDistintos
                },
                Pagina = pagina,
                TamanoPagina = tamanoPagina,
                TotalPaginas = total == 0 ? 0 : (int)Math.Ceiling(total / (double)tamanoPagina)
            };
        }

    }
}
