import React, { useEffect, useState } from 'react';
import { X, Users, FileText, TrendingUp, Clock, Check, Ban, Trash2, Eye, Search } from 'lucide-react';
import { Ad, User } from '../types';
import { supabase } from '../lib/supabase';
import { adService } from '../services/api';
import toast from 'react-hot-toast';

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

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      sold: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    
    const labels = {
      active: 'Aktif',
      pending: 'Beklemede',
      rejected: 'Reddedildi',
      sold: 'Satıldı',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' TL';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-7xl w-full my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X size={24} />
        </button>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Genel Bakış
              </button>
              <button
                onClick={() => setActiveTab('ads')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'ads'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                İlanlar
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Kullanıcılar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-600 dark:text-gray-300">Yükleniyor...</div>
          ) : error ? (
            <div className="py-16 text-center text-red-600">{error}</div>
          ) : activeTab === 'overview' ? (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <FileText className="text-blue-600 dark:text-blue-400" size={24} />
                    <div className="ml-3">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.totalAds}
                      </div>
                      <div className="text-sm text-blue-800 dark:text-blue-300">
                        Toplam İlan
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <Check className="text-green-600 dark:text-green-400" size={24} />
                    <div className="ml-3">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.activeAds}
                      </div>
                      <div className="text-sm text-green-800 dark:text-green-300">
                        Aktif İlan
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
                    <div className="ml-3">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {stats.pendingAds}
                      </div>
                      <div className="text-sm text-yellow-800 dark:text-yellow-300">
                        Bekleyen İlan
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <Users className="text-purple-600 dark:text-purple-400" size={24} />
                    <div className="ml-3">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {stats.totalUsers}
                      </div>
                      <div className="text-sm text-purple-800 dark:text-purple-300">
                        Toplam Kullanıcı
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <TrendingUp className="text-indigo-600 dark:text-indigo-400" size={24} />
                    <div className="ml-3">
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {stats.activeUsers}
                      </div>
                      <div className="text-sm text-indigo-800 dark:text-indigo-300">
                        Aktif Kullanıcı
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Son Aktiviteler
                </h3>
                <div className="space-y-3">
                  {ads.slice(0, 5).map((ad: any) => (
                    <div key={ad.id} className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {ad.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
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
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="İlan ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Ads Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          İlan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Fiyat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Satıcı
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Durum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredAds.map((ad: any) => (
                        <tr key={ad.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <img
                                src={ad.images?.[0] || ''}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover mr-3"
                              />
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {ad.title}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {ad.categories?.name || ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white">
                            {formatPrice(ad.price)}
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white">
                            {ad.users?.name}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(ad.status)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1 rounded">
                                <Eye size={16} />
                              </button>
                              <button className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 p-1 rounded">
                                <Check size={16} />
                              </button>
                              <button onClick={() => handleDeleteAd(ad.id)} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded">
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
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Kullanıcı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Users Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Kullanıcı
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Rol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Üyelik Tarihi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredUsers.map((user: any) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                  {(user.name || '').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {user.name}
                                </div>
                                <div className={`text-sm ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                  {user.is_active ? 'Aktif' : 'Pasif'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white">
                            {user.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {user.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 p-1 rounded">
                                <Ban size={16} />
                              </button>
                              <button className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded">
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
      </div>
    </div>
  );
};

export default AdminDashboard;