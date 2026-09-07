import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import jsPDF from 'jspdf';
import {
  Calendar, Clock, User, Phone, CheckCircle, Stethoscope, Activity,
  CreditCard, ArrowLeft, ArrowRight, X, PartyPopper, Download} from 'lucide-react';

const MESAI_SAATLERI = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

const bosForm = {
  hastaAd: '', hastaSoyad: '', hastaTcNo: '', hastaTelefon: '',
  islemId: '', islemSecenekId: '', doktorId: '', tarih: '', saat: '', hastaNotu: ''
};

export default function PublicHome() {
  const [doktorlar, setDoktorlar] = useState([]);
  const [islemler, setIslemler] = useState([]);
  const [doluSaatler, setDoluSaatler] = useState([]);
  const [minTarih, setMinTarih] = useState('');

  const [modalAcik, setModalAcik] = useState(false);
  const [adim, setAdim] = useState(1);          
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [basarili, setBasarili] = useState(false);
  const [randevuSonuc, setRandevuSonuc] = useState(null);

  const [formData, setFormData] = useState(bosForm);

  useEffect(() => {
    const fetchIslemler = async () => {
      try {
        const res = await axiosInstance.get('/Public/islem');
        setIslemler(res.data || []);
      } catch (err) {
        console.error('İşlemler çekilemedi:', err);
      }
    };
    fetchIslemler();

    const bugun = new Date();
    setMinTarih(bugun.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    const fetchDoluSaatler = async () => {
      if (!formData.doktorId || !formData.tarih) {
        setDoluSaatler([]);
        return;
      }
      try {
        const res = await axiosInstance.get('/Public/dolu-saatler', {
          params: { doktorId: parseInt(formData.doktorId), tarih: formData.tarih }
        });
        setDoluSaatler((res.data || []).map(s => s.substring(0, 5)));
      } catch (err) {
        console.error('Dolu saatler çekilemedi:', err);
        setDoluSaatler([]);
      }
    };
    fetchDoluSaatler();
  }, [formData.doktorId, formData.tarih]);

  const fetchDoktorlarByBrans = async (bransId) => {
    try {
      const url = bransId ? `/Public/doktorlar?bransId=${bransId}` : '/Public/doktorlar';
      const res = await axiosInstance.get(url);
      setDoktorlar(res.data || []);
    } catch (err) {
      console.error('Doktorlar çekilemedi:', err);
      setDoktorlar([]);
    }
  };

  const seciliIslem = islemler.find(i => i.id === parseInt(formData.islemId));
  const seciliSecenek = seciliIslem?.secenekler?.find(s => s.id === parseInt(formData.islemSecenekId));
  const seciliDoktorObj = doktorlar.find(d => d.id === parseInt(formData.doktorId));
  const gosterilecekFiyat = seciliIslem
    ? (seciliIslem.fiyatTipi === 2 ? (seciliSecenek?.fiyat ?? null) : seciliIslem.fiyat)
    : null;

  const formatMoney = (a) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(a || 0);

  const saatDurumu = (saat) => {
    if (doluSaatler.includes(saat)) return { disabled: true, etiket: 'Dolu' };
    const bugunStr = new Date().toISOString().split('T')[0];
    if (formData.tarih === bugunStr) {
      const suAn = new Date();
      const [ss, dd] = saat.split(':').map(Number);
      if (ss < suAn.getHours() || (ss === suAn.getHours() && dd <= suAn.getMinutes())) {
        return { disabled: true, etiket: 'Geçti' };
      }
    }
    return { disabled: false, etiket: '' };
  };

  const setField = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  const handleIslemChange = (value) => {
    setFormData(prev => ({ ...prev, islemId: value, islemSecenekId: '', doktorId: '', tarih: '', saat: '' }));
    const secilen = islemler.find(i => i.id === parseInt(value));
    fetchDoktorlarByBrans(secilen?.bransId);
  };

  const handleDoktorChange = (value) => {
    setFormData(prev => ({ ...prev, doktorId: value, tarih: '', saat: '' }));
  };

  const handleTarihChange = (value) => {
    setFormData(prev => ({ ...prev, tarih: value, saat: '' }));
  };

  const modalAc = () => {
    setFormData(bosForm);
    setAdim(1);
    setErrorMsg('');
    setBasarili(false);
    setModalAcik(true);
  };
  const modalKapat = () => {
    setModalAcik(false);
    setErrorMsg('');
  };

  const adim1Ileri = () => {
    setErrorMsg('');
    if (!formData.hastaAd.trim() || !formData.hastaSoyad.trim()) {
      setErrorMsg('Ad ve soyad zorunludur.'); return;
    }
    if (!/^\d{11}$/.test(formData.hastaTcNo)) {
      setErrorMsg('TC Kimlik No 11 haneli olmalıdır.'); return;
    }
    if (!formData.hastaTelefon.trim()) {
      setErrorMsg('Telefon numarası zorunludur.'); return;
    }
    setAdim(2);
  };

  const pdfIndir = () => {
    const doc = new jsPDF();
    const tr = (s) => String(s || '')
      .replace(/ş/g,'s').replace(/Ş/g,'S').replace(/ğ/g,'g').replace(/Ğ/g,'G')
      .replace(/ı/g,'i').replace(/İ/g,'I').replace(/ç/g,'c').replace(/Ç/g,'C')
      .replace(/ö/g,'o').replace(/Ö/g,'O').replace(/ü/g,'u').replace(/Ü/g,'U');
    const hastaAdSoyad = `${formData.hastaAd} ${formData.hastaSoyad}`;
    const tarihStr = new Date(formData.tarih).toLocaleDateString('tr-TR');
    const doktorAd = seciliDoktorObj ? `${seciliDoktorObj.unvan || ''} ${seciliDoktorObj.ad} ${seciliDoktorObj.soyad}` : '';
    const bransAd = randevuSonuc?.bransAd || seciliIslem?.ad || '';
    const referans = randevuSonuc?.referansNo || '';

    doc.setFontSize(18); doc.setTextColor(37,99,235);
    doc.text(tr('SurgicalClinic - Randevu Ozeti'), 20, 25);
    doc.setDrawColor(37,99,235); doc.line(20, 30, 190, 30);

    doc.setFontSize(12); doc.setTextColor(30,41,59);
    let y = 45;
    const satir = (label, deger) => {
      doc.setFont(undefined,'bold'); doc.text(tr(label), 20, y);
      doc.setFont(undefined,'normal'); doc.text(tr(deger), 75, y);
      y += 12;
    };
    satir('Sayin:', hastaAdSoyad);
    satir('Tarih / Saat:', `${tarihStr} / ${formData.saat}`);
    satir('Poliklinik:', `${bransAd} Poliklinigi`);
    satir('Hekim:', doktorAd);
    satir('Referans No:', referans);

    y += 8; doc.setFontSize(11); doc.setTextColor(16,185,129);
    doc.text(tr('Randevunuz basariyla olusturuldu.'), 20, y);
    y += 8; doc.setTextColor(100,116,139); doc.setFontSize(10);
    doc.text(tr('Randevunuzdan 15 dk once hastanemizde olmaniz onerilir.'), 20, y);
    doc.save(`randevu-${referans || 'ozet'}.pdf`);
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!formData.islemId) { setErrorMsg('Lütfen işlem seçiniz.'); return; }
    if (seciliIslem?.fiyatTipi === 2 && !formData.islemSecenekId) {
      setErrorMsg('Lütfen bir seçenek belirleyiniz.'); return;
    }
    if (!formData.doktorId) { setErrorMsg('Lütfen hekim seçiniz.'); return; }
    if (!formData.tarih) { setErrorMsg('Lütfen tarih seçiniz.'); return; }
    if (!formData.saat) { setErrorMsg('Lütfen saat seçiniz.'); return; }

    setLoading(true);
    try {
      const payload = {
        hastaAd: formData.hastaAd.trim(),
        hastaSoyad: formData.hastaSoyad.trim(),
        hastaTcNo: formData.hastaTcNo,
        hastaTelefon: formData.hastaTelefon.trim(),
        doktorId: parseInt(formData.doktorId),
        islemId: parseInt(formData.islemId),
        islemSecenekId: formData.islemSecenekId ? parseInt(formData.islemSecenekId) : null,
        tarih: `${formData.tarih}T00:00:00.000Z`,
        saat: `${formData.saat}:00`,
        hastaNotu: formData.hastaNotu
      };
      const res = await axiosInstance.post('/Public/online-randevu', payload);
      setRandevuSonuc(res.data);
      setBasarili(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Randevu oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <Stethoscope className="w-7 h-7" />
            <span>SurgicalClinic</span>
          </div>
          <a href="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition">
            Personel Girişi
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-6">
            <Calendar className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-3">Sağlığınız İçin Buradayız</h1>
          <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
            Uzman hekimlerimizden kolayca online randevu alın. Birkaç adımda randevunuz hazır.
          </p>
          <button
            onClick={modalAc}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition"
          >
            <Calendar className="w-5 h-5" /> Randevu Al
          </button>
        </div>

        {islemler.length > 0 && (
          <div className="mt-16">
            <h2 className="text-center text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Hizmetlerimiz</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {islemler.slice(0, 8).map(i => (
                <div key={i.id} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                  <Activity className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">{i.ad}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {modalAcik && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

            {basarili ? (
              <div className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                    <PartyPopper className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Randevunuz Oluşturuldu!</h3>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Sayın</span><span className="font-semibold text-slate-800">{formData.hastaAd} {formData.hastaSoyad}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Tarih / Saat</span><span className="font-semibold text-slate-800">{new Date(formData.tarih).toLocaleDateString('tr-TR')} / {formData.saat}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Poliklinik</span><span className="font-semibold text-slate-800">{randevuSonuc?.bransAd || seciliIslem?.ad} Polikliniği</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Hekim</span><span className="font-semibold text-slate-800">{seciliDoktorObj?.unvan} {seciliDoktorObj?.ad} {seciliDoktorObj?.soyad}</span></div>
                  <div className="flex justify-between border-t border-slate-200 pt-3"><span className="text-slate-500">Referans No</span><span className="font-bold text-blue-600">{randevuSonuc?.referansNo}</span></div>
                </div>
                <p className="text-xs text-slate-500 text-center mt-4">Randevunuzdan <b>15 dk önce</b> hastanemizde olmanız önerilir.</p>
                <div className="flex gap-3 mt-6">
                  <button onClick={pdfIndir} className="flex-1 py-2.5 rounded-lg border border-blue-200 text-blue-700 font-bold hover:bg-blue-50 flex items-center justify-center gap-2 transition"><Download className="w-4 h-4" /> PDF İndir</button>
                  <button onClick={modalKapat} className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">Tamam</button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Online Randevu</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Adım {adim} / 2</p>
                  </div>
                  <button onClick={modalKapat} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="h-1 bg-slate-100">
                  <div className="h-full bg-blue-600 transition-all" style={{ width: adim === 1 ? '50%' : '100%' }} />
                </div>

                <div className="p-5">
                  {errorMsg && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
                      {errorMsg}
                    </div>
                  )}

                  {adim === 1 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-4 h-4" /> Kişisel Bilgiler
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-1">Ad</label>
                          <input type="text" value={formData.hastaAd} onChange={(e) => setField('hastaAd', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-1">Soyad</label>
                          <input type="text" value={formData.hastaSoyad} onChange={(e) => setField('hastaSoyad', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1 flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5" /> TC Kimlik No
                        </label>
                        <input type="text" inputMode="numeric" maxLength={11} value={formData.hastaTcNo}
                          onChange={(e) => setField('hastaTcNo', e.target.value.replace(/\D/g, ''))}
                          placeholder="11 haneli TC kimlik numaranız"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" /> Telefon
                        </label>
                        <input type="tel" value={formData.hastaTelefon} onChange={(e) => setField('hastaTelefon', e.target.value)}
                          placeholder="05XX XXX XX XX"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>

                      <button onClick={adim1Ileri}
                        className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 transition">
                        Devam <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {adim === 2 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Randevu Detayları
                      </h4>

                      <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">İşlem</label>
                        <select value={formData.islemId} onChange={(e) => handleIslemChange(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                          <option value="">-- İşlem Seçiniz --</option>
                          {islemler.map(i => (
                            <option key={i.id} value={i.id}>
                              {i.ad}
                            </option>
                          ))}
                        </select>
                      </div>

                      {seciliIslem?.fiyatTipi === 2 && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-1">Seçenek</label>
                          <select value={formData.islemSecenekId} onChange={(e) => setField('islemSecenekId', e.target.value)}
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                            <option value="">-- Seçenek Belirleyiniz --</option>
                            {seciliIslem.secenekler.map(s => (
                              <option key={s.id} value={s.id}>{s.secenekAd}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {formData.islemId && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-1">Hekim</label>
                          <select value={formData.doktorId} onChange={(e) => handleDoktorChange(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="">-- Hekim Seçiniz --</option>
                            {doktorlar.map(d => (
                              <option key={d.id} value={d.id}>{d.unvan} {d.ad} {d.soyad}</option>
                            ))}
                          </select>
                          {doktorlar.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1">Bu işlem için uygun hekim bulunamadı.</p>
                          )}
                        </div>
                      )}

                      {formData.doktorId && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-1 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> Tarih
                          </label>
                          <input type="date" min={minTarih} value={formData.tarih}
                            onChange={(e) => handleTarihChange(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                      )}

                      {formData.tarih && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Saat
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {MESAI_SAATLERI.map(s => {
                              const durum = saatDurumu(s);
                              const secili = formData.saat === s;
                              return (
                                <button key={s} type="button" disabled={durum.disabled}
                                  onClick={() => setField('saat', s)}
                                  className={`py-2 rounded-lg text-xs font-medium transition flex flex-col items-center ${
                                    durum.disabled ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                    : secili ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
                                  }`}>
                                  <span className={durum.disabled ? 'line-through' : ''}>{s}</span>
                                  {durum.etiket && <span className="text-[9px] mt-0.5">{durum.etiket}</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {formData.saat && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-1">Not (opsiyonel)</label>
                          <textarea rows="2" value={formData.hastaNotu} onChange={(e) => setField('hastaNotu', e.target.value)}
                            placeholder="Eklemek istedikleriniz..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button onClick={() => { setAdim(1); setErrorMsg(''); }}
                          className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 flex items-center justify-center gap-2">
                          <ArrowLeft className="w-4 h-4" /> Geri
                        </button>
                        <button onClick={handleSubmit} disabled={loading}
                          className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50">
                          {loading ? 'Gönderiliyor...' : 'Randevu Al'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}