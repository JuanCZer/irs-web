using System.Diagnostics;
using System.Security.Claims;
using System.Text.Json;
using Backend.DTOs;
using IRS.API.Interfaces;

namespace Backend.Middleware
{
    public class AuditoriaMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AuditoriaMiddleware> _logger;

        public AuditoriaMiddleware(
            RequestDelegate next,
            IServiceScopeFactory scopeFactory,
            ILogger<AuditoriaMiddleware> logger)
        {
            _next = next;
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var ruta = context.Request.Path.Value ?? string.Empty;
            if (!ruta.StartsWith("/api", StringComparison.OrdinalIgnoreCase) ||
                ruta.StartsWith("/api/health", StringComparison.OrdinalIgnoreCase))
            {
                await _next(context);
                return;
            }

            var omitirRegistroAutomatico =
                context.Request.Method == HttpMethods.Post &&
                ruta.Equals("/api/auditoria/eventos", StringComparison.OrdinalIgnoreCase);
            var cronometro = Stopwatch.StartNew();
            Exception? errorNoControlado = null;

            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                errorNoControlado = ex;
                throw;
            }
            finally
            {
                cronometro.Stop();
                if (!omitirRegistroAutomatico)
                {
                    await RegistrarPeticionAsync(
                        context,
                        ruta,
                        cronometro.ElapsedMilliseconds,
                        errorNoControlado);
                }
            }
        }

        private async Task RegistrarPeticionAsync(
            HttpContext context,
            string ruta,
            long duracionMs,
            Exception? errorNoControlado)
        {
            try
            {
                var idUsuario = ObtenerIdUsuario(context);
                var estado = errorNoControlado == null
                    ? context.Response.StatusCode
                    : StatusCodes.Status500InternalServerError;
                var clasificacion = Clasificar(context.Request.Method, ruta);
                var exitoso = estado < 400;
                var idEntidad = context.Items["AuditoriaEntidadId"]?.ToString()
                    ?? clasificacion.IdEntidad;
                if (idEntidad == null &&
                    (clasificacion.Modulo == "AUTENTICACION" || clasificacion.Modulo == "SEGURIDAD"))
                {
                    idEntidad = idUsuario?.ToString();
                }
                var descripcion = exitoso
                    ? clasificacion.Descripcion
                    : $"{clasificacion.Descripcion} (resultado no exitoso: HTTP {estado})";

                using var alcance = _scopeFactory.CreateScope();
                var servicio = alcance.ServiceProvider.GetRequiredService<IAuditoriaService>();
                await servicio.RegistrarAsync(idUsuario, new RegistroAuditoriaDTO
                {
                    Accion = clasificacion.Accion,
                    Modulo = clasificacion.Modulo,
                    Descripcion = descripcion,
                    MetodoHttp = context.Request.Method,
                    Ruta = Limitar(ruta, 500),
                    Entidad = clasificacion.Entidad,
                    IdEntidad = idEntidad,
                    DireccionIp = Limitar(context.Connection.RemoteIpAddress?.ToString(), 64),
                    AgenteUsuario = Limitar(context.Request.Headers.UserAgent.ToString(), 500),
                    CodigoEstado = estado,
                    Exitoso = exitoso,
                    UsuarioAlternativo = context.Items["AuditoriaUsuarioNombre"]?.ToString(),
                    Detalles = JsonSerializer.Serialize(new
                    {
                        consulta = context.Request.QueryString.Value,
                        duracionMs,
                        error = errorNoControlado?.GetType().Name
                    })
                });
            }
            catch (Exception ex)
            {
                // La bitácora nunca debe interrumpir la operación principal.
                _logger.LogWarning(ex, "No fue posible guardar el evento de auditoría {Ruta}", ruta);
            }
        }

        private static int? ObtenerIdUsuario(HttpContext context)
        {
            if (context.Items["AuditoriaUsuarioId"] is int idDesdeLogin)
                return idDesdeLogin;

            return int.TryParse(
                context.User.FindFirstValue(ClaimTypes.NameIdentifier),
                out var idUsuario)
                ? idUsuario
                : null;
        }

        private static (string Accion, string Modulo, string Descripcion, string? Entidad, string? IdEntidad)
            Clasificar(string metodo, string rutaOriginal)
        {
            var ruta = rutaOriginal.TrimEnd('/').ToLowerInvariant();
            var segmentos = ruta.Split('/', StringSplitOptions.RemoveEmptyEntries);
            var ultimoId = segmentos.LastOrDefault(segmento => int.TryParse(segmento, out _));

            if (ruta == "/api/auth/login")
                return ("INICIAR_SESION", "AUTENTICACION", "Inició sesión en el sistema", "USUARIO", null);
            if (ruta == "/api/auth/logout")
                return ("CERRAR_SESION", "AUTENTICACION", "Cerró su sesión", "USUARIO", null);
            if (ruta == "/api/auth/me")
                return ("VALIDAR_SESION", "AUTENTICACION", "Validó su sesión activa", "SESION", null);
            if (ruta == "/api/auth/cambiar-contrasena")
                return ("CAMBIAR_CONTRASENA", "SEGURIDAD", "Cambió la contraseña de su cuenta", "USUARIO", null);

            if (ruta.StartsWith("/api/usuarios"))
            {
                if (metodo == HttpMethods.Post)
                    return ("CREAR_USUARIO", "USUARIOS", "Registró un usuario", "USUARIO", null);
                if (metodo == HttpMethods.Put)
                    return ("ACTUALIZAR_USUARIO", "USUARIOS", "Actualizó un usuario", "USUARIO", ultimoId);
                if (metodo == HttpMethods.Delete)
                    return ("DESACTIVAR_USUARIO", "USUARIOS", "Desactivó un usuario", "USUARIO", ultimoId);
                return ultimoId == null
                    ? ("CONSULTAR_USUARIOS", "USUARIOS", "Consultó los usuarios dados de alta", "USUARIO", null)
                    : ("CONSULTAR_USUARIO", "USUARIOS", "Consultó el detalle de un usuario", "USUARIO", ultimoId);
            }

            if (ruta.StartsWith("/api/fichas"))
            {
                if (metodo == HttpMethods.Post)
                    return ("CREAR_FICHA", "FICHAS", "Registró una ficha informativa", "FICHA", null);
                if (metodo == HttpMethods.Put)
                    return ("ACTUALIZAR_FICHA", "FICHAS", "Actualizó una ficha informativa", "FICHA", ultimoId);
                if (metodo == HttpMethods.Delete)
                    return ("ELIMINAR_FICHA", "FICHAS", "Eliminó una ficha informativa", "FICHA", ultimoId);
                if (ruta.Contains("estadisticas"))
                    return ("CONSULTAR_ESTADISTICAS", "ESTADISTICAS", "Consultó las estadísticas de fichas", "FICHA", null);
                if (ruta.Contains("borradores"))
                    return ("CONSULTAR_BORRADORES", "FICHAS", "Consultó borradores de fichas", "FICHA", null);
                return ("CONSULTAR_FICHAS", "FICHAS", "Consultó fichas informativas", "FICHA", ultimoId);
            }

            if (ruta.StartsWith("/api/despacho"))
            {
                return metodo == HttpMethods.Post
                    ? ("REALIZAR_DESPACHO", "DESPACHO", "Realizó la validación de despacho de una ficha", "FICHA", ultimoId)
                    : ("CONSULTAR_DESPACHO", "DESPACHO", "Consultó información de despacho", "FICHA", ultimoId);
            }

            if (ruta.StartsWith("/api/auditoria"))
                return ("CONSULTAR_AUDITORIA", "AUDITORIA", "Consultó la bitácora de actividad", "AUDITORIA", null);
            if (ruta.StartsWith("/api/catalogos"))
                return ("CONSULTAR_CATALOGO", "CATALOGOS", "Consultó un catálogo del sistema", "CATALOGO", null);
            if (ruta.StartsWith("/api/roles"))
                return ("CONSULTAR_ROLES", "USUARIOS", "Consultó el catálogo de roles", "ROL", null);

            return ("PETICION_API", "SISTEMA", $"Ejecutó {metodo} sobre {rutaOriginal}", null, ultimoId);
        }

        private static string? Limitar(string? valor, int longitud)
        {
            if (string.IsNullOrEmpty(valor)) return valor;
            return valor.Length <= longitud ? valor : valor[..longitud];
        }
    }
}
