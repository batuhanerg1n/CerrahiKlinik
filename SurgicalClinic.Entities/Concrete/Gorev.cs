using SurgicalClinic.Entities.Enums;

namespace SurgicalClinic.Entities.Concrete
{
    public class Gorev
    {
        public int Id { get; set; }
        public string Baslik { get; set; } = string.Empty;
        public string? Aciklama { get; set; }            

        public int AtananPersonelId { get; set; }        
        public Kullanici AtananPersonel { get; set; } = null!;

        public DateTime BaslangicZamani { get; set; }    
        public DateTime? BitisZamani { get; set; }       

        public GorevDurumu Durum { get; set; } = GorevDurumu.Bekliyor;
        public string? PersonelNotu { get; set; }
        public DateTime OlusturulmaTarihi { get; set; } = DateTime.Now;
        public DateTime? TamamlanmaTarihi { get; set; }
        
    }
}