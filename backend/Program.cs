using IRS.API.Data;
using IRS.API.Services;
using IRS.API.Hubs;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using IRS.API.Interfaces;
using Backend.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("La llave JWT no está configurada");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var cookieName = builder.Configuration["Jwt:CookieName"] ?? "irs_access_token";
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
                    context.Fail("El token no contiene una sesión válida");
                    return;
                }

                var sessions = context.HttpContext.RequestServices
                    .GetRequiredService<ISesionService>();
                if (!await sessions.ValidateSessionAsync(sessionId, jti, userId, role))
                    context.Fail("La sesión fue revocada o expiró");
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});


builder.Services.AddSignalR();


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            policy.WithOrigins(
                    "http://localhost:4200",
                    "http://localhost:50839",
                    "http://localhost:4300",
                    "http://localhost:4400"
                  )
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});


builder.Services.AddDbContext<IRSDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));


builder.Services.AddAutoMapper(typeof(Program));


builder.Services.AddScoped<IFichaService, ReportService>();
builder.Services.AddScoped<IUsuariosService, UsersService>();
builder.Services.AddScoped<ICatRolService, CatRolService>();
builder.Services.AddScoped<ICatalogosService, CatalogsService>();
builder.Services.AddScoped<IDespachoService, DispatchService>();
builder.Services.AddScoped<IAuditoriaService, AuditService>();
builder.Services.AddScoped<ISesionService, SessionService>();

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAngularApp");

app.UseMiddleware<AuditoriaMiddleware>();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.MapHub<FichaHub>("/hubs/fichas");

app.Run();
