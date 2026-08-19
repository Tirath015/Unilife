using Marketplace_capstone_feature_01.Data;
using Marketplace_capstone_feature_01.DTOs;
using Marketplace_capstone_feature_01.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Marketplace_capstone_feature_01.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class FavoritesController : Controller
    {

        private readonly ApplicationDbContext _context;

        public FavoritesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/Favorites

        [HttpPost]
        public async Task<IActionResult> AddFavorite(CreateFavoriteDto request)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == request.UserId);
            if (!userExists)
                return BadRequest("User not found.");

            var listingExists = await _context.Listings.AnyAsync(l => l.ListingId == request.ListingId);
            if (!listingExists)
                return BadRequest("Listing not found.");

            var alreadySaved = await _context.Favorites.AnyAsync(f =>
                f.UserId == request.UserId && f.ListingId == request.ListingId);

            if (alreadySaved)
                return BadRequest("Listing already saved.");

            var favorite = new Favorite
            {
                UserId = request.UserId,
                ListingId = request.ListingId
            };

            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();

            return Ok(favorite);
        }

        // GET: api/Favorites/user/5

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserFavorites(int userId)
        {
            var favorites = await _context.Favorites
                .Include(f => f.Listing)
                .ThenInclude(l => l.Category)
                .Include(f => f.Listing)
                .ThenInclude(l => l.Images)
                .Where(f => f.UserId == userId)
                .ToListAsync();

            return Ok(favorites);
        }

        // DELETE: api/Favorites/5

        [HttpDelete("{favoriteId}")]
        public async Task<IActionResult> RemoveFavorite(int favoriteId)
        {
            var favorite = await _context.Favorites.FindAsync(favoriteId);

            if (favorite == null)
                return NotFound("Favorite not found.");

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();

            return Ok("Favorite removed successfully.");
        }

    }
}
