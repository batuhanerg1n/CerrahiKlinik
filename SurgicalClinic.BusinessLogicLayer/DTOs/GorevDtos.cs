using SurgicalClinic.Entities.Concrete;
using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class GorevOlusturDto
    {
        public string Baslik { get; set; } = string.Empty;
        public string? Aciklama { get; set; }
        public int AtananPersonelId { get; set; }
        public DateTime BaslangicZamani { get; set; }
        public DateTime? BitisZamani { get; set; }
    }

    public class GorevDto
    {
        public int Id { get; set; }
        public string Baslik { get; set; } = string.Empty;
        public string? Aciklama { get; set; }
        public int AtananPersonelId { get; set; }
        public string PersonelAdi { get; set; } = string.Empty;
        public DateTime BaslangicZamani { get; set; }
        public DateTime? BitisZamani { get; set; }
        public GorevDurumu Durum { get; set; }
        public DateTime OlusturulmaTarihi { get; set; }
        public DateTime? TamamlanmaTarihi { get; set; }
    }
}
