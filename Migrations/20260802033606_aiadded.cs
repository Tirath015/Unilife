using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Marketplace_capstone_feature_01.Migrations
{
    /// <inheritdoc />
    public partial class aiadded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MarketplaceTransactions",
                columns: table => new
                {
                    TransactionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ListingId = table.Column<int>(type: "int", nullable: false),
                    BuyerId = table.Column<int>(type: "int", nullable: false),
                    SellerId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AcceptedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SellerCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BuyerConfirmedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarketplaceTransactions", x => x.TransactionId);
                    table.ForeignKey(
                        name: "FK_MarketplaceTransactions_Listings_ListingId",
                        column: x => x.ListingId,
                        principalTable: "Listings",
                        principalColumn: "ListingId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MarketplaceTransactions_Users_BuyerId",
                        column: x => x.BuyerId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MarketplaceTransactions_Users_SellerId",
                        column: x => x.SellerId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MarketplaceTransactions_BuyerId",
                table: "MarketplaceTransactions",
                column: "BuyerId");

            migrationBuilder.CreateIndex(
                name: "IX_MarketplaceTransactions_ListingId_BuyerId",
                table: "MarketplaceTransactions",
                columns: new[] { "ListingId", "BuyerId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MarketplaceTransactions_SellerId",
                table: "MarketplaceTransactions",
                column: "SellerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MarketplaceTransactions");
        }
    }
}
