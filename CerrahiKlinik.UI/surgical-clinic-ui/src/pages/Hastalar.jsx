import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import {
  Plus, Search, X, Save, Users, Phone, Calendar, User, Edit3,
  ChevronLeft, ChevronRight, Clock, Stethoscope, Activity
} from 'lucide-react';

const DURUM_BILGI = {
  1: { ad: 'Beklemede', renk: 'bg-amber-100 text-amber-700' },
  2: { ad: 'Onaylandı', renk: 'bg-blue-100 text-blue-700' },
  3: { ad: 'Tamamlandı', renk: 'bg-emerald-100 text-emerald-700' },
  4: { ad: 'İptal', renk: 'bg-rose-100 text-rose-700' }
};

export default function Hastalar() {
  const [hastalar, setHastalar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [modalAcik, setModalAcik] = useState(false);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [editId, setEditId] = useState(null);
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [telefon, setTelefon] = useState('');
  const [dogumTarihi, setDogumTarihi] = useState('');
  const [notlar, setNotlar] = useState('');

  const [detayHasta, setDetayHasta] = useState(null);
  const [gecmis, setGecmis] = useState([]);
  const [gecmisLoading, setGecmisLoading] = useState(false);

  useEffect(() => {
    fetchHastalar();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchHastalar = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/PersonelPanel/hastalar');
      setHastalar(res.data || []);
    } catch (err) {
      console.error('Hastalar çekilemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAd(''); setSoyad(''); setTelefon(''); setDogumTarihi(''); setNotlar('');
  };

  const acModal = () => { resetForm(); setEditId(null); setModalAcik(true); };

  const acDuzenleModal = (h) => {
    setEditId(h.id);
    setAd(h.ad || '');
    setSoyad(h.soyad || '');
    setTelefon(h.telefon || '');
    setDogumTarihi(h.dogumTarihi ? h.dogumTarihi.split('T')[0] : '');
    setNotlar(h.notlar || '');
    setModalAcik(true);
  };

  const kapatModal = () => { setModalAcik(false); setEditId(null); resetForm(); };

  const acDetayModal = async (h) => {
    setDetayHasta(h);
    setGecmis([]);
    setGecmisLoading(true);
    try {
      const res = await axiosInstance.get(`/PersonelPanel/hastalar/${h.id}/randevular`);
      setGecmis(res.data || []);
    } catch (err) {
      console.error('Geçmiş çekilemedi:', err);
      toast.error('Geçmiş randevular yüklenemedi.');
    } finally {
      setGecmisLoading(false);
    }
  };

  const handleKaydet = async () => {
    if (!ad.trim() || !soyad.trim()) { toast.error('Ad ve soyad zorunludur.'); return; }
    if (!telefon.trim()) { toast.error('Telefon zorunludur.'); return; }

    const payload = {
      id: editId || 0,
      ad: ad.trim(),
      soyad: soyad.trim(),
      telefon: telefon.trim(),
      dogumTarihi: dogumTarihi ? `${dogumTarihi}T00:00:00` : null,
      notlar: notlar.trim()
    };

    try {
      setKaydediyor(true);
      await axiosInstance.post('/PersonelPanel/hastalar', payload);
      toast.success(editId ? 'Hasta güncellendi.' : 'Hasta eklendi.');
      kapatModal();
      fetchHastalar();
    } catch (err) {
      console.error('Hasta kaydedilemedi:', err);
      toast.error('Hasta kaydedilirken hata oluştu.');
    } finally {
      setKaydediyor(false);
    }
  };

  const formatMoney = (a) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(a || 0);

  const filtered = hastalar.filter(h => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      h.ad?.toLowerCase().includes(q) ||
      h.soyad?.toLowerCase().includes(q) ||
      h.telefon?.includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentHastalar = filtered.slice(indexOfFirst, indexOfLast);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-slate-700" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Hastalar</h1>
            <p className="text-sm text-slate-500">Hasta kayıtlarını görüntüleyin ve yönetin.</p>
          </div>
        </div>
        <button
          onClick={acModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm transition"
        >
          <Plus className="w-5 h-5" /> Yeni Hasta
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Hasta adı veya telefon ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-10">Yükleniyor...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
          {searchQuery ? 'Aramayla eşleşen hasta yok.' : 'Henüz hasta kaydı yok.'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentHastalar.map(h => (
              <div
                key={h.id}
                onClick={() => acDetayModal(h)}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    {h.ad?.charAt(0) || <User className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{h.ad} {h.soyad}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" /> {h.telefon}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); acDuzenleModal(h); }}
                    className="ml-auto p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Düzenle"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                {h.dogumTarihi && new Date(h.dogumTarihi).getFullYear() > 1900 && (
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(h.dogumTarihi).toLocaleDateString('tr-TR')}
                  </p>
                )}
                {h.notlar && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{h.notlar}</p>}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => setCurrentPage(number)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === number
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {modalAcik && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="font-bold text-slate-800 text-lg">{editId ? 'Hastayı Düzenle' : 'Yeni Hasta Ekle'}</h3>
              <button onClick={kapatModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Ad</label>
                  <input type="text" value={ad} onChange={(e) => setAd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Soyad</label>
                  <input type="text" value={soyad} onChange={(e) => setSoyad(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Telefon</label>
                <input type="text" value={telefon} onChange={(e) => setTelefon(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Doğum Tarihi</label>
                <input type="date" value={dogumTarihi} onChange={(e) => setDogumTarihi(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Notlar (opsiyonel)</label>
                <textarea rows="3" value={notlar} onChange={(e) => setNotlar(e.target.value)}
                  placeholder="Hasta ile ilgili notlar..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={kapatModal}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                  Vazgeç
                </button>
                <button onClick={handleKaydet} disabled={kaydediyor}
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {kaydediyor ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {detayHasta && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDetayHasta(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-start sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                  {detayHasta.ad?.charAt(0) || <User className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{detayHasta.ad} {detayHasta.soyad}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {detayHasta.telefon}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { const h = detayHasta; setDetayHasta(null); acDuzenleModal(h); }}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Düzenle"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => setDetayHasta(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 gap-3 mb-5">
                {detayHasta.dogumTarihi && new Date(detayHasta.dogumTarihi).getFullYear() > 1900 && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-0.5">Doğum Tarihi</p>
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(detayHasta.dogumTarihi).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                )}
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-0.5">Toplam Randevu</p>
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> {gecmis.length} randevu
                  </p>
                </div>
              </div>

              {detayHasta.notlar && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-5">
                  <p className="text-xs text-amber-600 font-semibold mb-0.5">Not</p>
                  <p className="text-sm text-slate-700">{detayHasta.notlar}</p>
                </div>
              )}

              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Randevu Geçmişi
              </h4>

              {gecmisLoading ? (
                <p className="text-center text-slate-400 py-6 text-sm">Yükleniyor...</p>
              ) : gecmis.length === 0 ? (
                <div className="bg-slate-50 rounded-lg p-6 text-center text-slate-400 text-sm">
                  Bu hastanın henüz randevusu yok.
                </div>
              ) : (
                <div className="space-y-2">
                  {gecmis.map(r => {
                    const durum = DURUM_BILGI[r.durum] || DURUM_BILGI[1];
                    return (
                      <div key={r.id} className="border border-slate-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-semibold text-slate-800">{r.islemAd}</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${durum.renk}`}>
                            {durum.ad}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Stethoscope className="w-3 h-3" /> {r.doktorUnvan} {r.doktorAd} {r.doktorSoyad}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {new Date(r.tarih).toLocaleDateString('tr-TR')}
                            {r.saat && ` - ${r.saat.substring(0, 5)}`}
                          </span>
                          {r.islemFiyat > 0 && (
                            <span className="text-xs font-bold text-slate-700">{formatMoney(r.islemFiyat)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}