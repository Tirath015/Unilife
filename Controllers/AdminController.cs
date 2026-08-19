using Marketplace_capstone_feature_01.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Marketplace_capstone_feature_01.Controllers
{
    // This is admin page admin is allowed to do the following things
    // Delete users, view all users, view all listings, delete listings, view all requests, delete requests, view all messages, delete messages, view all notifications, delete notifications

    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : Controller
    {

        // object of the context class 


        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;

        }



        // GET: api/Admin/users
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .OrderBy(u => u.FullName)
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/Admin/listings
        //Admin can see all the listings and can delete if it is inappropriate or against the rules of the marketplace
        [HttpGet("listings")]
        public async Task<IActionResult> GetListings()
        {
            var listings = await _context.Listings
                .Include(l => l.User)
                .Include(l => l.Category)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();

            return Ok(listings);
        }


        // DELETE: api/Admin/users/{id}


        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound("User not found.");

            _context.Users.Remove(user);

            await _context.SaveChangesAsync();

            return Ok("User deleted successfully.");
        }

        // DELETE: api/Admin/listings/{id}


        [HttpDelete("listings/{id}")]
        public async Task<IActionResult> DeleteListing(int id)
        {
            var listing = await _context.Listings.FindAsync(id);

            if (listing == null)
                return NotFound("Listing not found.");

            _context.Listings.Remove(listing);

            await _context.SaveChangesAsync();

            return Ok("Listing deleted successfully.");
        }


        // GET: api/Admin/dashboard
        // This endpoint will return the total number of users, listings, categories, messages, favorites, purchase requests, reviews and notifications in the system

        [HttpGet("dashboard")]
        public async Task<IActionResult> Dashboard()
        {
            return Ok(new
            {
                TotalUsers = await _context.Users.CountAsync(),
                TotalListings = await _context.Listings.CountAsync(),
                TotalCategories = await _context.Categories.CountAsync(),
                TotalMessages = await _context.ChatMessages.CountAsync(),
                TotalFavorites = await _context.Favorites.CountAsync(),
                TotalPurchaseRequests = await _context.PurchaseRequests.CountAsync(),
                TotalReviews = await _context.Reviews.CountAsync(),
                TotalNotifications = await _context.Notifications.CountAsync()
            });
        }

        // GET: api/Admin/reports
        // This endpoint will return all the reports in the system


        [HttpGet("reports")]
        public async Task<IActionResult> GetReports()
        {
            var reports = await _context.ListingReports
                .Include(r => r.Listing)
                .Include(r => r.Reporter)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(reports);
        }

        // PUT: /users/id/block
        // Admins can block the users 


        [HttpPut("users/{id}/block")]
        public async Task<IActionResult> BlockUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound("User not found.");

            user.IsBlocked = true;

            await _context.SaveChangesAsync();

            return Ok("User blocked successfully.");
        }

        //Admins can unblock the users

        [HttpPut("users/{id}/unblock")]
        public async Task<IActionResult> UnblockUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound("User not found.");

            user.IsBlocked = false;

            await _context.SaveChangesAsync();

            return Ok("User unblocked successfully.");
        }

        // PUT: api/Admin/reports/{id}/review


        [HttpPut("reports/{id}/review")]
        public async Task<IActionResult> ReviewReport(int id)
        {
            var report = await _context.ListingReports.FindAsync(id);

            if (report == null)
                return NotFound();

            report.IsReviewed = true;

            await _context.SaveChangesAsync();

            return Ok("Report reviewed.");
        }

        // DELETE: api/Admin/reports/{id}

        [HttpDelete("reports/{id}")]
        public async Task<IActionResult> DeleteReport(int id)
        {
            var report = await _context.ListingReports.FindAsync(id);

            if (report == null)
                return NotFound();

            _context.ListingReports.Remove(report);

            await _context.SaveChangesAsync();

            return Ok("Report deleted.");
        }


        [HttpGet("statistics")]
        public async Task<IActionResult> Statistics()
        {
            return Ok(new
            {
                Users = await _context.Users.CountAsync(),

                Listings = await _context.Listings.CountAsync(),

                ActiveListings = await _context.Listings
                    .CountAsync(l => !l.IsHidden),

                HiddenListings = await _context.Listings
                    .CountAsync(l => l.IsHidden),

                Messages = await _context.ChatMessages.CountAsync(),

                Reviews = await _context.Reviews.CountAsync(),

                Favorites = await _context.Favorites.CountAsync(),

                Reports = await _context.ListingReports.CountAsync(),

                Notifications = await _context.Notifications.CountAsync(),

                Requests = await _context.PurchaseRequests.CountAsync()
            });
        }




    }
}
