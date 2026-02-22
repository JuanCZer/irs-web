using Backend.DTOs;
using Backend.Models;
using IRS.API.Data;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Text.RegularExpressions;
using IRS.API.Interfaces;

namespace Backend.Services
{
    public class UsuariosService : IUsuariosService
    {
        private readonly IRSDbContext _context;

        public UsuariosService(IRSDbContext context)
        {
            _context = context;
        }

        private string ObtenerIPLocal()
        {
            try
            {
                
                var processStartInfo = new ProcessStartInfo
                {
                    FileName = "ipconfig",
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using var process = Process.Start(processStartInfo);
                if (process == null)
                {
                    return "0.0.0.0";
                }

                var output = process.StandardOutput.ReadToEnd();
                process.WaitForExit();

                // Buscar la primera dirección IPv4 que no sea localhost
                var ipv4Pattern = @"IPv4.*?: (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})";
                var matches = Regex.Matches(output, ipv4Pattern);

                foreach (Match match in matches)
                {
                    var ip = match.Groups[1].Value;
                    // Ignorar localhost y IPs de link-local
                    if (ip != "127.0.0.1" && !ip.StartsWith("169.254"))
                    {
                        return ip;
                    }
                }
                return "0.0.0.0";
            }
            catch (Exception ex)
            {
                return "0.0.0.0";
            }
        }

        public async Task<List<UsuarioDTO>> ObtenerTodosLosUsuariosAsync()
        {
            
            var usuarios = await _context.Usuarios
                .Include(u => u.Rol) // Incluir la relación con CatRol
                .Where(u => u.Status == 1) // Solo usuarios activos
                .OrderByDescending(u => u.FechaHoraCreacion)
                .ToListAsync();

            return usuarios.Select(u => MapearAUsuarioDTO(u)).ToList();
        }

        public async Task<UsuarioDTO?> ObtenerUsuarioPorIdAsync(int id)
        {      
            var usuario = await _context.Usuarios
                .Include(u => u.Rol) // Incluir la relación con CatRol
                .FirstOrDefaultAsync(u => u.IdUsuario == id);

            if (usuario == null)
            {
                return null;
            }
            return MapearAUsuarioDTO(usuario);
        }

        public async Task<UsuarioDTO> CrearUsuarioAsync(CrearUsuarioDTO usuarioDto)
        {
            try
            {
                if (usuarioDto.IdUsuarioCrea.HasValue)
                {
                    var usuarioCrea = await _context.Usuarios
                        .Include(u => u.Rol)
                        .FirstOrDefaultAsync(u => u.IdUsuario == usuarioDto.IdUsuarioCrea.Value);

                    if (usuarioCrea == null)
                    {
                        throw new InvalidOperationException("El usuario que intenta crear no fue encontrado");
                    }

                    // Verificar que sea Administrador
                    if (usuarioCrea.Rol?.NombreRol?.ToUpper() != "ADMINISTRADOR")
                    {
                        throw new InvalidOperationException("Solo los administradores pueden crear nuevos usuarios");
                    }
                }
                else
                {
                    throw new InvalidOperationException("El ID del usuario que crea es requerido");
                }

                // Verificar si el usuario ya existe
                var usuarioExistente = await _context.Usuarios
                    .FirstOrDefaultAsync(u => u.Usuario1 == usuarioDto.Usuario);

                if (usuarioExistente != null)
                {
                    throw new InvalidOperationException($"El usuario '{usuarioDto.Usuario}' ya existe");
                }

                // Encriptar contraseña
                var passwordHash = BCrypt.Net.BCrypt.HashPassword(usuarioDto.Password);

                // Obtener IP local del sistema
                var ipLocal = ObtenerIPLocal();

                var nuevoUsuario = new Usuario
                {
                    Nombre = usuarioDto.Nombre,
                    App = usuarioDto.App,
                    Apm = usuarioDto.Apm,
                    Alias = usuarioDto.Alias,
                    Usuario1 = usuarioDto.Usuario,
                    Password = passwordHash,
                    Status = usuarioDto.Status ?? 1,
                    StatusList = 1,
                    IdRol = usuarioDto.IdRol,
                    FechaHoraCreacion = DateTime.UtcNow,
                    UltimoAcceso = DateTime.UtcNow,
                    Intento = 0,
                    Ip = ipLocal
                };
                _context.Usuarios.Add(nuevoUsuario);
                await _context.SaveChangesAsync();

                // Recargar el usuario con la navegación del rol
                var usuarioConRol = await _context.Usuarios
                    .Include(u => u.Rol)
                    .FirstOrDefaultAsync(u => u.IdUsuario == nuevoUsuario.IdUsuario);

                return MapearAUsuarioDTO(usuarioConRol ?? nuevoUsuario);
            }
            catch (Exception ex)
            {
                if (ex.InnerException != null)
                {
                }
                throw;
            }
        }

        public async Task<bool> ActualizarUsuarioAsync(int id, ActualizarUsuarioDTO usuarioDto)
        {
            var usuario = await _context.Usuarios.FindAsync(id);

            if (usuario == null)
            {
                return false;
            }

            // Actualizar solo los campos proporcionados
            if (usuarioDto.Nombre != null) usuario.Nombre = usuarioDto.Nombre;
            if (usuarioDto.App != null) usuario.App = usuarioDto.App;
            if (usuarioDto.Apm != null) usuario.Apm = usuarioDto.Apm;
            if (usuarioDto.Alias != null) usuario.Alias = usuarioDto.Alias;
            if (usuarioDto.Usuario != null) usuario.Usuario1 = usuarioDto.Usuario;
            if (usuarioDto.Status.HasValue) usuario.Status = usuarioDto.Status.Value;
            if (usuarioDto.IdRol.HasValue) usuario.IdRol = usuarioDto.IdRol.Value;

            // Si se proporciona una nueva contraseña, encriptarla
            if (!string.IsNullOrEmpty(usuarioDto.Password))
            {
                usuario.Password = BCrypt.Net.BCrypt.HashPassword(usuarioDto.Password);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EliminarUsuarioAsync(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);

            if (usuario == null)
            {
                return false;
            }

            // Eliminación lógica: cambiar status a 0 (inactivo)
            usuario.Status = 0;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<UsuarioDTO?> ValidarCredencialesAsync(string usuario, string password)
        {
            try
            {
                var usuarioEncontrado = await _context.Usuarios
                    .Include(u => u.Rol)
                    .FirstOrDefaultAsync(u => u.Usuario1 == usuario && u.Status == 1);

                if (usuarioEncontrado == null)
                {
                    return null;
                }

                // Verificar la contraseña con BCrypt
                bool passwordValida = BCrypt.Net.BCrypt.Verify(password, usuarioEncontrado.Password);

                if (!passwordValida)
                {
                    usuarioEncontrado.Intento = (usuarioEncontrado.Intento ?? 0) + 1;
                    await _context.SaveChangesAsync();
                    
                    return null;
                }

                // Actualizar último acceso y reiniciar intentos
                usuarioEncontrado.UltimoAcceso = DateTime.UtcNow;
                usuarioEncontrado.Intento = 0;
                await _context.SaveChangesAsync();

                return MapearAUsuarioDTO(usuarioEncontrado);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        private UsuarioDTO MapearAUsuarioDTO(Usuario usuario)
        {
            return new UsuarioDTO
            {
                IdUsuario = usuario.IdUsuario,
                Nombre = usuario.Nombre,
                App = usuario.App,
                Apm = usuario.Apm,
                Alias = usuario.Alias,
                Usuario = usuario.Usuario1,
                Status = usuario.Status,
                StatusList = usuario.StatusList,
                UltimoAcceso = usuario.UltimoAcceso,
                Intento = usuario.Intento,
                Ip = usuario.Ip,
                FechaHoraCreacion = usuario.FechaHoraCreacion,
                IdRol = usuario.IdRol,
                NombreRol = usuario.Rol?.NombreRol ?? "Sin rol" // Obtener nombre del rol desde la relación
            };
        }

        public async Task<RespuestaCambioContrasenaDTO> CambiarContrasenaAsync(CambiarContrasenaDTO cambioContraseñaDto)
        {
            try
            {
                var errores = new List<string>();

                if (string.IsNullOrWhiteSpace(cambioContraseñaDto.ContraseñaActual))
                {
                    errores.Add("La contraseña actual es requerida");
                }

                if (string.IsNullOrWhiteSpace(cambioContraseñaDto.ContraseñaNueva))
                {
                    errores.Add("La nueva contraseña es requerida");
                }

                if (cambioContraseñaDto.ContraseñaNueva != cambioContraseñaDto.ConfirmarContraseña)
                {
                    errores.Add("Las contraseñas nuevas no coinciden");
                }

                if (cambioContraseñaDto.ContraseñaNueva?.Length < 8)
                {
                    errores.Add("La nueva contraseña debe tener al menos 8 caracteres");
                }

                if (errores.Count > 0)
                {
                    return new RespuestaCambioContrasenaDTO
                    {
                        Exitoso = false,
                        Mensaje = "Errores de validación",
                        Errores = errores
                    };
                }

                // Obtener el usuario
                var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.IdUsuario == cambioContraseñaDto.IdUsuario);

                if (usuario == null)
                {
                    return new RespuestaCambioContrasenaDTO
                    {
                        Exitoso = false,
                        Mensaje = "Usuario no encontrado",
                        Errores = new List<string> { "El usuario especificado no existe" }
                    };
                }

                // Verificar que la contraseña actual es correcta
                bool contraseñaActualValida = BCrypt.Net.BCrypt.Verify(cambioContraseñaDto.ContraseñaActual, usuario.Password);

                if (!contraseñaActualValida)
                {
                    return new RespuestaCambioContrasenaDTO
                    {
                        Exitoso = false,
                        Mensaje = "La contraseña actual es incorrecta",
                        Errores = new List<string> { "La contraseña actual no coincide" }
                    };
                }

                // Evitar que la nueva contraseña sea igual a la actual
                bool contraseñaIgual = BCrypt.Net.BCrypt.Verify(cambioContraseñaDto.ContraseñaNueva, usuario.Password);
                if (contraseñaIgual)
                {
                    return new RespuestaCambioContrasenaDTO
                    {
                        Exitoso = false,
                        Mensaje = "La nueva contraseña debe ser diferente a la actual",
                        Errores = new List<string> { "La nueva contraseña no puede ser igual a la anterior" }
                    };
                }

                // Hashear la nueva contraseña
                string contraseñaHasheada = BCrypt.Net.BCrypt.HashPassword(cambioContraseñaDto.ContraseñaNueva);

                // Actualizar la contraseña
                usuario.Password = contraseñaHasheada;
                usuario.UltimoAcceso = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return new RespuestaCambioContrasenaDTO
                {
                    Exitoso = true,
                    Mensaje = "Contraseña actualizada exitosamente"
                };
            }
            catch (Exception ex)
            {
                return new RespuestaCambioContrasenaDTO
                {
                    Exitoso = false,
                    Mensaje = "Error al cambiar la contraseña",
                    Errores = new List<string> { ex.Message }
                };
            }
        }
    }
}
