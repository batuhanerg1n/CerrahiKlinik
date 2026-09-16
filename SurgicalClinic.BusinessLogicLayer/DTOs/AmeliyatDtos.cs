using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class AmeliyatOlusturDto
    {
        public int HastaId { get; set; }
        public int DoktorId { get; set; }
        public int AmeliyathaneId { get; set; }
        public int? IslemId { get; set; }
        public string Baslik { get; set; } = string.Empty;
        public DateTime BaslangicZamani { get; set; }
        public DateTime BitisZamani { get; set; }
        public string? PreOpNot { get; set; }
    }

    public class AmeliyatDurumDto
    {
        public AmeliyatDurumu Durum { get; set; }
        public string? PostOpNot { get; set; }
        public string? KomplikasyonNotu { get; set; }
    }

    public class AmeliyatDto
    {
        public int Id { get; set; }
        public int HastaId { get; set; }
        public string HastaAdi { get; set; } = string.Empty;
        public int DoktorId { get; set; }
        public string DoktorAdi { get; set; } = string.Empty;
        public int AmeliyathaneId { get; set; }
        public string AmeliyathaneAdi { get; set; } = string.Empty;
        public int? IslemId { get; set; }
        public string? IslemAdi { get; set; }
        public string Baslik { get; set; } = string.Empty;
        public DateTime BaslangicZamani { get; set; }
        public DateTime BitisZamani { get; set; }
        public AmeliyatDurumu Durum { get; set; }
        public string? PreOpNot { get; set; }
        public string? PostOpNot { get; set; }
        public string? KomplikasyonNotu { get; set; }
        public DateTime OlusturmaTarihi { get; set; }
    }

    public class AmeliyathaneDto
    {
        public int Id { get; set; }
        public string Ad { get; set; } = string.Empty;
    }
}
