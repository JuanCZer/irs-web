using Microsoft.AspNetCore.SignalR;

namespace IRS.API.Hubs;

public class FichaHub : Hub
{
    public async Task NotificarFichaCreada(object ficha)
    {
        await Clients.All.SendAsync("FichaCreada", ficha);
    }

    public async Task NotificarFichaActualizada(object ficha)
    {
        await Clients.All.SendAsync("FichaActualizada", ficha);
    }

    public async Task NotificarFichaEliminada(int id)
    {
        await Clients.All.SendAsync("FichaEliminada", id);
    }
}
