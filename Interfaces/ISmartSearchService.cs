using Marketplace_capstone_feature_01.DTOs;

namespace Marketplace_capstone_feature_01.Interfaces
{
    public interface ISmartSearchService
    {
        Task<SmartSearchFiltersDto> ParseSearchAsync(
            string searchText);
    }
}