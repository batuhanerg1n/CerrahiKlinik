using Microsoft.AspNetCore.Mvc;
using SurgicalClinic.BusinessLogicLayer.Services.Abstract;
using SurgicalClinic.Entities.Enums;
using System.Security.Claims;

namespace SurgicalClinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("ozet")]
        public async Task<IActionResult> GetOzet()
        {
            var result = await _dashboardService.GetOzetAsync();
            return Ok(result);
        }

        [HttpGet("aylik-performans")]
        public async Task<IActionResult> GetAylikPerformans([FromQuery] int? yil, [FromQuery] int? ay)
        {
            var result = await _dashboardService.GetAylikPerformansAsync(yil, ay);
            return Ok(result);
        }

        [HttpGet("randevu-kaynaklari")]
        public async Task<IActionResult> GetRandevuKaynaklari()
        {
            var result = await _dashboardService.GetRandevuKaynaklariAsync();
            return Ok(result);
        }

        [HttpGet("son-randevular")]
        public async Task<IActionResult> GetSonRandevular([FromQuery] int limit = 5)
        {
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            var currentRole = Rol.Ziyaretci;

            if (!string.IsNullOrEmpty(roleClaim) && Enum.TryParse<Rol>(roleClaim, out var parsedRole))
            {
                currentRole = parsedRole;
            }
            var result = await _dashboardService.GetSonRandevuAsync(currentRole, limit);
            return Ok(result);
        }
    }
}
