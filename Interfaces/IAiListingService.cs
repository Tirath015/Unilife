using Marketplace_capstone_feature_01.DTOs;

namespace Marketplace_capstone_feature_01.Interfaces
{
    public interface IAiListingService
    {
        Task<string> GenerateDescriptionAsync(
            GenerateListingDescriptionDto request
        );
    }
}