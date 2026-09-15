using SurgicalClinic.Entities.Enums;

namespace SurgicalClinic.Entities.Concrete
{
    public class Gorev
    {
        public int Id { get; set; }
        public string Baslik { get; set; } = string.Empty;
        public string? Aciklama { get; set; }            // metin / not kısmı

        public int AtananPersonelId { get; set; }        // -> Kullanici.Id (Rol=Personel)
        public Kullanici AtananPersonel { get; set; } = null!;

        public DateTime BaslangicZamani { get; set; }    // "şu saate" / aralık başı
        public DateTime? BitisZamani { get; set; }       // aralık bitişi (opsiyonel)

        public GorevDurumu Durum { get; set; } = GorevDurumu.Bekliyor;
        public DateTime OlusturulmaTarihi { get; set; } = DateTime.Now;
        public DateTime? TamamlanmaTarihi { get; set; }
    }
}