import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adService } from '../services/api';
import { Ad } from '../types';
import { X, Edit, Trash2, Eye, Plus, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import AdCard from './AdCard';

interface MyAdsModalProps {
  onClose: () => void;
  onShowNewAd: () => void;
}

const MyAdsModal: React.FC<MyAdsModalProps> = ({ onClose, onShowNewAd }) => {
  const { user } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyAds();
    }
  }, [user]);

  const fetchMyAds = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await adService.getUserAds(user.id);
      const transformedAds: Ad[] = (data || []).map((item: any) => ({
        id: item?.id ?? '',
        title: item.title,
        description: item.description,
        price: item.price,
        category: {
          id: item?.category_id ?? 'unknown',
          name: 'Diğer',
          slug: 'diger',
          icon: 'tag'
        },
        location: {
          city: item.city ?? '',
          district: item.district ?? '',
          coordinates: item.latitude && item.longitude ? {
            lat: item.latitude,
            lng: item.longitude
          } : undefined
        },
        images: Array.isArray(item.images) ? item.images : [],
        userId: item.user_id ?? user.id,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          createdAt: user.createdAt,
          isActive: user.isActive
        },
        status: item.status,
        createdAt: item.created_at ?? new Date().toISOString(),
        updatedAt: item.updated_at ?? item.created_at ?? new Date().toISOString(),
        viewCount: item.view_count ?? 0,
        featured: item.featured ?? false
      })).filter((ad: Ad) => ad.id);
      setAds(transformedAds);
    } catch (error: any) {
      toast.error(error.message || 'İlanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await adService.deleteAd(adId);
      toast.success('İlan başarıyla silindi');
      fetchMyAds();
    } catch (error: any) {
      toast.error(error.message || 'İlan silinirken hata oluştu');
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Aktif</span>;
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Beklemede</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Reddedildi</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Package size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              İlanlarım ({ads.length})
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onShowNewAd}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Yeni İlan
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">İlanlar yükleniyor...</span>
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-12">
              <Package size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Henüz ilanınız yok
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                İlk ilanınızı oluşturmak için aşağıdaki butona tıklayın
              </p>
              <button
                onClick={onShowNewAd}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center mx-auto"
              >
                <Plus size={16} className="mr-2" />
                İlk İlanımı Oluştur
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
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
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      {getStatusBadge(ad.status)}
                    </div>

                    {/* Featured Badge */}
                    {ad.featured && (
                      <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
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
                        onClick={() => handleDeleteAd(ad.id)}
                        className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                        title="İlanı Sil"
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

export default MyAdsModal;
