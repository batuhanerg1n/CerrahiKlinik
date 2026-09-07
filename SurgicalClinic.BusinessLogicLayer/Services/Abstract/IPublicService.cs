using SurgicalClinic.BusinessLogicLayer.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.Services.Abstract
{
    public interface IPublicService
    {
        Task<IEnumerable<DoktorDto>> GetDoktorlarAsync(int? bransId=null);
        Task<IEnumerable<IslemDto>> GetIslemlerAsync();
        Task<OnlineRandevuSonucDto> OnlineRandevuOlusturAsync(OnlineRandevuOlusturDto dto);
        Task<IEnumerable<TimeSpan>> GetDoluSaatlerAsync(int doktorId, DateTime tarih);
        Task<IEnumerable<BransDto>> GetBranslarAsync();
    }
}
