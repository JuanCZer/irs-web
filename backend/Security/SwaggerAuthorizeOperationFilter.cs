using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Backend.Security;

/// <summary>
/// Overrides the global Bearer requirement for endpoints explicitly marked
/// as anonymous, such as login and the minimal liveness check.
/// </summary>
public sealed class SwaggerAuthorizeOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var allowsAnonymous = context.ApiDescription.ActionDescriptor
            .EndpointMetadata
            .OfType<IAllowAnonymous>()
            .Any();

        if (allowsAnonymous)
            operation.Security = [];
    }
}
