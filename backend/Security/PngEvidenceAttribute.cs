using System.ComponentModel.DataAnnotations;

namespace Backend.Security;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class PngEvidenceAttribute : ValidationAttribute
{
    private const string DataUrlPrefix = "data:image/png;base64,";
    private const int MaximumFiles = 5;
    private const int MaximumBytesPerFile = 2 * 1024 * 1024;
    private const int MaximumTotalBytes = 5 * 1024 * 1024;
    private static readonly byte[] PngSignature = [137, 80, 78, 71, 13, 10, 26, 10];

    public PngEvidenceAttribute()
    {
        ErrorMessage = "La evidencia debe contener hasta 5 imágenes PNG válidas y no superar 5 MB en total";
    }

    public override bool IsValid(object? value)
    {
        if (value is null) return true;
        if (value is not string evidence || string.IsNullOrWhiteSpace(evidence)) return false;

        var files = evidence.Split('|', StringSplitOptions.RemoveEmptyEntries);
        if (files.Length is < 1 or > MaximumFiles) return false;

        var totalBytes = 0;
        foreach (var file in files)
        {
            if (!file.StartsWith(DataUrlPrefix, StringComparison.Ordinal)) return false;

            try
            {
                var decoded = Convert.FromBase64String(file[DataUrlPrefix.Length..]);
                if (decoded.Length > MaximumBytesPerFile ||
                    decoded.Length < PngSignature.Length ||
                    !decoded.AsSpan(0, PngSignature.Length).SequenceEqual(PngSignature))
                {
                    return false;
                }

                totalBytes += decoded.Length;
                if (totalBytes > MaximumTotalBytes) return false;
            }
            catch (FormatException)
            {
                return false;
            }
        }

        return true;
    }
}
