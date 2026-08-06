using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using Backend.Configuration;
using Backend.Middleware;
using Backend.Services;
using IRS.API.Data;
using IRS.API.Hubs;
using IRS.API.Interfaces;
using IRS.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddSimpleConsole(options =>
{
    options.SingleLine = true;
    options.TimestampFormat = "yyyy-MM-ddTHH:mm:ss.fffZ ";
    options.UseUtcTimestamp = true;
});
if (builder.Environment.IsDevelopment())
    builder.Logging.AddDebug();

var security = builder.Configuration
    .GetSection(SecurityOptions.SectionName)
    .Get<SecurityOptions>() ?? new SecurityOptions();

ValidateConfiguration(builder, security);

builder.WebHost.ConfigureKestrel(options =>
{
    options.AddServerHeader = false;
    options.Limits.MaxRequestBodySize = security.MaxRequestBodySizeBytes;
    options.Limits.MaxRequestHeadersTotalSize = 32 * 1024;
    options.Limits.MaxRequestHeaderCount = 100;
    options.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(15);
    options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(2);
});

builder.Services
    .AddOptions<SecurityOptions>()
    .Bind(builder.Configuration.GetSection(SecurityOptions.SectionName))
    .Validate(options => options.AllowedOrigins.Length > 0, "Debe configurar al menos un origen permitido")
    .Validate(options => options.MaxRequestBodySizeBytes is >= 1024 and <= 50 * 1024 * 1024,
        "El límite del cuerpo de las solicitudes debe estar entre 1 KB y 50 MB")
    .ValidateOnStart();

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = security.MaxRequestBodySizeBytes;
    options.ValueLengthLimit = 64 * 1024;
    options.MultipartHeadersLengthLimit = 16 * 1024;
});

builder.Services
    .AddControllers(options => options.MaxModelBindingCollectionSize = 200)
    .AddJsonOptions(options => options.JsonSerializerOptions.MaxDepth = 32);
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var problem = new ValidationProblemDetails(new Dictionary<string, string[]>
        {
            ["request"] = ["Uno o más campos no cumplen las reglas de validación"]
        })
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "La solicitud contiene datos no válidos",
            Instance = context.HttpContext.Request.Path
        };
        problem.Extensions["traceId"] = context.HttpContext.TraceIdentifier;

        var result = new BadRequestObjectResult(problem);
        result.ContentTypes.Add("application/problem+json");
        return result;
    };
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = context =>
    {
        context.ProblemDetails.Instance ??= context.HttpContext.Request.Path;
        context.ProblemDetails.Extensions["traceId"] =
            Activity.Current?.Id ?? context.HttpContext.TraceIdentifier;
    };
});
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

var jwtKey = builder.Configuration["Jwt:Key"]!;
var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;
var jwtAudience = builder.Configuration["Jwt:Audience"]!;

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.IncludeErrorDetails = false;
        options.SaveToken = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            RequireExpirationTime = true,
            RequireSignedTokens = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var cookieName = builder.Configuration["Jwt:CookieName"]!;
                if (context.Request.Cookies.TryGetValue(cookieName, out var token))
                    context.Token = token;

                return Task.CompletedTask;
            },
            OnTokenValidated = async context =>
            {
                var idText = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
                var sessionIdText = context.Principal?.FindFirstValue("sid");
                var jti = context.Principal?.FindFirstValue(JwtRegisteredClaimNames.Jti);
                var role = context.Principal?.FindFirstValue(ClaimTypes.Role);

                if (!int.TryParse(idText, out var userId) ||
                    !Guid.TryParse(sessionIdText, out var sessionId) ||
                    string.IsNullOrWhiteSpace(jti) ||
                    string.IsNullOrWhiteSpace(role))
                {
                    context.Fail("Token inválido");
                    return;
                }

                var sessions = context.HttpContext.RequestServices
                    .GetRequiredService<ISesionService>();
                if (!await sessions.ValidateSessionAsync(sessionId, jti, userId, role))
                    context.Fail("Sesión inválida");
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    {
        var isWrite = IsWriteMethod(context.Request.Method);
        var permitLimit = isWrite
            ? security.WriteRequestsPerMinute
            : security.ReadRequestsPerMinute;
        var partitionKey = GetRateLimitPartition(context);

        return RateLimitPartition.GetFixedWindowLimiter(
            $"{(isWrite ? "write" : "read")}:{partitionKey}",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permitLimit,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                AutoReplenishment = true
            });
    });

    options.AddPolicy("login", context =>
        RateLimitPartition.GetSlidingWindowLimiter(
            $"login:{GetRemoteAddress(context)}",
            _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = security.LoginAttemptsPerMinute,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 6,
                QueueLimit = 0,
                AutoReplenishment = true
            }));

    options.OnRejected = async (context, cancellationToken) =>
    {
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            context.HttpContext.Response.Headers.RetryAfter =
                Math.Max(1, (int)Math.Ceiling(retryAfter.TotalSeconds)).ToString();
        }

        await Results.Problem(
                statusCode: StatusCodes.Status429TooManyRequests,
                title: "Demasiadas solicitudes",
                detail: "Espera antes de volver a intentarlo.",
                instance: context.HttpContext.Request.Path,
                extensions: new Dictionary<string, object?>
                {
                    ["traceId"] = context.HttpContext.TraceIdentifier
                })
            .ExecuteAsync(context.HttpContext);
    };
});

builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = false;
    options.MaximumReceiveMessageSize = 32 * 1024;
    options.HandshakeTimeout = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins(security.AllowedOrigins)
            .WithMethods("GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .WithHeaders(
                "Accept",
                "Authorization",
                "Content-Type",
                security.AntiForgeryHeaderName,
                "X-SignalR-User-Agent")
            .WithExposedHeaders("Retry-After")
            .SetPreflightMaxAge(TimeSpan.FromHours(1))
            .AllowCredentials();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;
