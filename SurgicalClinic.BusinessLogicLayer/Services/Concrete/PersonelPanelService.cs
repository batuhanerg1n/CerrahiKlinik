using Microsoft.EntityFrameworkCore;
using SurgicalClinic.BusinessLogicLayer.DTOs;
using SurgicalClinic.BusinessLogicLayer.Services.Abstract;
using SurgicalClinic.DataAccessLayer.Abstract;
using SurgicalClinic.DataAccessLayer.Concrete;
using SurgicalClinic.Entities.Concrete;
using SurgicalClinic.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BCrypt.Net;

namespace SurgicalClinic.BusinessLogicLayer.Services.Concrete
{
    public class PersonelPanelService : IPersonelPanelService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PersonelPanelService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<BransDto> BransEkleAsync(string ad)
        {
            var bransRepo = _unitOfWork.GetRepository<Brans>();
            var yeniBrans = new Brans { Ad = ad };
            await bransRepo.AddAsync(yeniBrans);
            await _unitOfWork.SaveChangeAsync();

            return new BransDto { Id = yeniBrans.Id, Ad = yeniBrans.Ad };
        }

        public async Task<bool> BransSilAsync(int bransId)
        {
            var bransRepo = _unitOfWork.GetRepository<Brans>();
            var brans = await bransRepo.GetByIdAsync(bransId);
            if (brans == null) return false;

            bransRepo.Remove(brans);
            await _unitOfWork.SaveChangeAsync();
            return true;
        }

        public async Task<(bool Success, string Message)> DoktorGuncelleAsync(int doktorId, DoktorGuncelleDto dto)
        {
            var doktorRepo = _unitOfWork.GetRepository<Doktor>();
            var doktorBransRepo = _unitOfWork.GetRepository<DoktorBrans>();

            var doktor = await doktorRepo.GetWhere(d => d.Id == doktorId)
                .Include(d => d.DoktorBranslar)
                .FirstOrDefaultAsync();

            if (doktor == null)
                return (false, "Doktor bulunamadı.");

            doktor.Ad = dto.Ad;
            doktor.Soyad = dto.Soyad;
            doktor.Unvan = dto.Unvan;
            doktor.Aciklama = dto.Aciklama;

            foreach (var eski in doktor.DoktorBranslar.ToList())
            {
                doktorBransRepo.Remove(eski);
            }
            foreach (var bransId in dto.BransIds)
            {
                doktor.DoktorBranslar.Add(new DoktorBrans { DoktorId = doktor.Id, BransId = bransId });
            }

            doktorRepo.Update(doktor);
            await _unitOfWork.SaveChangeAsync();

            return (true, "Doktor bilgileri güncellendi.");
        }

        public async Task<(bool Success, string Message)> DoktorOlusturAsync(DoktorOlusturDto dto)
        {
            var kullaniciRepo = _unitOfWork.GetRepository<Kullanici>();
            var doktorRepo = _unitOfWork.GetRepository<Doktor>();

            var emailVar = await kullaniciRepo.GetWhere(k => k.Email == dto.Email).AnyAsync();
            if (emailVar)
                return (false, "Bu email adresi zaten kayıtlı.");

            var kullanici = new Kullanici
            {
                Ad = dto.Ad,
                Soyad = dto.Soyad,
                Email = dto.Email,
                passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Sifre),
                Rol = Rol.Doktor
            };
            await kullaniciRepo.AddAsync(kullanici);
            await _unitOfWork.SaveChangeAsync();

            var doktor = new Doktor
            {
                KullaniciId = kullanici.Id,
                Ad = dto.Ad,
                Soyad = dto.Soyad,
                Unvan = dto.Unvan,
                Aciklama = dto.Aciklama
            };
            foreach (var bransId in dto.BransIds)
            {
                doktor.DoktorBranslar.Add(new DoktorBrans { BransId = bransId });
            }
            await doktorRepo.AddAsync(doktor);
            await _unitOfWork.SaveChangeAsync();

