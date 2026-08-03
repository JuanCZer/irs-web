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
            var path = context.Request.Path.Value ?? string.Empty;
            if (!path.StartsWith("/api", StringComparison.OrdinalIgnoreCase) ||
                path.StartsWith("/api/health", StringComparison.OrdinalIgnoreCase))
            {
                await _next(context);
                return;
            }

            var skipAutomaticLogging =
                context.Request.Method == HttpMethods.Post &&
                path.Equals("/api/auditoria/eventos", StringComparison.OrdinalIgnoreCase);
            var stopwatch = Stopwatch.StartNew();
            Exception? unhandledError = null;

            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                unhandledError = ex;
                throw;
            }
            finally
            {
                stopwatch.Stop();
                if (!skipAutomaticLogging)
                {
                    await LogRequestAsync(
                        context,
                        path,
                        stopwatch.ElapsedMilliseconds,
                        unhandledError);
                }
            }
        }

        private async Task LogRequestAsync(
            HttpContext context,
            string path,
            long durationMs,
            Exception? unhandledError)
        {
            try
            {
                var userId = GetUserId(context);
                var state = unhandledError == null
                    ? context.Response.StatusCode
                    : StatusCodes.Status500InternalServerError;
                var classification = Classify(context.Request.Method, path);
                var successful = state < 400;
                var entityId = context.Items["AuditoriaEntidadId"]?.ToString()
                    ?? classification.EntityId;
                if (entityId == null &&
                    (classification.Module == "AUTENTICACION" || classification.Module == "SEGURIDAD"))
                {
                    entityId = userId?.ToString();
                }
                var description = successful
                    ? classification.Description
                    : $"{classification.Description} (resultado no exitoso: HTTP {state})";

                using var scope = _scopeFactory.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<IAuditoriaService>();
                await service.LogAsync(userId, new RegistroAuditoriaDTO
                {
                    Action = classification.Action,
                    Module = classification.Module,
                    Description = description,
                    HttpMethod = context.Request.Method,
                    Path = Limit(path, 500),
                    Entity = classification.Entity,
                    EntityId = entityId,
                    IpAddress = Limit(context.Connection.RemoteIpAddress?.ToString(), 64),
                    UserAgent = Limit(context.Request.Headers.UserAgent.ToString(), 500),
                    StatusCode = state,
                    Successful = successful,
                    FallbackUser = context.Items["AuditoriaUsuarioNombre"]?.ToString(),
                    Details = JsonSerializer.Serialize(new
                    {
                        query = context.Request.QueryString.Value,
                        durationMs,
                        error = unhandledError?.GetType().Name
                    })
                });
            }
            catch (Exception ex)
            {

                _logger.LogWarning(ex, "No fue posible guardar el evento de auditoría {Ruta}", path);
            }
        }

        private static int? GetUserId(HttpContext context)
        {
            if (context.Items["AuditoriaUsuarioId"] is int loginUserId)
                return loginUserId;

            return int.TryParse(
                context.User.FindFirstValue(ClaimTypes.NameIdentifier),
                out var userId)
                ? userId
                : null;
        }

        private static (string Action, string Module, string Description, string? Entity, string? EntityId)
            Classify(string method, string originalPath)
        {
            var path = originalPath.TrimEnd('/').ToLowerInvariant();
            var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
            var lastId = segments.LastOrDefault(segment => int.TryParse(segment, out _));

            if (path == "/api/auth/login")
                return ("INICIAR_SESION", "AUTENTICACION", "Inició sesión en el sistema", "USUARIO", null);
            if (path == "/api/auth/logout")
                return ("CERRAR_SESION", "AUTENTICACION", "Cerró su sesión", "USUARIO", null);
            if (path == "/api/auth/me")
                return ("VALIDAR_SESION", "AUTENTICACION", "Validó su sesión activa", "SESION", null);
            if (path == "/api/auth/cambiar-contrasena")
                return ("CAMBIAR_CONTRASENA", "SEGURIDAD", "Cambió la contraseña de su cuenta", "USUARIO", null);

            if (path.StartsWith("/api/usuarios"))
            {
                if (method == HttpMethods.Post)
                    return ("CREAR_USUARIO", "USUARIOS", "Registró un usuario", "USUARIO", null);
                if (method == HttpMethods.Put)
                    return ("ACTUALIZAR_USUARIO", "USUARIOS", "Actualizó un usuario", "USUARIO", lastId);
                if (method == HttpMethods.Delete)
                    return ("DESACTIVAR_USUARIO", "USUARIOS", "Desactivó un usuario", "USUARIO", lastId);
                return lastId == null
                    ? ("CONSULTAR_USUARIOS", "USUARIOS", "Consultó los usuarios dados de alta", "USUARIO", null)
                    : ("CONSULTAR_USUARIO", "USUARIOS", "Consultó el detalle de un usuario", "USUARIO", lastId);
            }

            if (path.StartsWith("/api/fichas"))
            {
                if (method == HttpMethods.Post)
                    return ("CREAR_FICHA", "FICHAS", "Registró una ficha informativa", "FICHA", null);
                if (method == HttpMethods.Put)
                    return ("ACTUALIZAR_FICHA", "FICHAS", "Actualizó una ficha informativa", "FICHA", lastId);
                if (method == HttpMethods.Delete)
                    return ("ELIMINAR_FICHA", "FICHAS", "Eliminó una ficha informativa", "FICHA", lastId);
                if (path.Contains("estadisticas"))
                    return ("CONSULTAR_ESTADISTICAS", "ESTADISTICAS", "Consultó las estadísticas de fichas", "FICHA", null);
                if (path.Contains("borradores"))
                    return ("CONSULTAR_BORRADORES", "FICHAS", "Consultó borradores de fichas", "FICHA", null);
                return ("CONSULTAR_FICHAS", "FICHAS", "Consultó fichas informativas", "FICHA", lastId);
            }

            if (path.StartsWith("/api/despacho"))
            {
                return method == HttpMethods.Post
                    ? ("REALIZAR_DESPACHO", "DESPACHO", "Realizó la validación de despacho de una ficha", "FICHA", lastId)
                    : ("CONSULTAR_DESPACHO", "DESPACHO", "Consultó información de despacho", "FICHA", lastId);
            }

            if (path.StartsWith("/api/auditoria"))
                return ("CONSULTAR_AUDITORIA", "AUDITORIA", "Consultó la bitácora de actividad", "AUDITORIA", null);
            if (path.StartsWith("/api/catalogos"))
                return ("CONSULTAR_CATALOGO", "CATALOGOS", "Consultó un catálogo del sistema", "CATALOGO", null);
            if (path.StartsWith("/api/roles"))
                return ("CONSULTAR_ROLES", "USUARIOS", "Consultó el catálogo de roles", "ROL", null);

            return ("PETICION_API", "SISTEMA", $"Ejecutó {method} sobre {originalPath}", null, lastId);
        }

        private static string? Limit(string? value, int longitude)
        {
            if (string.IsNullOrEmpty(value)) return value;
            return value.Length <= longitude ? value : value[..longitude];
        }
    }
}
