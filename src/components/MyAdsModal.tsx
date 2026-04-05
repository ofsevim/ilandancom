import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adService } from '../services/api';
import { Ad } from '../types';
import { X, Edit, Trash2, Eye, Plus, Package } from 'lucide-react';
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
    <div className="fixed inset-0 bg-primary-950/60 backdrop-blur-md flex items-center justify-center z-[1000] p-4 lg:p-8">
      <div className="bg-white dark:bg-primary-900 rounded-[2.5rem] shadow-premium max-w-6xl w-full max-h-[90vh] overflow-y-auto relative border border-primary-100 dark:border-primary-800">

        {/* Close Button - Premium */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 glass-premium rounded-full flex items-center justify-center text-primary-400 hover:text-white transition-all z-50 hover:scale-110 active:scale-90"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-8 md:p-10 border-b border-primary-100 dark:border-primary-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-neon-indigo rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Package size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary-950 dark:text-white tracking-tight">
                İlanlarım <span className="text-indigo-500">({ads.length})</span>
              </h2>
              <p className="text-primary-500 text-xs font-bold uppercase tracking-widest mt-1">İlanlarınızı buradan yönetebilirsiniz</p>
            </div>
          </div>

          <button
            onClick={onShowNewAd}
            className="bg-neon-indigo text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            Yeni İlan Oluştur
          </button>
        </div>

        {/* Content */}
        <div className="p-8 md:p-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-primary-500 font-bold uppercase tracking-widest text-[10px]">İlanlar yükleniyor...</span>
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-primary-50 dark:bg-primary-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Package size={32} className="text-primary-300 dark:text-primary-600" />
              </div>
              <h3 className="text-xl font-black text-primary-950 dark:text-white mb-2 tracking-tight">
                Henüz ilanınız yok
              </h3>
              <p className="text-primary-500 text-sm font-medium mb-10 max-w-xs mx-auto">
                İlk ilanınızı oluşturmak için aşağıdaki butona tıklayın
              </p>
              <button
                onClick={onShowNewAd}
                className="bg-neon-indigo text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center mx-auto gap-2"
              >
                <Plus size={16} />
                İlk İlanımı Oluştur
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ads.map((ad) => (
                <div key={ad.id} className="group glass-premium rounded-[2rem] border border-primary-100 dark:border-primary-800 overflow-hidden hover:border-indigo-500/30 transition-all duration-500">
                  {/* Image */}
                  <div className="relative h-56 bg-primary-50 dark:bg-black/20 overflow-hidden">
                    {ad.images.length > 0 ? (
                      <img
                        src={ad.images[0]}
                        alt={ad.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-primary-300 gap-2">
                        <Package size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Fotoğraf Yok</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${ad.status === 'active' ? 'bg-green-500 text-white' :
                        ad.status === 'pending' ? 'bg-amber-500 text-white' :
                          'bg-red-500 text-white'
                        }`}>
                        {ad.status === 'active' ? 'Aktif' : ad.status === 'pending' ? 'Beklemede' : 'Pasif'}
                      </div>
                    </div>

                    {/* Featured Badge */}
                    {ad.featured && (
                      <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                        VİTRİN
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-primary-950 dark:text-white mb-3 line-clamp-1 text-lg tracking-tight">
                      {ad.title}
                    </h3>
                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mb-4 tracking-tighter">
                      {formatPrice(ad.price)}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-6 border-y border-primary-50 dark:border-primary-800 py-3">
                      <span className="flex items-center gap-1.5">
                        <Eye size={14} className="text-indigo-500" />
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
                        className="flex-1 bg-primary-100 dark:bg-primary-800 text-primary-900 dark:text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Eye size={14} />
                        İncele
                      </button>
                      <button
                        onClick={() => handleEditAd(ad)}
                        className="w-12 h-12 bg-green-500/10 text-green-600 rounded-xl hover:bg-green-500 hover:text-white transition-all flex items-center justify-center"
                        title="Düzenle"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                        title="Sil"
                      >
                        <Trash2 size={16} />
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
          onDeleted={() => {
            setSelectedAd(null);
            fetchMyAds();
          }}
        />
      )}

      {/* Edit Ad Modal */}
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
