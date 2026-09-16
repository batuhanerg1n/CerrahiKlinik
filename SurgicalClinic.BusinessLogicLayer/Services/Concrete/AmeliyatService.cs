using Microsoft.EntityFrameworkCore;
using SurgicalClinic.BusinessLogicLayer.DTOs;
using SurgicalClinic.BusinessLogicLayer.Services.Abstract;
using SurgicalClinic.DataAccessLayer.Abstract;
using SurgicalClinic.Entities.Concrete;
using SurgicalClinic.Entities.Enums;

namespace SurgicalClinic.BusinessLogicLayer.Services.Concrete
{
    public class AmeliyatService : IAmeliyatService
    {
        private readonly IUnitOfWork _unitOfWork;
        public AmeliyatService(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

        public async Task<(bool Success, string Message)> OlusturAsync(AmeliyatOlusturDto dto)
            => await KaydetAsync(dto, mevcutId: 0);

        public async Task<(bool Success, string Message)> GuncelleAsync(int id, AmeliyatOlusturDto dto)
        {
            var repo = _unitOfWork.GetRepository<Ameliyat>();
            var ameliyat = await repo.GetByIdAsync(id);
            if (ameliyat == null) return (false, "Ameliyat bulunamadı.");
            return await KaydetAsync(dto, mevcutId: id, mevcut: ameliyat);
        }

        private async Task<(bool Success, string Message)> KaydetAsync(AmeliyatOlusturDto dto, int mevcutId, Ameliyat? mevcut = null)
        {
            if (string.IsNullOrWhiteSpace(dto.Baslik))
                return (false, "Operasyon adı zorunludur.");
            if (dto.BitisZamani <= dto.BaslangicZamani)
                return (false, "Bitiş zamanı başlangıçtan sonra olmalı.");

            var ameliyatRepo = _unitOfWork.GetRepository<Ameliyat>();

            var odaCakisma = await ameliyatRepo.GetWhere(a =>
                a.AmeliyathaneId == dto.AmeliyathaneId &&
                a.Durum != AmeliyatDurumu.Iptal &&
                a.Id != mevcutId &&
                a.BaslangicZamani < dto.BitisZamani &&
                a.BitisZamani > dto.BaslangicZamani).AnyAsync();
            if (odaCakisma)
                return (false, "Seçilen ameliyathane bu saat aralığında dolu.");

            var cerrahCakisma = await ameliyatRepo.GetWhere(a =>
                a.DoktorId == dto.DoktorId &&
                a.Durum != AmeliyatDurumu.Iptal &&
                a.Id != mevcutId &&
                a.BaslangicZamani < dto.BitisZamani &&
                a.BitisZamani > dto.BaslangicZamani).AnyAsync();
            if (cerrahCakisma)
                return (false, "Cerrahın bu saat aralığında başka ameliyatı var.");

            if (mevcut == null)
            {
                await ameliyatRepo.AddAsync(new Ameliyat
                {
                    HastaId = dto.HastaId,
                    DoktorId = dto.DoktorId,
                    AmeliyathaneId = dto.AmeliyathaneId,
                    IslemId = dto.IslemId,
                    Baslik = dto.Baslik.Trim(),
                    BaslangicZamani = dto.BaslangicZamani,
                    BitisZamani = dto.BitisZamani,
                    PreOpNot = dto.PreOpNot
                });
            }
            else
            {
                mevcut.HastaId = dto.HastaId;
                mevcut.DoktorId = dto.DoktorId;
                mevcut.AmeliyathaneId = dto.AmeliyathaneId;
                mevcut.IslemId = dto.IslemId;
                mevcut.Baslik = dto.Baslik.Trim();
                mevcut.BaslangicZamani = dto.BaslangicZamani;
                mevcut.BitisZamani = dto.BitisZamani;
                mevcut.PreOpNot = dto.PreOpNot;
                ameliyatRepo.Update(mevcut);
            }

            await _unitOfWork.SaveChangeAsync();
            return (true, mevcut == null ? "Ameliyat planlandı." : "Ameliyat güncellendi.");
        }

        public async Task<(bool Success, string Message)> DurumGuncelleAsync(int id, AmeliyatDurumDto dto, int kullaniciId, bool isDoktor)
        {
            var repo = _unitOfWork.GetRepository<Ameliyat>();
            var ameliyat = await repo.GetByIdAsync(id);
            if (ameliyat == null) return (false, "Ameliyat bulunamadı.");

            if (isDoktor)
            {
                var doktorId = await GetDoktorIdByKullaniciIdAsync(kullaniciId);
                if (!doktorId.HasValue || ameliyat.DoktorId != doktorId.Value)
                    return (false, "Bu ameliyat size ait değil.");
            }

            ameliyat.Durum = dto.Durum;
            if (dto.PostOpNot != null) ameliyat.PostOpNot = dto.PostOpNot;
            if (dto.KomplikasyonNotu != null) ameliyat.KomplikasyonNotu = dto.KomplikasyonNotu;
            repo.Update(ameliyat);
            await _unitOfWork.SaveChangeAsync();
            return (true, "Durum güncellendi.");
        }

        public async Task<PageResultDto<AmeliyatDto>> GetTumAsync(int? ameliyathaneId, int pageIndex, int pageSize)
        {
            var query = BaseQuery();
            if (ameliyathaneId.HasValue) query = query.Where(a => a.AmeliyathaneId == ameliyathaneId);
            return await SayfalaAsync(query, pageIndex, pageSize);
        }

        public async Task<PageResultDto<AmeliyatDto>> GetDoktorAmeliyatlariAsync(int kullaniciId, int pageIndex, int pageSize)
        {
            var doktorId = await GetDoktorIdByKullaniciIdAsync(kullaniciId);
            if (!doktorId.HasValue)
                return new PageResultDto<AmeliyatDto> { PageIndex = pageIndex, PageSize = pageSize };

            var query = BaseQuery().Where(a => a.DoktorId == doktorId.Value);
            return await SayfalaAsync(query, pageIndex, pageSize);
        }

        public async Task<AmeliyatDto?> GetByIdAsync(int id)
            => await BaseQuery().Where(a => a.Id == id).Select(a => Map(a)).FirstOrDefaultAsync();

        public async Task<IEnumerable<AmeliyathaneDto>> GetAmeliyathanelerAsync()
            => await _unitOfWork.GetRepository<Ameliyathane>()
                .GetWhere(o => o.Aktif)
                .Select(o => new AmeliyathaneDto { Id = o.Id, Ad = o.Ad })
                .ToListAsync();

        public async Task<bool> SilAsync(int id)
        {
            var repo = _unitOfWork.GetRepository<Ameliyat>();
            var ameliyat = await repo.GetByIdAsync(id);
            if (ameliyat == null) return false;
            repo.Remove(ameliyat);
            await _unitOfWork.SaveChangeAsync();
            return true;
        }

        private IQueryable<Ameliyat> BaseQuery() =>
            _unitOfWork.GetRepository<Ameliyat>().GetWhere(a => true)
                .Include(a => a.Hasta)
                .Include(a => a.Doktor)
                .Include(a => a.Ameliyathane)
                .Include(a => a.Islem);

        private async Task<int?> GetDoktorIdByKullaniciIdAsync(int kullaniciId)
        {
            var doktor = await _unitOfWork.GetRepository<Doktor>()
                .GetWhere(d => d.KullaniciId == kullaniciId).FirstOrDefaultAsync();
            return doktor?.Id;
        }

        private static async Task<PageResultDto<AmeliyatDto>> SayfalaAsync(IQueryable<Ameliyat> query, int pageIndex, int pageSize)
        {
            if (pageIndex < 1) pageIndex = 1;
            if (pageSize < 1) pageSize = 5;

            var toplam = await query.CountAsync();
            var items = await query
                .OrderByDescending(a => a.BaslangicZamani)
                .Skip((pageIndex - 1) * pageSize).Take(pageSize)
                .Select(a => Map(a)).ToListAsync();

            return new PageResultDto<AmeliyatDto>
            { Items = items, TotalCount = toplam, PageIndex = pageIndex, PageSize = pageSize };
        }

        private static AmeliyatDto Map(Ameliyat a) => new()
        {
            Id = a.Id,
            HastaId = a.HastaId,
            HastaAdi = $"{a.Hasta.Ad} {a.Hasta.Soyad}",
            DoktorId = a.DoktorId,
            DoktorAdi = $"{a.Doktor.Ad} {a.Doktor.Soyad}",
            AmeliyathaneId = a.AmeliyathaneId,
            AmeliyathaneAdi = a.Ameliyathane.Ad,
            IslemId = a.IslemId,
            IslemAdi = a.Islem != null ? a.Islem.Ad : null,
            Baslik = a.Baslik,
            BaslangicZamani = a.BaslangicZamani,
            BitisZamani = a.BitisZamani,
            Durum = a.Durum,
            PreOpNot = a.PreOpNot,
            PostOpNot = a.PostOpNot,
            KomplikasyonNotu = a.KomplikasyonNotu,
            OlusturmaTarihi = a.OlusturmaTarihi
        };
    }
}