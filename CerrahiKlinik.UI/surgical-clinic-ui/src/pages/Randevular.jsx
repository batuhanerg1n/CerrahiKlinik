import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { 
  Search, Eye, MoreVertical, Calendar as CalendarIcon, Clock, 
  Phone, Globe, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle
} from 'lucide-react';
import RandevuModal from './RandevuModal'; 
import toast from 'react-hot-toast';
import RandevuDuzenleModal from './RandevuDuzenleModal';

export default function Randevular() {
  const [randevular, setRandevular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [doktorFilter, setDoktorFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [detayRandevu, setDetayRandevu] = useState(null);
  const [editRandevuId, setEditRandevuId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [aksiyonRandevu, setAksiyonRandevu] = useState(null);
  const [iptalOnayId, setIptalOnayId] = useState(null);
  const [duzenleRandevu, setDuzenleRandevu] = useState(null);
  useEffect(() => {
    fetchRandevular();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, doktorFilter]);

  const fetchRandevular = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/PersonelPanel/randevular/search', {
        params: {
          pageIndex: 1,
          pageSize: 500 
        }
      });
      const data = response.data?.items || response.data || [];
      setRandevular(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Randevular çekilemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDurumGuncelle = async (randevuId, yeniDurum) => {
    try {
      await axiosInstance.put(
        `/PersonelPanel/randevular/${randevuId}/durum`,
        null,
        { params: { drum: yeniDurum } }
      );
      setAksiyonRandevu(null);   
      fetchRandevular();
    } catch (err) {
      console.error('Durum güncellenemedi:', err);
      toast.error('İşlem başarısız oldu.');
    }
  };

  const handleOnayla = (randevuId) => handleDurumGuncelle(randevuId, 2);
  const handleBeklemeyeAl = (randevuId) => handleDurumGuncelle(randevuId, 1);

  const handleIptal = (randevuId) => {
    setAksiyonRandevu(null);
    setIptalOnayId(randevuId);
  };

  const handleIptalOnayla = () => {
    if (iptalOnayId) handleDurumGuncelle(iptalOnayId, 4);
    setIptalOnayId(null);
  };

  const filteredRandevular = randevular.filter(r => {
    const aramaMetni = searchQuery.toLowerCase();
    const aramaUyuyor = searchQuery ? (
      r.hastaAd?.toLowerCase().includes(aramaMetni) ||
      r.hastaSoyad?.toLowerCase().includes(aramaMetni) ||
      r.islemAd?.toLowerCase().includes(aramaMetni) ||
      r.doktorAd?.toLowerCase().includes(aramaMetni)
    ) : true;
    
    const durumUyuyor = statusFilter ? r.durum.toString() === statusFilter : true;

    const doktorUyuyor = doktorFilter ? r.doktorId?.toString() === doktorFilter : true;

    return aramaUyuyor && durumUyuyor && doktorUyuyor;
  });

  // Randevulardan benzersiz doktor listesi çıkar
  const doktorListesi = Array.from(
    new Map(
      randevular
        .filter(r => r.doktorId)
        .map(r => [r.doktorId, { id: r.doktorId, ad: r.doktorAd, soyad: r.doktorSoyad, unvan: r.doktorUnvan }])
    ).values()
  );

  const totalPages = Math.ceil(filteredRandevular.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRandevular = filteredRandevular.slice(indexOfFirstItem, indexOfLastItem);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const startDayOffset = firstDay === 0 ? 6 : firstDay - 1; 

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const selectedDayRandevular = filteredRandevular.filter(r => {
    if (!r.tarih) return false;
    const rDate = new Date(r.tarih);
    return rDate.getDate() === selectedDate.getDate() &&
           rDate.getMonth() === selectedDate.getMonth() &&
           rDate.getFullYear() === selectedDate.getFullYear();
  });

  const formatMoney = (amount) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount || 0);
  
  const getDurumBadge = (durum) => {
    switch (durum) {
      case 1: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">Beklemede</span>;
      case 2: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Onaylandı</span>;
      case 3: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">Tamamlandı</span>;
      case 4: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">İptal</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-1/2">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Hasta, doktor veya işlem ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>
        <div className="w-full sm:w-48">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer bg-white"
          >
            <option value="">Tüm Durumlar</option>
            <option value="1">Beklemede</option>
            <option value="2">Onaylandı</option>
            <option value="3">Tamamlandı</option>
            <option value="4">İptal</option>
          </select>

          <select
            value={doktorFilter}
            onChange={(e) => setDoktorFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Tüm Doktorlar</option>
            {doktorListesi.map(d => (
              <option key={d.id} value={d.id}>{d.unvan} {d.ad} {d.soyad}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-center text-slate-500 py-8">Yükleniyor...</p> : 
         currentRandevular.length === 0 ? <p className="text-center text-slate-500 py-8">Randevu bulunamadı.</p> :
         currentRandevular.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-slate-300 transition">
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className={`p-3 rounded-full ${r.durum === 4 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                <StethoscopeIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-800">{r.hastaAd} {r.hastaSoyad}</h3>
                  {getDurumBadge(r.durum)}
                   {r.kaynak === 1 ? <Phone className="w-3.5 h-3.5 text-blue-400" /> : <Globe className="w-3.5 h-3.5 text-purple-400" />}
                 </div>
                <p className="text-xs text-slate-500">{r.islemAd} • {r.doktorUnvan} {r.doktorAd} {r.doktorSoyad}</p>
              </div>
            </div>

            <div className="flex-1 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 w-full md:w-auto">
              <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4 text-slate-400"/> Randevu: {new Date(r.tarih).toLocaleDateString('tr-TR')} {r.saat?.substring(0,5)}</span>
              {r.onayTarihi && <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="w-4 h-4"/> Onay: {new Date(r.onayTarihi).toLocaleDateString('tr-TR')}</span>}
              {r.durum === 3 && <span className="flex items-center gap-1.5 text-amber-600 font-bold">💰 {formatMoney(r.islemFiyat)}</span>}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setDetayRandevu(r)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Detayları Gör">
                <Eye className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setAksiyonRandevu(r)} 
                className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition" 
                title="İşlemler"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 capitalize">
              {currentDate.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"><ChevronLeft className="w-4 h-4"/></button>
              <button onClick={handleToday} className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50">
                {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </button>
              <button onClick={handleNextMonth} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"><ChevronRight className="w-4 h-4"/></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 text-center mb-2 text-xs font-bold text-slate-400">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => <div key={day}>{day}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startDayOffset }).map((_, i) => <div key={`empty-${i}`} />)}
            
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const isSelected = day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth();
              const hasRandevu = randevular.some(r => {
                const rDate = new Date(r.tarih);
                return rDate.getDate() === day && rDate.getMonth() === currentDate.getMonth();
              });

              return (
                <button 
                  key={day}
                  onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                  className={`aspect-square p-2 rounded-xl border flex flex-col items-center justify-center relative transition-all
                    ${isSelected ? 'border-blue-500 bg-blue-50/50 text-blue-700 font-bold shadow-sm' : 'border-slate-100 hover:border-blue-200 text-slate-700'}
                  `}
                >
                  <span>{day}</span>
                  {hasRandevu && <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 h-[500px] flex flex-col">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {selectedDayRandevular.length === 0 ? (
              <p className="text-sm text-slate-400 text-center mt-10">Seçilen günde veya kritere uygun randevu yok.</p>
            ) : (
              selectedDayRandevular.map(r => (
                <div key={r.id} className={`p-3 rounded-xl border-l-4 shadow-sm bg-white
                  ${r.durum === 4 ? 'border-l-rose-500 bg-rose-50/30' : r.durum === 3 ? 'border-l-blue-500' : 'border-l-emerald-500' }
                `}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-slate-800">{r.saat?.substring(0,5)}</span>
                    <div className={`w-2 h-2 rounded-full ${r.durum === 4 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                  </div>
                  <p className="text-sm font-bold text-slate-800 truncate">{r.hastaAd} {r.hastaSoyad}</p>
                  <p className="text-xs text-slate-500 mb-2">{r.islemAd} • {r.doktorAd}</p>
                  {r.durum === 3 && <p className="text-xs font-bold text-amber-600">{formatMoney(r.islemFiyat)}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {iptalOnayId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setIptalOnayId(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Randevuyu İptal Et</h3>
              <p className="text-sm text-slate-500 mb-6">
                Bu randevuyu iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIptalOnayId(null)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleIptalOnayla}
                  className="flex-1 py-2.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-sm transition"
                >
                  Evet, İptal Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {aksiyonRandevu && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setAksiyonRandevu(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">Randevu Yönetimi</h3>
              <button onClick={() => setAksiyonRandevu(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Hasta Bilgisi</p>
              <p className="font-bold text-slate-800">{aksiyonRandevu.hastaAd} {aksiyonRandevu.hastaSoyad}</p>
              <p className="text-sm text-slate-500 mb-5">{aksiyonRandevu.islemAd} — {aksiyonRandevu.doktorUnvan} {aksiyonRandevu.doktorAd} {aksiyonRandevu.doktorSoyad}</p>

              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">İşlem Seçin</p>
              <div className="space-y-2">
                {aksiyonRandevu.durum === 1 && (
                  <button
                    onClick={() => handleOnayla(aksiyonRandevu.id)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition"
                  >
                    Randevuyu Onayla
                  </button>
                )}

                {aksiyonRandevu.durum === 2 && (
                  <button
                    onClick={() => handleBeklemeyeAl(aksiyonRandevu.id)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 font-semibold hover:bg-amber-100 transition"
                  >
                    Beklemeye Al
                  </button>
                )}

                {(aksiyonRandevu.durum === 1 || aksiyonRandevu.durum === 2) && (
                  <button
                    onClick={() => handleIptal(aksiyonRandevu.id)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-semibold hover:bg-rose-100 transition"
                  >
                    Randevuyu İptal Et
                  </button>
                )}

                {(aksiyonRandevu.durum === 1 || aksiyonRandevu.durum === 2) && (
                  <button
                    onClick={() => { setDuzenleRandevu(aksiyonRandevu); setAksiyonRandevu(null); }}
                    className="w-full text-left px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition"
                  >
                    Randevuyu Düzenle
                  </button>
                )}

                {(aksiyonRandevu.durum === 3 || aksiyonRandevu.durum === 4) && (
                  <p className="text-sm text-slate-400 text-center py-4">
                    Bu randevu {aksiyonRandevu.durum === 3 ? 'tamamlanmış' : 'iptal edilmiş'}, işlem yapılamaz.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {detayRandevu && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Randevu Detayı</h2>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Hasta:</span>
                  <span className="font-bold text-slate-800">{detayRandevu.hastaAd} {detayRandevu.hastaSoyad}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Telefon:</span>
                  <span className="font-medium text-slate-800">{detayRandevu.hastaTelefon || "Belirtilmemiş"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Doktor:</span>
                  <span className="font-medium text-slate-800">{detayRandevu.doktorUnvan} {detayRandevu.doktorAd} {detayRandevu.doktorSoyad}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">İşlem/Tedavi:</span>
                  <span className="font-medium text-slate-800">{detayRandevu.islemAd}</span>
                </div>
                
                <div className="pt-2">
                  <span className="block text-slate-500 mb-1">Hasta Notu / Açıklama:</span>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {detayRandevu.hastaNotu || "Açıklama girilmemiş."}
                  </p>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2 mt-4">
                  <span className="text-slate-500">Randevu Tarihi:</span>
                  <span className="font-medium text-slate-800">{new Date(detayRandevu.tarih).toLocaleDateString('tr-TR')} {detayRandevu.saat?.substring(0,5)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Kaynak:</span>
                  <span className="font-medium text-slate-800">{detayRandevu.kaynak === 1 ? "Telefon" : "Web / Online"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Durum:</span>
                  <span>{getDurumBadge(detayRandevu.durum)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 font-bold">Fiyat:</span>
                  <span className="font-bold text-lg text-slate-800">{formatMoney(detayRandevu.islemFiyat)}</span>
                </div>
              </div>

              <button 
                onClick={() => setDetayRandevu(null)} 
                className="w-full mt-8 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      <RandevuModal 
        isOpen={isEditModalOpen} 
        onClose={() => { setIsEditModalOpen(false); setEditRandevuId(null); }} 
        onSuccess={() => fetchRandevular()} 
        editId={editRandevuId} 
      />
      {duzenleRandevu && (
        <RandevuDuzenleModal
          randevu={duzenleRandevu}
          onClose={() => setDuzenleRandevu(null)}
          onSuccess={() => fetchRandevular()}
        />
      )}

    </div>
  );
}

function StethoscopeIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"></path>
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"></path>
      <circle cx="20" cy="10" r="2"></circle>
    </svg>
  );
}