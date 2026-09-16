using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SurgicalClinic.DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AmelitahthaneMGs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Ameliyathaneler",
                columns: new[] { "Id", "Ad", "Aktif" },
                values: new object[,]
                {
                    { 1, "Ameliyathane 1", true },
                    { 2, "Ameliyathane 2", true },
                    { 3, "Ameliyathane 3", true }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Ameliyathaneler",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Ameliyathaneler",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Ameliyathaneler",
                keyColumn: "Id",
                keyValue: 3);
        }
    }
}
