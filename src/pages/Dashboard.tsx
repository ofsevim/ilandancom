import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adService, messageService } from '../services/api';
import { Ad } from '../types';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import ProfileModal from '../components/ProfileModal';
import EditAdModal from '../components/EditAdModal';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Tümü');
    const [stats, setStats] = useState({
        active: 0,
        views: 0,
        messages: 0
    });
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [editingAd, setEditingAd] = useState<Ad | null>(null);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [userAds, unreadCount] = await Promise.all([
                    adService.getUserAds(user.id),
                    messageService.getUnreadCount()
                ]);

                const adsData = userAds || [];
                setAds(adsData);

                const activeCount = adsData.filter((a: any) => a.status === 'active').length;
                const totalViews = adsData.reduce((acc: number, curr: Ad) => acc + (curr.viewCount || 0), 0);
                
                setStats({
                    active: activeCount,
                    views: totalViews,
                    messages: unreadCount
                });
            } catch (error) {
                console.error('Dashboard data fetch error:', error);
                toast.error('Veriler yüklenirken bir hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, navigate]);

    const handleAction = async (action: string, adId: string) => {
        try {
            if (action === 'delete') {
                if (!confirm('İlanı silmek istediğinize emin misiniz?')) return;
                await adService.deleteAd(adId);
                setAds(ads.filter(a => a.id !== adId));
                toast.success('İlan silindi');
            } else if (action === 'sold') {
                await (adService as any).updateAd(adId, { status: 'sold' });
                setAds(ads.map(a => a.id === adId ? { ...a, status: 'sold' as any } : a));
                toast.success('İlan satıldı olarak işaretlendi');
            } else if (action === 'activate') {
                 await (adService as any).updateAd(adId, { status: 'active' });
                 setAds(ads.map(a => a.id === adId ? { ...a, status: 'active' as any } : a));
                 toast.success('İlan yayına alındı');
            }
        } catch (error) {
            toast.error('İşlem başarısız oldu');
        }
    };

    const filteredAds = ads.filter(ad => {
        const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'Tümü' || 
                            (activeFilter === 'Aktif' && ad.status === 'active') ||
                            (activeFilter === 'Pasif' && ad.status !== 'active');
        return matchesSearch && matchesFilter;
    });

    if (!user) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-navy-950">
            <aside className="w-72 bg-white dark:bg-navy-900 flex flex-col justify-between p-8 border-r border-slate-200 dark:border-silver-700/10">
                <div className="space-y-10">
                    <Link to="/" className="flex items-center gap-4 px-2">
                        <div className="w-12 h-12 flex-shrink-0">
                            <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                <defs>
                                    <linearGradient id="dbg" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#2563eb" />
                                    </linearGradient>
                                    <linearGradient id="dglam" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#ffffff" />
                                        <stop offset="100%" stopColor="#e9ecef" />
                                    </linearGradient>
                                </defs>
                                <rect width="512" height="512" rx="120" fill="url(#dbg)" />
                                <path d="M108 100 L108 348 Q108 380 140 380 L320 380 Q348 380 364 358 L434 268 Q450 250 434 232 L364 142 Q348 120 320 120 L140 120 Q108 120 108 100 Z" fill="url(#dglam)" opacity="0.95" />
                                <circle cx="164" cy="250" r="30" fill="url(#dbg)" />
                                <circle cx="164" cy="250" r="22" fill="url(#dglam)" opacity="0.6" />
                                <rect x="210" y="198" width="140" height="18" rx="9" fill="url(#dbg)" opacity="0.4" />
                                <rect x="210" y="234" width="108" height="14" rx="7" fill="url(#dbg)" opacity="0.3" />
                                <rect x="210" y="264" width="124" height="14" rx="7" fill="url(#dbg)" opacity="0.25" />
                                <rect x="210" y="294" width="88" height="14" rx="7" fill="url(#dbg)" opacity="0.2" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-black leading-tight text-slate-900 dark:text-silver-100 tracking-tight">ilandan<span className="text-accent">.online</span></h1>
                            <p className="text-[10px] text-accent font-bold uppercase tracking-widest">{user.role === 'admin' ? 'YÖNETİCİ' : 'ÜYE'}</p>
                        </div>
                    </Link>
                    <nav className="space-y-2">
                        <Link to="/dashboard" className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-accent/10 text-accent dark:text-accent-light font-bold transition-all border border-accent/20 shadow-sm">
                            <span className="material-symbols-outlined">analytics</span>
                            <span className="text-sm">Panel</span>
                        </Link>
                        <Link to="/mesajlar" className="flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-600 dark:text-silver-400 hover:bg-white dark:hover:bg-navy-800/60 transition-all font-semibold hover:shadow-sm">
                            <span className="material-symbols-outlined">chat_bubble</span>
                            <span className="text-sm">Mesajlar</span>
                            {stats.messages > 0 && (
                                <span className="ml-auto bg-accent text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-glow">{stats.messages}</span>
                            )}
                        </Link>
                        <Link to="/favoriler" className="flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-600 dark:text-silver-400 hover:bg-white dark:hover:bg-navy-800/60 transition-all font-semibold hover:shadow-sm">
                            <span className="material-symbols-outlined">favorite</span>
                            <span className="text-sm">Favoriler</span>
                        </Link>
                    <button
                        onClick={() => setShowProfileModal(true)}
                        className="flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-600 dark:text-silver-400 hover:bg-white dark:hover:bg-navy-800/60 transition-all font-semibold hover:shadow-sm w-full"
                    >
                        <span className="material-symbols-outlined">person</span>
                        <span className="text-sm">Profil Ayarları</span>
                    </button>
                    <Link to="/" className="flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-600 dark:text-silver-400 hover:bg-white dark:hover:bg-navy-800/60 transition-all font-semibold hover:shadow-sm">
                        <span className="material-symbols-outlined">home</span>
                        <span className="text-sm">Ana Sayfa</span>
                    </Link>
                    </nav>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-navy-800/50 p-5 rounded-[2rem] border border-slate-100 dark:border-silver-700/10 shadow-sm">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="h-12 w-12 rounded-full bg-accent/10 dark:bg-accent/10 flex items-center justify-center text-accent font-bold text-xl overflow-hidden border border-accent/20">
                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[15px] font-black truncate text-slate-900 dark:text-silver-100 leading-tight">{user.name}</p>
                                <p className="text-[10px] text-silver-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                    <span className="material-symbols-outlined text-[12px] text-accent">verified_user</span>
                                    {user.role === 'admin' ? 'YÖNETİCİ' : 'ÜYE'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={logout}
                            className="w-full bg-slate-50 dark:bg-navy-800 text-red-500 text-[11px] font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 border border-transparent hover:border-red-200 dark:hover:border-red-500/30"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                <header className="sticky top-0 z-10 bg-white/80 dark:bg-navy-950/80 backdrop-blur-2xl border-b border-slate-200 dark:border-silver-700/10 px-10 py-6 flex items-center justify-between shadow-sm">
                    <div className="relative w-[400px]">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-accent">search</span>
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-silver-700/15 rounded-2xl text-slate-900 dark:text-silver-100 placeholder-silver-500 dark:placeholder-silver-600 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none" 
                            placeholder="İlanlarımda ara..." 
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/ilan-ver" className="bg-accent text-white px-8 py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all shadow-glow hover:-translate-y-0.5 flex items-center gap-2 hover:shadow-glow-lg">
                             <span className="material-symbols-outlined text-[18px]">add</span>
                             Yeni İlan Ver
                        </Link>
                    </div>
                </header>

                <div className="p-10 max-w-[1200px] mx-auto space-y-12">
                    <section>
                        <div className="mb-8 pl-2 border-l-[3px] border-accent">
                            <h2 className="text-[32px] font-black tracking-tighter text-slate-900 dark:text-silver-100 uppercase leading-none mb-2">Hoş geldin, {user.name.split(' ')[0]}</h2>
                            <p className="text-silver-500 dark:text-silver-600 font-medium uppercase tracking-widest text-[11px]">Pazar özetin ve istatistiklerin.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Aktif İlanlar', value: stats.active, icon: 'campaign', color: 'bg-accent/10 dark:bg-accent/10 text-accent dark:text-accent-light border-accent/20 dark:border-accent/20', trend: '+2 Yeni', trendColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' },
                                { label: 'Görüntülenme', value: stats.views.toLocaleString(), icon: 'visibility', color: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20', trend: '%5 Düşüş', trendColor: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10' },
                                { label: 'Mesajlar', value: stats.messages, icon: 'forum', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20', trend: '+%12', trendColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' }
                            ].map((item, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white dark:bg-navy-800/50 p-8 group border border-slate-100 dark:border-silver-700/10 rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className={`p-3 rounded-2xl border ${item.color} group-hover:scale-110 transition-transform`}>
                                            <span className="material-symbols-outlined text-[24px] block">{item.icon}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl ${item.trendColor}`}>{item.trend}</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-silver-500 dark:text-silver-600 uppercase tracking-widest">{item.label}</p>
                                    <p className="text-[40px] font-black mt-2 text-slate-900 dark:text-silver-100 tracking-tighter leading-none">{item.value}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-silver-700/10">
                            <h3 className="text-[20px] font-bold text-slate-900 dark:text-silver-100 flex items-center gap-2">
                                <span className="material-symbols-outlined text-accent">list_alt</span>
                                İlanlarım
                            </h3>
                            <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-navy-800 rounded-2xl border border-slate-200 dark:border-silver-700/10">
                                {['Tümü', 'Aktif', 'Pasif'].map((filter) => (
                                    <button 
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === activeFilter ? 'bg-white dark:bg-accent text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-transparent' : 'text-silver-500 hover:text-slate-700 dark:hover:text-silver-300'}`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-20 bg-white dark:bg-navy-800 rounded-[2rem] border border-slate-200 dark:border-silver-700/10">
                                    <div className="animate-spin w-12 h-12 border-[5px] border-accent border-t-transparent rounded-full mx-auto"></div>
                                    <p className="text-accent text-[11px] font-bold uppercase tracking-widest mt-6">İlanlar yükleniyor...</p>
                                </div>
                            ) : filteredAds.length === 0 ? (
                                <div className="text-center py-24 bg-white dark:bg-navy-800/50 border-2 border-dashed border-silver-300 dark:border-silver-700/20 rounded-2xl">
                                    <span className="material-symbols-outlined text-6xl text-silver-300 dark:text-silver-700 mb-6">folder_open</span>
                                    <p className="text-slate-700 dark:text-silver-100 text-[18px] font-bold tracking-tight mb-2">Henüz ilanınız bulunmuyor</p>
                                    <p className="text-silver-500 dark:text-silver-600 text-[12px] font-medium mb-6">Satışa başlamak için hemen yeni bir ilan oluşturun.</p>
                                    <Link to="/ilan-ver" className="bg-accent text-white px-8 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-glow hover:-translate-y-0.5 transition-all inline-block">Yeni İlan Oluştur</Link>
                                </div>
                            ) : (
                                filteredAds.map((ad, idx) => (
                                    <motion.div 
                                        key={ad.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`group bg-white dark:bg-navy-800/50 p-4 flex flex-col md:flex-row gap-6 border border-slate-100 dark:border-silver-700/10 rounded-2xl shadow-card hover:shadow-card-hover transition-all ${ad.status !== 'active' ? 'opacity-70 grayscale-[0.3]' : ''}`}
                                    >
                                        <div className="relative w-full md:w-64 h-40 shrink-0 rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-200 dark:border-silver-700/15 m-2">
                                            {ad.images && ad.images.length > 0 ? (
                                                <img src={ad.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt={ad.title} />
                                            ) : (
                                                <div className="w-full h-full bg-slate-50 dark:bg-navy-800 flex items-center justify-center text-silver-400 dark:text-silver-600">
                                                    <span className="material-symbols-outlined text-4xl opacity-50">image_not_supported</span>
                                                </div>
                                            )}
                                            <div className={`absolute top-3 left-3 px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg backdrop-blur-md ${ad.status === 'active' ? 'bg-emerald-500/90 text-white' : 'bg-slate-800/90 text-white'}`}>
                                                {ad.status === 'active' ? 'AKTİF' : ad.status.toUpperCase()}
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between py-3 pr-4">
                                            <div>
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] text-accent font-bold uppercase tracking-widest">{ad.category?.name || 'Genel'}</p>
                                                        <h4 className="text-[20px] font-extrabold text-slate-900 dark:text-silver-100 group-hover:text-accent transition-colors leading-[1.2] tracking-tight">{ad.title}</h4>
                                                        <div className="flex items-center gap-3 text-silver-500 dark:text-silver-600 text-[11px] font-bold uppercase tracking-widest pt-1">
                                                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">visibility</span>{ad.viewCount || 0} Görüntülenme</span>
                                                            <span className="h-1 w-1 bg-slate-200 dark:bg-silver-700 rounded-full"></span>
                                                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">event</span>{ad.createdAt && !isNaN(new Date(ad.createdAt).getTime()) ? new Date(ad.createdAt).toLocaleDateString('tr-TR') : 'YENİ'}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[24px] font-black text-slate-900 dark:text-silver-100 tracking-tighter">{ad.price.toLocaleString('tr-TR')} ₺</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-3 mt-8">
                                                <Link 
                                                    to={`/ilan/${ad.id}`}
                                                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-navy-800 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-700 dark:text-silver-300 hover:bg-accent hover:text-white transition-all shadow-sm border border-slate-200 dark:border-silver-700/10 hover:border-transparent"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                    Görüntüle
                                                </Link>
                                                <button
                                                    onClick={() => setEditingAd(ad)}
                                                    className="flex items-center gap-2 px-6 py-2.5 bg-accent/10 dark:bg-accent/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-accent dark:text-accent-light hover:bg-accent hover:text-white transition-all shadow-sm border border-accent/20 dark:border-transparent"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                                    Düzenle
                                                </button>
                                                <button 
                                                    onClick={() => handleAction('sold', ad.id)}
                                                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-emerald-200 dark:border-transparent"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                                    Satıldı
                                                </button>
                                                <button 
                                                    onClick={() => handleAction('delete', ad.id)}
                                                    className="flex items-center gap-2 px-6 py-2.5 bg-red-50 dark:bg-red-500/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-200 dark:border-transparent"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                                    Sil
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </main>
            {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
            {editingAd && <EditAdModal ad={editingAd} onClose={() => setEditingAd(null)} onAdUpdated={() => { setEditingAd(null); setAds(prev => prev.map(a => a.id === editingAd.id ? { ...a } : a)); }} />}
        </div>
    );
};

export default Dashboard;
