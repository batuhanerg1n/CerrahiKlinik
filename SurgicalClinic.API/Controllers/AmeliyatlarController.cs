using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurgicalClinic.BusinessLogicLayer.DTOs;
using SurgicalClinic.BusinessLogicLayer.Services.Abstract;
using System.Security.Claims;

namespace SurgicalClinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AmeliyatlarController : ControllerBase
    {
        private readonly IAmeliyatService _service;
        public AmeliyatlarController(IAmeliyatService service) => _service = service;

        private int AktifKullaniciId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private bool IsDoktor => User.IsInRole("Doktor");

        [HttpPost]
        [Authorize(Roles = "Admin,Personel")]
        public async Task<IActionResult> Olustur([FromBody] AmeliyatOlusturDto dto)
        {
            var (ok, msg) = await _service.OlusturAsync(dto);
            return ok ? Ok(new { message = msg }) : BadRequest(new { message = msg });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Personel")]
        public async Task<IActionResult> Guncelle(int id, [FromBody] AmeliyatOlusturDto dto)
        {
            var (ok, msg) = await _service.GuncelleAsync(id, dto);
            return ok ? Ok(new { message = msg }) : BadRequest(new { message = msg });
        }

        [HttpPut("{id}/durum")]
        [Authorize(Roles = "Admin,Doktor")]
        public async Task<IActionResult> DurumGuncelle(int id, [FromBody] AmeliyatDurumDto dto)
        {
            var (ok, msg) = await _service.DurumGuncelleAsync(id, dto, AktifKullaniciId, IsDoktor);
            return ok ? Ok(new { message = msg }) : BadRequest(new { message = msg });
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Personel")]
        public async Task<IActionResult> Tumu([FromQuery] int? ameliyathaneId, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 5)
            => Ok(await _service.GetTumAsync(ameliyathaneId, pageIndex, pageSize));

        [HttpGet("benim")]
        [Authorize(Roles = "Doktor")]
        public async Task<IActionResult> Benim([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 5)
            => Ok(await _service.GetDoktorAmeliyatlariAsync(AktifKullaniciId, pageIndex, pageSize));

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Personel,Doktor")]
        public async Task<IActionResult> Detay(int id)
        {
            var a = await _service.GetByIdAsync(id);
            return a == null ? NotFound(new { message = "Ameliyat bulunamadı." }) : Ok(a);
        }

        [HttpGet("ameliyathaneler")]
        [Authorize(Roles = "Admin,Personel,Doktor")]
        public async Task<IActionResult> Ameliyathaneler()
            => Ok(await _service.GetAmeliyathanelerAsync());

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Sil(int id)
        {
            var ok = await _service.SilAsync(id);
            return ok ? Ok(new { message = "Ameliyat silindi." }) : NotFound(new { message = "Ameliyat bulunamadı." });
        }
    }
}