            return (true, "Doktor başarıyla oluşturuldu.");
        }

       

        public async Task<bool> DoktorSilAsync(int doktorId)
        {
            var doktorRepo = _unitOfWork.GetRepository<Doktor>();
            var doktor = await doktorRepo.GetByIdAsync(doktorId);
            if (doktor == null) return false;

            doktorRepo.Remove(doktor);
            await _unitOfWork.SaveChangeAsync();
            return true;
        }

        public async Task<HastaDto?> GetHastaByIdAsync(int id)
        {
            var hastaRepo = _unitOfWork.GetRepository<Hasta>();
            var hasta= await hastaRepo.GetByIdAsync(id);

            return new HastaDto
            {
                Id = hasta.Id,
                Ad = hasta.Ad,
                Soyad = hasta.Soyad,
                DogumTarihi = hasta.DogumTarihi,
                Notlar = hasta.Notlar
            };
        }

        public async Task<IEnumerable<HastaDto>> GetHastalarAsync()
        {
            var hastaRepo= _unitOfWork.GetRepository<Hasta>();
            var hastalar = await hastaRepo.GetAllAsync();

            return hastalar.Select(h => new HastaDto
            {
                Id = h.Id,
                Ad = h.Ad,
                Soyad = h.Soyad,
                Telefon = h.Telefon,
                DogumTarihi = h.DogumTarihi,
                Notlar = h.Notlar
            });
        }

        public async Task<IEnumerable<RandevuDetailDto>> GetHastaRandevulariAsync(int hastaId)
        {
            var randevuRepo = _unitOfWork.GetRepository<Randevu>();
            var randevular = await randevuRepo.GetWhere(r => r.HastaId == hastaId)
                .Include(r => r.Hasta)
                .Include(r => r.Doktor)
                .Include(r => r.Islem)
                .Include(r => r.IslemSecenek)
                .OrderByDescending(r => r.Tarih)
                .ToListAsync();

            return randevular.Select(r => new RandevuDetailDto
            {
                Id = r.Id,
                HastaId = r.HastaId,
                HastaAd = r.Hasta?.Ad ?? "",
                HastaSoyad = r.Hasta?.Soyad ?? "",
                HastaTelefon = r.Hasta?.Telefon ?? "",
                DoktorId = r.DoktorId,
                DoktorAd = r.Doktor?.Ad ?? "",
                DoktorSoyad = r.Doktor?.Soyad ?? "",
                DoktorUnvan = r.Doktor?.Unvan ?? "",
                IslemId = r.IslemId,
                IslemAd = r.Islem?.Ad ?? "",
                IslemFiyat = r.IslemSecenek != null ? r.IslemSecenek.Fiyat : (r.Islem?.Fiyat ?? 0),
                Tarih = r.Tarih,
                Saat = r.Saat,
                Durum = r.Durum,
                Kaynak = r.Kaynak,
                HastaNotu = r.HastaNotu
            });
        }

        public async Task<IEnumerable<KullaniciListeDto>> GetKullanicilarAsync()
        {
            var kullaniciRepo = _unitOfWork.GetRepository<Kullanici>();
            var kullanicilar = await kullaniciRepo
                .GetWhere(k => k.Rol == Rol.Admin || k.Rol == Rol.Personel)
                .ToListAsync();

            return kullanicilar.Select(k => new KullaniciListeDto
            {
                Id = k.Id,
                Ad = k.Ad,
                Soyad = k.Soyad,
                Email = k.Email,
                Rol = (int)k.Rol,
                RolAd = k.Rol.ToString()
            });
        }

        public async Task<PageResultDto<RandevuDetailDto>> GetRandevularAsync(string? query, RandevuDrum? drum, int? doktorId=null, int pageIndex = 1, int PageSize = 10)
        {
            var randevuRepo = _unitOfWork.GetRepository<Randevu>();
            var baseQuery = randevuRepo.GetWhere(r => true)
                .Include(r => r.Hasta)
                .Include(r => r.Doktor)
                .Include(r => r.Islem)
                .Include(r=>r.IslemSecenek)
                .AsQueryable();
            if (drum.HasValue)
            {
                baseQuery =baseQuery.Where(r=>r.Durum == drum.Value);
            }
            if (doktorId.HasValue)
            {
                baseQuery = baseQuery.Where(r => r.Durum == drum.Value);
            }
            if(!string.IsNullOrWhiteSpace(query))
            {
                var q = query.Trim().ToLower();
                baseQuery = baseQuery.Where(r =>
                r.Hasta.Ad.ToLower().Contains(q) || 
                r.Hasta.Soyad.ToLower().Contains(q) || 
                r.Doktor.Ad.ToLower().Contains(q) || 
                r.Doktor.Soyad.ToLower().Contains(q) || 
                r.Islem.Ad.ToLower().Contains(q));
            }
            var totalCount= await baseQuery.CountAsync();
            var items =await baseQuery
                .OrderByDescending( r=>r.Tarih)
                .ThenByDescending(r=>r.Saat)
                .Skip((pageIndex-1)*PageSize)
                .Take(PageSize)
                .ToListAsync();

            var mappedItems = items.Select(r => new RandevuDetailDto
            {
                Id = r.Id,
                HastaId = r.HastaId,
                HastaAd = r.Hasta?.Ad ?? "",
                HastaSoyad = r.Hasta?.Soyad ?? "",
                HastaTelefon = r.Hasta?.Telefon ?? "",

                DoktorId = r.DoktorId,
                DoktorAd = r.Doktor?.Ad ?? "",
                DoktorSoyad = r.Doktor?.Soyad ?? "",
                DoktorUnvan = r.Doktor?.Unvan ?? "",

                IslemId = r.IslemId,
                IslemAd = r.Islem?.Ad ?? "",
                IslemFiyat = r.IslemSecenek != null ? r.IslemSecenek.Fiyat : (r.Islem?.Fiyat ?? 0),
                Tarih = r.Tarih,
                Saat = r.Saat,
                Durum = r.Durum,
                Kaynak = r.Kaynak,
                HastaNotu = r.HastaNotu,
                OlusturmaTarihi = r.OlusturmaTarihi,
                OnayTarihi = r.OnayTarihi
            });
            return new PageResultDto<RandevuDetailDto>
            {
                Items = mappedItems,
                TotalCount = totalCount,
                PageIndex = pageIndex,
                PageSize = PageSize
            };
        }

        public async Task<IEnumerable<TakvimEventDto>> GetTakvimEventAsync(int ay, int yil)
        {
            var randevuRepo = _unitOfWork.GetRepository<Randevu>();

            var randevular = await randevuRepo.GetWhere(r =>
            r.Tarih.Year == yil &&
            r.Tarih.Month == ay)
                .Include(r => r.Hasta)
                .Include(r => r.Doktor)
                .Include(r => r.Islem)
                .ToListAsync();

            return randevular.Select(r => new TakvimEventDto
            {
                RandevuId = r.Id,
                HastaAd = r.Hasta?.Ad ?? "",
                HastaSoyad = r.Hasta?.Soyad ?? "",
                DoktorAd = r.Doktor?.Ad ?? "",
                DoktorSoyad = r.Doktor?.Soyad ?? "",
                IslemAd = r.Islem?.Ad ?? "",
                Tarih = r.Tarih,
                Saat = r.Saat,
                Durum = r.Durum,
                RenkKodu = r.Durum switch
                {
                    RandevuDrum.Beklemede => "#ffc107",
                    RandevuDrum.Onaylandi => "#0d6efd",
                    RandevuDrum.Tamamlandi => "#198754",
                    RandevuDrum.Iptal => "#dc3545",
                    _ => "#6c757d"
                }
            });
        }

        public async Task<IEnumerable<DoktorListeDto>> GetTumDoktorlarAsync()
        {
            var doktorRepo = _unitOfWork.GetRepository<Doktor>();
            var doktorlar = await doktorRepo.GetWhere(d => true)
                .Include(d => d.Kullanici)
                .Include(d => d.DoktorBranslar)
                    .ThenInclude(db => db.Brans)
                .ToListAsync();

            return doktorlar.Select(d => new DoktorListeDto
            {
                Id = d.Id,
                Ad = d.Ad,
                Soyad = d.Soyad,
                Unvan = d.Unvan,
                Aciklama =d.Aciklama,
                Email = d.Kullanici?.Email ?? "",
                Branslar = d.DoktorBranslar.Select(db => db.Brans.Ad).ToList()
            });
        }

        public async Task<IEnumerable<IslemDto>> GetTumIslemlerAsync()
        {
            var islemRepo = _unitOfWork.GetRepository<Islem>();
            var islemler = await islemRepo.GetWhere(i => true)
                .Include( i =>i.Secenekler)
                .Include( i =>i.Brans)
                .ToListAsync();
            return islemler.Select(i => new IslemDto
            {
                Id = i.Id,
                Ad = i.Ad,
                Aciklama = i.Aciklama,
                FiyatTipi = (int)i.FiyatTipi,
                Fiyat = i.Fiyat,
                BransId=i.BransId,
                BransAd = i.Brans?.Ad,
                Secenekler = i.Secenekler.Select(s => new IslemSecenekDto
                {
                    Id = s.Id,
                    SecenekAd = s.SecenekAd,
                    Fiyat = s.Fiyat
                }).ToList()

            });
        }

        public async Task<HastaDto> HastaEkleVeGuncelleAsync(HastaDto dto)
        {
            var hastaRepo = _unitOfWork.GetRepository<Hasta>();

            if (dto.Id == 0)
            {
                var yeniHasta = new Hasta
                {
                    Ad = dto.Ad,
                    Soyad = dto.Soyad,
                    Telefon = dto.Telefon,
                    DogumTarihi = dto.DogumTarihi,
                    Notlar = dto.Notlar
                };
                await hastaRepo.AddAsync(yeniHasta);
                await _unitOfWork.SaveChangeAsync();
                dto.Id = yeniHasta.Id;
            }
            else
            {
                var hasta = await hastaRepo.GetByIdAsync(dto.Id);
                if (hasta != null)
                {
                    hasta.Ad = dto.Ad;
                    hasta.Soyad = dto.Soyad;
                    hasta.Telefon = dto.Telefon;
                    hasta.DogumTarihi = dto.DogumTarihi;
                    hasta.Notlar = dto.Notlar;
                    hastaRepo.Update(hasta);
                    await _unitOfWork.SaveChangeAsync();
                }
            }

            return dto;
        }

        public async Task<IslemDto> IslemEkleAsync(IslemOlusturDto dto)
        {
            var islemRepo = _unitOfWork.GetRepository<Islem>();

            var yeniIslem = new Islem
            {
                Ad = dto.Ad,
                Aciklama = dto.Aciklama,
                FiyatTipi = (FiyatTipi)dto.FiyatTipi,
                Fiyat = dto.FiyatTipi == 1 ? dto.Fiyat : 0,
                BransId = dto.BransId,
                Secenekler = dto.FiyatTipi == 2
                    ? dto.Secenekler.Select(s => new IslemSecenek
                    {
                        SecenekAd = s.SecenekAd,
                        Fiyat = s.Fiyat
                    }).ToList()
                    : new List<IslemSecenek>()
            };

            await islemRepo.AddAsync(yeniIslem);
            await _unitOfWork.SaveChangeAsync();

            return new IslemDto
            {
                Id = yeniIslem.Id,
                Ad = yeniIslem.Ad,
                Aciklama = yeniIslem.Aciklama,
                FiyatTipi = (int)yeniIslem.FiyatTipi,
                Fiyat = yeniIslem.Fiyat,
                Secenekler = yeniIslem.Secenekler.Select(s => new IslemSecenekDto
                {
                    Id = s.Id,
                    SecenekAd = s.SecenekAd,
                    Fiyat = s.Fiyat
                }).ToList()
            };
        }

        public async Task<(bool Success, string Message)> IslemGuncelleAsync(int islemId, IslemGuncelleDto dto)
        {
            var islemRepo = _unitOfWork.GetRepository<Islem>();
            var secenekRepo = _unitOfWork.GetRepository<IslemSecenek>();

            var islem = await islemRepo.GetWhere(i => i.Id == islemId)
                .Include(i => i.Secenekler)
                .FirstOrDefaultAsync();

            if (islem == null)
                return (false, "İşlem bulunamadı.");
            islem.Ad = dto.Ad;
            islem.Aciklama = dto.Aciklama;
            islem.FiyatTipi = (FiyatTipi)dto.FiyatTipi;
            islem.Fiyat = dto.FiyatTipi == 1 ? dto.Fiyat : 0;
            islem.BransId=dto.BransId;

            if (dto.FiyatTipi == 1)
            {
                foreach (var eski in islem.Secenekler.ToList())
                {
                    secenekRepo.Remove(eski);
                }
            }
            else
            {
                var gelenIdler = dto.Secenekler
                    .Where(s => s.Id.HasValue)
                    .Select(s => s.Id.Value)
                    .ToList();

                foreach (var eski in islem.Secenekler.ToList())
                {
                    if (!gelenIdler.Contains(eski.Id))
                        secenekRepo.Remove(eski);
                }

                foreach (var gelen in dto.Secenekler)
                {
                    if (gelen.Id.HasValue)
                    {
                        var mevcut = islem.Secenekler.FirstOrDefault(s => s.Id == gelen.Id.Value);
                        if (mevcut != null)
                        {
                            mevcut.SecenekAd = gelen.SecenekAd;
                            mevcut.Fiyat = gelen.Fiyat;
                        }
                    }
                    else
                    {
                        islem.Secenekler.Add(new IslemSecenek
                        {
                            SecenekAd = gelen.SecenekAd,
                            Fiyat = gelen.Fiyat
                        });
                    }
                }
            }

            islemRepo.Update(islem);

            try
            {
                await _unitOfWork.SaveChangeAsync();
                return (true, "İşlem güncellendi.");
            }
            catch
            {
                return (false, "Randevusu olan bir seçenek silinemez. Önce ilgili randevuları kontrol edin.");
            }
        }

        public async Task<bool> IslemSilAsync(int islemId)
        {
            var islemRepo = _unitOfWork.GetRepository<Islem>();
            var islem = await islemRepo.GetByIdAsync(islemId);
            if (islem == null) return false;

            islemRepo.Remove(islem);   
            await _unitOfWork.SaveChangeAsync();
            return true;
        }

        public async Task<(bool Success, string Message)> KullaniciOlusturAsync(KullaniciOlusturDto dto)
        {
            var kullaniciRepo = _unitOfWork.GetRepository<Kullanici>();

            if (dto.Rol != 1 && dto.Rol != 2)
                return (false, "Geçersiz rol.");

            var emailVar = await kullaniciRepo.GetWhere(k => k.Email == dto.Email).AnyAsync();
            if (emailVar)
                return (false, "Bu email adresi zaten kayıtlı.");

            var kullanici = new Kullanici
            {
                Ad = dto.Ad,
                Soyad = dto.Soyad,
                Email = dto.Email,
                passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Sifre),
                Rol = (Rol)dto.Rol
            };
            await kullaniciRepo.AddAsync(kullanici);
            await _unitOfWork.SaveChangeAsync();

            return (true, "Kullanıcı başarıyla oluşturuldu.");
        }

        public async Task<bool> KullaniciSilAsync(int kullaniciId)
        {
            var kullaniciRepo = _unitOfWork.GetRepository<Kullanici>();
            var kullanici = await kullaniciRepo.GetByIdAsync(kullaniciId);
            if (kullanici == null) return false;

            kullaniciRepo.Remove(kullanici);
            await _unitOfWork.SaveChangeAsync();
            return true;
        }

        public async Task<(bool Success, string Message)> PersonelRandevuOlusturAsync(PersonelRandevuOlusturDto dto)
        {
            var randevuZamani = dto.Tarih.Date.Add(dto.Saat);
            if (randevuZamani < DateTime.Now)
                return (false, "Geçmiş bir tarih veya saate randevu oluşturulamaz.");

            var randevuRepo = _unitOfWork.GetRepository<Randevu>();
            var hastaRepo = _unitOfWork.GetRepository<Hasta>();

            var slotDolumu = await randevuRepo.GetWhere(r =>
                r.DoktorId == dto.DoktorId &&
                r.Tarih.Date == dto.Tarih.Date &&
                r.Saat == dto.Saat &&
                r.Durum != RandevuDrum.Iptal).AnyAsync();

            if (slotDolumu)
                return (false, "Seçilen tarih ve saate doktorun bir randevusu bulunmaktadır.");

            var hasta = await hastaRepo.GetWhere(h => h.Telefon == dto.HastaTelefon).FirstOrDefaultAsync();
            if (hasta == null)
            {
                hasta = new Hasta
                {
                    Ad = dto.HastaAd,
                    Soyad = dto.HastaSoyad,
                    Telefon = dto.HastaTelefon,
                    DogumTarihi = DateTime.MinValue
                };
                await hastaRepo.AddAsync(hasta);
                await _unitOfWork.SaveChangeAsync();
            }

            var yeniRandevu = new Randevu
            {
                HastaId = hasta.Id,
                DoktorId = dto.DoktorId,
                IslemId = dto.IslemId,
                IslemSecenekId = dto.IslemSecenekId,
                Tarih = dto.Tarih.Date,
                Saat = dto.Saat,
                HastaNotu = dto.HastaNotu,
                Durum = RandevuDrum.Beklemede,
                Kaynak = (RandevuKaynak)dto.Kaynak,      
                OlusturmaTarihi = DateTime.UtcNow
            };
            await randevuRepo.AddAsync(yeniRandevu);
            await _unitOfWork.SaveChangeAsync();

            return (true, "Randevu başarıyla oluşturuldu.");
        }

        public async Task<bool> RandevuDurumGuncelleAsync(int randevuId, RandevuDrum yeniDurum)
        {
            var randevuRepo = _unitOfWork.GetRepository<Randevu>();
            var randevu = await randevuRepo.GetByIdAsync(randevuId);

            if (randevu == null) 
                return false;
            randevu.Durum=yeniDurum;
            if(yeniDurum == RandevuDrum.Onaylandi && !randevu.OnayTarihi.HasValue)
            {
                randevu.OnayTarihi= DateTime.UtcNow;
            }
            randevuRepo.Update(randevu);
            await _unitOfWork.SaveChangeAsync();
            return true;
        }

        public async Task<(bool Success, string Message)> RandevuGuncelleAsync(int randevuId, RandevuGuncelleDto dto)
        {
            var randevuRepo = _unitOfWork.GetRepository<Randevu>();
            var randevu = await randevuRepo.GetByIdAsync(randevuId);

            if (randevu == null)
                return (false, "Randevu bulunamadı.");

            if (randevu.Durum == RandevuDrum.Tamamlandi || randevu.Durum == RandevuDrum.Iptal)
                return (false, "Tamamlanmış veya iptal edilmiş randevu düzenlenemez.");

            randevu.DoktorId = dto.DoktorId;
            randevu.IslemId = dto.IslemId;
            randevu.IslemSecenekId = dto.IslemSecenekId;
            randevu.Tarih = dto.Tarih.Date;
            randevu.Saat = dto.Saat;
            randevu.HastaNotu = dto.HastaNotu;

            randevuRepo.Update(randevu);
            await _unitOfWork.SaveChangeAsync();

            return (true, "Randevu güncellendi.");
        }
    }
}
