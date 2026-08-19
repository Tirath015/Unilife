using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace Marketplace_capstone_feature_01.Models
{
    public class Category
    {
        //Properties of Category class
        public int CategoryId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public ICollection<Listing> Listings { get; set; } = new List<Listing>();
    }
}

