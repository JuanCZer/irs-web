using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace IRS.API.Hubs;

[Authorize]
public sealed class FichaHub : Hub
{
    // Las notificaciones se deben publicar desde IHubContext<FichaHub> en el
    // servidor. No se exponen métodos invocables por clientes para evitar que
    // un usuario suplante eventos globales.
}
