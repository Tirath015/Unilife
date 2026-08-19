using Marketplace_capstone_feature_01.Data;
using Marketplace_capstone_feature_01.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Marketplace_capstone_feature_01.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : Controller
    {

        // object of context class which will Communicate with the database
        private readonly ApplicationDbContext _context;

        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Categories

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories.ToListAsync();
            return Ok(categories);
        }

        // GET: api/Categories/5    

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound("Category not found.");
            }

            return Ok(category);
        }

        // POST: api/Categories 

        [HttpPost]
        public async Task<IActionResult> CreateCategory(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(category);
        }

        // PUT: api/Categories/5    

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, Category category)
        {
            var existingCategory = await _context.Categories.FindAsync(id);

            if (existingCategory == null)
            {
                return NotFound("Category not found.");
            }

            existingCategory.Name = category.Name;

            await _context.SaveChangesAsync();

            return Ok(existingCategory);
        }

        // DELETE: api/Categories/5 

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound("Category not found.");
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok("Category deleted successfully.");
        }

    }
}
