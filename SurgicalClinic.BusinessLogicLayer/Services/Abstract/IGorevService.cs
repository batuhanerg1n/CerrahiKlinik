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
    public interface IGorevService
    {
        Task<(bool Success, string Message)> GorevOlusturAsync(GorevOlusturDto dto);
        Task<PageResultDto<GorevDto>> GetTumGorevlerAsync(int? personelId, GorevDurumu? durum, int pageIndex, int pageSize);
        Task<PageResultDto<GorevDto>> GetGorevlerimAsync(int kullaniciId, int pageIndex, int pageSize);
        Task<(bool Success, string Message)> GorevTamamlaAsync(int gorevId, int kullaniciId, string? not);
        Task<(bool Success, string Message)> GorevIptalAsync(int gorevId, int kullaniciId, string? not);
        Task<bool> GorevSilAsync(int gorevId);
    }
}
