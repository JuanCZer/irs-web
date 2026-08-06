using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Backend.Security;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class SecurePasswordAttribute : ValidationAttribute
{
    public const int MinimumLength = 15;
    public const int MaximumLength = 64;
    private const int BcryptMaximumBytes = 72;

    public SecurePasswordAttribute()
    {
        ErrorMessage = $"La contraseña debe tener entre {MinimumLength} y {MaximumLength} caracteres";
    }

    public override bool IsValid(object? value)
    {
        if (value is null) return true;
        if (value is not string password) return false;

        return password.Length is >= MinimumLength and <= MaximumLength &&
               Encoding.UTF8.GetByteCount(password) <= BcryptMaximumBytes;
    }
}
