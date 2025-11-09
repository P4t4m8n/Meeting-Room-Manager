using System.Security.Claims;
using API.Interfaces;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace API.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class RequireRoleAttribute : Attribute, IAsyncAuthorizationFilter
    {
        private readonly string[] _roles;

        public RequireRoleAttribute(params string[] roles)
        {
            _roles = roles;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            if (!context.HttpContext.User.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Authentication required" });
                return;
            }

            string userId = context.HttpContext.User.FindFirstValue("userId") ?? "";
            if (string.IsNullOrEmpty(userId))
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Invalid token" });
                return;
            }

            var dataContext = context.HttpContext.RequestServices.GetRequiredService<IDataContext>();

            string sql = "EXEC MeetingSchema.usp_Users_GetRole @Id=@Id";
            var parameters = new DynamicParameters();
            parameters.Add("@Id", Guid.Parse(userId));

            var userRole = await dataContext.LoadDataSingle<string>(sql, parameters);

            if (string.IsNullOrEmpty(userRole))
            {
                context.Result = new UnauthorizedObjectResult(new { message = "User not found" });
                return;
            }

            if (!_roles.Contains(userRole, StringComparer.OrdinalIgnoreCase))
            {
                context.Result = new ForbidResult();
                return;
            }
        }
    }
}