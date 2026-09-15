import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { ClipboardList, Clock, CheckCircle2, Hourglass, XCircle, Check, X, Ban } from 'lucide-react';

const PAGE_SIZE = 5;
const fmt = (d) =>
  new Date(d).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const durumMeta = (durum) => {
  if (durum === 2) return { label: 'Tamamlandı', cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-3 h-3" />, border: 'border-emerald-200' };
  if (durum === 3) return { label: 'İptal', cls: 'bg-rose-100 text-rose-700', icon: <XCircle className="w-3 h-3" />, border: 'border-rose-200' };
  return { label: 'Bekliyor', cls: 'bg-amber-100 text-amber-700', icon: <Hourglass className="w-3 h-3" />, border: 'border-slate-200' };
};

export default function PersonelGorevler() {
  const [gorevler, setGorevler] = useState([]);
  const [toplam, setToplam] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dahaYukleniyor, setDahaYukleniyor] = useState(false);
  const [notModal, setNotModal] = useState(null);      
  const [notMetni, setNotMetni] = useState('');
  const [islemYapiliyor, setIslemYapiliyor] = useState(false);

  useEffect(() => { fetchGorevlerim(1, true); }, []);

  const fetchGorevlerim = async (page, replace) => {
    try {
      if (replace) setLoading(true); else setDahaYukleniyor(true);
      const res = await axiosInstance.get('/Gorevler/benim', { params: { pageIndex: page, pageSize: PAGE_SIZE } });
      const data = res.data;
      setToplam(data.totalCount || 0);
      setPageIndex(data.pageIndex || page);
      setGorevler(prev => replace ? (data.items || []) : [...prev, ...(data.items || [])]);
    } catch (err) { console.error('Görevler çekilemedi:', err); }
    finally { setLoading(false); setDahaYukleniyor(false); }
  };

  const acNotModal = (mode, gorev) => { setNotMetni(''); setNotModal({ mode, gorev }); };
  const kapatNotModal = () => { setNotModal(null); setNotMetni(''); };

  const handleGonder = async () => {
    const { mode, gorev } = notModal;
    if (mode === 'tamamla' && !notMetni.trim()) { toast.error('Geri dönüt yazmalısınız.'); return; }
    try {
      setIslemYapiliyor(true);
      const url = mode === 'tamamla' ? `/Gorevler/${gorev.id}/tamamla` : `/Gorevler/${gorev.id}/iptal`;
      await axiosInstance.put(url, { not: notMetni.trim() || null });
      toast.success(mode === 'tamamla' ? 'Görev tamamlandı.' : 'Görev iptal edildi.');
      kapatNotModal();
      fetchGorevlerim(1, true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'İşlem başarısız.');
    } finally { setIslemYapiliyor(false); }
  };

  const hasMore = gorevler.length < toplam;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="w-6 h-6 text-slate-700" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Görevlerim</h1>
          <p className="text-sm text-slate-500">Size atanan görevleri tamamlayın veya iptal edin.</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-10">Yükleniyor...</p>
      ) : gorevler.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">Size atanmış görev yok.</div>
      ) : (
        <>
          <div className="space-y-3">
            {gorevler.map(g => {
              const m = durumMeta(g.durum);
              return (
                <div key={g.id} className={`bg-white rounded-xl border shadow-sm p-5 ${m.border}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-800">{g.baslik}</h3>
                        <span className={`text-[11px] ${m.cls} px-2 py-1 rounded-md font-bold flex items-center gap-1`}>{m.icon} {m.label}</span>
                      </div>
                      {g.aciklama && <p className="text-sm text-slate-500 mb-2">{g.aciklama}</p>}
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {fmt(g.baslangicZamani)}{g.bitisZamani ? ` — ${fmt(g.bitisZamani)}` : ''}
                      </div>
                      {g.personelNotu && (
                        <p className="text-xs text-slate-600 mt-2 bg-slate-50 border border-slate-200 rounded-lg p-2 whitespace-pre-wrap">
                          <span className="font-bold">Geri dönüt: </span>{g.personelNotu}
                        </p>
                      )}
                    </div>
                    {g.durum === 1 && (
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => acNotModal('tamamla', g)}
                          className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 shadow-sm transition">
                          <Check className="w-4 h-4" /> Tamamladım
                        </button>
                        <button onClick={() => acNotModal('iptal', g)}
                          className="flex items-center gap-2 px-3 py-2 border border-rose-200 text-rose-600 text-sm font-bold rounded-lg hover:bg-rose-50 transition">
                          <Ban className="w-4 h-4" /> İptal Et
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-5">
              <button onClick={() => fetchGorevlerim(pageIndex + 1, false)} disabled={dahaYukleniyor}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50 transition">
                {dahaYukleniyor ? 'Yükleniyor...' : `Daha Fazla Göster (${gorevler.length}/${toplam})`}
              </button>
            </div>
          )}
        </>
      )}

      {notModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={kapatNotModal}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">{notModal.mode === 'tamamla' ? 'Görevi Tamamla' : 'Görevi İptal Et'}</h3>
              <button onClick={kapatNotModal} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-500">"{notModal.gorev.baslik}"</p>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">
                  {notModal.mode === 'tamamla' ? 'Geri dönüt (zorunlu)' : 'İptal nedeni (opsiyonel)'}
                </label>
                <textarea value={notMetni} onChange={(e) => setNotMetni(e.target.value)} rows={4}
                  placeholder={notModal.mode === 'tamamla' ? 'Yapılan işi kısaca yazın...' : 'Neden iptal ediyorsunuz?'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={kapatNotModal} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Vazgeç</button>
                <button onClick={handleGonder} disabled={islemYapiliyor}
                  className={`flex-1 py-2.5 rounded-lg text-white font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 ${
                    notModal.mode === 'tamamla' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}>
                  {islemYapiliyor ? 'Gönderiliyor...' : (notModal.mode === 'tamamla' ? 'Tamamla' : 'İptal Et')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}