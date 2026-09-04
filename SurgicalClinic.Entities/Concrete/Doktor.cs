using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.Entities.Concrete
{
    public class Doktor
    {
        public int Id { get; set; }
        public int? KullaniciId { get; set; }
        public string Ad { get; set; }= string.Empty;
        public string Soyad { get; set; }=string.Empty;
        public string  Unvan  { get; set; } =string.Empty;
        public string Aciklama { get; set; }=string.Empty;
        public string? DiplomaNo { get; set; }
        public string? SicilNo { get; set; }
        public string? TcNo { get; set; }

        public Kullanici? Kullanici { get; set; }
        public ICollection<DoktorBrans> DoktorBranslar { get; set; } = new List<DoktorBrans>();
        public ICollection<Randevu> Randevular { get; set; } = new List<Randevu>();
    }
}
