import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { favoriteService } from '../services/api';
import { Ad } from '../types';
import { X, Heart, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import AdCard from './AdCard';
import AdDetailModal from './AdDetailModal';

interface FavoritesModalProps {
  onClose: () => void;
}

const FavoritesModal: React.FC<FavoritesModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await favoriteService.getUserFavorites(user.id);
      const transformedFavorites: Ad[] = data.map((item: any) => ({
        id: item.ads.id,
        title: item.ads.title,
        description: item.ads.description,
        price: item.ads.price,
        category: {
          id: item.ads.categories?.id || 'unknown',
          name: item.ads.categories?.name || 'Diğer',
          slug: item.ads.categories?.slug || 'other',
          icon: item.ads.categories?.icon || 'package'
        },
        location: {
          city: item.ads.city,
          district: item.ads.district,
          coordinates: item.ads.latitude && item.ads.longitude ? {
            lat: item.ads.latitude,
            lng: item.ads.longitude
          } : undefined
        },
        images: item.ads.images || [],
        userId: item.ads.user_id,
        user: {
          id: item.ads.users?.id || 'unknown',
          email: item.ads.users?.email || '',
          name: item.ads.users?.name || 'Gizli Kullanıcı',
          phone: item.ads.users?.phone || '',
          avatar: item.ads.users?.avatar || '',
          role: item.ads.users?.role || 'user',
          createdAt: item.ads.users?.created_at || item.ads.created_at,
          isActive: item.ads.users?.is_active || true
        },
        status: item.ads.status,
        createdAt: item.ads.created_at,
        updatedAt: item.ads.updated_at,
        viewCount: item.ads.view_count || 0,
        featured: item.ads.featured || false
      }));
      setFavorites(transformedFavorites);
    } catch (error: any) {
      toast.error(error.message || 'Favoriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (adId: string) => {
    if (!user) return;

    try {
      await favoriteService.removeFromFavorites(user.id, adId);
      toast.success('Favorilerden kaldırıldı');
      fetchFavorites();
    } catch (error: any) {
      toast.error(error.message || 'Favorilerden kaldırılırken hata oluştu');
    }
  };

  const handleAdClick = (ad: Ad) => {
    setSelectedAd(ad);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-[1000] p-4 lg:p-8">
      <div className="bg-white dark:bg-[#0a0e27] rounded-[2.5rem] shadow-premium max-w-6xl w-full max-h-[90vh] overflow-y-auto relative border border-slate-200 dark:border-white/5 custom-scrollbar">

        {/* Close Button - Premium */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all z-50 hover:scale-110 active:scale-90"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-8 md:p-10 border-b border-slate-200 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-neon-indigo rounded-[1.25rem] flex items-center justify-center shadow-gold-heavy">
              <Heart size={28} className="text-white fill-current" />
            </div>
            <div>
              <h2 className="text-[28px] font-black text-slate-900 dark:text-white tracking-tight uppercase">
                Favorilerim <span className="text-primary-500">({favorites.length})</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest mt-1">Beğendiğiniz tüm ilanlar burada</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-[4px] border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-primary-500 font-black uppercase tracking-widest text-[11px]">Favoriler yükleniyor...</span>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-24 glass-premium rounded-[2rem] border border-slate-200 dark:border-white/5 border-dashed">
              <div className="w-24 h-24 bg-primary-50 dark:bg-primary-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Heart size={40} className="text-primary-300 dark:text-primary-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter uppercase">
                Henüz favori ilanınız yok
              </h3>
              <p className="text-slate-500 text-sm font-medium mb-10 max-w-sm mx-auto leading-relaxed">
                Beğendiğiniz ilanları favorilere ekleyerek daha sonra kolayca bulabilirsiniz
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favorites.map((ad) => (
                <div key={ad.id} className="group glass-premium rounded-[2rem] border border-slate-200 dark:border-white/5 overflow-hidden hover:border-primary-500/30 transition-all duration-500 shadow-sm hover:shadow-xl">
                  {/* Image */}
                  <div className="relative h-56 bg-slate-50 dark:bg-black/20 overflow-hidden rounded-t-[2rem]">
                    {ad.images.length > 0 ? (
                      <img
                        src={ad.images[0]}
                        alt={ad.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 gap-2">
                        <Heart size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Fotoğraf Yok</span>
                      </div>
                    )}

                    {/* Favorite Button */}
                    <button
                      onClick={() => handleRemoveFavorite(ad.id)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/95 dark:bg-[#12142d]/95 rounded-[12px] flex items-center justify-center hover:bg-white dark:hover:bg-[#12142d] transition-all shadow-md active:scale-90 border border-slate-100 dark:border-white/5"
                      title="Favorilerden Kaldır"
                    >
                      <Heart
                        size={18}
                        className="text-red-500 fill-current"
                      />
                    </button>

                    {/* Featured Badge */}
                    {ad.featured && (
                      <div className="absolute top-4 left-4 bg-primary-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                        VİTRİN
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-extrabold text-slate-900 dark:text-white mb-2 line-clamp-1 text-[18px] tracking-tight group-hover:text-primary-500 transition-colors">
                      {ad.title}
                    </h3>
                    <div className="text-[26px] font-black text-slate-900 dark:text-white mb-5 tracking-tighter drop-shadow-sm">
                      {formatPrice(ad.price)}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-y border-slate-100 dark:border-white/5 py-3">
                      <span className="flex items-center gap-1.5">
                        <Eye size={16} className="text-primary-500" />
                        {ad.viewCount}
                      </span>
                      <span>
                        {ad.createdAt && !isNaN(new Date(ad.createdAt).getTime()) 
                          ? new Date(ad.createdAt).toLocaleDateString('tr-TR') 
                          : 'YENİ'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAdClick(ad)}
                        className="flex-1 bg-slate-100 dark:bg-[#12142d] text-slate-700 dark:text-slate-300 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-neon-indigo hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-200 dark:border-white/5 hover:border-transparent"
                      >
                        <Eye size={16} />
                        İncele
                      </button>
                      <button
                        onClick={() => handleRemoveFavorite(ad.id)}
                        className="w-14 h-14 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-200 dark:border-transparent active:scale-95"
                        title="Favorilerden Kaldır"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ad Detail Modal */}
      {selectedAd && (
        <AdDetailModal 
          ad={selectedAd} 
          onClose={() => setSelectedAd(null)} 
        />
      )}
    </div>
  );
};

export default FavoritesModal;
