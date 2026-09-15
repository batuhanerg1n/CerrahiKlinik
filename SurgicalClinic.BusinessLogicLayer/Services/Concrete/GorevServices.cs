using Microsoft.EntityFrameworkCore;
using SurgicalClinic.BusinessLogicLayer.DTOs;
using SurgicalClinic.BusinessLogicLayer.Services.Abstract;
using SurgicalClinic.DataAccessLayer.Abstract;
using SurgicalClinic.Entities.Concrete;
using SurgicalClinic.Entities.Enums;

namespace SurgicalClinic.BusinessLogicLayer.Services.Concrete
{
    public class GorevService : IGorevService
    {
        private readonly IUnitOfWork _unitOfWork;
        public GorevService(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

        public async Task<(bool Success, string Message)> GorevOlusturAsync(GorevOlusturDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Baslik))
                return (false, "Görev başlığı zorunludur.");
            if (dto.BitisZamani.HasValue && dto.BitisZamani < dto.BaslangicZamani)
                return (false, "Bitiş zamanı başlangıçtan önce olamaz.");

            var kullaniciRepo = _unitOfWork.GetRepository<Kullanici>();
            var gecerliPersonel = await kullaniciRepo
                .GetWhere(k => k.Id == dto.AtananPersonelId && k.Rol == Rol.Personel)
                .AnyAsync();
            if (!gecerliPersonel)
                return (false, "Seçilen kullanıcı bir personel değil.");

            var gorevRepo = _unitOfWork.GetRepository<Gorev>();
            await gorevRepo.AddAsync(new Gorev
            {
                Baslik = dto.Baslik.Trim(),
                Aciklama = dto.Aciklama,
                AtananPersonelId = dto.AtananPersonelId,
                BaslangicZamani = dto.BaslangicZamani,
                BitisZamani = dto.BitisZamani
            });
            await _unitOfWork.SaveChangeAsync();
            return (true, "Görev atandı.");
        }

        public async Task<PageResultDto<GorevDto>> GetTumGorevlerAsync(int? personelId, GorevDurumu? durum, int pageIndex, int pageSize)
        {
            var query = _unitOfWork.GetRepository<Gorev>()
                .GetWhere(g => true).Include(g => g.AtananPersonel).AsQueryable();

            if (personelId.HasValue) query = query.Where(g => g.AtananPersonelId == personelId);
            if (durum.HasValue) query = query.Where(g => g.Durum == durum);

            return await SayfalaAsync(query, pageIndex, pageSize);
        }

        public async Task<PageResultDto<GorevDto>> GetGorevlerimAsync(int kullaniciId, int pageIndex, int pageSize)
        {
            var query = _unitOfWork.GetRepository<Gorev>()
                .GetWhere(g => g.AtananPersonelId == kullaniciId)
                .Include(g => g.AtananPersonel).AsQueryable();

            return await SayfalaAsync(query, pageIndex, pageSize);
        }

        public async Task<(bool Success, string Message)> GorevTamamlaAsync(int gorevId, int kullaniciId, string? not)
        {
            var gorevRepo = _unitOfWork.GetRepository<Gorev>();
            var gorev = await gorevRepo.GetByIdAsync(gorevId);
            if (gorev == null) return (false, "Görev bulunamadı.");
            if (gorev.AtananPersonelId != kullaniciId) return (false, "Bu görev size ait değil.");
            if (gorev.Durum == GorevDurumu.Tamamlandi) return (false, "Görev zaten tamamlanmış.");
            if (gorev.Durum == GorevDurumu.Iptal) return (false, "İptal edilmiş görev tamamlanamaz.");

            gorev.Durum = GorevDurumu.Tamamlandi;
            gorev.PersonelNotu = not;
            gorev.TamamlanmaTarihi = DateTime.Now;
            gorevRepo.Update(gorev);
            await _unitOfWork.SaveChangeAsync();
            return (true, "Görev tamamlandı.");
        }

        public async Task<(bool Success, string Message)> GorevIptalAsync(int gorevId, int kullaniciId, string? not)
        {
            var gorevRepo = _unitOfWork.GetRepository<Gorev>();
            var gorev = await gorevRepo.GetByIdAsync(gorevId);
            if (gorev == null) return (false, "Görev bulunamadı.");
            if (gorev.AtananPersonelId != kullaniciId) return (false, "Bu görev size ait değil.");
            if (gorev.Durum == GorevDurumu.Tamamlandi) return (false, "Tamamlanmış görev iptal edilemez.");
            if (gorev.Durum == GorevDurumu.Iptal) return (false, "Görev zaten iptal edilmiş.");

            gorev.Durum = GorevDurumu.Iptal;
            gorev.PersonelNotu = not;
            gorevRepo.Update(gorev);
            await _unitOfWork.SaveChangeAsync();
            return (true, "Görev iptal edildi.");
        }

        public async Task<bool> GorevSilAsync(int gorevId)
        {
            var gorevRepo = _unitOfWork.GetRepository<Gorev>();
            var gorev = await gorevRepo.GetByIdAsync(gorevId);
            if (gorev == null) return false;
            gorevRepo.Remove(gorev);
            await _unitOfWork.SaveChangeAsync();
            return true;
        }

        private static async Task<PageResultDto<GorevDto>> SayfalaAsync(IQueryable<Gorev> query, int pageIndex, int pageSize)
        {
            if (pageIndex < 1) pageIndex = 1;
            if (pageSize < 1) pageSize = 5;

            var toplam = await query.CountAsync();
            var items = await query
                .OrderByDescending(g => g.OlusturulmaTarihi)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .Select(g => Map(g))
                .ToListAsync();

            return new PageResultDto<GorevDto>
            {
                Items = items,
                TotalCount = toplam,
                PageIndex = pageIndex,
                PageSize = pageSize
            };
        }

        private static GorevDto Map(Gorev g) => new()
        {
            Id = g.Id,
            Baslik = g.Baslik,
            Aciklama = g.Aciklama,
            AtananPersonelId = g.AtananPersonelId,
            PersonelAdi = $"{g.AtananPersonel.Ad} {g.AtananPersonel.Soyad}",
            BaslangicZamani = g.BaslangicZamani,
            BitisZamani = g.BitisZamani,
            Durum = g.Durum,
            PersonelNotu =g.PersonelNotu,
            OlusturulmaTarihi = g.OlusturulmaTarihi,
            TamamlanmaTarihi = g.TamamlanmaTarihi
        };
    }
}
        
