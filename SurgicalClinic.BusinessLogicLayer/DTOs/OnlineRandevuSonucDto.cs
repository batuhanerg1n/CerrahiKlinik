using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.BusinessLogicLayer.DTOs
{
    public class OnlineRandevuSonucDto
    {
        public bool Success { get; set; }
        public string Message  { get; set; } = string.Empty;
        public int RandevuId { get; set; }
        public string ReferansNo { get; set; } = string.Empty ;
        public string BransAd { get; set; } =string.Empty ;
    }
}
