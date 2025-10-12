import React, { useState } from 'react';
import { X, MapPin, Clock, Eye, Heart, ChevronLeft, ChevronRight, User, Trash2, Edit } from 'lucide-react';
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



  // Instant preloading - direct URLs for speed
  React.useEffect(() => {
    if (ad.images.length <= 1) return;
    
    const timer = setTimeout(() => {
      const nextIndex = currentImageIndex === ad.images.length - 1 ? 0 : currentImageIndex + 1;
      const prevIndex = currentImageIndex === 0 ? ad.images.length - 1 : currentImageIndex - 1;
      
      // Preload next and previous images - direct URLs
      [nextIndex, prevIndex].forEach(index => {
        if (ad.images[index]) {
          const img = new Image();
          img.src = ad.images[index]; // Direct URL, no transformation
        }
      });
    }, 100); // Reduced delay for faster preload
    
    return () => clearTimeout(timer);
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

        <div className="p-4 lg:p-6">
          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Left Side - Photo Gallery */}
            <div className="space-y-3">
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
                    <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1">
                      <span>✨</span>
                      <span>Yeni</span>
                    </span>
                  </div>

                  {/* Favorite Button - Modern Design */}
                  <div className="absolute top-4 right-4 z-20">
                    <button
                      onClick={handleFavoriteClick}
                      aria-label="Favorilere ekle"
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl backdrop-blur-sm ${
                        isFavorite 
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

                {/* Optimized Image Loading - Direct URL */}
                <div className="relative w-full h-[450px] lg:h-[600px] rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {/* Loading Skeleton */}
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                    <div className="text-gray-400 text-sm">Yükleniyor...</div>
                  </div>
                  
                  {/* Direct Image - No transformation for speed */}
                  <img
                    src={ad.images[currentImageIndex]}
                    alt={ad.title}
                    className="absolute inset-0 w-full h-full object-cover cursor-zoom-in transition-opacity duration-300 opacity-0"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    onClick={() => setIsFullscreen(true)}
                    onLoad={(e) => {
                      e.currentTarget.style.opacity = '1';
                      const skeleton = e.currentTarget.previousElementSibling as HTMLElement;
                      if (skeleton) {
                        skeleton.style.display = 'none';
                      }
                    }}
                    onError={(e) => {
                      console.error('Image load error');
                      e.currentTarget.style.display = 'none';
                    }}
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

            {/* Thumbnail Images - Modern Design */}
            {ad.images.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                {ad.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden border-3 transition-all transform hover:scale-105 ${
                      index === currentImageIndex 
                        ? 'border-blue-500 shadow-lg ring-2 ring-blue-300 dark:ring-blue-700 scale-105' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 shadow-md'
                    }`}
                  >
                    <div className="relative w-full h-full bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                      {/* Thumbnail - Direct URL for speed */}
                      <img
                        src={image}
                        alt={`${ad.title} - ${index + 1}`}
                        className="w-full h-full object-cover transition-opacity duration-200"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
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

            {/* Right Side - Info Grid */}
            <div className="space-y-4">
              
              {/* Title and Price Card - Modern Design */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        {ad.category?.name || 'Diğer'}
                      </span>
                      {ad.featured && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                          ⭐ Öne Çıkan
                        </span>
                      )}
                    </div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                      {ad.title}
                    </h1>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Fiyat</div>
                  <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    {formatPrice(ad.price)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                    <MapPin size={18} className="mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Konum</div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {ad.location.city}
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                    <Clock size={18} className="mx-auto mb-1 text-green-600 dark:text-green-400" />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tarih</div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                      {new Date(ad.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                    <Eye size={18} className="mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Görüntülenme</div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                      {ad.viewCount}
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

              {/* Seller Info Card - Modern Design */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  Satıcı Bilgileri
                </h3>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl font-bold">
                        {(seller?.name || 'S')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 dark:text-white text-base">
                        {seller?.name || 'Satıcı'}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(seller?.createdAt || ad.createdAt).toLocaleDateString('tr-TR', { year:'numeric', month:'long' })} tarihinde üye
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  {seller?.phone && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300 font-medium text-sm flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          📞
                        </span>
                        Telefon
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {seller.phone}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Modern Design */}
                <div className="space-y-2">
                  {seller?.phone && (
                    <a
                      href={`https://wa.me/90${seller.phone.replace(/\D/g,'').replace(/^90/, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-xl transition-all shadow-md hover:shadow-lg font-semibold text-sm group"
                    >
                      <span className="text-lg">💬</span>
                      <span>WhatsApp ile İletişime Geç</span>
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
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-3 rounded-xl transition-all shadow-md hover:shadow-lg font-semibold text-sm"
                  >
                    <span className="text-lg">✉️</span>
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