using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Marketplace_capstone_feature_01.Migrations
{
    /// <inheritdoc />
    public partial class imageurladded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Listings",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Listings");
        }
    }
}
