using Microsoft.AspNetCore.SignalR;

namespace IRS.API.Hubs;

public class FichaHub : Hub
{
    public async Task NotifyReportCreated(object report)
    {
        await Clients.All.SendAsync("FichaCreada", report);
    }

    public async Task NotifyReportUpdated(object report)
    {
        await Clients.All.SendAsync("FichaActualizada", report);
    }

    public async Task NotifyReportDeleted(int id)
    {
        await Clients.All.SendAsync("FichaEliminada", id);
    }
}
