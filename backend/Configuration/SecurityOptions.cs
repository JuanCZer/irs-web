namespace Backend.Configuration;

public sealed class SecurityOptions
{
    public const string SectionName = "Security";

    public string[] AllowedOrigins { get; set; } = [];
    public string AntiForgeryHeaderName { get; set; } = "X-IRS-Request";
    public string AntiForgeryHeaderValue { get; set; } = "1";
    public int MaxRequestBodySizeBytes { get; set; } = 16 * 1024 * 1024;
    public int ReadRequestsPerMinute { get; set; } = 300;
    public int WriteRequestsPerMinute { get; set; } = 60;
    public int LoginAttemptsPerMinute { get; set; } = 5;
}
