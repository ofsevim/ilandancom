import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adService, messageService } from '../services/api';
import { Ad } from '../types';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({
        active: 0,
        views: 0,
        messages: 0
    });

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

                // Ensure data is array
                const adsData = userAds || [];
                setAds(adsData);

                // Calculate stats
                const activeCount = adsData.filter((a: any) => a.status === 'active').length;
                const totalViews = adsData.reduce((acc: number, curr: any) => acc + (curr.view_count || 0), 0);
                
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

    const filteredAds = ads.filter(ad => 
        ad.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Sidebar */}
            <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-6">
                <div className="space-y-8">
                    <Link to="/" className="flex items-center gap-3 px-2">
                        <div className="bg-primary p-2 rounded-lg text-white">
                            <span className="material-symbols-outlined block">storefront</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight dark:text-white">Premium Pazar</h1>
                            <p className="text-[10px] text-primary font-black uppercase tracking-widest">{user.role === 'admin' ? 'ADMİN PANEL' : 'PREMİUM ÜYE'}</p>
                        </div>
                    </Link>
                    <nav className="space-y-1">
                        <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold transition-all">
                            <span className="material-symbols-outlined">analytics</span>
                            <span className="text-sm">Panel</span>
                        </Link>
                        <Link to="/mesajlar" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-semibold">
                            <span className="material-symbols-outlined">chat_bubble</span>
                            <span className="text-sm">Mesajlar</span>
                            {stats.messages > 0 && (
                                <span className="ml-auto bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{stats.messages}</span>
                            )}
                        </Link>
                        <Link to="/favoriler" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-semibold">
                            <span className="material-symbols-outlined">favorite</span>
                            <span className="text-sm">Favoriler</span>
                        </Link>
                        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-semibold">
                            <span className="material-symbols-outlined">home</span>
                            <span className="text-sm">Ana Sayfa</span>
                        </Link>
                    </nav>
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold truncate dark:text-white uppercase tracking-tight">{user.name}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Çevrim içi</p>
                            </div>
                        </div>
                        <button 
                            onClick={logout}
                            className="w-full bg-white dark:bg-slate-900 text-red-500 text-xs font-bold py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-5 flex items-center justify-between">
                    <div className="relative w-96">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/50 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400" 
                            placeholder="İlanlarımda ara..." 
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/ilan-ver" className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                             <span className="material-symbols-outlined text-sm">add</span>
                             İlan Ver
                        </Link>
                    </div>
                </header>

                <div className="p-8 max-w-6xl mx-auto space-y-10">
                    <section>
                        <div className="mb-8">
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">Hoş geldin, {user.name.split(' ')[0]} 👋</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-2 uppercase tracking-widest text-[10px]">Marketplace performans özetin burada.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Aktif İlanlar', value: stats.active, icon: 'campaign', color: 'bg-primary/10 text-primary', trend: '+2 yeni', trendColor: 'text-green-500 bg-green-500/10' },
                                { label: 'Görüntülenme', value: stats.views.toLocaleString(), icon: 'visibility', color: 'bg-orange-500/10 text-orange-500', trend: '%5 düşüş', trendColor: 'text-red-500 bg-red-500/10' },
                                { label: 'Mesajlar', value: stats.messages, icon: 'forum', color: 'bg-blue-500/10 text-blue-500', trend: '+12%', trendColor: 'text-green-500 bg-green-500/10' }
                            ].map((item, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <div className={`p-2.5 rounded-2xl ${item.color}`}>
                                            <span className="material-symbols-outlined block">{item.icon}</span>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${item.trendColor}`}>{item.trend}</span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                                    <p className="text-4xl font-black mt-2 text-slate-900 dark:text-white tracking-tighter">{item.value}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">İlanlarım</h3>
                            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                                {['Tümü', 'Aktif', 'Pasif'].map((filter) => (
                                    <button 
                                        key={filter}
                                        className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'Tümü' ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-20">
                                    <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-4">İlanlar yükleniyor...</p>
                                </div>
                            ) : filteredAds.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">folder_open</span>
                                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Henüz ilanınız bulunmuyor</p>
                                    <Link to="/ilan-ver" className="text-primary text-xs font-bold uppercase border-b border-primary mt-2 inline-block">Yeni İlan Oluştur</Link>
                                </div>
                            ) : (
                                filteredAds.map((ad, idx) => (
                                    <motion.div 
                                        key={ad.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`group bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col md:flex-row gap-6 ${ad.status !== 'active' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                                    >
                                        <div className="relative w-full md:w-56 h-36 shrink-0 rounded-2xl overflow-hidden shadow-sm">
                                            {ad.images && ad.images.length > 0 ? (
                                                <img src={ad.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={ad.title} />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                    <span className="material-symbols-outlined">image_not_supported</span>
                                                </div>
                                            )}
                                            <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${ad.status === 'active' ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'}`}>
                                                {ad.status === 'active' ? 'AKTİF' : ad.status.toUpperCase()}
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between py-2">
                                            <div>
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] text-primary font-black uppercase tracking-widest">{(ad as any).category?.name || 'Genel'}</p>
                                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight">{ad.title}</h4>
                                                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-tight">
                                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span>{(ad as any).view_count || 0} Görüntülenme</span>
                                                            <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                                                            <span>{new Date(ad.createdAt).toLocaleDateString('tr-TR')}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{ad.price.toLocaleString('tr-TR')} ₺</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-6">
                                                <Link 
                                                    to={`/ilan/${ad.id}`}
                                                    className="flex items-center gap-2 px-6 py-2 bg-slate-50 dark:bg-slate-800 rounded-full text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all shadow-sm"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                    Görüntüle
                                                </Link>
                                                <button 
                                                    onClick={() => handleAction('sold', ad.id)}
                                                    className="flex items-center gap-2 px-6 py-2 bg-slate-50 dark:bg-slate-800 rounded-full text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                                    Satıldı
                                                </button>
                                                <button 
                                                    onClick={() => handleAction('delete', ad.id)}
                                                    className="flex items-center gap-2 px-6 py-2 bg-slate-50 dark:bg-slate-800 rounded-full text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white transition-all shadow-sm"
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
        </div>
    );
};

export default Dashboard;
