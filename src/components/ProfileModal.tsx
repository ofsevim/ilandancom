import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService, adService, storageService } from '../services/api';
import { toast } from 'react-hot-toast';

interface ProfileModalProps {
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { user, logout, favorites } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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
        const totalViews = (myAds || []).reduce((sum, a) => sum + (a.viewCount || a.view_count || 0), 0);
        setStats({ activeAds, soldAds, totalViews });
      } catch {
        if (!mounted) return;
        setStats({ activeAds: 0, soldAds: 0, totalViews: 0 });
      }
    };
    loadStats();
    return () => { mounted = false; };
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `avatar-${user.id}-${Date.now()}.${ext}`;
      await storageService.uploadImage(file, fileName);
      const url = await storageService.getImageUrl(fileName);
      const newFormData = { ...formData, avatar: url };
      setFormData(newFormData);
      await userService.updateUser(user.id, { avatar: url });
      toast.success('Profil fotoğrafı güncellendi!');
    } catch (err) {
      toast.error('Fotoğraf yüklenemedi');
    } finally {
      setUploadingAvatar(false);
    }
  };

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
    <div className="fixed inset-0 bg-slate-50 dark:bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
      <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-silver-700/20 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 bg-white dark:bg-navy-900 hover:bg-navy-950 border border-silver-700/10 rounded-full flex items-center justify-center text-silver-500 hover:text-slate-900 dark:text-silver-100 transition-all z-50"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="p-8 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-24 h-24 bg-white dark:bg-navy-900 border border-slate-200 dark:border-silver-700/20 rounded-2xl flex items-center justify-center mb-4">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="Profil"
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-slate-500 dark:text-slate-500 dark:text-silver-500">person</span>
                )}
              </div>
              {isEditing && (
                <label className="absolute -bottom-1 -right-1 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-silver-700/20 text-accent p-2 rounded-xl hover:scale-105 transition-all cursor-pointer shadow-lg">
                  {uploadingAvatar ? (
                    <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                </label>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-silver-100 mb-1">
              {user?.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${user?.role === 'admin'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-accent/10 text-accent border border-accent/20'
                }`}>
                {user?.role === 'admin' ? 'Admin' : 'Kullanıcı'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-500 dark:text-silver-500">
                Üye: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '2024'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-semibold text-silver-500 uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">person</span> Ad Soyad
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="input-base w-full px-4 py-3 disabled:opacity-60"
                placeholder="Adınız ve soyadınız"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-semibold text-silver-500 uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">mail</span> E-posta
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="input-base w-full px-4 py-3 disabled:opacity-60"
                placeholder="E-posta adresiniz"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-semibold text-silver-500 uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">phone</span> Telefon
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="input-base w-full px-4 py-3 disabled:opacity-60"
                placeholder="Telefon numaranız"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-semibold text-silver-500 uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">key</span> Kullanıcı ID
              </label>
              <div className="px-4 py-3 bg-white dark:bg-navy-900 border border-silver-700/10 rounded-xl text-[11px] text-silver-500 font-mono break-all">
                {user?.id || '---'}
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-white dark:bg-navy-900 border border-silver-700/10 rounded-xl">
            <h4 className="text-[10px] font-semibold text-silver-500 uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">bar_chart</span> Hesap İstatistikleri
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="text-xl font-bold text-slate-900 dark:text-silver-100">{stats.activeAds}</div>
                <div className="text-[10px] font-medium text-silver-500 uppercase tracking-wider">Aktif İlan</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold text-slate-900 dark:text-silver-100">{stats.soldAds}</div>
                <div className="text-[10px] font-medium text-silver-500 uppercase tracking-wider">Satılan</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold text-slate-900 dark:text-silver-100">{stats.totalViews}</div>
                <div className="text-[10px] font-medium text-silver-500 uppercase tracking-wider">İzlenme</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold text-slate-900 dark:text-silver-100">{favorites.length}</div>
                <div className="text-[10px] font-medium text-silver-500 uppercase tracking-wider">Favori</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn-primary flex-1 py-3.5 text-xs disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Kaydet'
                  )}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary px-8 py-3.5 text-xs"
                >
                  İptal
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary flex-1 py-3.5 text-xs"
                >
                  Profili Düzenle
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-secondary px-8 py-3.5 text-xs text-red-400 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/30"
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
