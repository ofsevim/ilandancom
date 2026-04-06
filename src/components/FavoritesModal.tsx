import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { favoriteService } from '../services/api';
import { Ad } from '../types';
import toast from 'react-hot-toast';
import AdDetailModal from './AdDetailModal';

interface FavoritesModalProps {
  onClose: () => void;
  asPage?: boolean;
}

const FavoritesModal: React.FC<FavoritesModalProps> = ({ onClose, asPage = false }) => {
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

  if (asPage) {
    return (
      <div className="w-full">
        <div className="p-4 border-b border-silver-700/10 flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-accent">favorite</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-silver-100 tracking-tight">Favorilerim <span className="text-slate-500 dark:text-slate-500 dark:text-silver-500">({favorites.length})</span></h1>
            <p className="text-silver-500 text-xs">Beğendiğiniz tüm ilanlar</p>
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-5xl text-silver-700 mx-auto mb-4">favorite_border</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-silver-100 mb-2">Henüz favori ilanınız yok</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {favorites.map((ad) => (
              <div key={ad.id} className="group card-base overflow-hidden">
                <div className="relative h-48 bg-white dark:bg-navy-900 overflow-hidden">
                  {ad.images.length > 0 ? (
                    <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 dark:text-silver-700">
                      <span className="material-symbols-outlined text-3xl">image</span>
                    </div>
                  )}
                  <button onClick={() => handleRemoveFavorite(ad.id)} className="absolute top-3 right-3 w-9 h-9 bg-slate-50 dark:bg-navy-950/90 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-90" title="Favorilerden Kaldır">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-silver-100 mb-1 line-clamp-1 text-sm group-hover:text-accent transition-colors">{ad.title}</h3>
                  <div className="text-lg font-bold text-slate-900 dark:text-silver-100 mb-3">{formatPrice(ad.price)}</div>
                  <button onClick={() => handleAdClick(ad)} className="btn-secondary w-full py-2.5 text-[10px]">
                    İncele
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedAd && <AdDetailModal ad={selectedAd} onClose={() => setSelectedAd(null)} />}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4 lg:p-8">
      <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-silver-700/20 rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 bg-white dark:bg-navy-900 hover:bg-navy-950 border border-silver-700/10 rounded-full flex items-center justify-center text-silver-500 hover:text-slate-900 dark:text-silver-100 transition-all z-50"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="p-8 border-b border-silver-700/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-accent text-2xl">favorite</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-silver-100 tracking-tight">
                Favorilerim <span className="text-slate-500 dark:text-slate-500 dark:text-silver-500">({favorites.length})</span>
              </h2>
              <p className="text-silver-500 text-xs mt-0.5">Beğendiğiniz tüm ilanlar burada</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-silver-500 text-xs">Favoriler yükleniyor...</span>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-navy-900 border border-silver-700/10 rounded-xl border-dashed">
              <div className="w-20 h-20 bg-navy-950 border border-silver-700/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-3xl text-slate-700 dark:text-silver-700">favorite_border</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-silver-100 mb-2">
                Henüz favori ilanınız yok
              </h3>
              <p className="text-silver-500 text-sm max-w-sm mx-auto">
                Beğendiğiniz ilanları favorilere ekleyerek daha sonra kolayca bulabilirsiniz
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((ad) => (
                <div key={ad.id} className="group card-base overflow-hidden">
                  <div className="relative h-56 bg-white dark:bg-navy-900 overflow-hidden">
                    {ad.images.length > 0 ? (
                      <img
                        src={ad.images[0]}
                        alt={ad.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-silver-700 gap-2">
                        <span className="material-symbols-outlined text-3xl">image</span>
                        <span className="text-[10px] font-medium">Fotoğraf Yok</span>
                      </div>
                    )}

                    <button
                      onClick={() => handleRemoveFavorite(ad.id)}
                      className="absolute top-4 right-4 w-10 h-10 bg-slate-50 dark:bg-navy-950/95 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-silver-700/10"
                      title="Favorilerden Kaldır"
                    >
                      <span className="material-symbols-outlined text-sm text-red-400 hover:text-white">favorite</span>
                    </button>

                    {ad.featured && (
                      <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg">
                        Vitrin
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900 dark:text-silver-100 mb-1.5 line-clamp-1 group-hover:text-accent transition-colors">
                      {ad.title}
                    </h3>
                    <div className="text-xl font-bold text-slate-900 dark:text-silver-100 mb-4">
                      {formatPrice(ad.price)}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-medium text-silver-500 mb-4 border-t border-b border-silver-700/10 py-2.5">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        {ad.viewCount}
                      </span>
                      <span>
                        {ad.createdAt && !isNaN(new Date(ad.createdAt).getTime())
                          ? new Date(ad.createdAt).toLocaleDateString('tr-TR')
                          : 'YENİ'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAdClick(ad)}
                        className="btn-secondary flex-1 py-2.5 text-[10px]"
                      >
                        İncele
                      </button>
                      <button
                        onClick={() => handleRemoveFavorite(ad.id)}
                        className="w-10 h-10 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center active:scale-95"
                        title="Favorilerden Kaldır"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
