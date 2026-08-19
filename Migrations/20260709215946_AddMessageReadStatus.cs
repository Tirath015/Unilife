using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Marketplace_capstone_feature_01.Migrations
{
    /// <inheritdoc />
    public partial class AddMessageReadStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsRead",
                table: "ChatMessages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReadAt",
                table: "ChatMessages",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsRead",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "ReadAt",
                table: "ChatMessages");
        }
    }
}
