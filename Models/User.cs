using System.ComponentModel.DataAnnotations;

namespace Marketplace_capstone_feature_01.Models
{
    public class User
    {
        // Primary Key
        public int UserId { get; set; }

        // User's Full Name
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        // User Email
        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;

        // Hashed Password
        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        // Contact Number
        [StringLength(20)]
        public string? PhoneNumber { get; set; }

        // Short description about the seller
        [StringLength(500)]
        public string? Bio { get; set; }

        // Address Information
        [StringLength(100)]
        public string? City { get; set; }

        [StringLength(100)]
        public string? Province { get; set; }

        [StringLength(100)]
        public string? Country { get; set; }

        // Profile Picture
        public string? ProfileImageUrl { get; set; }

        // Preferred Contact Method
        [StringLength(50)]
        public string? PreferredContactMethod { get; set; }

        // Account Status
        public bool IsBlocked { get; set; } = false;

        // Email verification status
        public bool EmailVerified { get; set; } = false;

        // Secure token sent through email
        [StringLength(200)]
        public string? EmailVerificationToken { get; set; }

        // Token expiration date and time
        public DateTime? EmailVerificationTokenExpiry { get; set; }

        // User Role
        [Required]
        [StringLength(50)]
        public string Role { get; set; } = "User";

        // Dates
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastLoginAt { get; set; }


        // for the password reset and other stuffs 
        [StringLength(200)]
        public string? PasswordResetToken { get; set; }

        public DateTime? PasswordResetTokenExpiry { get; set; }

        // Navigation Properties
        public ICollection<Listing> Listings { get; set; }
            = new List<Listing>();

        public ICollection<Favorite> Favorites { get; set; }
            = new List<Favorite>();

        public ICollection<Notification> Notifications { get; set; }
            = new List<Notification>();
    }
}