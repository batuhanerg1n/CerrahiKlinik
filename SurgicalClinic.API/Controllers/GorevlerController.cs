using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurgicalClinic.BusinessLogicLayer.DTOs;
using SurgicalClinic.BusinessLogicLayer.Services.Abstract;
using SurgicalClinic.Entities.Enums;
using System.Security.Claims;

namespace SurgicalClinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GorevlerController : ControllerBase
    {
        private readonly IGorevService _gorevService;
        public GorevlerController(IGorevService gorevService) => _gorevService = gorevService;

        private int AktifKullaniciId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Olustur([FromBody] GorevOlusturDto dto)
        {
            var (success, message) = await _gorevService.GorevOlusturAsync(dto);
            if (!success) return BadRequest(new { message });
            return Ok(new { message });
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Tumu([FromQuery] int? personelId, [FromQuery] GorevDurumu? durum,
            [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 5)
        {
            var result = await _gorevService.GetTumGorevlerAsync(personelId, durum, pageIndex, pageSize);
            return Ok(result);
        }

        [HttpGet("benim")]
        [Authorize(Roles = "Personel")]
        public async Task<IActionResult> Benim([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 5)
        {
            var result = await _gorevService.GetGorevlerimAsync(AktifKullaniciId, pageIndex, pageSize);
            return Ok(result);
        }

        [HttpPut("{id}/tamamla")]
        [Authorize(Roles = "Personel")]
        public async Task<IActionResult> Tamamla(int id, [FromBody] GorevNotDto? dto)
        {
            var (success, message) = await _gorevService.GorevTamamlaAsync(id, AktifKullaniciId, dto?.Not);
            if (!success) return BadRequest(new { message });
            return Ok(new { message });
        }

        [HttpPut("{id}/iptal")]
        [Authorize(Roles = "Personel")]
        public async Task<IActionResult> Iptal(int id, [FromBody] GorevNotDto? dto)
        {
            var (success, message) = await _gorevService.GorevIptalAsync(id, AktifKullaniciId, dto?.Not);
            if (!success) return BadRequest(new { message });
            return Ok(new { message });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Sil(int id)
        {
            var success = await _gorevService.GorevSilAsync(id);
            if (!success) return NotFound(new { message = "Görev bulunamadı." });
            return Ok(new { message = "Görev silindi." });
        }
    }
}