using IRS.API.Data;
using IRS.API.DTOs;
using IRS.API.Models;
using Microsoft.EntityFrameworkCore;

namespace IRS.API.Services;

public class FichaService : IFichaService
{
    private readonly IRSDbContext _context;

    public FichaService(IRSDbContext context)
    {
        _context = context;
    }

    public async Task<List<FichaResponseDto>> ObtenerTodasAsync()
    {
        return await _context.Fichas
            .OrderByDescending(f => f.FechaElaboracion)
            .Select(f => new FichaResponseDto
            {
                Id = f.Id,
                Delegacion = f.Delegacion,
                Lugar = f.Lugar,
                Sector = f.Sector,
                FechaSuceso = f.FechaSuceso,
                Prioridad = f.Prioridad,
                Condicion = f.Condicion,
                FechaElaboracion = f.FechaElaboracion
            })
            .ToListAsync();
    }

    public async Task<List<FichasTodosDto>> ObtenerTodosDtoAsync()
    {
        var fichas = await _context.Fichas
            //Preguntar a LALO
            .Where(f => (f.Activo == 2 || f.Activo == 3 || f.Activo == 6) && 
                       (f.IdEstadoActual == 2 || f.IdEstadoActual == 3 || 
                        f.IdEstadoActual == 4 || f.IdEstadoActual == 6 || 
                        f.IdEstadoActual == 7))
            .OrderByDescending(f => f.FechaElaboracion)
            .ToListAsync();

        return fichas.Select(f => MapearAFichasTodosDto(f)).ToList();
    }

    public async Task<List<FichasTodosDto>> ObtenerFichasPorRangoFechasAsync(DateTime fechaInicio, DateTime fechaFin)
    {
       
        // Convertir a UTC si no lo están
        var fechaInicioUtc = fechaInicio.Kind == DateTimeKind.Unspecified 
            ? DateTime.SpecifyKind(fechaInicio, DateTimeKind.Utc) 
            : fechaInicio.ToUniversalTime();
            
        var fechaFinUtc = fechaFin.Kind == DateTimeKind.Unspecified 
            ? DateTime.SpecifyKind(fechaFin, DateTimeKind.Utc) 
            : fechaFin.ToUniversalTime();
        
        // Ajustar fechaFin para incluir todo el día (hasta las 23:59:59)
        var fechaFinAjustada = fechaFinUtc.Date.AddDays(1).AddTicks(-1);
        
        var fichas = await _context.Fichas
            .Where(f => (f.Activo == 2 || f.Activo == 3 || f.Activo == 6) && 
                       (f.IdEstadoActual == 2 || f.IdEstadoActual == 3 || 
                        f.IdEstadoActual == 4 || f.IdEstadoActual == 6 || 
                        f.IdEstadoActual == 7) &&
                       f.FechaElaboracion >= fechaInicioUtc && 
                       f.FechaElaboracion <= fechaFinAjustada)
            .OrderByDescending(f => f.FechaElaboracion)
            .ToListAsync();

        var resultado = fichas.Select(f => MapearAFichasTodosDto(f)).ToList();
       
        return resultado;
    }

    public async Task<List<FichasTodosDto>> ObtenerFichasDelDiaAsync()
    {
        // Obtener la fecha de hoy en UTC
        var hoy = DateTime.UtcNow.Date;
        var finDelDia = hoy.AddDays(1).AddTicks(-1);
        
        var fichas = await _context.Fichas
            .Where(f => (f.Activo == 3 || f.Activo == 6) && 
                       (f.IdEstadoActual == 2 || f.IdEstadoActual == 3 || 
                        f.IdEstadoActual == 4 || f.IdEstadoActual == 6 || 
                        f.IdEstadoActual == 7) &&
                       f.FechaElaboracion >= hoy && 
                       f.FechaElaboracion <= finDelDia)
            .OrderByDescending(f => f.FechaElaboracion)
            .ToListAsync();

        return fichas.Select(f => MapearAFichasTodosDto(f)).ToList();
    }

    public async Task<List<FichasTodosDto>> ObtenerFichasConcluidasAsync()
    {
      var fichas = await _context.Fichas
          .Where(f =>             
              f.IdEstadoActual == 2 &&
              f.Activo == 3 &&
              f.Cedula.HasValue &&
              f.Cedula.Value > 0 &&
              f.Condicion == "CONCLUIDO"
          )
          .OrderByDescending(f => f.FechaElaboracion)
          .ToListAsync();

      return fichas.Select(f => MapearAFichasTodosDto(f)).ToList();
    }

