using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class IslemGelirDto
    {
        public string IslemAd { get; set; } = string.Empty;
        public decimal ToplamGelir { get; set; }
        public int Adet { get; set; }
    }
}
