using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SurgicalClinic.DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AmelitahthaneMG : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Ameliyathaneler",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Ad = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Aktif = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ameliyathaneler", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Ameliyatlar",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HastaId = table.Column<int>(type: "int", nullable: false),
                    DoktorId = table.Column<int>(type: "int", nullable: false),
                    AmeliyathaneId = table.Column<int>(type: "int", nullable: false),
                    IslemId = table.Column<int>(type: "int", nullable: true),
                    Baslik = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BaslangicZamani = table.Column<DateTime>(type: "datetime2", nullable: false),
                    BitisZamani = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Durum = table.Column<int>(type: "int", nullable: false),
                    PreOpNot = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PostOpNot = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    KomplikasyonNotu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OlusturmaTarihi = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ameliyatlar", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ameliyatlar_Ameliyathaneler_AmeliyathaneId",
                        column: x => x.AmeliyathaneId,
                        principalTable: "Ameliyathaneler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Ameliyatlar_Doktorlar_DoktorId",
                        column: x => x.DoktorId,
                        principalTable: "Doktorlar",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Ameliyatlar_Hastalar_HastaId",
                        column: x => x.HastaId,
                        principalTable: "Hastalar",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Ameliyatlar_Islemler_IslemId",
                        column: x => x.IslemId,
                        principalTable: "Islemler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Ameliyatlar_AmeliyathaneId",
                table: "Ameliyatlar",
                column: "AmeliyathaneId");

            migrationBuilder.CreateIndex(
                name: "IX_Ameliyatlar_DoktorId",
                table: "Ameliyatlar",
                column: "DoktorId");

            migrationBuilder.CreateIndex(
                name: "IX_Ameliyatlar_HastaId",
                table: "Ameliyatlar",
                column: "HastaId");

            migrationBuilder.CreateIndex(
                name: "IX_Ameliyatlar_IslemId",
                table: "Ameliyatlar",
                column: "IslemId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Ameliyatlar");

            migrationBuilder.DropTable(
                name: "Ameliyathaneler");
        }
    }
}
