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

// Add services to the container.
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
                var idTexto = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
                var idSesionTexto = context.Principal?.FindFirstValue("sid");
                var jti = context.Principal?.FindFirstValue(JwtRegisteredClaimNames.Jti);
                var rol = context.Principal?.FindFirstValue(ClaimTypes.Role);

                if (!int.TryParse(idTexto, out var idUsuario) ||
                    !Guid.TryParse(idSesionTexto, out var idSesion) ||
                    string.IsNullOrWhiteSpace(jti) ||
                    string.IsNullOrWhiteSpace(rol))
                {
                    context.Fail("El token no contiene una sesión válida");
                    return;
                }

                var sesiones = context.HttpContext.RequestServices
                    .GetRequiredService<ISesionService>();
                if (!await sesiones.ValidarSesionAsync(idSesion, jti, idUsuario, rol))
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

// Configurar SignalR
builder.Services.AddSignalR();

// Configurar CORS para Angular
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            policy.WithOrigins(
                    "http://localhost:4200",
                    "http://localhost:50839",  // Puerto alternativo de Angular
                    "http://localhost:4300",
                    "http://localhost:4400"
                  )
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // Necesario para SignalR
        });
});

// Configurar DbContext con PostgreSQL
builder.Services.AddDbContext<IRSDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configurar AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Registrar servicios
builder.Services.AddScoped<IFichaService, FichaService>();
builder.Services.AddScoped<IUsuariosService, UsuariosService>();
builder.Services.AddScoped<ICatRolService, CatRolService>();
builder.Services.AddScoped<ICatalogosService, CatalogosService>();
builder.Services.AddScoped<IDespachoService, DespachoService>();
builder.Services.AddScoped<IAuditoriaService, AuditoriaService>();
builder.Services.AddScoped<ISesionService, SesionService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
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

// Mapear el Hub de SignalR
app.MapHub<FichaHub>("/hubs/fichas");

app.Run();
