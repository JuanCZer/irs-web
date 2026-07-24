using Backend.DTOs;

namespace IRS.API.Interfaces
{
    public interface IAuditoriaService
    {
        Task RegistrarAsync(int? idUsuario, RegistroAuditoriaDTO registro);
        Task<AuditoriaPaginaDTO> ConsultarAsync(AuditoriaConsultaDTO consulta);
    }
}
