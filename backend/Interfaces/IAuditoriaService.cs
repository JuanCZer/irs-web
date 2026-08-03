using Backend.DTOs;

namespace IRS.API.Interfaces
{
    public interface IAuditoriaService
    {
        Task LogAsync(int? userId, RegistroAuditoriaDTO registro);
        Task<AuditoriaPaginaDTO> QueryAsync(AuditoriaConsultaDTO filters);
    }
}
