using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Marketplace_capstone_feature_01.Helpers
{

    // Custom implementation of IUserIdProvider to extract user ID from claims
    public class CustomUserIdProvider : IUserIdProvider
    {
        public string? GetUserId(HubConnectionContext connection)
        {
            return connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}