builder.Services.AddDbContext<IRSDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.CommandTimeout(30);
        npgsqlOptions.EnableRetryOnFailure(3, TimeSpan.FromSeconds(2), null);
    });
    options.EnableDetailedErrors(builder.Environment.IsDevelopment());
    options.EnableSensitiveDataLogging(false);
});

builder.Services.AddScoped<IFichaService, ReportService>();
builder.Services.AddScoped<IUsuariosService, UsersService>();
builder.Services.AddScoped<ICatRolService, CatRolService>();
builder.Services.AddScoped<ICatalogosService, CatalogsService>();
builder.Services.AddScoped<IDespachoService, DispatchService>();
builder.Services.AddScoped<IAuditoriaService, AuditService>();
builder.Services.AddScoped<ISesionService, SessionService>();
builder.Services.AddSingleton<IAuditQueue, AuditQueue>();
builder.Services.AddHostedService<AuditBackgroundService>();

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseMiddleware<SecurityHeadersMiddleware>();

if (!app.Environment.IsDevelopment())
    app.UseHsts();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowAngularApp");
app.UseAuthentication();
app.UseRateLimiter();
app.UseMiddleware<ApiRequestValidationMiddleware>();
app.UseMiddleware<AuditoriaMiddleware>();
app.UseAuthorization();

app.MapControllers();
app.MapHub<FichaHub>("/hubs/fichas").RequireAuthorization();

app.Run();

static bool IsWriteMethod(string method) =>
    HttpMethods.IsPost(method) ||
    HttpMethods.IsPut(method) ||
    HttpMethods.IsPatch(method) ||
    HttpMethods.IsDelete(method);

static string GetRateLimitPartition(HttpContext context)
{
    var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
    return string.IsNullOrWhiteSpace(userId)
        ? $"ip:{GetRemoteAddress(context)}"
        : $"user:{userId}";
}

static string GetRemoteAddress(HttpContext context) =>
    context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

static void ValidateConfiguration(WebApplicationBuilder builder, SecurityOptions security)
{
    var jwtKey = builder.Configuration["Jwt:Key"];
    if (string.IsNullOrWhiteSpace(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 32)
        throw new InvalidOperationException("Jwt:Key debe configurarse fuera del repositorio y tener al menos 32 bytes.");

    if (string.IsNullOrWhiteSpace(builder.Configuration["Jwt:Issuer"]) ||
        string.IsNullOrWhiteSpace(builder.Configuration["Jwt:Audience"]))
    {
        throw new InvalidOperationException("Jwt:Issuer y Jwt:Audience son obligatorios.");
    }

    var cookieName = builder.Configuration["Jwt:CookieName"];
    if (string.IsNullOrWhiteSpace(cookieName))
        throw new InvalidOperationException("Jwt:CookieName es obligatorio.");
    if (builder.Environment.IsProduction() && !cookieName.StartsWith("__Host-", StringComparison.Ordinal))
        throw new InvalidOperationException("En producción, Jwt:CookieName debe utilizar el prefijo __Host-.");

    var sameSite = builder.Configuration["Jwt:CookieSameSite"];
    if (!Enum.TryParse<SameSiteMode>(sameSite, true, out var parsedSameSite) ||
        parsedSameSite == SameSiteMode.Unspecified)
    {
        throw new InvalidOperationException("Jwt:CookieSameSite debe ser Strict, Lax o None.");
    }

    if (string.IsNullOrWhiteSpace(builder.Configuration.GetConnectionString("DefaultConnection")))
        throw new InvalidOperationException("ConnectionStrings:DefaultConnection debe configurarse fuera del repositorio.");

    if (security.AllowedOrigins.Length == 0)
        throw new InvalidOperationException("Security:AllowedOrigins debe contener al menos un origen exacto.");

    foreach (var origin in security.AllowedOrigins)
    {
        if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps) ||
            uri.AbsolutePath != "/" ||
            !string.IsNullOrEmpty(uri.Query) ||
            !string.IsNullOrEmpty(uri.Fragment))
        {
            throw new InvalidOperationException($"El origen CORS '{origin}' no es un origen absoluto válido.");
        }

        if (builder.Environment.IsProduction() && uri.Scheme != Uri.UriSchemeHttps)
            throw new InvalidOperationException("Todos los orígenes CORS de producción deben utilizar HTTPS.");
    }

    if (security.MaxRequestBodySizeBytes is < 1024 or > 50 * 1024 * 1024 ||
        security.ReadRequestsPerMinute is < 1 or > 10_000 ||
        security.WriteRequestsPerMinute is < 1 or > 1_000 ||
        security.LoginAttemptsPerMinute is < 1 or > 30)
    {
        throw new InvalidOperationException("La configuración de límites de seguridad está fuera de los rangos admitidos.");
    }

    if (string.IsNullOrWhiteSpace(security.AntiForgeryHeaderName) ||
        string.IsNullOrWhiteSpace(security.AntiForgeryHeaderValue) ||
        security.AntiForgeryHeaderName.Any(char.IsControl) ||
        security.AntiForgeryHeaderValue.Any(char.IsControl))
    {
        throw new InvalidOperationException("La configuración del encabezado antifalsificación no es válida.");
    }

    var allowedHosts = builder.Configuration["AllowedHosts"];
    if (builder.Environment.IsProduction() &&
        (string.IsNullOrWhiteSpace(allowedHosts) || allowedHosts.Contains('*')))
    {
        throw new InvalidOperationException("AllowedHosts debe contener los hosts exactos de producción.");
    }
}
