using MarketPlace_Project.Data;
using MarketPlace_Project.Models;
using Microsoft.AspNetCore.Mvc;

namespace MarketPlace_Project.Controllers
{
    public class AccountController : Controller
    {
        private readonly MarketPlaceDbContext _context;

        public AccountController(MarketPlaceDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Register(User user)
        {
            if (!ModelState.IsValid)
            {
                return View(user);
            }

            if (string.IsNullOrWhiteSpace(user.Email) ||
                !user.Email.ToLower().EndsWith("@sheridancollege.ca"))
            {
                ModelState.AddModelError("Email", "Only Sheridan College emails ending with @sheridancollege.ca are allowed.");
                return View(user);
            }

            bool emailExists = _context.Users.Any(u =>
                u.Email.ToLower() == user.Email.ToLower());

            if (emailExists)
            {
                ModelState.AddModelError("Email", "This email is already registered.");
                return View(user);
            }

            user.Role = "User";
            user.CreatedAt = DateTime.Now;

            _context.Users.Add(user);
            _context.SaveChanges();

            return RedirectToAction("Login");
        }

        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Login(string email, string password)
        {
            var user = _context.Users.FirstOrDefault(u =>
                u.Email.ToLower() == email.ToLower() &&
                u.Password == password);

            if (user == null)
            {
                ViewBag.Error = "Invalid email or password.";
                return View();
            }

            CookieOptions cookieOptions = new CookieOptions
            {
                Expires = DateTime.Now.AddDays(7),
                HttpOnly = true,
                IsEssential = true
            };

            Response.Cookies.Append("UserId", user.UserId.ToString(), cookieOptions);
            Response.Cookies.Append("UserEmail", user.Email, cookieOptions);
            Response.Cookies.Append("UserRole", user.Role, cookieOptions);

            return RedirectToAction("Index", "Product");
        }

        public IActionResult Logout()
        {
            Response.Cookies.Delete("UserId");
            Response.Cookies.Delete("UserName");
            Response.Cookies.Delete("UserEmail");
            Response.Cookies.Delete("UserRole");

            return RedirectToAction("Login");
        }
    }
}