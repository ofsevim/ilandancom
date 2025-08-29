import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import { User, Edit, Save, X, Camera, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileModalProps {
  onClose: () => void;
  onShowAdmin?: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, onShowAdmin }) => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });

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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Profil Bilgileri
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="Profil"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-gray-400" />
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                  <Camera size={16} />
                </button>
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {user?.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.role === 'admin' ? 'Admin' : 'Kullanıcı'}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-posta
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Üyelik Tarihi
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Kaydet
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  İptal
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <Edit size={16} className="mr-2" />
                  Düzenle
                </button>
                {user?.role === 'admin' && onShowAdmin && (
                  <button
                    onClick={() => {
                      onShowAdmin();
                      onClose();
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                  >
                    <Settings size={16} className="mr-2" />
                    Admin Panel
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Çıkış
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
