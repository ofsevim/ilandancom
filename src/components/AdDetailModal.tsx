import React, { useState } from 'react';
import { X, MapPin, Clock, Eye, Heart, ChevronLeft, ChevronRight, User, Trash2, Edit } from 'lucide-react';
import { Ad } from '../types';
import { buildImageUrl } from '../lib/images';
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

  // Tüm görselleri arka planda preload et
  React.useEffect(() => {
    if (ad.images.length > 1) {
      ad.images.forEach((image, index) => {
        if (index !== currentImageIndex) {
          const img = new Image();
          img.src = buildImageUrl(image, { 
            width: 1200, 
            height: 800, 
            quality: 85, 
            resize: 'cover', 
            format: 'webp' 
          });
        }
      });
    }
  }, [ad.images, currentImageIndex]);

  // Network-aware loading
  const [isSlowConnection, setIsSlowConnection] = React.useState(false);
  
  React.useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const updateConnectionStatus = () => {
        setIsSlowConnection(
          connection.effectiveType === '2g' || 
          connection.effectiveType === 'slow-2g' ||
          connection.downlink < 1
        );
      };
      
      updateConnectionStatus();
      connection.addEventListener('change', updateConnectionStatus);
      
      return () => connection.removeEventListener('change', updateConnectionStatus);
    }
  }, []);

  // Sonraki ve önceki görseli preload et
  React.useEffect(() => {
    const preloadImage = (index: number) => {
      if (ad.images[index]) {
        const img = new Image();
        const quality = isSlowConnection ? 60 : 85;
        const width = isSlowConnection ? 800 : 1200;
        img.src = buildImageUrl(ad.images[index], { 
          width, 
          height: Math.round(width * 0.67), 
          quality, 
          resize: 'cover', 
          format: 'webp' 
        });
      }
    };

    const nextIndex = currentImageIndex === ad.images.length - 1 ? 0 : currentImageIndex + 1;
    const prevIndex = currentImageIndex === 0 ? ad.images.length - 1 : currentImageIndex - 1;
    
    preloadImage(nextIndex);
    preloadImage(prevIndex);
  }, [currentImageIndex, ad.images, isSlowConnection]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
    <div className={asPage ? "max-w-full mx-auto p-1 lg:p-2" : "fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-1 overflow-y-auto"}>
      <div className={asPage ? "bg-white dark:bg-gray-800 rounded-lg w-full relative overflow-hidden" : "bg-white dark:bg-gray-800 rounded-lg max-w-full w-full my-2 relative overflow-hidden"}>
        {!asPage && (
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="absolute top-2 right-2 md:top-4 md:right-4 z-50 w-12 h-12 md:w-10 md:h-10 bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-opacity-100 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 shadow-lg border border-gray-200 dark:border-gray-600"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-2 lg:p-3">
          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3">
            
            {/* Left Side - Photo Gallery */}
            <div className="space-y-2">
            {ad.images.length > 0 ? (
              <div 
                className="relative touch-pan-y select-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                  {/* Badges */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                  {ad.featured && (
                      <span className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                      Öne Çıkan
                    </span>
                  )}
                    <span className="bg-yellow-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                    Yeni
                  </span>
                </div>

                  {/* Favorite Button */}
                  <div className="absolute top-4 right-4 z-20">
                  <button
                    onClick={handleFavoriteClick}
                    aria-label="Favorilere ekle"
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${
                        isFavorite 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-white/90 text-gray-600 hover:bg-white'
                      }`}
                  >
                    <Heart
                        size={20}
                        className={isFavorite ? 'fill-current' : ''}
                    />
                  </button>
                </div>

                {/* Loading Skeleton */}
                  <div className="w-full h-[350px] lg:h-[450px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse absolute inset-0 shadow-md"></div>
                
                <img
                  src={buildImageUrl(ad.images[currentImageIndex], { 
                      width: isSlowConnection ? 1200 : 1600, 
                      height: isSlowConnection ? 800 : 1000, 
                    quality: isSlowConnection ? 60 : 85, 
                    resize: 'cover', 
                    format: 'webp' 
                  })}
                  alt={ad.title}
                    className="w-full h-[350px] lg:h-[450px] object-cover rounded-xl cursor-zoom-in transition-all duration-300 relative z-10 shadow-md"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  onClick={() => setIsFullscreen(true)}
                    onLoad={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.previousElementSibling?.remove();
                  }}
                    onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJ0dXJuIG9uIGphdmFzY3JpcHQgdG8gdmlldyB0aGlzIHBhZ2Uu';
                  }}
                    style={{ opacity: 0 }}
                />
                
                {ad.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      aria-label="Önceki görsel"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      aria-label="Sonraki görsel"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                    >
                        <ChevronRight size={24} />
                    </button>
                    
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                      {currentImageIndex + 1} / {ad.images.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-[350px] lg:h-[450px] bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-gray-400">Fotoğraf Yok</span>
              </div>
            )}

            {/* Thumbnail Images */}
            {ad.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-1">
                {ad.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-12 h-12 lg:w-16 lg:h-16 rounded-lg overflow-hidden border-2 transition-all shadow-sm ${
                      index === currentImageIndex 
                          ? 'border-blue-500 shadow-md scale-105' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <img
                        src={buildImageUrl(image, { width: 200, height: 200, quality: 60, resize: 'cover', format: 'webp' })}
                      alt={ad.title}
                      className="w-full h-full object-cover transition-opacity duration-200"
                      loading="lazy"
                        onLoad={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                        onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyMkM0MC44MzY2IDIyIDQ4IDI5LjE2MzQgNDggMzhDNDggNDYuODM2NiA0MC44MzY2IDU0IDMyIDU0QzIzLjE2MzQgNTQgMTYgNDYuODM2NiAxNiAzOEMxNiAyOS4xNjM0IDIzLjE2MzQgMjIgMzIgMjJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                      }}
                        style={{ opacity: 0 }}
                    />
                  </button>
                ))}
              </div>
            )}

              {/* Description Card - Moved below photo */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                  İlan Açıklaması
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-xs">
                  {ad.description}
                </p>
              </div>
          </div>

            {/* Right Side - Info Grid */}
            <div className="grid grid-cols-1 gap-2">
              
              {/* Title and Price Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm border border-gray-200 dark:border-gray-700">
                <h1 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {ad.title}
                </h1>
                <div className="text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {formatPrice(ad.price)}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <MapPin size={12} className="mr-1" />
                    <span className="font-medium">{ad.location.district}, {ad.location.city}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    <span>{formatDate(ad.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Eye size={12} className="mr-1" />
                    <span>{ad.viewCount} görüntülenme</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Card - Only for owners */}
              {(user && (user.id === ad.userId || user.role === 'admin')) && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                    İşlemler
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    <button
                      onClick={() => setShowEditModal(true)}
                      aria-label="İlanı Düzenle"
                      className="flex items-center justify-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 text-xs font-medium"
                    >
                      <Edit size={12} />
                      <span>Düzenle</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      aria-label="İlanı Kaldır"
                      className="flex items-center justify-center gap-1 bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 transition-colors disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 text-xs font-medium"
                    >
                      <Trash2 size={12} />
                      <span>Kaldır</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Seller Info Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                  Satıcı Bilgileri
                </h3>
                
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User size={12} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-xs">
                      {seller?.name || 'Satıcı'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(seller?.createdAt || ad.createdAt).toLocaleDateString('tr-TR', { year:'numeric', month:'long' })} tarihinde üye
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-2 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300 font-medium text-xs">Telefon</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {seller?.phone || '+90 5XX XXX XX XX'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {seller?.phone && (
                    <a
                      href={`https://wa.me/${seller.phone.replace(/\D/g,'')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1 bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-700 transition-colors text-xs font-medium"
                    >
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
                    className="flex items-center justify-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                  >
                    <span>Soru Sor</span>
                  </button>
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
            src={buildImageUrl(ad.images[currentImageIndex], { width: 2000, height: 1600, quality: 90, resize: 'inside', format: 'webp' })}
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