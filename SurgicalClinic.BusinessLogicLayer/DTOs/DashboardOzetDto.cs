using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class DashboardOzetDto
    {
        public int BugunkuRandevuSayisi { get; set; }
        public int BekleyenRandevuSayisi { get; set; }
        public int AktifRandevuSayisi { get; set; }
        public int GunlukToplmHastaSayisi { get; set; }
        public decimal GunlukToplamGelir { get; set; }
        public int TamamlananRandevuSayisi { get; set; }
    }
}
