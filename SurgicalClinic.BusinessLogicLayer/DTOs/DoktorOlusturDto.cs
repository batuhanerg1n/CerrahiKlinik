using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class DoktorOlusturDto
    {
        public string Ad { get; set; } = string.Empty;
        public string Soyad { get; set; } =string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Sifre { get; set; } = string.Empty;
        public string Unvan { get; set; } = string.Empty;
        public string Aciklama { get; set; } = string.Empty;
        public string? DiplomaNo { get; set; }
        public string? SicilNo { get; set; }
        public string? TcNo { get; set; }
        public List<int> BransIds { get; set; } = new();
    }
    public class DoktorListeDto
    {
        public int Id { get; set; }
        public string Ad { get; set; } =string.Empty ;
        public string Soyad { get; set; } =string .Empty ;
        public string Unvan { get; set; } = string.Empty;
        public string Aciklama { get; set; } = string .Empty ;
        public string Email { get; set; }= string.Empty;
        public string? DiplomaNo { get; set; }
        public string? SicilNo { get; set; }
        public string? TcNo { get; set; }
        public List<string> Branslar { get; set; }= new();
        public List<int> BransIds { get; set; } = new();

    }
    public class DoktorGuncelleDto
    {
        public string Ad { get; set; }=string.Empty ;
        public string Soyad { get; set; }=string .Empty ;
        public string Unvan { get; set; } = string.Empty;
        public string Aciklama { get; set; } = string.Empty;

        public string? DiplomaNo { get; set; }
        public string? SicilNo { get; set; }
        public string? TcNo  { get; set; }
        public List<int> BransIds { get; set; } = new();
    }
}
