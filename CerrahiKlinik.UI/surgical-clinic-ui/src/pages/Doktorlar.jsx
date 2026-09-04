import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import {
    Plus, Trash2, X, Save, Stethoscope, Mail, Award, User, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

export default function Doktorlar() {
    const [doktorlar, setDoktorlar] = useState([]);
    const [branslar, setBranslar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAcik, setModalAcik] = useState(false);
    const [kaydediyor, setKaydediyor] = useState(false);
    const [editId, setEditId] = useState(null);   
    const [confirmData, setConfirmData] = useState(null);
    const [ad, setAd] = useState('');
    const [soyad, setSoyad] = useState('');
    const [email, setEmail] = useState('');
    const [sifre, setSifre] = useState('');
    const [unvan, setUnvan] = useState('');
    const [aciklama, setAciklama] = useState('');
    const [diplomaNo, setDiplomaNo] = useState('');
    const [sicilNo, setSicilNo] = useState('');
    const [tcNo, setTcNo] = useState('');
    const [seciliBranslar, setSeciliBranslar] = useState([]);
    const [sifreGoster, setSifreGoster]= useState(false);

    useEffect(() => {
        fetchDoktorlar();
        fetchBranslar();
    }, []);

    const fetchDoktorlar = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/PersonelPanel/doktorlar');
            setDoktorlar(res.data || []);
        } catch (err) {
            console.error('Doktorlar çekilemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBranslar = async () => {
        try {
            const res = await axiosInstance.get('/Public/branslar');
            setBranslar(res.data || []);
        } catch (err) {
            console.error('Branşlar çekilemedi:', err);
        }
    };

    const resetForm = () => {
        setAd(''); setSoyad(''); setEmail(''); setSifre('');
        setUnvan(''); setAciklama(''); setDiplomaNo(''); setSicilNo(''); setTcNo(''); setSeciliBranslar([]);
    };

    const acModal = () => { resetForm(); setEditId(null); setModalAcik(true); };

    const acDuzenleModal = (d) => {
        setEditId(d.id);
        setAd(d.ad);
        setSoyad(d.soyad);
        setEmail(d.email || '');
        setSifre('');
        setUnvan(d.unvan || '');
        setAciklama(d.aciklama || '');
        setDiplomaNo(d.diplomaNo || '');
        setSicilNo(d.sicilNo || '');
        setTcNo(d.tcNo || '');
        setSeciliBranslar(d.bransIds || []);
        setModalAcik(true);
    };

    const kapatModal = () => { setModalAcik(false); setEditId(null); resetForm(); };

    const bransToggle = (bransId) => {
        setSeciliBranslar(prev =>
            prev.includes(bransId) ? prev.filter(id => id !== bransId) : [...prev, bransId]
        );
    };

    const handleKaydet = async () => {
        if (!ad.trim() || !soyad.trim()) { toast.error('Ad ve soyad zorunludur.'); return; }
        if (!diplomaNo.trim()) { toast.error('Diploma numarası zorunludur.'); return; }
        if (!sicilNo.trim()) { toast.error('Sicil numarası zorunludur.'); return; }
        if (!/^\d{11}$/.test(tcNo.trim())) { toast.error('TC Kimlik No 11 haneli olmalıdır.'); return; }

        if (editId) {
            const payload = {
                ad: ad.trim(),
                soyad: soyad.trim(),
                unvan: unvan.trim(),
                aciklama: aciklama.trim(),
                diplomaNo: diplomaNo.trim(),
                sicilNo: sicilNo.trim(),
                tcNo: tcNo.trim(),
                bransIds: seciliBranslar
            };
            try {
                setKaydediyor(true);
                await axiosInstance.put(`/PersonelPanel/doktorlar/${editId}`, payload);
                kapatModal();
                fetchDoktorlar();
            } catch (err) {
                console.error('Doktor güncellenemedi:', err);
                toast.error(err.response?.data?.message || 'Doktor güncellenirken hata oluştu.');
            } finally {
                setKaydediyor(false);
            }
            return;
        }

        if (!email.trim()) { toast.error('Email zorunludur.'); return; }
        if (!sifre.trim() || sifre.length < 6) { toast.error('Şifre en az 6 karakter olmalı.'); return; }

        const payload = {
            ad: ad.trim(),
            soyad: soyad.trim(),
            email: email.trim(),
            sifre: sifre,
            unvan: unvan.trim(),
            aciklama: aciklama.trim(),
            diplomaNo: diplomaNo.trim(),
            sicilNo: sicilNo.trim(),
            tcNo: tcNo.trim(),
            bransIds: seciliBranslar
        };

        try {
            setKaydediyor(true);
            await axiosInstance.post('/PersonelPanel/doktorlar', payload);
            kapatModal();
            fetchDoktorlar();
        } catch (err) {
            console.error('Doktor eklenemedi:', err);
            toast.error(err.response?.data?.message || 'Doktor eklenirken hata oluştu.');
        } finally {
            setKaydediyor(false);
        }
    };

    const handleSil = (id) => {
        setConfirmData({
            baslik: 'Doktoru Sil',
            mesaj: 'Bu doktoru silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
            onaylaText: 'Evet, Sil',
            onConfirm: () => doktorSil(id)
        });
    };

    const doktorSil = async (id) => {
        try {
            await axiosInstance.delete(`/PersonelPanel/doktorlar/${id}`);
            toast.success('Doktor silindi.');
            fetchDoktorlar();
        } catch (err) {
            console.error('Doktor silinemedi:', err);
            toast.error('Doktor silinemedi. Bu doktora bağlı randevular olabilir.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Stethoscope className="w-6 h-6 text-slate-700" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Doktorlar</h1>
                        <p className="text-sm text-slate-500">Klinik hekimlerini yönetin ve yeni doktor ekleyin.</p>
                    </div>
                </div>
                <button
                    onClick={acModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm transition"
                >
                    <Plus className="w-5 h-5" /> Yeni Doktor
                </button>
            </div>

            {loading ? (
                <p className="text-center text-slate-500 py-10">Yükleniyor...</p>
            ) : doktorlar.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
                    Henüz doktor eklenmemiş. "Yeni Doktor" butonuyla başlayın.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {doktorlar.map(d => (
                        <div
                            key={d.id}
                            onClick={() => acDuzenleModal(d)}
                            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                                        {d.ad?.charAt(0) || <User className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{d.unvan} {d.ad} {d.soyad}</h3>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                            <Mail className="w-3 h-3" /> {d.email}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleSil(d.id); }}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                    title="Sil"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {d.branslar?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {d.branslar.map((brans, i) => (
                                        <span key={i} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium flex items-center gap-1">
                                            <Award className="w-3 h-3" /> {brans}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {modalAcik && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="font-bold text-slate-800 text-lg">{editId ? 'Doktoru Düzenle' : 'Yeni Doktor Ekle'}</h3>
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
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Unvan</label>
                                <input type="text" value={unvan} onChange={(e) => setUnvan(e.target.value)}
                                    placeholder="Op. Dr., Prof. Dr., Uzm. Dr..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>

                            {!editId && (
                                <>
                                    <div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-600 mb-1">Email (giriş için)</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="doktor@klinik.com"
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-1">Şifre (giriş için)</label>
                                        <div className="relative">
                                            <input
                                                type={sifreGoster ? 'text' : 'password'}
                                                value={sifre}
                                                onChange={(e) => setSifre(e.target.value)}
                                                placeholder="En az 4 karakter"
                                                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setSifreGoster(!sifreGoster)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                tabIndex={-1}
                                            >
                                                {sifreGoster ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                </>
                                
                            )}

                            <div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Diploma No</label>
                                    <input type="text" value={diplomaNo} onChange={(e) => setDiplomaNo(e.target.value)}
                                        placeholder="Diploma numarası"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Sicil No</label>
                                    <input type="text" value={sicilNo} onChange={(e) => setSicilNo(e.target.value)}
                                        placeholder="Sicil numarası"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">TC Kimlik No</label>
                                    <input type="text" inputMode="numeric" maxLength={11} value={tcNo}
                                        onChange={(e) => setTcNo(e.target.value.replace(/\D/g, ''))}
                                        placeholder="11 haneli TC"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>

                                <label className="block text-sm font-semibold text-slate-600 mb-1">Açıklama (opsiyonel)</label>
                                <input type="text" value={aciklama} onChange={(e) => setAciklama(e.target.value)}
                                    placeholder="Kısa biyografi"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Branşlar</label>
                                {branslar.length === 0 ? (
                                    <p className="text-xs text-slate-400">Sistemde branş tanımlı değil.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {branslar.map(b => (
                                            <button
                                                key={b.id}
                                                type="button"
                                                onClick={() => bransToggle(b.id)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition ${seciliBranslar.includes(b.id)
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                    }`}
                                            >
                                                {b.ad}
                                            </button>
                                        ))}
                                    </div>
                                )}
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
            <ConfirmModal data={confirmData} onClose={() => setConfirmData(null)} />
        </div>
    );
}