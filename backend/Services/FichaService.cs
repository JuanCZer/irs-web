using IRS.API.Data;
using IRS.API.DTOs;
using IRS.API.Models;
using Microsoft.EntityFrameworkCore;
using Backend.DTOs;
using IRS.API.Interfaces;

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
            return null;
        }
    }

    private FichasBorradorDto MapearAFichasBorradorDto(FichaInformativa ficha)
    {
        // Solo usar HoraSucesoFin para la columna Hora Suceso
        var horaSuceso = ficha.HoraSucesoFin?.ToString(@"HH\:mm") ?? "Sin hora";

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

    public async Task<FichasEstadisticasDto> ObtenerEstadisticasAsync()
    {
        try
        {
            var hoy = DateTime.UtcNow.Date;
            var inicioSemana = hoy.AddDays(-(int)hoy.DayOfWeek);
            var inicioMes = new DateTime(hoy.Year, hoy.Month, 1);
            var inicioAñoActual = new DateTime(hoy.Year, 1, 1);
            var inicioAñoAnterior = new DateTime(hoy.Year - 1, 1, 1);
            var finAñoAnterior = new DateTime(hoy.Year - 1, 12, 31);

            var todasLasFichas = await _context.Fichas.ToListAsync();

            var totalFichas = todasLasFichas.Count;
            var fichasHoy = todasLasFichas.Count(f => f.FechaElaboracion.HasValue && f.FechaElaboracion.Value.Date == hoy);
            var fichasSemana = todasLasFichas.Count(f => f.FechaElaboracion.HasValue && f.FechaElaboracion.Value.Date >= inicioSemana && f.FechaElaboracion.Value.Date <= hoy);
            var fichasMes = todasLasFichas.Count(f => f.FechaElaboracion.HasValue && f.FechaElaboracion.Value >= inicioMes && f.FechaElaboracion.Value < inicioMes.AddMonths(1));

            // Promedio mensual del mes actual
            var diasDelMes = DateTime.DaysInMonth(hoy.Year, hoy.Month);
            var promedioMensual = fichasMes > 0 ? (decimal)fichasMes / diasDelMes : 0;

            // Crecimiento mensual (comparar promedio actual vs mes anterior)
            var inicioMesAnterior = inicioMes.AddMonths(-1);
            var fichasMesAnterior = todasLasFichas.Count(f => f.FechaElaboracion.HasValue && f.FechaElaboracion.Value >= inicioMesAnterior && f.FechaElaboracion.Value < inicioMes);
            var diasDelMesAnterior = DateTime.DaysInMonth(inicioMesAnterior.Year, inicioMesAnterior.Month);
            var promedioMesAnterior = fichasMesAnterior > 0 ? (decimal)fichasMesAnterior / diasDelMesAnterior : 0;

            decimal crecimientoMensual = 0;
            if (promedioMesAnterior > 0)
            {
                crecimientoMensual = ((promedioMensual - promedioMesAnterior) / promedioMesAnterior) * 100;
            }
            else if (promedioMensual > 0)
            {
                crecimientoMensual = 100; // Si el mes anterior no tenía fichas pero ahora sí
            }

            var resumen = new EstadisticasResumenDto
            {
                TotalFichas = totalFichas,
                FichasHoy = fichasHoy,
                FichasSemana = fichasSemana,
                FichasMes = fichasMes,
                PromedioMensual = Math.Round(promedioMensual, 2),
                CrecimientoMensual = Math.Round(crecimientoMensual, 2)
            };

            var fichasPorDelegacion = todasLasFichas
                .GroupBy(f => f.Delegacion ?? "Sin delegación")
                .OrderByDescending(g => g.Count())
                .ToList();

            var fichasPorEstado = new FichasPorEstadoDto();
            foreach (var grupo in fichasPorDelegacion.Take(6)) // Top 6
            {
                fichasPorEstado.Labels.Add(grupo.Key);
                fichasPorEstado.Data.Add(grupo.Count());
            }

            // Agrupar el resto como "Otros"
            if (fichasPorDelegacion.Count > 6)
            {
                var otros = fichasPorDelegacion.Skip(6).Sum(g => g.Count());
                fichasPorEstado.Labels.Add("Otros");
                fichasPorEstado.Data.Add(otros);
            }

            var fichasPorMes = new FichasPorMesDto();
            var meses = new[] { "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic" };

            for (int mes = 1; mes <= 12; mes++)
            {
                var inicioDelMes = new DateTime(hoy.Year, mes, 1);
                var finDelMes = inicioDelMes.AddMonths(1).AddDays(-1);
                var fichasEnMes = todasLasFichas.Count(f => f.FechaElaboracion.HasValue && 
                    f.FechaElaboracion.Value >= inicioDelMes && 
                    f.FechaElaboracion.Value <= finDelMes);
                
                fichasPorMes.Labels.Add(meses[mes - 1]);
                fichasPorMes.Data.Add(fichasEnMes);
            }

            var tendenciaMensual = new TendenciaMensualDto();
            var dataAñoAnterior = new List<int>();
            var dataAñoActual = new List<int>();

            for (int mes = 1; mes <= 6; mes++) // Primeros 6 meses para comparación
            {
                var inicioDelMesAñoAnterior = new DateTime(hoy.Year - 1, mes, 1);
                var finDelMesAñoAnterior = inicioDelMesAñoAnterior.AddMonths(1).AddDays(-1);
                var fichasAñoAnterior = todasLasFichas.Count(f => f.FechaElaboracion.HasValue && 
                    f.FechaElaboracion.Value >= inicioDelMesAñoAnterior && 
                    f.FechaElaboracion.Value <= finDelMesAñoAnterior);

                var inicioDelMesAñoActual = new DateTime(hoy.Year, mes, 1);
                var finDelMesAñoActual = inicioDelMesAñoActual.AddMonths(1).AddDays(-1);
                var fichasAñoActual = todasLasFichas.Count(f => f.FechaElaboracion.HasValue && 
                    f.FechaElaboracion.Value >= inicioDelMesAñoActual && 
                    f.FechaElaboracion.Value <= finDelMesAñoActual);

                tendenciaMensual.Labels.Add(meses[mes - 1]);
                dataAñoAnterior.Add(fichasAñoAnterior);
                dataAñoActual.Add(fichasAñoActual);
            }

            tendenciaMensual.Datasets.Add(new DatasetDto { Label = (hoy.Year - 1).ToString(), Data = dataAñoAnterior });
            tendenciaMensual.Datasets.Add(new DatasetDto { Label = hoy.Year.ToString(), Data = dataAñoActual });

            return new FichasEstadisticasDto
            {
                Resumen = resumen,
                FichasPorEstado = fichasPorEstado,
                FichasPorMes = fichasPorMes,
                TendenciaMensual = tendenciaMensual
            };
        }
        catch (Exception ex)
        {
            throw;
        }
    }
}
