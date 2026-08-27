using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurgicalClinic.BusinessLogicLayer.DTOs;
using SurgicalClinic.BusinessLogicLayer.Services.Abstract;
using SurgicalClinic.BusinessLogicLayer.Services.Concrete;
using SurgicalClinic.Entities.Concrete;
using SurgicalClinic.Entities.Enums;
using System.Security.Claims;

namespace SurgicalClinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Personel")]
    public class PersonelPanelController : ControllerBase
    {

        private readonly IPersonelPanelService _personelService;

        public PersonelPanelController(IPersonelPanelService personelService)
        {
            _personelService = personelService;
        }

        [HttpGet("randevular/search")]
        public async Task<IActionResult> GetRandevular([FromQuery] string? query, [FromQuery] RandevuDrum? durum, [FromQuery] int? doktorId,[FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _personelService.GetRandevularAsync(query, durum,doktorId, pageIndex, pageSize);
            return Ok(result);
        }
        [HttpPut("randevular/{id}/durum")]
        public async Task<IActionResult> RandevuDurumGuncelle(int id, [FromQuery] RandevuDrum drum)
        {
            var result = await _personelService.RandevuDurumGuncelleAsync(id, drum);
            if (!result)
                return NotFound(new { message = "Randevu bulunamadı" });
            return Ok(new { message = " Randevu durumu güncellendi" });
        }
        [HttpGet("hastalar")]
        public async Task<IActionResult> GetHastalar()
        {
            var result = await _personelService.GetHastalarAsync();
            return Ok(result);
        }
        [HttpGet("hastalar/{id}")]
        public async Task<IActionResult> GetHastaById(int id)
        {
            var result = await _personelService.GetHastaByIdAsync(id);
            if (result == null)
                return NotFound(new { message = "Hasta bulunamadı" });
            return Ok(result);
        }
        [HttpPost("hastalar")]
        public async Task<IActionResult> HastaKaydet([FromBody] HastaDto dto)
        {
            var result = await _personelService.HastaEkleVeGuncelleAsync(dto);
            return Ok(result);
        }
        

        [HttpGet("takvim")]
        public async Task<IActionResult> GetTakvim([FromQuery] int ay, [FromQuery] int yil)
        {
            var result = await _personelService.GetTakvimEventAsync(ay, yil);
            return Ok(result);
        }

        [HttpGet("islemler")]
        public async Task<IActionResult> GetTumIslemler()
        {
            var result = await _personelService.GetTumIslemlerAsync();
            return Ok(result);
        }
        [Authorize(Roles = "Admin")]
        [HttpPost("islemler")]
        public async Task<IActionResult> IslemEkle([FromBody] IslemOlusturDto dto)
        {
            var result = await _personelService.IslemEkleAsync(dto);
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("islemler/{id}")]
        public async Task<IActionResult> IslemSil(int id)
        {
            var success = await _personelService.IslemSilAsync(id);
            if (!success)
                return BadRequest(new { message = "İşlem silinemedi." });
            return Ok(new { message = "İşlem silindi." });
        }

        [HttpGet("doktorlar")]
        public async Task<IActionResult> GetTumDoktorlar()
        {
            var result = await _personelService.GetTumDoktorlarAsync();
            return Ok(result);
        }
        [Authorize(Roles = "Admin")]
        [HttpPost("doktorlar")]
        public async Task<IActionResult> DoktorOlustur([FromBody] DoktorOlusturDto dto)
        {
            var (success, message) = await _personelService.DoktorOlusturAsync(dto);
            if (!success)
                return BadRequest(new { message });
            return Ok(new { message });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("doktorlar/{id}")]
        public async Task<IActionResult> DoktorSil(int id)
        {
            var success = await _personelService.DoktorSilAsync(id);
            if (!success)
                return BadRequest(new { message = "Doktor silinemedi." });
            return Ok(new { message = "Doktor silindi." });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("branslar")]
        public async Task<IActionResult> BransEkle([FromBody] BransEkleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Ad))
                return BadRequest(new { message = "Branş adı boş olamaz." });

            var result = await _personelService.BransEkleAsync(dto.Ad.Trim());
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("branslar/{id}")]
        public async Task<IActionResult> BransSil(int id)
        {
            var success = await _personelService.BransSilAsync(id);
            if (!success)
                return BadRequest(new { message = "Branş silinemedi." });
            return Ok(new { message = "Branş silindi." });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("islemler/{id}")]
        public async Task<IActionResult> IslemGuncelle(int id, [FromBody] IslemGuncelleDto dto)
        {
            var (success, message) = await _personelService.IslemGuncelleAsync(id, dto);
            if (!success)
                return BadRequest(new { message });
            return Ok(new { message });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("doktorlar/{id}")]
        public async Task<IActionResult> DoktorGuncelle(int id, [FromBody] DoktorGuncelleDto dto)
        {
            var (success, message) = await _personelService.DoktorGuncelleAsync(id, dto);
            if (!success)
                return BadRequest(new { message });
            return Ok(new { message });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("kullanicilar")]
        public async Task<IActionResult> GetKullanicilar()
        {
            var result = await _personelService.GetKullanicilarAsync();
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("kullanicilar")]
        public async Task<IActionResult> KullaniciOlustur([FromBody] KullaniciOlusturDto dto)
        {
            var (success, message) = await _personelService.KullaniciOlusturAsync(dto);
            if (!success)
                return BadRequest(new { message });
            return Ok(new { message });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("kullanicilar/{id}")]
        public async Task<IActionResult> KullaniciSil(int id)
        {
            var success = await _personelService.KullaniciSilAsync(id);
            if (!success)
                return BadRequest(new { message = "Kullanıcı silinemedi." });
            return Ok(new { message = "Kullanıcı silindi." });
        }

        [HttpPut("randevular/{id}")]
        public async Task<IActionResult> RandevuGuncelle(int id, [FromBody] RandevuGuncelleDto dto)
        {
            var (success, message) = await _personelService.RandevuGuncelleAsync(id, dto);
            if (success)
                return BadRequest(new { message });
            return Ok(new { message });

        }

        [HttpGet("hastalar/{id}/randevular")]
        public async Task<IActionResult> GetHastaRandevulari(int id)
        {
            var result = await _personelService.GetHastaRandevulariAsync(id);
            return Ok(result);
        }

        [HttpPost("randevular")]
        public async Task<IActionResult> RandevuOlustur([FromBody] PersonelRandevuOlusturDto dto)
        {
            var (success, message) = await _personelService.PersonelRandevuOlusturAsync(dto);
            if (!success)
                return BadRequest(new { message });
            return Ok(new { message });
        }
    }
}