    public async Task<List<FichasBorradorDto>> ObtenerBorradoresAsync()
    {
        var borradores = await _context.Fichas
            .Where(f => f.Activo == 2)
            .OrderByDescending(f => f.FechaElaboracion)
            .ToListAsync();

        Console.WriteLine($"🔍 Total borradores encontrados: {borradores.Count}");
        
        if (borradores.Any())
        {
            var primero = borradores.First();
        }

        return borradores.Select(f => MapearAFichasBorradorDto(f)).ToList();
    }

    public async Task<List<FichasBorradorDto>> BuscarBorradoresAsync(string criterio)
    {
        var borradores = await _context.Fichas
            .Where(f => f.Activo == 2 && 
                (f.Delegacion.Contains(criterio) ||
                 f.Sector.Contains(criterio) ||
                 f.Prioridad.Contains(criterio) ||
                 f.Condicion.Contains(criterio) ||
                 f.Lugar.Contains(criterio) ||
                 f.Asunto.Contains(criterio)))
            .OrderByDescending(f => f.FechaElaboracion)
            .ToListAsync();

        return borradores.Select(f => MapearAFichasBorradorDto(f)).ToList();
    }

    private FichasTodosDto MapearAFichasTodosDto(FichaInformativa ficha)
    {
        var folio = ficha.FolioInterno ?? $"F-{ficha.Id.ToString().PadLeft(6, '0')}";
        
        var horaInicio = FormatearTimeSpan(ficha.HoraSucesoInicio, ficha.Id, "HoraSucesoInicio");
        var horaFin = FormatearTimeSpan(ficha.HoraSucesoFin, ficha.Id, "HoraSucesoFin");
        
        var horaSuceso = horaInicio != null && horaFin != null
            ? $"{horaInicio} - {horaFin}"
            : horaInicio ?? horaFin ?? "N/A";
      
        return new FichasTodosDto
        {
            Id = ficha.Id,
            FechaElaboracion = ficha.FechaElaboracion?.ToString("yyyy-MM-dd") ?? "",
            Folio = folio,
            FechaSuceso = ficha.FechaSuceso?.ToString("yyyy-MM-dd") ?? "",
            HoraSuceso = horaSuceso,
            Estado = ficha.Delegacion,
            Municipio = ficha.Municipio,
            Lugar = ficha.Lugar ?? "",
            Asunto = ficha.Asunto ?? "",
            Prioridad = ficha.Prioridad,
            Sector = ficha.Sector,
            Asistentes = ficha.NumAsistentes ?? 0,
            EstadoActual = ficha.Condicion,
            Latitud = ficha.Latitud,
            Longitud  = ficha.Longitud,
};
    }

    private string? FormatearTimeSpan(TimeSpan? timeSpan, int fichaId, string nombreCampo)
    {
        if (timeSpan == null) return null;
        
        try
        {
            return timeSpan.Value.ToString(@"hh\:mm");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Error al formatear {nombreCampo} para ficha {fichaId}: {ex.Message}");
            return null;
        }
    }

    private FichasBorradorDto MapearAFichasBorradorDto(FichaInformativa ficha)
    {
        // Solo usar HoraSucesoFin para la columna Hora Suceso
        var horaSuceso = ficha.HoraSucesoFin?.ToString(@"HH\:mm") ?? "Sin hora";

        Console.WriteLine($"🕐 Mapeando borrador ID {ficha.Id}:");
        Console.WriteLine($"   HoraSucesoFin: {ficha.HoraSucesoFin} -> {horaSuceso}");

        return new FichasBorradorDto
        {
            Id = ficha.Id,
            FechaElaboracion = ficha.FechaElaboracion?.ToString("yyyy-MM-dd") ?? "Sin fecha",
            FechaSuceso = ficha.FechaSuceso?.ToString("yyyy-MM-dd") ?? "Sin fecha",
            HoraSuceso = horaSuceso,
            Estado = !string.IsNullOrWhiteSpace(ficha.Delegacion) ? ficha.Delegacion : "Sin delegación",
            Prioridad = !string.IsNullOrWhiteSpace(ficha.Prioridad) ? ficha.Prioridad : "Sin prioridad",
            Sector = !string.IsNullOrWhiteSpace(ficha.Sector) ? ficha.Sector : "Sin sector",
            Asistentes = ficha.NumAsistentes ?? 0,
            EstadoActual = !string.IsNullOrWhiteSpace(ficha.Condicion) ? ficha.Condicion : "Sin condición",
            BorradorUsuario = ficha.IdUsuario?.ToString() ?? "Sin usuario"
        };
    }
    public async Task<FichaInformativa?> ObtenerPorIdAsync(int id)
    {
        return await _context.Fichas.FindAsync(id);
    }

