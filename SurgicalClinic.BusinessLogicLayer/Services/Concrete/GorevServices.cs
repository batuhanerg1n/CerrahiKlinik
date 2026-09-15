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
        public async Task<IEnumerable<GorevDto>> GetGorevlerimAsync(int kullaniciId)
        {
            return await _unitOfWork.GetRepository<Gorev>()
                .GetWhere(g => g.AtananPersonelId == kullaniciId)
                .Include(g => g.AtananPersonel)
                .OrderByDescending(g => g.OlusturulmaTarihi)
                .Select(g => Map(g)).ToListAsync();
        }



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

        public async Task<bool> GorevSilAsync(int gorevId)
        {
            var gorevRepo = _unitOfWork.GetRepository<Gorev>();
            var gorev = await gorevRepo.GetByIdAsync(gorevId);
            if (gorev == null) return false;
            gorevRepo.Remove(gorev);
            await _unitOfWork.SaveChangeAsync();
            return true;
        }

        public async Task<(bool Success, string Message)> GorevTamamlaAsync(int gorevId, int kullaniciId)
        {
            var gorevRepo = _unitOfWork.GetRepository<Gorev>();
            var gorev = await gorevRepo.GetByIdAsync(gorevId);
            if (gorev == null) return (false, "Görev bulunamadı.");
            if (gorev.AtananPersonelId != kullaniciId)
                return (false, "Bu görev size ait değil.");
            if (gorev.Durum == GorevDurumu.Tamamlandi)
                return (false, "Görev zaten tamamlanmış.");

            gorev.Durum = GorevDurumu.Tamamlandi;
            gorev.TamamlanmaTarihi = DateTime.Now;
            gorevRepo.Update(gorev);
            await _unitOfWork.SaveChangeAsync();
            return (true, "Görev tamamlandı.");
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
            OlusturulmaTarihi = g.OlusturulmaTarihi,
            TamamlanmaTarihi = g.TamamlanmaTarihi
        };

        public async Task<IEnumerable<GorevDto>> GetTumGorevlerAsync(int? personelId, GorevDurumu? durum)
        {
            var query = _unitOfWork.GetRepository<Gorev>()
                .GetWhere(g => true).Include(g => g.AtananPersonel).AsQueryable();

            if (personelId.HasValue) query = query.Where(g => g.AtananPersonelId == personelId);
            if (durum.HasValue) query = query.Where(g => g.Durum == durum);

            return await query.OrderByDescending(g => g.OlusturulmaTarihi)
                .Select(g => Map(g)).ToListAsync();
        }
    }
}