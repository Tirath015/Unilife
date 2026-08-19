using Marketplace_capstone_feature_01.Data;
using Marketplace_capstone_feature_01.DTOs;
using Marketplace_capstone_feature_01.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Marketplace_capstone_feature_01.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SavedSearchesController : Controller
    {
        private readonly ApplicationDbContext _context;

        public SavedSearchesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateSavedSearch(CreateSavedSearchDto request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var savedSearch = new SavedSearch
            {
                UserId = userId,
                Keyword = request.Keyword,
                CategoryId = request.CategoryId,
                MinPrice = request.MinPrice,
                MaxPrice = request.MaxPrice,
                Location = request.Location
            };

            _context.SavedSearches.Add(savedSearch);
            await _context.SaveChangesAsync();

            return Ok(savedSearch);
        }

        [HttpGet]
        public async Task<IActionResult> GetMySavedSearches()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var savedSearches = await _context.SavedSearches
                .Include(s => s.Category)
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            return Ok(savedSearches);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSavedSearch(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var savedSearch = await _context.SavedSearches
                .FirstOrDefaultAsync(s => s.SavedSearchId == id && s.UserId == userId);

            if (savedSearch == null)
                return NotFound("Saved search not found.");

            _context.SavedSearches.Remove(savedSearch);
            await _context.SaveChangesAsync();

            return Ok("Saved search deleted.");
        }

    }
}
