using IRS.API.DTOs;
using IRS.API.Models;
using Backend.DTOs;

namespace IRS.API.Interfaces;

public interface IFichaService
{
  Task<List<FichaResponseDto>> ObtenerTodasAsync();
  Task<List<FichasTodosDto>> ObtenerTodosDtoAsync();
  Task<List<FichasTodosDto>> ObtenerFichasPorRangoFechasAsync(DateTime fechaInicio, DateTime fechaFin);
  Task<List<FichasTodosDto>> ObtenerFichasDelDiaAsync();
  Task<List<FichasTodosDto>> ObtenerFichasConcluidasAsync();
  Task<List<FichasBorradorDto>> ObtenerBorradoresAsync();
  Task<List<FichasBorradorDto>> BuscarBorradoresAsync(string criterio);
  Task<FichaInformativa?> ObtenerPorIdAsync(int id);
  Task<FichaInformativa> CrearAsync(FichaInformativa ficha, string usuario);
  Task<FichaInformativa?> ActualizarAsync(int id, FichaInformativa ficha);
  Task<bool> EliminarAsync(int id);
  Task<List<FichaResponseDto>> BuscarAsync(string criterio);
  Task<FichasEstadisticasDto> ObtenerEstadisticasAsync();
}
