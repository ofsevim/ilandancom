import React, { useState } from 'react';
import { X, MapPin, Clock, Eye, Heart, ChevronLeft, ChevronRight, Trash2, Edit } from 'lucide-react';
import { Ad } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { adService, publicUserService } from '../services/api';
import MessagesModal from './MessagesModal';
import EditAdModal from './EditAdModal';
import toast from 'react-hot-toast';

interface AdDetailModalProps {
  ad: Ad;
  onClose: () => void;
  onDeleted?: () => void;
  asPage?: boolean;
}

const AdDetailModal: React.FC<AdDetailModalProps> = ({ ad, onClose, onDeleted, asPage = false }) => {
  const { favorites, toggleFavorite, user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [seller, setSeller] = useState(ad.user);
  const [showMessages, setShowMessages] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Swipe state'leri
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Scroll to top when modal opens
  React.useEffect(() => {
    if (asPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [asPage]);

  React.useEffect(() => {
    let isMounted = true;
    const loadSeller = async () => {
      try {
        if (!ad.userId) return;
        // Public view üzerinden herkese açık satıcı bilgisi
        const sellerData = await publicUserService.getPublicUserById(ad.userId);
        if (!isMounted) return;
        setSeller({
          id: sellerData.id,
          email: sellerData.email,
          name: sellerData.name,
          phone: sellerData.phone,
          avatar: sellerData.avatar,
          role: (sellerData as any).role || 'user',
          createdAt: (sellerData as any).created_at || (sellerData as any).createdAt,
          isActive: (sellerData as any).is_active || (sellerData as any).isActive
        });
      } catch {
        // ignore, fallback ad.user
      }
    };
    loadSeller();
    return () => { isMounted = false; };
  }, [ad.userId]);

  // View count artırma
  React.useEffect(() => {
    const incrementView = async () => {
      try {
        // Sadece ilan sahibi değilse view count artır
        if (!user || user.id !== ad.userId) {
          await adService.incrementViewCount(ad.id);
        }
      } catch (error) {
        console.warn('View count artırılamadı:', error);
      }
    };

    // İlan açıldığında view count artır
    incrementView();
  }, [ad.id, ad.userId, user]);

  const isFavorite = favorites.includes(ad.id);

  // Swipe fonksiyonları
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentImageIndex < ad.images.length - 1) {
      // Sola kaydırma - sonraki fotoğraf
      setCurrentImageIndex(prev => prev + 1);
    } else if (isRightSwipe && currentImageIndex > 0) {
      // Sağa kaydırma - önceki fotoğraf
      setCurrentImageIndex(prev => prev - 1);
    }
  };



  // Minimal preloading - only next image
  React.useEffect(() => {
    if (ad.images.length <= 1) return;

    const nextIndex = currentImageIndex === ad.images.length - 1 ? 0 : currentImageIndex + 1;

    // Preload only next image
    if (ad.images[nextIndex]) {
      const img = new Image();
      img.src = ad.images[nextIndex];
    }
  }, [ad.images, currentImageIndex]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === ad.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? ad.images.length - 1 : prev - 1
    );
  };

  const handleFavoriteClick = () => {
    if (!user) {
      toast.error('Favorilere eklemek için önce giriş yapmalısınız');
      return;
    }
    toggleFavorite(ad.id);
  };

  const handleDelete = async () => {
    if (!user || user.id !== ad.userId || deleting) return;
    const confirmDelete = window.confirm('İlanı kaldırmak istediğinize emin misiniz?');
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await adService.deleteAd(ad.id);
      onDeleted && onDeleted();
      onClose();
    } catch (e) {
      console.error('İlan silinirken hata:', e);
      alert('İlan silinirken bir hata oluştu.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={asPage ? "max-w-full mx-auto p-2 lg:p-4" : "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-2 overflow-y-auto"}>
      <div className={asPage ? "bg-white dark:bg-gray-800 rounded-xl w-full relative overflow-hidden shadow-lg" : "bg-white dark:bg-gray-800 rounded-xl max-w-full w-full my-4 relative overflow-hidden shadow-lg"}>
        {!asPage && (
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="absolute top-2 right-2 md:top-4 md:right-4 z-50 w-12 h-12 md:w-10 md:h-10 bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-opacity-100 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 shadow-lg border border-gray-200 dark:border-gray-600"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Side - Photo Gallery */}
            <div className="lg:col-span-2 space-y-3">
              {ad.images.length > 0 ? (
                <div
                  className="relative touch-pan-y select-none"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Badges - Modern Design */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    {ad.featured && (
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1">
                        <span>⭐</span>
                        <span>Öne Çıkan</span>
                      </span>
                    )}
                    {/* Yeni Badge - Son 7 gün içinde eklenen ilanlar için */}
                    {new Date().getTime() - new Date(ad.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000 && (
                      <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1">
                        <span>✨</span>
                        <span>Yeni</span>
                      </span>
                    )}
                  </div>

                  {/* Favorite Button - Modern Design */}
                  <div className="absolute top-4 right-4 z-20">
                    <button
                      onClick={handleFavoriteClick}
                      aria-label="Favorilere ekle"
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl backdrop-blur-sm ${isFavorite
                          ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 scale-110'
                          : 'bg-white/95 text-gray-600 hover:bg-white hover:text-red-500 hover:scale-110'
                        }`}
                    >
                      <Heart
                        size={20}
                        className={isFavorite ? 'fill-current' : ''}
                      />
                    </button>
                  </div>

                  {/* Ultra-Fast Image Loading */}
                  <div className="relative w-full h-[450px] lg:h-[600px] rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img
                      src={ad.images[currentImageIndex]}
                      alt={ad.title}
                      className="w-full h-full object-cover cursor-zoom-in"
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      onClick={() => setIsFullscreen(true)}
                    />
                  </div>

                  {ad.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        aria-label="Önceki görsel"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                      >
                        <ChevronLeft size={24} className="text-gray-700" />
                      </button>
                      <button
                        onClick={nextImage}
                        aria-label="Sonraki görsel"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                      >
                        <ChevronRight size={24} className="text-gray-700" />
                      </button>

                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-900/90 to-black/90 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl backdrop-blur-sm">
                        {currentImageIndex + 1} / {ad.images.length}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-[450px] lg:h-[600px] bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400">Fotoğraf Yok</span>
                </div>
              )}

              {/* Thumbnail Images - Lazy Load Only Visible */}
              {ad.images.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                  {ad.images.slice(0, 10).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden border-3 transition-all ${index === currentImageIndex
                          ? 'border-blue-500 shadow-lg ring-2 ring-blue-300 dark:ring-blue-700'
                          : 'border-gray-300 dark:border-gray-600'
                        }`}
                    >
                      <img
                        src={image}
                        alt={`${ad.title} - ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Description Card - Modern Design */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📝</span>
                  </div>
                  İlan Açıklaması
                </h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-4">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                    {ad.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Info Sidebar */}
            <div className="lg:col-span-1 space-y-16">

              {/* Price Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700 sticky top-20">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                  {formatPrice(ad.price)}
                </div>

                <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                  {ad.title}
                </h1>

                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                    {ad.category?.name || 'Diğer'}
                  </span>
                  {ad.featured && (
                    <span className="inline-block px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded text-xs font-bold">
                      ⭐ VİTRİN
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="flex-shrink-0" />
                    <span>{ad.location.district}, {ad.location.city}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="flex-shrink-0" />
                      <span>{new Date(ad.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Eye size={16} className="flex-shrink-0" />
                      <span>{ad.viewCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Card - Only for owners - Modern Design */}
              {(user && (user.id === ad.userId || user.role === 'admin')) && (
                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-orange-100 dark:border-gray-700">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">⚙️</span>
                    </div>
                    İlan Yönetimi
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowEditModal(true)}
                      aria-label="İlanı Düzenle"
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-3 rounded-xl transition-all shadow-md hover:shadow-lg font-semibold text-sm"
                    >
                      <Edit size={16} />
                      <span>İlanı Düzenle</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      aria-label="İlanı Kaldır"
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-sm"
                    >
                      <Trash2 size={16} />
                      <span>{deleting ? 'Siliniyor...' : 'İlanı Sil'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Seller Info Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">👤</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Satıcı Bilgileri
                  </h3>
                </div>

                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg font-bold">
                      {(seller?.name || 'S')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 dark:text-white text-sm truncate">
                      {seller?.name || 'Satıcı'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Üye: {new Date(seller?.createdAt || ad.createdAt).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Phone */}
                {seller?.phone && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Telefon</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {seller.phone}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  {seller?.phone && (
                    <a
                      href={`https://wa.me/90${seller.phone.replace(/\D/g, '').replace(/^90/, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg transition-all font-semibold text-sm"
                    >
                      <span>💬</span>
                      <span>WhatsApp</span>
                    </a>
                  )}

                  <button
                    onClick={() => {
                      if (!user) {
                        toast.error('Mesaj göndermek için önce giriş yapmalısınız');
                        return;
                      }
                      setShowMessages(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-all font-semibold text-sm"
                  >
                    <span>✉️</span>
                    <span>Mesaj Gönder</span>
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <span className="text-green-500">✓</span>
                      <span>Güvenli İletişim</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-blue-500">🛡️</span>
                      <span>Doğrulanmış</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {isFullscreen && ad.images.length > 0 && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center touch-pan-y select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
          {ad.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                aria-label="Önceki"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                aria-label="Sonraki"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          <img
            src={ad.images[currentImageIndex]}
            alt={ad.title}
            className="max-w-[95vw] max-h-[90vh] object-contain"
            loading="lazy"
          />
        </div>
      )}
      {showMessages && (
        <MessagesModal receiverId={ad.userId} adId={ad.id} onClose={() => setShowMessages(false)} />
      )}
      {showEditModal && (
        <EditAdModal
          ad={ad}
          onClose={() => setShowEditModal(false)}
          onAdUpdated={() => {
            setShowEditModal(false);
            // İlan güncellendiğinde sayfayı yenile
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default AdDetailModal;