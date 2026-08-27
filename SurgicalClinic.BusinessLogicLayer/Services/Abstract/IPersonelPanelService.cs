using Microsoft.VisualBasic;
using SurgicalClinic.BusinessLogicLayer.DTOs;
using SurgicalClinic.Entities.Concrete;
using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.Services.Abstract
{
    public interface IPersonelPanelService
    {
        Task<PageResultDto<RandevuDetailDto>> GetRandevularAsync(String? query, RandevuDrum? drum, int? doktorId=null, int pageIndex = 1, int PageSize= 10);
        Task<bool> RandevuDurumGuncelleAsync(int randevuId, RandevuDrum yeniDurum);

        Task<IEnumerable<HastaDto>> GetHastalarAsync();
        Task<HastaDto?> GetHastaByIdAsync(int id);
        Task<HastaDto> HastaEkleVeGuncelleAsync(HastaDto dto);
        Task<IEnumerable<TakvimEventDto>> GetTakvimEventAsync(int ay, int yil);

        Task<IEnumerable<IslemDto>> GetTumIslemlerAsync();
        Task<IslemDto> IslemEkleAsync(IslemOlusturDto dto);
        Task<bool> IslemSilAsync(int islemId);
        Task<(bool Success, string Message)> DoktorOlusturAsync(DoktorOlusturDto dto);
        
        Task<IEnumerable<DoktorListeDto>> GetTumDoktorlarAsync();
        Task<bool> DoktorSilAsync(int doktorId);
        Task<BransDto> BransEkleAsync(string ad);
        Task<bool> BransSilAsync(int BransId);
        Task<(bool Success, string Message)> IslemGuncelleAsync(int islemId, IslemGuncelleDto dto);
        Task<(bool Success, string Message)> DoktorGuncelleAsync(int doktorId, DoktorGuncelleDto dto);
        Task<(bool Success, string Message)> KullaniciOlusturAsync(KullaniciOlusturDto dto);
        Task<IEnumerable<KullaniciListeDto>> GetKullanicilarAsync();
        Task<bool> KullaniciSilAsync(int kullanicId);
        Task<(bool Success, string Message)> RandevuGuncelleAsync(int randevuId, RandevuGuncelleDto dto);
        Task<IEnumerable<RandevuDetailDto>> GetHastaRandevulariAsync(int hastaId);
        Task<(bool Success, string Message)> PersonelRandevuOlusturAsync(PersonelRandevuOlusturDto dto);

    }
}
