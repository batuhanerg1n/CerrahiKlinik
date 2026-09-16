using SurgicalClinic.BusinessLogicLayer.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.Services.Abstract
{
    public interface IAmeliyatService
    {
        Task<(bool Success, string Message)> OlusturAsync(AmeliyatOlusturDto dto);
        Task<(bool Success, string Message)> GuncelleAsync(int id, AmeliyatOlusturDto dto);
        Task<(bool Success, string Message)> DurumGuncelleAsync(int id, AmeliyatDurumDto dto, int kullaniciId, bool isDoktor);
        Task<PageResultDto<AmeliyatDto>> GetTumAsync(int? ameliyathaneId, int pageIndex, int pageSize);
        Task<PageResultDto<AmeliyatDto>> GetDoktorAmeliyatlariAsync(int kullaniciId, int pageIndex, int pageSize);
        Task<AmeliyatDto?> GetByIdAsync(int id);
        Task<IEnumerable<AmeliyathaneDto>> GetAmeliyathanelerAsync();
        Task<bool> SilAsync(int id);
    }
}
