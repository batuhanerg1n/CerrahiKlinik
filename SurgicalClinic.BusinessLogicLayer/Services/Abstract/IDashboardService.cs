using SurgicalClinic.BusinessLogicLayer.DTOs;
using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.Services.Abstract
{
    public interface IDashboardService
    {
        Task<DashboardOzetDto> GetOzetAsync();
        Task<AylikPerformansDto> GetAylikPerformansAsync(int? yil = null, int? ay = null); Task<IEnumerable<RandevuKaynakDagilimiDto>> GetRandevuKaynaklariAsync();
        Task<IEnumerable<SonRandevuDto>> GetSonRandevuAsync(Rol currentRole, int limit = 5);

    }
}