    public async Task<FichaInformativa> CrearAsync(FichaInformativa ficha, string usuario)
    {
        // Intentar parsear el usuario a int, si falla usar 1 como default
        int.TryParse(usuario, out var usuarioId);
        if (usuarioId == 0) usuarioId = 1; // Usuario por defecto
        
        // Establecer valores por defecto si no vienen del cliente
        if (ficha.IdUsuario == null || ficha.IdUsuario == 0)
            ficha.IdUsuario = usuarioId;
        
        if (ficha.FechaElaboracion == null)
            ficha.FechaElaboracion = DateTime.UtcNow;

        _context.Fichas.Add(ficha);
        await _context.SaveChangesAsync();

        return ficha;
    }

    public async Task<FichaInformativa?> ActualizarAsync(int id, FichaInformativa ficha)
    {
        var fichaExistente = await _context.Fichas.FindAsync(id);
        if (fichaExistente == null) return null;

        // Actualizar propiedades
        fichaExistente.Cedula = ficha.Cedula;
        fichaExistente.Delegacion = ficha.Delegacion;
        fichaExistente.Municipio = ficha.Municipio;
        fichaExistente.Lugar = ficha.Lugar;
        fichaExistente.Latitud = ficha.Latitud;
        fichaExistente.Longitud = ficha.Longitud;
        fichaExistente.Direccion = ficha.Direccion;
        fichaExistente.Sector = ficha.Sector;
        fichaExistente.Subsector = ficha.Subsector;
        fichaExistente.HoraSucesoInicio = ficha.HoraSucesoInicio;
        fichaExistente.HoraSucesoFin = ficha.HoraSucesoFin;
        fichaExistente.FechaSuceso = ficha.FechaSuceso;
        fichaExistente.NumAsistentes = ficha.NumAsistentes;
        fichaExistente.FechaElaboracion = ficha.FechaElaboracion;
        fichaExistente.HoraElaboracion = ficha.HoraElaboracion;
        fichaExistente.Prioridad = ficha.Prioridad;
        fichaExistente.Condicion = ficha.Condicion;
        fichaExistente.Informacion = ficha.Informacion;
        fichaExistente.Asunto = ficha.Asunto;
        fichaExistente.Hechos = ficha.Hechos;
        fichaExistente.Acuerdos = ficha.Acuerdos;
        fichaExistente.IdInformo = ficha.IdInformo;
        fichaExistente.IdUsuario = ficha.IdUsuario;
        fichaExistente.IdAutorizo = ficha.IdAutorizo;
        fichaExistente.FechaRecepcion = ficha.FechaRecepcion;
        fichaExistente.HoraRecepcion = ficha.HoraRecepcion;
        fichaExistente.IdEstadoActual = ficha.IdEstadoActual;
        fichaExistente.MotivoCancelacion = ficha.MotivoCancelacion;
        fichaExistente.Activo = ficha.Activo;
        fichaExistente.FolioInterno = ficha.FolioInterno;
        fichaExistente.Visto = ficha.Visto;
        fichaExistente.IdFichaAnterior = ficha.IdFichaAnterior;
        fichaExistente.FechaValidacion = ficha.FechaValidacion;

        await _context.SaveChangesAsync();
        return fichaExistente;
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var ficha = await _context.Fichas.FindAsync(id);
        if (ficha == null) return false;

        _context.Fichas.Remove(ficha);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<FichaResponseDto>> BuscarAsync(string criterio)
    {
        var query = _context.Fichas.AsQueryable();

        if (!string.IsNullOrWhiteSpace(criterio))
        {
            criterio = criterio.ToLower();
            query = query.Where(f =>
                f.Delegacion.ToLower().Contains(criterio) ||
                f.Lugar.ToLower().Contains(criterio) ||
                f.Sector.ToLower().Contains(criterio) ||
                f.Asunto.ToLower().Contains(criterio)
            );
        }

        return await query
            .OrderByDescending(f => f.FechaElaboracion)
            .Select(f => new FichaResponseDto
            {
                Id = f.Id,
                Delegacion = f.Delegacion,
                Lugar = f.Lugar,
                Sector = f.Sector,
                FechaSuceso = f.FechaSuceso,
                Prioridad = f.Prioridad,
                Condicion = f.Condicion,
                FechaElaboracion = f.FechaElaboracion
            })
            .ToListAsync();
    }
}
