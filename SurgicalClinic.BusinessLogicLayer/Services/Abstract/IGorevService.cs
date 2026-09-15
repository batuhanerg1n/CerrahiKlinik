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
        Task<IEnumerable<GorevDto>> GetTumGorevlerAsync(int? personelId, GorevDurumu? durum);
        Task<IEnumerable<GorevDto>> GetGorevlerimAsync(int kullaniciId);
        Task<(bool Success, string Message)> GorevTamamlaAsync(int gorevId, int kullaniciId);
        Task<bool> GorevSilAsync(int gorevId);
    }
}
