using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Marketplace_capstone_feature_01.Migrations
{
    /// <inheritdoc />
    public partial class AddListingGeoLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Listings",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Listings",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Listings");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Listings");
        }
    }
}
