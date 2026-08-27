using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class OnlineRandevuOlusturDto
    {
        public string HastaAd { get; set; } = string.Empty;
        public string HastaSoyad { get; set; } =string.Empty;
        public string HastaTelefon { get; set; } = string.Empty;
        public string? HastaTcNo { get; set; }
        public int DoktorId { get; set; }
        public int IslemId { get; set; }
        public int? IslemSecenekId { get; set; }
        public DateTime Tarih { get; set; }
        public TimeSpan Saat { get; set; }
        public string? HastaNotu { get; set; }
    }
}
