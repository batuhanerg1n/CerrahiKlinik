using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.Entities.Concrete
{
    public class Ameliyat
    {
        public int Id { get; set; }

        public int HastaId { get; set; }
        public Hasta Hasta { get; set; } = null!;

        public int DoktorId { get; set; }              
        public Doktor Doktor { get; set; } = null!;

        public int AmeliyathaneId { get; set; }
        public Ameliyathane Ameliyathane { get; set; } = null!;

        public int? IslemId { get; set; }               
        public Islem? Islem { get; set; }

        public string Baslik { get; set; } = string.Empty;  
        public DateTime BaslangicZamani { get; set; }
        public DateTime BitisZamani { get; set; }            

        public AmeliyatDurumu Durum { get; set; } = AmeliyatDurumu.Planlandi;

        public string? PreOpNot { get; set; }
        public string? PostOpNot { get; set; }
        public string? KomplikasyonNotu { get; set; }

        public DateTime OlusturmaTarihi { get; set; } = DateTime.Now;
    }
}
