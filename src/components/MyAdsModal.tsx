import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adService } from '../services/api';
import { Ad } from '../types';
import toast from 'react-hot-toast';
import EditAdModal from './EditAdModal';
import AdDetailModal from './AdDetailModal';

interface MyAdsModalProps {
  onClose: () => void;
  onShowNewAd: () => void;
}

const MyAdsModal: React.FC<MyAdsModalProps> = ({ onClose, onShowNewAd }) => {
  const { user } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

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
      setAds(data || []);
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

  const handleEditAd = (ad: Ad) => {
    setEditingAd(ad);
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
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4 lg:p-8">
      <div className="bg-navy-800 border border-silver-700/20 rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 bg-navy-900 hover:bg-navy-950 border border-silver-700/10 rounded-full flex items-center justify-center text-silver-500 hover:text-silver-100 transition-all z-50"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="p-8 border-b border-silver-700/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-accent">inventory_2</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-silver-100 tracking-tight">
                İlanlarım <span className="text-silver-500">({ads.length})</span>
              </h2>
              <p className="text-silver-500 text-xs mt-0.5">İlanlarınızı buradan yönetebilirsiniz</p>
            </div>
          </div>

          <button
            onClick={onShowNewAd}
            className="btn-primary px-6 py-3 text-xs"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Yeni İlan
          </button>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-silver-500 text-xs">İlanlar yükleniyor...</span>
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-navy-900 border border-silver-700/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-2xl text-silver-600">inventory_2</span>
              </div>
              <h3 className="text-base font-bold text-silver-100 mb-2">
                Henüz ilanınız yok
              </h3>
              <p className="text-silver-500 text-sm mb-8 max-w-xs mx-auto">
                İlk ilanınızı oluşturmak için aşağıdaki butona tıklayın
              </p>
              <button
                onClick={onShowNewAd}
                className="btn-primary px-8 py-3.5 text-xs inline-flex"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                İlk İlanımı Oluştur
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <div key={ad.id} className="group card-base overflow-hidden">
                  <div className="relative h-56 bg-navy-900 overflow-hidden">
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

                    <div className="absolute top-4 left-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg ${ad.status === 'active' ? 'bg-green-500/90 text-white' :
                          ad.status === 'pending' ? 'bg-amber-500/90 text-white' :
                            'bg-red-500/90 text-white'
                        }`}>
                        {ad.status === 'active' ? 'Aktif' : ad.status === 'pending' ? 'Beklemede' : 'Pasif'}
                      </span>
                    </div>

                    {ad.featured && (
                      <div className="absolute top-4 right-4 bg-accent text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg">
                        Vitrin
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-silver-100 mb-2 line-clamp-1">
                      {ad.title}
                    </h3>
                    <div className="text-lg font-bold text-accent mb-3">
                      {formatPrice(ad.price)}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-medium text-silver-500 mb-4 border-t border-b border-silver-700/10 py-2">
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
                        onClick={() => handleEditAd(ad)}
                        className="w-10 h-10 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500 hover:text-white transition-all flex items-center justify-center"
                        title="Düzenle"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="w-10 h-10 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                        title="Sil"
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
          onDeleted={() => {
            setSelectedAd(null);
            fetchMyAds();
          }}
        />
      )}

      {editingAd && (
        <EditAdModal
          ad={editingAd}
          onClose={() => setEditingAd(null)}
          onAdUpdated={() => {
            setEditingAd(null);
            fetchMyAds();
          }}
        />
      )}
    </div>
  );
};

export default MyAdsModal;
