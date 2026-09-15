import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import {
  Plus, Trash2, X, Save, ClipboardList, Clock, User, CheckCircle2, Hourglass
} from 'lucide-react';

const fmt = (d) =>
  new Date(d).toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

export default function Gorevler() {
  const [gorevler, setGorevler] = useState([]);
  const [personeller, setPersoneller] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAcik, setModalAcik] = useState(false);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [filtreDurum, setFiltreDurum] = useState('');

  const [baslik, setBaslik] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [atananPersonelId, setAtananPersonelId] = useState('');
  const [baslangicZamani, setBaslangicZamani] = useState('');
  const [bitisZamani, setBitisZamani] = useState('');

  useEffect(() => { fetchGorevler(); }, [filtreDurum]);
  useEffect(() => { fetchPersoneller(); }, []);

  const fetchGorevler = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/Gorevler', {
        params: filtreDurum ? { durum: filtreDurum } : {}
      });
      setGorevler(res.data || []);
    } catch (err) {
      console.error('Görevler çekilemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersoneller = async () => {
    try {
      const res = await axiosInstance.get('/PersonelPanel/kullanicilar');
      setPersoneller((res.data || []).filter(k => k.rol === 2)); // sadece Personel
    } catch (err) {
      console.error('Personeller çekilemedi:', err);
    }
  };

  const resetForm = () => {
    setBaslik(''); setAciklama(''); setAtananPersonelId('');
    setBaslangicZamani(''); setBitisZamani('');
  };
  const acModal = () => { resetForm(); setModalAcik(true); };
  const kapatModal = () => { setModalAcik(false); resetForm(); };

  const handleKaydet = async () => {
    if (!baslik.trim()) { toast.error('Görev başlığı zorunludur.'); return; }
    if (!atananPersonelId) { toast.error('Personel seçmelisiniz.'); return; }
    if (!baslangicZamani) { toast.error('Başlangıç zamanı zorunludur.'); return; }
    if (bitisZamani && bitisZamani < baslangicZamani) {
      toast.error('Bitiş zamanı başlangıçtan önce olamaz.'); return;
    }

    const payload = {
      baslik: baslik.trim(),
      aciklama: aciklama.trim() || null,
      atananPersonelId: Number(atananPersonelId),
      baslangicZamani,
      bitisZamani: bitisZamani || null
    };

    try {
      setKaydediyor(true);
      await axiosInstance.post('/Gorevler', payload);
      toast.success('Görev atandı.');
      kapatModal();
      fetchGorevler();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Görev atanırken hata oluştu.');
    } finally {
      setKaydediyor(false);
    }
  };

  const handleSil = (g) => {
    setConfirmData({
      baslik: 'Görevi Sil',
      mesaj: `"${g.baslik}" görevini silmek istediğinize emin misiniz?`,
      onaylaText: 'Evet, Sil',
      onConfirm: () => gorevSil(g.id)
    });
  };

  const gorevSil = async (id) => {
    try {
      await axiosInstance.delete(`/Gorevler/${id}`);
      toast.success('Görev silindi.');
      fetchGorevler();
    } catch {
      toast.error('Görev silinemedi.');
    }
  };

  const durumBadge = (durum) =>
    durum === 2
      ? <span className="text-[11px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Tamamlandı</span>
      : <span className="text-[11px] bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-bold flex items-center gap-1"><Hourglass className="w-3 h-3" /> Bekliyor</span>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-slate-700" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Görevler</h1>
            <p className="text-sm text-slate-500">Personele görev atayın ve takip edin.</p>
          </div>
        </div>
        <button onClick={acModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm transition">
          <Plus className="w-5 h-5" /> Yeni Görev
        </button>
      </div>

      {/* Filtre */}
      <div className="flex gap-2 mb-4">
        {[['', 'Tümü'], ['1', 'Bekleyen'], ['2', 'Tamamlanan']].map(([val, label]) => (
          <button key={val} onClick={() => setFiltreDurum(val)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
              filtreDurum === val ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-10">Yükleniyor...</p>
      ) : gorevler.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
          Görev yok.
        </div>
      ) : (
        <div className="space-y-3">
          {gorevler.map(g => (
            <div key={g.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-slate-800">{g.baslik}</h3>
                  {durumBadge(g.durum)}
                </div>
                {g.aciklama && <p className="text-sm text-slate-500 mb-2">{g.aciklama}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {g.personelAdi}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />
                    {fmt(g.baslangicZamani)}{g.bitisZamani ? ` — ${fmt(g.bitisZamani)}` : ''}
                  </span>
                </div>
              </div>
              <button onClick={() => handleSil(g)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Sil">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Atama Popup */}
      {modalAcik && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="font-bold text-slate-800 text-lg">Yeni Görev Ata</h3>
              <button onClick={kapatModal} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Personel</label>
                <select value={atananPersonelId} onChange={(e) => setAtananPersonelId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Personel seçin...</option>
                  {personeller.map(p => (
                    <option key={p.id} value={p.id}>{p.ad} {p.soyad}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Başlık</label>
                <input type="text" value={baslik} onChange={(e) => setBaslik(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Açıklama (not)</label>
                <textarea value={aciklama} onChange={(e) => setAciklama(e.target.value)} rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Başlangıç</label>
                  <input type="datetime-local" value={baslangicZamani} onChange={(e) => setBaslangicZamani(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Bitiş <span className="text-slate-400 font-normal">(opsiyonel)</span></label>
                  <input type="datetime-local" value={bitisZamani} onChange={(e) => setBitisZamani(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={kapatModal}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Vazgeç</button>
                <button onClick={handleKaydet} disabled={kaydediyor}
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {kaydediyor ? 'Atanıyor...' : 'Ata'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal data={confirmData} onClose={() => setConfirmData(null)} />
    </div>
  );
}