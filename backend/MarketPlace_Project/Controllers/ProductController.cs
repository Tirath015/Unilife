using MarketPlace_Project.Data;
using MarketPlace_Project.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MarketPlace_Project.Controllers
{
    public class ProductController : Controller
    {
        private readonly MarketPlaceDbContext _context;

        public ProductController(MarketPlaceDbContext context)
        {
            _context = context;
        }

        private int? GetLoggedInUserId()
        {
            string? userIdCookie = Request.Cookies["UserId"];

            if (string.IsNullOrWhiteSpace(userIdCookie))
            {
                return null;
            }

            if (int.TryParse(userIdCookie, out int userId))
            {
                return userId;
            }

            return null;
        }

        public IActionResult Index(string? search, string? category, string? listingType)
        {
            var products = _context.Products
                .Include(p => p.User)
                .Where(p => p.Status != "Removed")
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                products = products.Where(p =>
                    p.Title.Contains(search) ||
                    p.Description.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                products = products.Where(p => p.Category == category);
            }

            if (!string.IsNullOrWhiteSpace(listingType))
            {
                products = products.Where(p =>
                    p.ListingType == listingType || p.ListingType == "Both");
            }

            ViewBag.Search = search;
            ViewBag.Category = category;
            ViewBag.ListingType = listingType;
            ViewBag.UserName = Request.Cookies["UserName"];

            var result = products
                .OrderByDescending(p => p.CreatedAt)
                .ToList();

            return View(result);
        }

        public IActionResult Details(int id)
        {
            var product = _context.Products
                .Include(p => p.User)
                .FirstOrDefault(p => p.Id == id);

            if (product == null)
            {
                return NotFound();
            }

            return View(product);
        }

        [HttpGet]
        public IActionResult Create()
        {
            int? userId = GetLoggedInUserId();

            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            return View();
        }

        [HttpPost]
        public IActionResult Create(Product product)
        {
            int? userId = GetLoggedInUserId();

            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            if (!ModelState.IsValid)
            {
                return View(product);
            }

            product.UserId = userId.Value;
            product.Status = "Available";
            product.CreatedAt = DateTime.Now;

            _context.Products.Add(product);
            _context.SaveChanges();

            return RedirectToAction("Index");
        }

        public IActionResult MyListings()
        {
            int? userId = GetLoggedInUserId();

            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            var products = _context.Products
                .Where(p => p.UserId == userId.Value && p.Status != "Removed")
                .OrderByDescending(p => p.CreatedAt)
                .ToList();

            return View(products);
        }

        [HttpGet]
        public IActionResult Edit(int id)
        {
            int? userId = GetLoggedInUserId();

            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            var product = _context.Products
                .FirstOrDefault(p => p.Id == id);

            if (product == null)
            {
                return NotFound();
            }

            if (product.UserId != userId.Value)
            {
                return Unauthorized();
            }

            return View(product);
        }

        [HttpPost]
        public IActionResult Edit(Product product)
        {
            int? userId = GetLoggedInUserId();

            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            if (!ModelState.IsValid)
            {
                return View(product);
            }

            var existingProduct = _context.Products
                .FirstOrDefault(p => p.Id == product.Id);

            if (existingProduct == null)
            {
                return NotFound();
            }

            if (existingProduct.UserId != userId.Value)
            {
                return Unauthorized();
            }

            existingProduct.Title = product.Title;
            existingProduct.Description = product.Description;
            existingProduct.Price = product.Price;
            existingProduct.Category = product.Category;
            existingProduct.ListingType = product.ListingType;
            existingProduct.ImageUrl = product.ImageUrl;
            existingProduct.Location = product.Location;
            existingProduct.Status = product.Status;

            _context.SaveChanges();

            return RedirectToAction("MyListings");
        }

        public IActionResult Delete(int id)
        {
            int? userId = GetLoggedInUserId();

            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            var product = _context.Products
                .FirstOrDefault(p => p.Id == id);

            if (product == null)
            {
                return NotFound();
            }

            if (product.UserId != userId.Value)
            {
                return Unauthorized();
            }

            product.Status = "Removed";
            _context.SaveChanges();

            return RedirectToAction("MyListings");
        }
    }
}