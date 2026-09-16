using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SurgicalClinic.Entities.Concrete
{
    public class Ameliyathane
    {
        public int Id { get; set; }
        public string Ad { get; set; } = string.Empty;   
        public bool Aktif { get; set; } = true;

        public ICollection<Ameliyat> Ameliyatlar { get; set; } = new List<Ameliyat>();
    }
}
