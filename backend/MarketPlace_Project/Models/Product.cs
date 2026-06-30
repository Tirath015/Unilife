using System.ComponentModel.DataAnnotations;

namespace MarketPlace_Project.Models
{
    public class Product
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Product title is required.")]
        [StringLength(120)]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Description is required.")]
        [StringLength(1000)]
        public string Description { get; set; }

        [Required(ErrorMessage = "Price is required.")]
        [Range(0.01, 10000, ErrorMessage = "Price must be greater than 0.")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Category is required.")]
        public string Category { get; set; } = string.Empty;

        [Required(ErrorMessage = "Listing type is required.")]
        public string ListingType { get; set; } 
        // Sell, Rent, or Both

        public string Status { get; set; } = "Available";

        public string? ImageUrl { get; set; }

        public string? Location { get; set; }

        public DateTime CreatedAt { get; set; } 

        public int UserId { get; set; }

        public User? User { get; set; }
    }
}

