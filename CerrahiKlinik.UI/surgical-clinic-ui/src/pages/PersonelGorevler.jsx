import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import { ClipboardList, Clock, CheckCircle2, Hourglass, Check } from 'lucide-react';

const fmt = (d) =>
  new Date(d).toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

export default function PersonelGorevler() {
  const [gorevler, setGorevler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmData, setConfirmData] = useState(null);

  useEffect(() => { fetchGorevlerim(); }, []);

  const fetchGorevlerim = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/Gorevler/benim');
      setGorevler(res.data || []);
    } catch (err) {
      console.error('Görevler çekilemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTamamla = (g) => {
    setConfirmData({
      baslik: 'Görevi Tamamla',
      mesaj: `"${g.baslik}" görevini tamamladınız mı?`,
      onaylaText: 'Evet, Tamamladım',
      onConfirm: () => gorevTamamla(g.id)
    });
  };

  const gorevTamamla = async (id) => {
    try {
      await axiosInstance.put(`/Gorevler/${id}/tamamla`);
      toast.success('Görev tamamlandı.');
      fetchGorevlerim();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Görev tamamlanamadı.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="w-6 h-6 text-slate-700" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Görevlerim</h1>
          <p className="text-sm text-slate-500">Size atanan görevleri görüntüleyin ve tamamlayın.</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-10">Yükleniyor...</p>
      ) : gorevler.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
          Size atanmış görev yok.
        </div>
      ) : (
        <div className="space-y-3">
          {gorevler.map(g => (
            <div key={g.id}
              className={`bg-white rounded-xl border shadow-sm p-5 flex justify-between items-start gap-4 ${
                g.durum === 2 ? 'border-emerald-200' : 'border-slate-200'
              }`}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-slate-800">{g.baslik}</h3>
                  {g.durum === 2
                    ? <span className="text-[11px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Tamamlandı</span>
                    : <span className="text-[11px] bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-bold flex items-center gap-1"><Hourglass className="w-3 h-3" /> Bekliyor</span>}
                </div>
                {g.aciklama && <p className="text-sm text-slate-500 mb-2">{g.aciklama}</p>}
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {fmt(g.baslangicZamani)}{g.bitisZamani ? ` — ${fmt(g.bitisZamani)}` : ''}
                </div>
              </div>
              {g.durum !== 2 && (
                <button onClick={() => handleTamamla(g)}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 shadow-sm transition shrink-0">
                  <Check className="w-4 h-4" /> Tamamladım
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal data={confirmData} onClose={() => setConfirmData(null)} />
    </div>
  );
}