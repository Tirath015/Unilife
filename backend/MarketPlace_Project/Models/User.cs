using System.ComponentModel.DataAnnotations;

namespace MarketPlace_Project.Models
{
    public class User
    {

       
        public int UserId { get; set; }

        // email and it is required that the it should end with like @sheridancollege.ca

        [Required(ErrorMessage = "Sheridan College email is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        [StringLength(150)]
        public string Email { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100, MinimumLength = 5, ErrorMessage = "Password must be at least 5 characters.")]
        public string Password { get; set; }

        public string Role { get; set; } 

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public List<Product>? Products { get; set; }





    }
}
