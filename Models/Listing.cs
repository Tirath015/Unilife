using Marketplace_capstone_feature_01.Enums;
using System.ComponentModel.DataAnnotations;

namespace Marketplace_capstone_feature_01.Models
{
    public class Listing
    {
        public int ListingId { get; set; }

        [Required]
        [StringLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Range(0.01, 999999)]
        public decimal Price { get; set; }

        [Required]
        [StringLength(100)]
        public string Location { get; set; } = string.Empty;

        public ListingType ListingType { get; set; }

        public ListingStatus Status { get; set; } = ListingStatus.Available;



        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


        public string? ImageUrl { get; set; }


        public int UserId { get; set; }
        public User? User { get; set; }

        public int CategoryId { get; set; }

        public bool IsHidden { get; set; } = false;

        public int ViewCount { get; set; } = 0;
        public Category? Category { get; set; }

        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        public ICollection<ListingImage> Images { get; set; } = new List<ListingImage>();
    }
}

