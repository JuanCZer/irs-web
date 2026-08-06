using Backend.Configuration;
using Microsoft.Extensions.Options;

namespace Backend.Middleware;

public sealed class ApiRequestValidationMiddleware
{
    private static readonly HashSet<string> SafeMethods = new(StringComparer.OrdinalIgnoreCase)
    {
        HttpMethods.Get,
        HttpMethods.Head,
        HttpMethods.Options
    };

    private readonly RequestDelegate _next;
    private readonly SecurityOptions _options;
    private readonly HashSet<string> _allowedOrigins;
    private readonly ILogger<ApiRequestValidationMiddleware> _logger;

    public ApiRequestValidationMiddleware(
        RequestDelegate next,
        IOptions<SecurityOptions> options,
        ILogger<ApiRequestValidationMiddleware> logger)
    {
        _next = next;
        _options = options.Value;
        _logger = logger;
        _allowedOrigins = new HashSet<string>(
            _options.AllowedOrigins.Select(origin => origin.TrimEnd('/')),
            StringComparer.OrdinalIgnoreCase);
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var isApiRequest = context.Request.Path.StartsWithSegments("/api");
        var isHubRequest = context.Request.Path.StartsWithSegments("/hubs");

        if (!isApiRequest && !isHubRequest)
        {
            await _next(context);
            return;
        }

        if (HttpMethods.IsTrace(context.Request.Method))
        {
            await RejectAsync(
                context,
                StatusCodes.Status405MethodNotAllowed,
                "El método HTTP no está permitido");
            return;
        }

        var origin = context.Request.Headers.Origin.ToString().TrimEnd('/');
        if (!string.IsNullOrWhiteSpace(origin) &&
            !_allowedOrigins.Contains(origin) &&
            !IsSameOrigin(context.Request, origin))
        {
            _logger.LogWarning(
                "Solicitud rechazada por origen no autorizado a {Path}",
                context.Request.Path);
            await RejectAsync(context, StatusCodes.Status403Forbidden, "Origen no autorizado");
            return;
        }

        if (isApiRequest && !SafeMethods.Contains(context.Request.Method))
        {
            var suppliedHeader = context.Request.Headers[_options.AntiForgeryHeaderName].ToString();
            if (!string.Equals(
                    suppliedHeader,
                    _options.AntiForgeryHeaderValue,
                    StringComparison.Ordinal))
            {
                _logger.LogWarning(
                    "Solicitud {Method} rechazada por falta del encabezado antifalsificación en {Path}",
                    context.Request.Method,
                    context.Request.Path);
                await RejectAsync(
                    context,
                    StatusCodes.Status403Forbidden,
                    "La solicitud no incluye la protección antifalsificación requerida");
                return;
            }
        }

        await _next(context);
    }

    private static bool IsSameOrigin(HttpRequest request, string origin)
    {
        if (!Uri.TryCreate(origin, UriKind.Absolute, out var originUri) ||
            (originUri.Scheme != Uri.UriSchemeHttp &&
             originUri.Scheme != Uri.UriSchemeHttps) ||
            originUri.AbsolutePath != "/" ||
            !string.IsNullOrEmpty(originUri.Query) ||
            !string.IsNullOrEmpty(originUri.Fragment))
        {
            return false;
        }

        var originPort = originUri.IsDefaultPort
            ? GetDefaultPort(originUri.Scheme)
            : originUri.Port;
        var requestPort = request.Host.Port ?? GetDefaultPort(request.Scheme);

        return string.Equals(
                   originUri.Scheme,
                   request.Scheme,
                   StringComparison.OrdinalIgnoreCase) &&
               string.Equals(
                   originUri.Host,
                   request.Host.Host,
                   StringComparison.OrdinalIgnoreCase) &&
               originPort == requestPort;
    }

    private static int GetDefaultPort(string scheme) =>
        string.Equals(scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase)
            ? 443
            : 80;

    private static Task RejectAsync(HttpContext context, int status, string detail)
    {
        return Results.Problem(
                statusCode: status,
                title: "Solicitud rechazada",
                detail: detail,
                instance: context.Request.Path,
                extensions: new Dictionary<string, object?>
                {
                    ["traceId"] = context.TraceIdentifier
                })
            .ExecuteAsync(context);
    }
}
