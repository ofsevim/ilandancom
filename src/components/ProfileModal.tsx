import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService, adService, storageService } from '../services/api';
import { User, Edit, Save, X, Camera, Mail, Phone, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

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
    <div className="fixed inset-0 bg-primary-950/60 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
      <div className="bg-white dark:bg-primary-900 rounded-[2.5rem] shadow-premium max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border border-primary-100 dark:border-primary-800">

        {/* Close Button - More visible and premium */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 glass-premium rounded-full flex items-center justify-center text-primary-400 hover:text-white transition-all z-50 hover:scale-110 active:scale-90"
        >
          <X size={20} />
        </button>

        {/* Header/Content Area */}
        <div className="p-8 md:p-12">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative group">
              <div className="w-32 h-32 bg-neon-indigo rounded-[2.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="Profil"
                    className="w-full h-full rounded-[2.5rem] object-cover border-4 border-white dark:border-primary-800"
                  />
                ) : (
                  <User size={64} className="text-white" />
                )}
              </div>
              {isEditing && (
                <label className="absolute -bottom-2 -right-2 bg-white text-indigo-600 p-3 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border border-indigo-100 cursor-pointer">
                  {uploadingAvatar ? (
                    <div className="w-[18px] h-[18px] border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                  ) : (
                    <Camera size={18} />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                </label>
              )}
            </div>
            <h3 className="text-3xl font-black text-primary-950 dark:text-white mb-2 tracking-tight">
              {user?.name}
            </h3>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${user?.role === 'admin'
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}>
                {user?.role === 'admin' ? '👑 Admin' : '👤 Kullanıcı'}
              </span>
              <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">
                Üye: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '2024'}
              </span>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-black text-primary-400 uppercase tracking-widest ml-1">
                <User size={14} /> Ad Soyad
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-5 py-4 bg-primary-50 dark:bg-primary-800/50 border border-primary-100 dark:border-primary-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-primary-950 dark:text-white font-bold transition-all disabled:opacity-70"
                placeholder="Adınız ve soyadınız"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-black text-primary-400 uppercase tracking-widest ml-1">
                <Mail size={14} /> E-posta
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-5 py-4 bg-primary-50 dark:bg-primary-800/50 border border-primary-100 dark:border-primary-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-primary-950 dark:text-white font-bold transition-all disabled:opacity-70"
                placeholder="E-posta adresiniz"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-black text-primary-400 uppercase tracking-widest ml-1">
                <Phone size={14} /> Telefon
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-5 py-4 bg-primary-50 dark:bg-primary-800/50 border border-primary-100 dark:border-primary-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-primary-950 dark:text-white font-bold transition-all disabled:opacity-70"
                placeholder="Telefon numaranız"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-black text-primary-400 uppercase tracking-widest ml-1">
                <Lock size={14} /> Kullanıcı ID
              </label>
              <div className="px-5 py-4 bg-primary-100 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 rounded-2xl text-[11px] text-primary-500 font-mono break-all leading-relaxed">
                {user?.id || '---'}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-12 p-8 glass-premium rounded-[2rem] border border-indigo-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full group-hover:bg-indigo-500/10 transition-colors"></div>
            <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <span>📊</span> HESAP İSTATİSTİKLERİ
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-1">
                <div className="text-2xl font-black text-primary-950 dark:text-white">{stats.activeAds}</div>
                <div className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">Aktif İlan</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-black text-primary-950 dark:text-white">{stats.soldAds}</div>
                <div className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">Satılan</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-black text-primary-950 dark:text-white">{stats.totalViews}</div>
                <div className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">İzlenme</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-black text-primary-950 dark:text-white">{favorites.length}</div>
                <div className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">Favori</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-12">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-neon-indigo text-white py-5 px-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={16} />
                      Kaydet
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-10 py-5 bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-200 transition-all active:scale-95"
                >
                  İptal
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-neon-indigo text-white py-5 px-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  Profili Düzenle
                </button>
                <button
                  onClick={handleLogout}
                  className="px-10 py-5 border-2 border-red-500/20 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500/5 transition-all active:scale-95 flex items-center gap-2"
                >
                  🚪 Çıkış
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
