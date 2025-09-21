import React, { useState } from 'react';
import { X, MapPin, Clock, Eye, Heart, ChevronLeft, ChevronRight, User, Trash2, Edit, Bed, Bath, Square, Car, Phone, Mail, MessageCircle, Share2 } from 'lucide-react';
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
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

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

  const isFavorite = favorites.includes(ad.id);

  // Swipe fonksiyonları
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSwipeDirection(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    
    // Swipe yönünü belirle
    if (touchStart && e.targetTouches[0].clientX) {
      const distance = touchStart - e.targetTouches[0].clientX;
      if (Math.abs(distance) > 20) {
        setSwipeDirection(distance > 0 ? 'left' : 'right');
      }
    }
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
    
    // Swipe yönünü sıfırla
    setTimeout(() => setSwipeDirection(null), 300);
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
    <div className={asPage ? "max-w-7xl mx-auto p-4 md:p-6" : "fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto"}>
      <div className={asPage ? "bg-white dark:bg-gray-800 rounded-xl w-full relative overflow-hidden" : "bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full my-8 relative overflow-hidden"}>
        {!asPage && (
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="absolute top-2 right-2 md:top-4 md:right-4 z-50 w-12 h-12 md:w-10 md:h-10 bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-opacity-100 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 shadow-lg border border-gray-200 dark:border-gray-600"
          >
            <X size={20} />
          </button>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Left Side - Main Image */}
          <div className="space-y-4">
            {ad.images.length > 0 ? (
              <div 
                className="relative touch-pan-y select-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Status Badges */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                  {ad.featured && (
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      Öne Çıkan
                    </span>
                  )}
                  <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                    Yeni
                  </span>
                </div>

                {/* Action Icons */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <button
                    onClick={handleFavoriteClick}
                    aria-label="Favorilere ekle"
                    className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
                    title="Favorilere Ekle"
                  >
                    <Heart
                      size={18}
                      className={isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}
                    />
                  </button>
                  <button
                    aria-label="Paylaş"
                    className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
                    title="Paylaş"
                  >
                    <Share2 size={18} className="text-gray-600" />
                  </button>
                </div>

                {/* Loading Skeleton */}
                <div className="w-full h-[600px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse absolute inset-0"></div>
                
                <img
                  src={buildImageUrl(ad.images[currentImageIndex], { 
                    width: isSlowConnection ? 800 : 1200, 
                    height: isSlowConnection ? 600 : 900, 
                    quality: isSlowConnection ? 60 : 85, 
                    resize: 'cover', 
                    format: 'webp' 
                  })}
                  alt={ad.title}
                  className={`w-full h-[600px] object-cover rounded-xl cursor-zoom-in transition-all duration-300 relative z-10 ${
                    swipeDirection === 'left' ? 'translate-x-2' : 
                    swipeDirection === 'right' ? '-translate-x-2' : ''
                  }`}
                  loading="eager" as any
                  decoding="async"
                  fetchPriority="high"
                  onClick={() => setIsFullscreen(true)}
                  onLoad={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.previousElementSibling?.remove();
                  }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJ0dXJuIG9uIGphdmFzY3JpcHQgdG8gdmlldyB0aGlzIHBhZ2Uu';
                  }}
                  style={{ opacity: 0 } as React.CSSProperties}
                />
                
                {ad.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      aria-label="Önceki görsel"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      aria-label="Sonraki görsel"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                    >
                      <ChevronRight size={20} />
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                      {currentImageIndex + 1} / {ad.images.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-[600px] bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <span className="text-gray-400">Fotoğraf Yok</span>
              </div>
            )}

            {/* Thumbnail Images */}
            {ad.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {ad.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-blue-500 scale-105' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={buildImageUrl(image, { width: 160, height: 160, quality: 60, resize: 'cover', format: 'webp' })}
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
          </div>

          {/* Right Side - Property Details */}
          <div className="space-y-6">
            {/* Title and Location */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                {ad.title}
              </h1>
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                <MapPin size={18} className="mr-2" />
                <span className="text-lg">{ad.location.district}, {ad.location.city}</span>
              </div>
            </div>

            {/* Price */}
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-6">
              {formatPrice(ad.price)}
            </div>

            {/* Property Features */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Bed size={20} className="text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">4 Oda</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Bath size={20} className="text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">3 Banyo</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Square size={20} className="text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">180m²</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Car size={20} className="text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">2 Otopark</span>
              </div>
            </div>

            {/* Amenity Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                Deniz Manzarası
              </span>
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium">
                Lüks
              </span>
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                Merkezi
              </span>
              <span className="bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 px-3 py-1 rounded-full text-sm font-medium">
                Yüzme Havuzu
              </span>
            </div>

            {/* Admin Actions */}
            {(user && (user.id === ad.userId || user.role === 'admin')) && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Admin İşlemleri</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit size={16} />
                    Düzenle
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
                  >
                    <Trash2 size={16} />
                    Sil
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg">
                <Phone size={20} />
                Hemen Ara
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    if (!user) {
                      toast.error('Mesaj göndermek için önce giriş yapmalısınız');
                      return;
                    }
                    setShowMessages(true);
                  }}
                  className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <MessageCircle size={18} />
                  Mesaj Gönder
                </button>
                <button className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Mail size={18} />
                  E-posta Gönder
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span>{formatDate(ad.createdAt)}</span>
                </div>
                <div className="flex items-center">
                  <Eye size={16} className="mr-1" />
                  <span>{ad.viewCount} görüntülenme</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="px-6 pb-6">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Açıklama
            </h3>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
                {ad.description}
              </p>
            </div>
          </div>

          {/* Category */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Kategori
            </h3>
            <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg text-sm font-medium">
              {ad.category.name}
            </span>
          </div>

          {/* Seller Info */}
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Satıcı Bilgileri
            </h3>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <User size={24} className="text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white text-lg">
                  {seller?.name || 'Satıcı'}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Hesap açma tarihi: {new Date(seller?.createdAt || ad.createdAt).toLocaleDateString('tr-TR', { year:'numeric', month:'long' })}
                </div>
                {seller?.phone && (
                  <div className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                    {seller.phone}
                  </div>
                )}
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