import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { Calendar, User, Activity, CheckCircle, X, Phone} from "lucide-react";


const MESAI_SAATLERI = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];


export default function RandevuModal({isOpen, onClose, onSuccess}) {
    const [doktorlar, setDoktorlar] = useState([]);
    const [islemler, setIslemler] = useState([]);
    const [doluSaatler, setDoluSaatler] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [minTarih, setMinTarih] = useState('');

    const [formData, setFormData] = useState({
        hastaAd:'', hastaSoyad:'', hastaTelefon:'', doktorId:'', islemId:'', islemSecenekId:'', tarih:'', saat:'', hastaNotu:'', kaynak:'1', durum:'1'
    });


    useEffect(() => {
        const bugun = new Date();
        const yyyy = bugun.getFullYear();
        const mm = String(bugun.getMonth() + 1).padStart(2, '0');
        const dd = String(bugun.getDate()).padStart(2,'0');
        setMinTarih(`${yyyy}-${mm}-${dd}`);

        const fetchData = async () => {
            try {
                const [doktorRes, islemRes] = await Promise.all([
                    axiosInstance.get('/Public/doktorlar'),
                    axiosInstance.get('/Public/islem')
                ]);
                setDoktorlar(doktorRes.data);
                setIslemler(islemRes.data);
            } catch(err){
                console.error('Veri çekme hatası:', err);
            }
        }; 
        fetchData();
    }, [isOpen]);

    useEffect(() => {
        const fetchDoluSaatler = async () => {
            if(!formData.doktorId || !formData.tarih) {
                setDoluSaatler([]);
                return;
            }
            try {
                const response = await axiosInstance.get('/Public/dolu-saatler',{
                    params : {doktorId: parseInt(formData.doktorId), tarih: formData.tarih}
                });
                if(Array.isArray(response.data)) {
                    setDoluSaatler(response.data.map(saat => saat.substring(0,5)));
                }
            } catch (err) {
                console.warn('Dolu saatler çekilmedi.', err);
            }
        };
        fetchDoluSaatler();
    }, [formData.doktorId, formData.tarih]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'islemId') {
            setFormData({ ...formData, islemId: value, islemSecenekId: '', doktorId: '' });
            const secilen = islemler.find(i => i.id === parseInt(value));
            fetchDoktorlarByBrans(secilen?.bransId);
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const fetchDoktorlarByBrans = async (bransId) => {
        try {
            const url = bransId ? `/Public/doktorlar?bransId=${bransId}` : '/Public/doktorlar';
            const res = await axiosInstance.get(url);
            setDoktorlar(res.data || []);
        } catch (err) {
            console.error('Doktorlar filtrelenemedi:', err);
        }
    };

    const checkSaatDisabled = (saat) => {
        if(doluSaatler.includes(saat)) return {disabled: true, text: '(Dolu)'};
        
        if(formData.tarih === minTarih) {
            const suAn = new Date();
            const mevcutSaat = suAn.getHours();
            const mevcutDakika = suAn.getMinutes();
            const [saatStr, dakikaStr] = saat.split(':');
            
            if(parseInt(saatStr,10) < mevcutSaat || (parseInt(saatStr, 10) === mevcutSaat && parseInt(dakikaStr, 10) <= mevcutDakika)) {
                return { disabled: true, text: '(GEÇTİ)' }; 
            }
        }
        return { disabled: false, text: '' };
    }; 
    const seciliIslem = islemler.find(i => i.id === parseInt(formData.islemId));
    const seciliSecenek = seciliIslem?.secenekler?.find(s => s.id === parseInt(formData.islemSecenekId));

    const gosterilecekFiyat = seciliIslem
        ? (seciliIslem.fiyatTipi === 2 ? (seciliSecenek?.fiyat ?? null) : seciliIslem.fiyat)
        : null;

    const formatMoney = (amount) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!formData.saat) {
            setErrorMsg('Lütfen uygun bir randevu saati seçiniz'); 
            return;
        }
        setLoading(true); setSuccessMsg(''); setErrorMsg('');

        try {
            const payload = {
                ...formData,
                doktorId: parseInt(formData.doktorId),
                islemId: parseInt(formData.islemId),
                islemSecenekId: formData.islemSecenekId ? parseInt(formData.islemSecenekId) : null,
                tarih: `${formData.tarih}T00:00:00.000Z`,
                saat: `${formData.saat}:00`,
                kaynak: parseInt(formData.kaynak),
                durum: parseInt(formData.durum)
            };
            console.log("MODAL GÖNDERİLEN VERİ (PAYLOAD):", payload);
            console.log("HAM FORM DATA:", formData);
            const response = await axiosInstance.post('/PersonelPanel/randevular', payload);
            setSuccessMsg(response.data?.message || 'Randevu başarıyla oluşturuldu');

            if(onSuccess) onSuccess();
            
            setTimeout(() => {
                setFormData({hastaAd:'', hastaSoyad:'', hastaTelefon:'', doktorId:'', islemId:'', islemSecenekId:'', tarih:'', saat:'', hastaNotu:'', kaynak:'1', durum:'1'});
                setSuccessMsg('');
                onClose();
            }, 2000);
        } catch(err) {
            setErrorMsg(err.response?.data?.message || 'Randevu oluştururken bir hata gerçekleşti');
        } finally {
            setLoading(false);
        }
    };

    if(!isOpen) return null;

            return(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h[90vh] overflow-y-auto relative p-6 sm:p-8">
                       <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transistion">
                        <X className="w-6 h-6"/>
                        </button> 
                        <div className= "p-6 sm:p-8">
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">Yeni Randevu Oluştur</h2>
                            {successMsg &&(
                                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0"/> <span>{successMsg}</span>
                                </div>
                            )}
                            {errorMsg &&(
                                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">{errorMsg}</div>
                            )}
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4"/> Kişisel Bilgiler
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <input type="text" name="hastaAd" required value={formData.hastaAd} onChange={handleChange} placeholder="Ad" className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                    <input type="text" name="hastaSoyad" required value={formData.hastaSoyad} onChange={handleChange} placeholder="Soyad" className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                    <input type="tel" name="hastaTelefon" required value={formData.hastaTelefon} onChange={handleChange} placeholder="Telefon Numara" className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Phone className="w-4 h-4"/> Görüşme Türü
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <select name="kaynak" value={formData.kaynak} onChange={handleChange} className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value="1">Telefon</option>
                                        <option value="2">WhatsApp</option>
                                        <option value="3">Online</option>
                                    </select>
                                    <select name="durum" value={formData.durum} onChange={handleChange} className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value="1">Beklemede</option>
                                        <option value="2">Onaylandı</option>
                                        <option value="3">Tamamlandı</option>
                                        <option value="4">İptal</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4"/> Hekim ve İşlem
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <select name="islemId" required value={formData.islemId} onChange={handleChange} className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value="">--İşlem Seçiniz</option>
                                        {islemler.map( i=> <option key={i.id} value={i.id}>{i.ad}</option>)}
                                    </select>
                                    <select name="doktorId" required value={formData.doktorId} onChange={handleChange} disabled={!formData.islemId} className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed">
                                        <option value="">{formData.islemId ? '--Hekim Seçiniz --' : '--Önce işlem seçiniz--'}</option>
                                        {doktorlar.map(d => <option key={d.id} value={d.id}> 
                                            {d.unvan} {d.ad} {d.soyad}
                                        </option>)}
                                    </select>
                                    {seciliIslem?.fiyatTipi === 2 && (
                                        <select
                                            name="islemSecenekId"
                                            required
                                            value={formData.islemSecenekId}
                                            onChange={handleChange}
                                            className="px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none sm:col-span-2"
                                        >
                                            <option value="">-- Seçenek Belirleyiniz --</option>
                                            {seciliIslem.secenekler.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.secenekAd} - {formatMoney(s.fiyat)}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {gosterilecekFiyat !== null && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between">
                                            <span className="text-sm font-semibold text-blue-700">Tahmini Ücret</span>
                                            <span className="text-lg font-bold text-blue-800">{formatMoney(gosterilecekFiyat)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4"/> Tarih ve Saat
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input type="date" name="tarih" required min={minTarih} value={formData.tarih} onChange={handleChange} className=" px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                                    <select name="saat" required disabled={!formData.doktorId || !formData.tarih}  value={formData.saat} onChange={handleChange} className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100">
                                        <option value="">--Saat Seçiniz--</option>
                                        {MESAI_SAATLERI.map(saat => {
                                            const status = checkSaatDisabled(saat);
                                            return <option key={saat} value={saat} disabled={status.disabled}>
                                                {saat} {status.text}
                                            </option>
                                        })}
                                    </select>

                                </div>
                            </div>

                            <textarea name="hastaNotu" rows="2" value={formData.hastaNotu} onChange={handleChange} placeholder="Notunuz" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"> </textarea>
                            <button type="submit" disabled={loading} className=" bg-blue-500  text-white hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50">
                                {loading ? 'Oluşturuluyor...' : 'Randevu Onayla'}
                            </button>

                        </form>
                    </div>

                </div>
            )


        }