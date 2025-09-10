import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService, adService } from '../services/api';
import { User, Edit, Save, X, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileModalProps {
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { user, logout, favorites } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });

  const [stats, setStats] = useState({
    activeAds: 0,
    soldAds: 0,
    totalViews: 0,
  });

  React.useEffect(() => {
    let mounted = true;
    const loadStats = async () => {
      if (!user) return;
      try {
        const myAds: any[] = await adService.getUserAds(user.id);
        if (!mounted) return;
        const activeAds = (myAds || []).filter(a => a.status === 'active').length;
        const soldAds = (myAds || []).filter(a => a.status === 'sold').length;
        const totalViews = (myAds || []).reduce((sum, a) => sum + (a.view_count || 0), 0);
        setStats({ activeAds, soldAds, totalViews });
      } catch {
        if (!mounted) return;
        setStats({ activeAds: 0, soldAds: 0, totalViews: 0 });
      }
    };
    loadStats();
    return () => { mounted = false; };
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await userService.updateUser(user.id, formData);
      toast.success('Profil güncellendi!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Profil güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
    toast.success('Başarıyla çıkış yapıldı');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profil Bilgileri
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="Profil"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700"
                  />
                ) : (
                  <User size={64} className="text-white" />
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-2 right-2 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 shadow-lg transition-all duration-200 hover:scale-110">
                  <Camera size={18} />
                </button>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {user?.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              }`}>
                {user?.role === 'admin' ? '👑 Admin' : '👤 Kullanıcı'}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Üye: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                👤 Ad Soyad
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 transition-all duration-200"
                placeholder="Adınız ve soyadınız"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📧 E-posta
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 transition-all duration-200"
                placeholder="E-posta adresiniz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📱 Telefon
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 transition-all duration-200"
                placeholder="Telefon numaranız"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🆔 Kullanıcı ID
              </label>
              <div className="px-4 py-3 bg-gray-100 dark:bg-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 font-mono">
                {user?.id || 'Belirtilmemiş'}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📊 Hesap İstatistikleri
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.activeAds}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Aktif İlan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.soldAds}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Satılan İlan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalViews}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Toplam Görüntülenme</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{favorites.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Favori İlan</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-8">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 flex items-center justify-center font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Değişiklikleri Kaydet
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
                >
                  İptal
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center justify-center font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
                >
                  <Edit size={18} className="mr-2" />
                  Profili Düzenle
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-medium"
                >
                  🚪 Çıkış Yap
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
