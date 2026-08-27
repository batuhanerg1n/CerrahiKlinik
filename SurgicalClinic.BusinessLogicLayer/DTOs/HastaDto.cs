using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class HastaDto
    {
        public int Id { get; set; }
        public string   Ad { get; set; } = string.Empty;
        public string Soyad { get; set; } =string.Empty;
        public string Telefon { get; set; } = string.Empty;
        public string? TcNo { get; set; }
        public DateTime DogumTarihi { get; set; }
        public string? Notlar { get; set; }
    }
}
