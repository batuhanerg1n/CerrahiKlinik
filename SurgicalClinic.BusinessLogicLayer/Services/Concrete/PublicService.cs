using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.Json;
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
    public class PublicService : IPublicService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PublicService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<BransDto>> GetBranslarAsync()
        {
           var bransRepo = _unitOfWork.GetRepository<Brans>();
           var branslar = await bransRepo.GetAllAsync();
            return branslar.Select(b => new BransDto { Id = b.Id, Ad = b.Ad });
        }

        public async Task<IEnumerable<DoktorDto>> GetDoktorlarAsync(int? bransId = null)
        {
            var DoktorRepo = _unitOfWork.GetRepository<Doktor>();
            var query = DoktorRepo.GetWhere(d => true);
            if(bransId.HasValue)
            {
                query = query.Where(d => d.DoktorBranslar.Any(db => db.BransId == bransId.Value));
            }
            var doktorlar = await query
                .Include(d => d.DoktorBranslar)
                .ThenInclude(db => db.Brans)
                .ToListAsync();
            return doktorlar.Select(d => new DoktorDto  
            {
                Id = d.Id,
                Ad = d.Ad,
                Soyad = d.Soyad,
                Acıklama = d.Aciklama,
                Branslar = d.DoktorBranslar.Select(db => db.Brans.Ad).ToList(),
                Unvan = d.Unvan,
            });
        }

        public async Task<IEnumerable<TimeSpan>> GetDoluSaatlerAsync(int doktorId, DateTime tarih)
        {
            var randevuRepo = _unitOfWork.GetRepository<Randevu>();
            
            var doluSaatler= await randevuRepo.GetWhere( r=>
            r.DoktorId == doktorId &&
            r.Tarih.Date == tarih.Date &&
            r.Durum !=RandevuDrum.Iptal)
            .Select(r => r.Saat)
            .ToListAsync();
            return doluSaatler;

        }

        public async Task<IEnumerable<IslemDto>> GetIslemlerAsync()
        {
            var islemRepo = _unitOfWork.GetRepository<Islem>();
            var islemler = await islemRepo.GetWhere(i => true)
                .Include(i => i.Secenekler)
                .Include(i =>i.Brans)
                .ToListAsync();

            return islemler.Select(i => new IslemDto
            {
                Id = i.Id,
                Ad = i.Ad,
                Aciklama = i.Aciklama,
                FiyatTipi = (int)i.FiyatTipi,
                Fiyat = i.Fiyat,
                BransId = i.BransId,
                BransAd = i.Brans?.Ad,
                Secenekler = i.Secenekler.Select(s => new IslemSecenekDto
                {
                    Id = s.Id,
                    SecenekAd = s.SecenekAd,
                    Fiyat = s.Fiyat
                }).ToList()
            });
        }

        public async Task<(bool Success, string Message)> OnlineRandevuOlusturAsync(OnlineRandevuOlusturDto dto)
        {
            var randevuZamani = dto.Tarih.Date.Add(dto.Saat);
            if (randevuZamani < DateTime.Now)
            {
                return (false, "Geçmiş bir tarih veya saate randevu oluşturulamaz.");
            }

            var randevuRepo = _unitOfWork.GetRepository<Randevu>();
            var hastaRepo = _unitOfWork.GetRepository<Hasta>();

            var slotDolumu= await randevuRepo.GetWhere(r=>
            r.DoktorId ==dto.DoktorId &&
            r.Tarih.Date==dto.Tarih.Date &&
            r.Saat == dto.Saat &&
            r.Durum != RandevuDrum.Iptal).AnyAsync();

            if (slotDolumu)
            {
                return (false, "Seçilen tarih ve saate doktorun bir randevusu bulunmaktadır.");
            }

            var hasta = await hastaRepo.GetWhere(h => h.Telefon == dto.HastaTelefon).FirstOrDefaultAsync();
            if (hasta==null)
            {
                hasta = new Hasta
                {
                    Ad = dto.HastaAd,
                    Soyad = dto.HastaSoyad,
                    Telefon = dto.HastaTelefon,
                    TcNo = dto.HastaTcNo,
                    DogumTarihi = DateTime.MinValue
                };
                await hastaRepo.AddAsync(hasta);
                await _unitOfWork.SaveChangeAsync();
            }

            var yeniRandevu = new Randevu

            {
                HastaId = hasta.Id,
                DoktorId = dto.DoktorId,
                IslemId = dto.IslemId,
                IslemSecenekId= dto.IslemSecenekId,
                Tarih = dto.Tarih.Date,
                Saat = dto.Saat,
                HastaNotu = dto.HastaNotu,
                Durum = RandevuDrum.Beklemede,
                Kaynak = RandevuKaynak.Online,
                OlusturmaTarihi = DateTime.UtcNow
            };
            await randevuRepo.AddAsync(yeniRandevu);

            try
            {
                await _unitOfWork.SaveChangeAsync();
                return (true, " Randevu talebiniz başarıyla oluşturuldu.");

            }

            catch (DbUpdateConcurrencyException)
            {
                return (false, "Aynı slot için eşzamanlı başka bir istek işelendi.Lütfen farklı bir saat seçiniz.");
            }
        }
    }
}
