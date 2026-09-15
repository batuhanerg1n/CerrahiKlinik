using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using SurgicalClinic.Entities.Concrete;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.DataAccessLayer.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<Kullanici> Kullanicilar { get; set; }
        public DbSet<Doktor> Doktorlar { get; set; }
        public DbSet<Brans> Branslar { get; set; }
        public DbSet<DoktorBrans> DoktorBranslar { get; set; }
        public DbSet<Hasta> Hastalar { get; set; }
        public DbSet<Islem> Islemler { get; set; }
        public DbSet<Randevu> Randevular { get; set; }
        public DbSet<IslemSecenek> IslemSecenekler { get; set; }
        public DbSet<Gorev> Gorevler { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<DoktorBrans>()
            .HasKey(db => new { db.DoktorId, db.BransId });

            modelBuilder.Entity<DoktorBrans>()
            .HasOne(db => db.Doktor)
            .WithMany(d => d.DoktorBranslar)
            .HasForeignKey(db => db.DoktorId);

            modelBuilder.Entity<DoktorBrans>()
            .HasOne(db => db.Brans)
            .WithMany(b => b.DoktorBranslar)
            .HasForeignKey(db => db.BransId);

            modelBuilder.Entity<Randevu>()
            .HasOne(r=>r.Hasta)
            .WithMany(h=>h.Randevular)
            .HasForeignKey(r=>r.HastaId)
            .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Randevu>()
            .HasOne(r=>r.Doktor)
            .WithMany(d=>d.Randevular)
            .HasForeignKey(r=>r.DoktorId)
            .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Randevu>()
            .HasOne(r=>r.Islem)
            .WithMany(d=>d.Randevular)
            .HasForeignKey(r=>r.IslemId)
            .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Doktor>()
            .HasOne(d=>d.Kullanici)
            .WithOne(k=>k.Doktor)
            .HasForeignKey<Doktor>(d=>d.KullaniciId)
            .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Randevu>()
            .Property(r => r.RowVersion)
            .IsRowVersion();

            modelBuilder.Entity<Islem>()
            .Property(i => i.Fiyat)
            .HasPrecision(18, 2);

            modelBuilder.Entity<IslemSecenek>()
                .Property(s => s.Fiyat)
                .HasPrecision(18, 2);

            modelBuilder.Entity<IslemSecenek>()
                .HasOne(s => s.Islem)
                .WithMany(i =>i.Secenekler)
                .HasForeignKey(s => s.IslemId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Randevu>()
                .HasOne( r=>r.IslemSecenek)
                .WithMany()
                .HasForeignKey( r => r.IslemSecenekId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Islem>()
                .HasOne(i => i.Brans)
                .WithMany()
                .HasForeignKey( i=>i.BransId)
                .OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<Gorev>()
                .HasOne(g => g.AtananPersonel)
                .WithMany()                                  
                .HasForeignKey(g => g.AtananPersonelId)
                .OnDelete(DeleteBehavior.Cascade);

        }



    }
}
