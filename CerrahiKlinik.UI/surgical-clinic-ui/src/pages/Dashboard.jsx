import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Clock, Users, TrendingUp, Phone, 
  MessageCircle, Globe, ChevronDown, Stethoscope
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import RandevuModal from './RandevuModal';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRandevu, setSelectedRandevu] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [ozet, setOzet] = useState({
    bugunkuRandevuSayisi: 0,
    bekleyenRandevuSayisi: 0,
    aktifRandevuSayisi: 0,
    gunlukToplmHastaSayisi: 0,
    gunlukToplamGelir: 0,
    tamamlananRandevuSayisi: 0,
  });
  const [aylikPerformans, setAylikPerformans] = useState({
    doktorPerformanslari: [],
    islemGelirleri: []
  });
  const [randevuKaynaklari, setRandevuKaynaklari] = useState([]);
  const [sonRandevular, setSonRandevular] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ozetRes, performansRes, kaynaklarRes, sonRandevularRes] = await Promise.all([
        axiosInstance.get('/Dashboard/ozet'),
        axiosInstance.get('/Dashboard/aylik-performans'),
        axiosInstance.get('/Dashboard/randevu-kaynaklari'),
        axiosInstance.get('/Dashboard/son-randevular?limit=5')
      ]);

      setOzet(ozetRes.data);
      const perfData = performansRes.data;
      if (perfData.doktorPerformanslari) {
        perfData.doktorPerformanslari = perfData.doktorPerformanslari.map(d => ({
          ...d,
          doktorTamAd: `${d.doktorUnvan || ''} ${d.doktorAd || ''} ${d.doktorSoyad || ''}`.trim()
        }));
      }
      setAylikPerformans(perfData);
      setRandevuKaynaklari(kaynaklarRes.data);
      setSonRandevular(sonRandevularRes.data);
      
    } catch (err) {
      console.error('Dashboard verileri yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount || 0);
  };

  const maxIslemGeliri = Math.max(...(aylikPerformans.islemGelirleri.map(i => i.toplamGelir) || [0]), 1);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Dashboard Yükleniyor...</div>;
  }
  const getDurumBadge = (durum) => {
    switch (durum) {
      case 1:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700">Beklemede</span>;
      case 2:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700">Onaylandı</span>;
      case 3:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700">Tamamlandı</span>;
      case 4:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700">İptal</span>;
      default: 
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">Bilinmiyor</span>;
    }
  };
  const handleDurumGuncelle = async (id, yeniDurum) => {
    try {
      setActionLoadingId(id);
      await axiosInstance.put(`/PersonelPanel/randevular/${id}/durum`, null, {
        params: { drum: yeniDurum } 
      });
      
      setSelectedRandevu(null); 
      fetchDashboardData();
    } catch (err) {
      console.error('Durum güncellenirken hata oluştu:', err);
      toast.error('Randevu durumu güncellenemedi.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 font-sans">
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Genel Panel</h1>
          <p className="text-sm text-slate-500">Klinik randevu ve istatistik özeti</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm"
        >
          <Calendar className="w-4 h-4" />
          Yeni Randevu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">BU GÜNÜN RANDEVULARI</span>
            <div className="bg-blue-50 p-2 rounded-lg text-blue-500"><Calendar className="w-4 h-4" /></div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{ozet.bugunkuRandevuSayisi}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">BEKLEYEN / AKTİF</span>
            <div className="bg-amber-50 p-2 rounded-lg text-amber-500"><Clock className="w-4 h-4" /></div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{ozet.bekleyenRandevuSayisi} <span className="text-slate-400 font-medium text-xl">/ {ozet.aktifRandevuSayisi}</span></h3>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TOPLAM HASTA</span>
            <div className="bg-purple-50 p-2 rounded-lg text-purple-500"><Users className="w-4 h-4" /></div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{ozet.gunlukToplmHastaSayisi}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TOPLAM GELİR</span>
            <div className="bg-emerald-50 p-2 rounded-lg text-emerald-500"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{formatMoney(ozet.gunlukToplamGelir)}</h3>
          <p className="text-xs text-slate-400 mt-1">{ozet.tamamlananRandevuSayisi} muayene tamamlandı</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-6 overflow-hidden">
        
        <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Aylık Performans</h2>
            <p className="text-xs text-slate-500">Doktor ve tedavi bazlı gelir analizi</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">AYLIK GELİR</p>
              <p className="text-sm font-bold text-emerald-600">
                {formatMoney(aylikPerformans.islemGelirleri.reduce((acc, curr) => acc + curr.toplamGelir, 0))}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">MUAYENE</p>
              <p className="text-sm font-bold text-blue-600">
                {aylikPerformans.doktorPerformanslari.reduce((acc, curr) => acc + curr.tamamlananMuayeneSayisi, 0)}
              </p>
            </div>
            <div className="border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
              Ağustos 2026 <ChevronDown className="w-4 h-4 text-slate-400"/>
            </div>
          </div>
        </div>

        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-6">
            <Stethoscope className="w-4 h-4 text-blue-500" /> Doktor Bazlı Gelir & Tamamlanan Muayene
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aylikPerformans.doktorPerformanslari} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="doktorTamAd" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} /> 
               <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `${value / 1000}k ₺`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                <Bar yAxisId="left" dataKey="toplamGelir" name="Gelir" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar yAxisId="right" dataKey="tamamlananMuayeneSayisi" name="Muayene" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Tedavi Bazlı Gelir
          </h3>
          <div className="space-y-4">
            {aylikPerformans.islemGelirleri.map((islem, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-semibold text-slate-700">{islem.islemAd} <span className="text-slate-400 font-normal">({islem.toplamGelir > 0 ? "1" : "0"} adet)</span></span>
                  <span className="text-xs font-bold text-slate-800">{formatMoney(islem.toplamGelir)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(islem.toplamGelir / maxIslemGeliri) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-6">Randevu Kaynakları</h2>
          <div className="space-y-4">
            {randevuKaynaklari.map((kaynak, index) => {
              let icon = <Globe className="w-4 h-4" />;
              let color = "bg-purple-100 text-purple-600";
              let isim = kaynak.kaynak === 0 ? "Telefon" : kaynak.kaynak === 1 ? "WhatsApp" : "Online";

              if (kaynak.kaynak === 0) { icon = <Phone className="w-4 h-4" />; color = "bg-blue-100 text-blue-600"; }
              if (kaynak.kaynak === 1) { icon = <MessageCircle className="w-4 h-4" />; color = "bg-emerald-100 text-emerald-600"; }

              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
                    <span className="text-sm font-medium text-slate-700">{isim}</span>
                  </div>
                  <span className="text-lg font-bold text-slate-800">{kaynak.adet}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-slate-800">Son Randevular</h2>
            
          </div>
          <button 
            onClick={() => navigate('/randevular')} 
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition text-right block w-full">
            Tümünü gör
          </button>
          <div className="space-y-2 flex-1">
            {sonRandevular.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Kayıtlı randevu yok.</p>
            ) : (
              sonRandevular.map((r, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedRandevu(r)} 
                  className="flex justify-between items-center p-3 border border-transparent hover:border-slate-100 hover:bg-slate-50 rounded-xl cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                      <Users className="w-4 h-4"/>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{r.hastaAd} {r.hastaSoyad}</p>
                      <p className="text-xs text-slate-500">{r.islemAd} — {r.doktorUnvan} {r.doktorAd} {r.doktorSoyad}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-xs text-slate-400">{new Date(r.tarih).toLocaleDateString('tr-TR')}</span>
                    {getDurumBadge(r.durum)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {selectedRandevu && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Randevu Yönetimi</h3>
              <button onClick={() => setSelectedRandevu(null)} className="text-slate-400 hover:text-slate-600 transition">
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            
            <div className="p-5">
              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">HASTA BİLGİSİ</p>
                <p className="font-medium text-slate-800">{selectedRandevu.hastaAd} {selectedRandevu.hastaSoyad} {selectedRandevu.hastaTelefon}</p>
                <p className="text-sm text-slate-500">{selectedRandevu.islemAd} — {selectedRandevu.doktorUnvan } {selectedRandevu.doktorAd} {selectedRandevu.doktorSoyad}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">İŞLEM SEÇİN</p>
                
                <button 
                  onClick={() => handleDurumGuncelle(selectedRandevu.id, 2)}
                  disabled={actionLoadingId === selectedRandevu.id}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition font-medium text-sm"
                >
                  Randevuyu Onayla
                </button>
                
                <button 
                  onClick={() => handleDurumGuncelle(selectedRandevu.id, 3)}
                  disabled={actionLoadingId === selectedRandevu.id}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 transition font-medium text-sm"
                >
                  Muayeneyi Tamamla
                </button>

                <button 
                  onClick={() => handleDurumGuncelle(selectedRandevu.id, 1)}
                  disabled={actionLoadingId === selectedRandevu.id}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100 transition font-medium text-sm"
                >
                  Beklemeye Al
                </button>

                <button 
                  onClick={() => handleDurumGuncelle(selectedRandevu.id, 4)}
                  disabled={actionLoadingId === selectedRandevu.id}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100 transition font-medium text-sm"
                >
                  Randevuyu İptal Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <RandevuModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchDashboardData()} 
      />
    </div>
  );
}