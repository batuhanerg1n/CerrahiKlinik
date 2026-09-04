using Microsoft.EntityFrameworkCore;
using SurgicalClinic.BusinessLogicLayer.DTOs;
using SurgicalClinic.BusinessLogicLayer.Services.Abstract;
using SurgicalClinic.DataAccessLayer.Abstract;
using SurgicalClinic.Entities.Concrete;
using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.Services.Concrete
{
    public class DashboardService : IDashboardService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INameMaskingService _nameMaskingService;

        public DashboardService(IUnitOfWork unitOfWork, INameMaskingService nameMaskingService)
        {
            _unitOfWork = unitOfWork;
            _nameMaskingService = nameMaskingService;
        }
        private static decimal GetRandevuFiyat( Randevu r)
        {
            if (r.IslemSecenek != null)
                return r.IslemSecenek.Fiyat;
            return r.Islem?.Fiyat ?? 0;
        }

        public async Task<AylikPerformansDto> GetAylikPerformansAsync()
        {
            var randevuRepo = _unitOfWork.GetRepository<Randevu>();
            var buAy    =   DateTime.UtcNow.Month;
            var buYil   = DateTime.UtcNow.Year;

            var aylikRandevular = await randevuRepo.GetWhere(r =>
            r.Tarih.Month == buAy &&
            r.Tarih.Year == buYil &&
            r.Durum == RandevuDrum.Tamamlandi)
            .Include(r => r.Doktor)
            .Include(r => r.Islem)
            .Include(r => r.IslemSecenek)
            .ToListAsync();

            var doktorPerformans = aylikRandevular
                .GroupBy(r => new { r.Doktor.Ad, r.Doktor.Soyad, r.Doktor.Unvan })
                .Select(g => new DoktorPerformansDto
                {
                    DoktorAd = g.Key.Ad,
                    DoktorSoyad = g.Key.Soyad,
                    DoktorUnvan = g.Key.Unvan,
                    TamamlananMuayeneSayisi = g.Count(),
                    ToplamGelir = g.Sum(r => GetRandevuFiyat(r))
                }).ToList();

            var islemGelirleri = aylikRandevular
                .GroupBy(r => r.Islem.Ad)
               .Select(g => new IslemGelirDto
               {
                   IslemAd = g.Key,
                   ToplamGelir = g.Sum(r => GetRandevuFiyat(r)),
                   Adet = g.Count()
               }).ToList();
            return new AylikPerformansDto
            {
                DoktorPerformanslari = doktorPerformans,
                IslemGelirleri = islemGelirleri,
            };
        }

        public async Task<DashboardOzetDto> GetOzetAsync()
        {
            var randevuRepo = _unitOfWork.GetRepository<Randevu>();
            var bugun = DateTime.UtcNow.Date;

            var bugunkiRandevular = await randevuRepo.GetWhere(r => r.Tarih.Date==bugun)
                .Include(r=>r.Islem)
                .Include(r=>r.IslemSecenek)
                .ToListAsync();

            return new DashboardOzetDto
            {
                BugunkuRandevuSayisi = bugunkiRandevular.Count,
                BekleyenRandevuSayisi = bugunkiRandevular.Count(r => r.Durum == RandevuDrum.Beklemede),
                AktifRandevuSayisi = bugunkiRandevular.Count(r => r.Durum == RandevuDrum.Onaylandi),
                GunlukToplmHastaSayisi = bugunkiRandevular.Select(r => r.HastaId).Distinct().Count(),
                GunlukToplamGelir = bugunkiRandevular.Where(r => r.Durum == RandevuDrum.Tamamlandi).Sum(r => GetRandevuFiyat(r)),
                TamamlananRandevuSayisi = bugunkiRandevular.Count(r => r.Durum ==RandevuDrum.Tamamlandi)
            };
        }

        public async Task<IEnumerable<RandevuKaynakDagilimiDto>> GetRandevuKaynaklariAsync()
        {
            var randevuRepo = _unitOfWork.GetRepository<Randevu>();
            var randevular =await randevuRepo.GetAllAsync();

            var toplam = randevular.Count();
            if (toplam == 0)
                return new List<RandevuKaynakDagilimiDto>();

            return randevular
                .GroupBy(r => r.Kaynak)
                .Select(g => new RandevuKaynakDagilimiDto
                {
                    Kaynak = g.Key,
                    Adet = g.Count(),
                    Yuzde = Math.Round((double)g.Count() / toplam * 100, 2)
                });

        }

        public async Task<IEnumerable<SonRandevuDto>> GetSonRandevuAsync(Rol currentRole, int limit = 5)
        {
            var randevuRepo = _unitOfWork.GetRepository<Randevu>();

            var sonRandevular = await randevuRepo.GetWhere(r => true)
                .Include(r=>r.Hasta)
                .Include(r=>r.Doktor)
                .Include(r=>r.Islem)
                .OrderByDescending( r => r.OlusturmaTarihi )
                .Take(limit)
                .ToListAsync();
            return sonRandevular.Select(r =>
            {
                var (maskedAd, maskedSoyad) = _nameMaskingService.MaskFirstAndLastName(r.Hasta?.Ad ?? "",
                    r.Hasta?.Soyad ?? "",
                    currentRole);
                return new SonRandevuDto
                {
                    Id = r.Id,
                    HastaAd = maskedAd,
                    HastaSoyad = maskedSoyad,
                    DoktorAd = r.Doktor?.Ad ?? "",
                    DoktorSoyad = r.Doktor?.Soyad ?? "",
                    DoktorUnvan = r.Doktor?.Unvan ?? "",
                    IslemAd = r.Islem?.Ad ?? "",
                    Tarih = r.Tarih,
                    Saat = r.Saat,
                    Durum = r.Durum
                };
            });
        }
    }
}
