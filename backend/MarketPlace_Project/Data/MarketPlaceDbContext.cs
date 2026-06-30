using MarketPlace_Project.Models;
using Microsoft.EntityFrameworkCore;

namespace MarketPlace_Project.Data
{
    public class MarketPlaceDbContext : DbContext
    {

        //constructor

        public MarketPlaceDbContext(DbContextOptions<MarketPlaceDbContext> options)
           : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        public DbSet<Product> Products { get; set; }
       




    }
}
