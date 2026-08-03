using Marketplace_capstone_feature_01.Models;
using Microsoft.EntityFrameworkCore;

namespace Marketplace_capstone_feature_01.Data
{
    public class ApplicationDbContext : DbContext
    {

        // Constructor
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }


        // Define your DbSets here
        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Listing> Listings { get; set; }
        public DbSet<ListingImage> ListingImages { get; set; }
        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<PurchaseRequest> PurchaseRequests { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }

        public DbSet<Review> Reviews { get; set; }

        public DbSet<Notification> Notifications { get; set; }

        public DbSet<ListingReport> ListingReports { get; set; }

        public DbSet<RecentlyViewedListing> RecentlyViewedListings { get; set; }

        public DbSet<SavedSearch> SavedSearches { get; set; }


        public DbSet<Report> Reports { get; set; }

        public DbSet<MarketplaceTransaction> MarketplaceTransactions { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Listing>()
                .Property(l => l.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<ChatMessage>()
                .HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ChatMessage>()
                .HasOne(m => m.Receiver)
                .WithMany()
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PurchaseRequest>()
                .HasOne(r => r.Buyer)
                .WithMany()
                .HasForeignKey(r => r.BuyerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PurchaseRequest>()
                .HasOne(r => r.Seller)
                .WithMany()
                .HasForeignKey(r => r.SellerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Favorite>()
                .HasOne(f => f.User)
                 .WithMany()
                .HasForeignKey(f => f.UserId)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Favorite>()
                .HasOne(f => f.Listing)
                .WithMany()
                .HasForeignKey(f => f.ListingId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ListingImage>()
                .HasOne(i => i.Listing)
                .WithMany(l => l.Images)
                  .HasForeignKey(i => i.ListingId)
               .OnDelete(DeleteBehavior.Cascade);


            modelBuilder.Entity<Review>()
                .HasOne(r => r.Buyer)
                .WithMany()
                .HasForeignKey(r => r.BuyerId)
               .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Seller)
                .WithMany()
                .HasForeignKey(r => r.SellerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Listing)
                .WithMany()
                .HasForeignKey(r => r.ListingId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>()
               .HasOne(n => n.User)
               .WithMany()
               .HasForeignKey(n => n.UserId)
              .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<ListingReport>()
                 .HasOne(r => r.Listing)
                 .WithMany()
                  .HasForeignKey(r => r.ListingId)
                  .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ListingReport>()
                .HasOne(r => r.Reporter)
                .WithMany()
                .HasForeignKey(r => r.ReporterId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RecentlyViewedListing>()
                .HasOne(r => r.User)
                 .WithMany()
                 .HasForeignKey(r => r.UserId)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RecentlyViewedListing>()
                .HasOne(r => r.Listing)
                .WithMany()
                .HasForeignKey(r => r.ListingId)
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<SavedSearch>()
               .HasOne(s => s.User)
               .WithMany()
               .HasForeignKey(s => s.UserId)
               .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SavedSearch>()
                .HasOne(s => s.Category)
                .WithMany()
                .HasForeignKey(s => s.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<Report>()
    .HasOne(r => r.Reporter)
    .WithMany()
    .HasForeignKey(r => r.ReporterId)
    .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Report>()
                .HasOne(r => r.ReportedUser)
                .WithMany()
                .HasForeignKey(r => r.ReportedUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Report>()
                .HasOne(r => r.Listing)
                .WithMany()
                .HasForeignKey(r => r.ListingId)
                .OnDelete(DeleteBehavior.Restrict);



            modelBuilder.Entity<MarketplaceTransaction>()
    .HasOne(t => t.Listing)
    .WithMany()
    .HasForeignKey(t => t.ListingId)
    .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MarketplaceTransaction>()
                .HasOne(t => t.Buyer)
                .WithMany()
                .HasForeignKey(t => t.BuyerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MarketplaceTransaction>()
                .HasOne(t => t.Seller)
                .WithMany()
                .HasForeignKey(t => t.SellerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MarketplaceTransaction>()
                .HasIndex(t => new
                {
                    t.ListingId,
                    t.BuyerId
                })
                .IsUnique();



        }





    }
}
