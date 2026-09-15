using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SurgicalClinic.DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class Gorevcevap : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PersonelNotu",
                table: "Gorevler",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PersonelNotu",
                table: "Gorevler");
        }
    }
}
