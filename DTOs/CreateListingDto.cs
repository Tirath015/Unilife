using Marketplace_capstone_feature_01.Enums;
using System.ComponentModel.DataAnnotations;

using Microsoft.AspNetCore.Http;
namespace Marketplace_capstone_feature_01.DTOs
{
    public class CreateListingDto
    {

        [Required]
        [StringLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Range(0.01, 999999)]
        public decimal Price { get; set; }

        [Required]
        public string Location { get; set; } = string.Empty;

        public ListingType ListingType { get; set; }

        public int CategoryId { get; set; }

        public int UserId { get; set; }

        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        public IFormFile? Image { get; set; }


    }
}
