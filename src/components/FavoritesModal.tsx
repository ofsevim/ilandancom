import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { favoriteService } from '../services/api';
import { Ad } from '../types';
import { X, Heart, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import AdCard from './AdCard';

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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' TL';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Heart size={24} className="text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Favorilerim ({favorites.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Favoriler yükleniyor...</span>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Henüz favori ilanınız yok
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Beğendiğiniz ilanları favorilere ekleyerek daha sonra kolayca bulabilirsiniz
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((ad) => (
                <div key={ad.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden">
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-600 overflow-hidden">
                    {ad.images.length > 0 ? (
                      <img
                        src={ad.images[0]}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Fotoğraf Yok
                      </div>
                    )}
                    
                    {/* Favorite Button */}
                    <button
                      onClick={() => handleRemoveFavorite(ad.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
                      title="Favorilerden Kaldır"
                    >
                      <Heart
                        size={16}
                        className="text-red-500 fill-current"
                      />
                    </button>

                    {/* Featured Badge */}
                    {ad.featured && (
                      <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                        VİTRİN
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {ad.title}
                    </h3>
                    <p className="text-lg font-bold text-blue-600 mb-2">
                      {formatPrice(ad.price)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {ad.location.city}, {ad.location.district}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span className="flex items-center">
                        <Eye size={14} className="mr-1" />
                        {ad.viewCount} görüntülenme
                      </span>
                      <span>
                        {new Date(ad.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAdClick(ad)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                      >
                        <Eye size={14} className="mr-1" />
                        Görüntüle
                      </button>
                      <button
                        onClick={() => handleRemoveFavorite(ad.id)}
                        className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                        title="Favorilerden Kaldır"
                      >
                        <Trash2 size={14} />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                İlan Detayı
              </h3>
              <button
                onClick={() => setSelectedAd(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <AdCard ad={selectedAd} onAdClick={() => {}} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesModal;
