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
    <div className={asPage ? "max-w-7xl mx-auto p-6 lg:p-8" : "fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto"}>
      <div className={asPage ? "bg-white dark:bg-gray-800 rounded-xl w-full relative overflow-hidden" : "bg-white dark:bg-gray-800 rounded-xl max-w-7xl w-full my-8 relative overflow-hidden"}>
        {!asPage && (
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="absolute top-2 right-2 md:top-4 md:right-4 z-50 w-12 h-12 md:w-10 md:h-10 bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-opacity-100 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 shadow-lg border border-gray-200 dark:border-gray-600"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-6 lg:p-8">
          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Left Side - Photo Gallery */}
            <div className="space-y-6">
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

                  {/* Loading Skeleton */}
                  <div className="w-full h-[400px] lg:h-[500px] bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse absolute inset-0 shadow-lg"></div>
                  
                  <img
                    src={buildImageUrl(ad.images[currentImageIndex], { 
                      width: isSlowConnection ? 1200 : 1600, 
                      height: isSlowConnection ? 800 : 1000, 
                      quality: isSlowConnection ? 60 : 85, 
                      resize: 'cover', 
                      format: 'webp' 
                    })}
                    alt={ad.title}
                    className="w-full h-[400px] lg:h-[500px] object-cover rounded-2xl cursor-zoom-in transition-all duration-300 relative z-10 shadow-lg"
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
                <div className="w-full h-[400px] lg:h-[500px] bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-gray-400 text-lg">Fotoğraf Yok</span>
                </div>
              )}

              {/* Thumbnail Images */}
              {ad.images.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {ad.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 transition-all shadow-md ${
                        index === currentImageIndex 
                          ? 'border-blue-500 shadow-lg scale-105' 
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
            </div>

            {/* Right Side - Info Grid */}
            <div className="grid grid-cols-1 gap-6">
              
              {/* Title and Price Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {ad.title}
                </h1>
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-6">
                  {formatPrice(ad.price)}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm lg:text-base text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <MapPin size={18} className="mr-2" />
                    <span className="font-medium">{ad.location.district}, {ad.location.city}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock size={18} className="mr-2" />
                    <span>{formatDate(ad.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Eye size={18} className="mr-2" />
                    <span>{ad.viewCount} görüntülenme</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  İşlemler
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(user && (user.id === ad.userId || user.role === 'admin')) && (
                    <>
                      <button
                        onClick={() => setShowEditModal(true)}
                        aria-label="İlanı Düzenle"
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 font-medium"
                      >
                        <Edit size={18} />
                        <span>Düzenle</span>
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        aria-label="İlanı Kaldır"
                        className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 font-medium"
                      >
                        <Trash2 size={18} />
                        <span>Kaldır</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleFavoriteClick}
                    aria-label="Favorilere ekle"
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 font-medium ${
                      isFavorite 
                        ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    <Heart
                      size={18}
                      className={isFavorite ? 'fill-current' : ''}
                    />
                    <span className="hidden sm:inline">{isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}</span>
                    <span className="sm:hidden">{isFavorite ? 'Çıkar' : 'Ekle'}</span>
                  </button>
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  İlan Açıklaması
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-base lg:text-lg">
                  {ad.description}
                </p>
              </div>

              {/* Category Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Kategori
                </h3>
                <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-xl text-base font-medium">
                  {ad.category.name}
                </span>
              </div>

              {/* Seller Info Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Satıcı Bilgileri
                </h3>
                
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {seller?.name || 'Satıcı'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(seller?.createdAt || ad.createdAt).toLocaleDateString('tr-TR', { year:'numeric', month:'long' })} tarihinde üye
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Telefon</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {seller?.phone || '+90 5XX XXX XX XX'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {seller?.phone && (
                    <a
                      href={`https://wa.me/${seller.phone.replace(/\D/g,'')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition-colors font-medium"
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
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
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