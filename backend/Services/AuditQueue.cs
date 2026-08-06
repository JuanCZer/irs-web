using System.Threading.Channels;
using Backend.DTOs;
using IRS.API.Interfaces;

namespace Backend.Services;

public sealed record AuditQueueItem(int? UserId, RegistroAuditoriaDTO Entry);

public interface IAuditQueue
{
    bool TryQueue(AuditQueueItem item);
    IAsyncEnumerable<AuditQueueItem> ReadAllAsync(CancellationToken cancellationToken);
}

public sealed class AuditQueue : IAuditQueue
{
    private readonly Channel<AuditQueueItem> _channel = Channel.CreateBounded<AuditQueueItem>(
        new BoundedChannelOptions(1000)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = true,
            SingleWriter = false
        });

    public bool TryQueue(AuditQueueItem item) => _channel.Writer.TryWrite(item);

    public IAsyncEnumerable<AuditQueueItem> ReadAllAsync(CancellationToken cancellationToken) =>
        _channel.Reader.ReadAllAsync(cancellationToken);
}

public sealed class AuditBackgroundService : BackgroundService
{
    private readonly IAuditQueue _queue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AuditBackgroundService> _logger;

    public AuditBackgroundService(
        IAuditQueue queue,
        IServiceScopeFactory scopeFactory,
        ILogger<AuditBackgroundService> logger)
    {
        _queue = queue;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var item in _queue.ReadAllAsync(stoppingToken))
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var auditService = scope.ServiceProvider.GetRequiredService<IAuditoriaService>();
                await auditService.LogAsync(item.UserId, item.Entry);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                _logger.LogError(
                    exception,
                    "No fue posible persistir un evento de auditoría en segundo plano");
            }
        }
    }
}
