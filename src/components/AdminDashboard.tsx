import React, { useEffect, useState } from 'react';
import { X, Users, FileText, TrendingUp, Clock, Check, Ban, Trash2, Eye, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { adService } from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface AdminDashboardProps {
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ads' | 'users'>('overview');
  const [ads, setAds] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [{ data: adsData, error: adsErr }, { data: usersData, error: usersErr }] = await Promise.all([
        supabase.from('ads').select('*, users(*), categories(*)').order('created_at', { ascending: false }),
        supabase.from('users').select('*').order('created_at', { ascending: false })
      ]);
      if (adsErr) throw adsErr;
      if (usersErr) throw usersErr;
      setAds(adsData || []);
      setUsers(usersData || []);
    } catch (e: any) {
      setError(e.message || 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = {
    totalAds: ads.length,
    activeAds: ads.filter((ad: any) => ad.status === 'active').length,
    pendingAds: ads.filter((ad: any) => ad.status === 'pending').length,
    totalUsers: users.length,
    activeUsers: users.filter((u: any) => u.is_active).length,
  };

  const filteredAds = ads.filter((ad: any) => 
    (ad.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ad.users?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter((user: any) => 
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteAd = async (id: string) => {
    if (!confirm('Bu ilanı silmek istediğinize emin misiniz?')) return;
    try {
      await adService.deleteAd(id);
      toast.success('İlan silindi');
      setAds(prev => prev.filter((a: any) => a.id !== id));
    } catch (e: any) {
      toast.error(e.message || 'Silme işlemi başarısız');
    }
  };

  const handleApproveAd = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ status: 'active' })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('İlan onaylandı');
      setAds(prev => prev.map((a: any) => a.id === id ? { ...a, status: 'active' } : a));
    } catch (e: any) {
      toast.error(e.message || 'Onaylama başarısız');
    }
  };

  const handleViewAd = (id: string) => {
    window.open(`/ilan/${id}`, '_blank');
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı engellemek istediğinize emin misiniz?')) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast.success('Kullanıcı engellendi');
      setUsers(prev => prev.map((u: any) => u.id === userId ? { ...u, is_active: false } : u));
    } catch (e: any) {
      toast.error(e.message || 'Engelleme başarısız');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) return;
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      toast.success('Kullanıcı silindi');
      setUsers(prev => prev.filter((u: any) => u.id !== userId));
    } catch (e: any) {
      toast.error(e.message || 'Silme başarısız');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
      sold: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400',
    };
    
    const labels: Record<string, string> = {
      active: 'Aktif',
      pending: 'Beklemede',
      rejected: 'Reddedildi',
      sold: 'Satıldı',
    };

    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Bilinmiyor';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Bilinmiyor';
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-2xl flex items-start justify-center z-[150] p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-navy-900 rounded-[2.5rem] max-w-7xl w-full my-8 relative shadow-2xl border border-slate-100 dark:border-silver-700/10 overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-8 right-8 z-10 w-12 h-12 bg-slate-100 dark:bg-navy-800 rounded-full flex items-center justify-center text-silver-500 dark:text-silver-400 hover:text-accent hover:scale-105 transition-all"
        >
          <X size={24} />
        </button>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-silver-100">
              Admin Paneli
            </h1>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-accent text-white'
                    : 'text-silver-500 dark:text-silver-400 hover:bg-slate-100 dark:hover:bg-navy-800'
                }`}
              >
                Genel Bakış
              </button>
              <button
                onClick={() => setActiveTab('ads')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === 'ads'
                    ? 'bg-accent text-white'
                    : 'text-silver-500 dark:text-silver-400 hover:bg-slate-100 dark:hover:bg-navy-800'
                }`}
              >
                İlanlar
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === 'users'
                    ? 'bg-accent text-white'
                    : 'text-silver-500 dark:text-silver-400 hover:bg-slate-100 dark:hover:bg-navy-800'
                }`}
              >
                Kullanıcılar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-silver-500 dark:text-silver-400">
              <div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm font-semibold">Yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-500">{error}</div>
          ) : activeTab === 'overview' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-center">
                    <FileText className="text-blue-600 dark:text-blue-400" size={24} />
                    <div className="ml-3">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.totalAds}
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        Toplam İlan
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center">
                    <Check className="text-emerald-600 dark:text-emerald-400" size={24} />
                    <div className="ml-3">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {stats.activeAds}
                      </div>
                      <div className="text-sm text-emerald-700 dark:text-emerald-300">
                        Aktif İlan
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
                  <div className="flex items-center">
                    <Clock className="text-amber-600 dark:text-amber-400" size={24} />
                    <div className="ml-3">
                      <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {stats.pendingAds}
                      </div>
                      <div className="text-sm text-amber-700 dark:text-amber-300">
                        Bekleyen İlan
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-navy-50 dark:bg-navy-800/50 border border-slate-200 dark:border-silver-700/15 rounded-xl p-4">
                  <div className="flex items-center">
                    <Users className="text-slate-600 dark:text-silver-400" size={24} />
                    <div className="ml-3">
                      <div className="text-2xl font-bold text-slate-600 dark:text-silver-400">
                        {stats.totalUsers}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-silver-500">
                        Toplam Kullanıcı
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/10 dark:bg-accent/10 border border-accent/20 dark:border-accent/20 rounded-xl p-4">
                  <div className="flex items-center">
                    <TrendingUp className="text-accent" size={24} />
                    <div className="ml-3">
                      <div className="text-2xl font-bold text-accent">
                        {stats.activeUsers}
                      </div>
                      <div className="text-sm text-accent-dark dark:text-accent-light">
                        Aktif Kullanıcı
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-navy-800/50 rounded-xl p-6 border border-slate-100 dark:border-silver-700/10">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-silver-100 mb-4">
                  Son Aktiviteler
                </h3>
                <div className="space-y-3">
                  {ads.slice(0, 5).map((ad: any) => (
                    <div key={ad.id} className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-silver-100">
                          {ad.title}
                        </div>
                        <div className="text-sm text-silver-500 dark:text-silver-600">
                          {(ad.users?.name || 'Bilinmiyor')} tarafından {formatDate(ad.created_at)}
                        </div>
                      </div>
                      {getStatusBadge(ad.status)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'ads' && !loading && !error && (
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver-400" size={20} />
                <input
                  type="text"
                  placeholder="İlan ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-silver-700/15 rounded-xl focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white dark:bg-navy-800 text-slate-900 dark:text-silver-100 placeholder-silver-400 dark:placeholder-silver-600 outline-none transition-all"
                />
              </div>

              <div className="bg-white dark:bg-navy-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-silver-700/10">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-navy-800/80">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-silver-500 dark:text-silver-600 uppercase tracking-wider">
                          İlan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-silver-500 dark:text-silver-600 uppercase tracking-wider">
                          Fiyat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-silver-500 dark:text-silver-600 uppercase tracking-wider">
                          Satıcı
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-silver-500 dark:text-silver-600 uppercase tracking-wider">
                          Durum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-silver-500 dark:text-silver-600 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-silver-700/10">
                      {filteredAds.map((ad: any) => (
                        <tr key={ad.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <img
                                src={ad.images?.[0] || ''}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover mr-3 bg-slate-100 dark:bg-navy-800"
                              />
                              <div>
                                <div className="font-medium text-slate-900 dark:text-silver-100">
                                  {ad.title}
                                </div>
                                <div className="text-sm text-silver-500 dark:text-silver-600">
                                  {ad.categories?.name || ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-900 dark:text-silver-100 font-semibold">
                            {formatPrice(ad.price)}
                          </td>
                          <td className="px-6 py-4 text-slate-700 dark:text-silver-300">
                            {ad.users?.name}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(ad.status)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleViewAd(ad.id)}
                                className="text-accent hover:bg-accent/10 p-1.5 rounded-lg transition-colors"
                                title="İlanı Görüntüle"
                              >
                                <Eye size={16} />
                              </button>
                              {ad.status !== 'active' && (
                                <button 
                                  onClick={() => handleApproveAd(ad.id)}
                                  className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 p-1.5 rounded-lg transition-colors"
                                  title="İlanı Onayla"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteAd(ad.id)} 
                                className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                                title="İlanı Sil"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && !loading && !error && (
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver-400" size={20} />
                <input
                  type="text"
                  placeholder="Kullanıcı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-silver-700/15 rounded-xl focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white dark:bg-navy-800 text-slate-900 dark:text-silver-100 placeholder-silver-400 dark:placeholder-silver-600 outline-none transition-all"
                />
              </div>

              <div className="bg-white dark:bg-navy-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-silver-700/10">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-navy-800/80">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-silver-500 dark:text-silver-600 uppercase tracking-wider">
                          Kullanıcı
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-silver-500 dark:text-silver-600 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-silver-500 dark:text-silver-600 uppercase tracking-wider">
                          Rol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-silver-500 dark:text-silver-600 uppercase tracking-wider">
                          Üyelik Tarihi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-silver-500 dark:text-silver-600 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-silver-700/10">
                      {filteredUsers.map((user: any) => (
                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-slate-200 dark:bg-navy-700 rounded-full flex items-center justify-center mr-3">
                                <span className="text-slate-500 dark:text-silver-400 font-semibold text-sm">
                                  {(user.name || '').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 dark:text-silver-100">
                                  {user.name}
                                </div>
                                <div className={`text-sm font-semibold ${user.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                  {user.is_active ? 'Aktif' : 'Pasif'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-700 dark:text-silver-300">
                            {user.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                              user.role === 'admin'
                                ? 'bg-accent/10 text-accent dark:bg-accent/10 dark:text-accent-light'
                                : 'bg-slate-100 text-slate-600 dark:bg-navy-700 dark:text-silver-400'
                            }`}>
                              {user.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-700 dark:text-silver-300">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              {user.is_active && (
                                <button 
                                  onClick={() => handleBanUser(user.id)}
                                  className="text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 p-1.5 rounded-lg transition-colors"
                                  title="Kullanıcıyı Engelle"
                                >
                                  <Ban size={16} />
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                                title="Kullanıcıyı Sil"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
