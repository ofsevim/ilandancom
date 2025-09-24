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
    <div className={asPage ? "max-w-full mx-auto p-2 lg:p-4" : "fixed inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/20 to-slate-900/80 backdrop-blur-sm flex items-start justify-center z-50 p-2 overflow-y-auto"}>
      <div className={asPage ? "bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 rounded-2xl w-full relative overflow-hidden shadow-2xl border border-blue-100/50 dark:border-gray-600" : "bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 rounded-2xl max-w-full w-full my-4 relative overflow-hidden shadow-2xl border border-blue-100/50 dark:border-gray-600"}>
        {!asPage && (
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="absolute top-2 right-2 md:top-4 md:right-4 z-50 w-12 h-12 md:w-10 md:h-10 bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-opacity-100 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 shadow-lg border border-gray-200 dark:border-gray-600"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-4 lg:p-6 bg-gradient-to-b from-transparent to-blue-50/20 dark:to-transparent">
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
                  {/* Badges */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    {ad.featured && (
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-xl backdrop-blur-sm border border-white/20">
                        ✨ Öne Çıkan
                      </span>
                    )}
                    <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-xl backdrop-blur-sm border border-white/20">
                      🆕 Yeni
                    </span>
                  </div>

                  {/* Favorite Button */}
                  <div className="absolute top-4 right-4 z-20">
                    <button
                      onClick={handleFavoriteClick}
                      aria-label="Favorilere ekle"
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl backdrop-blur-sm border-2 hover:scale-110 ${
                        isFavorite 
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-white/30 hover:from-red-600 hover:to-pink-600' 
                          : 'bg-white/90 text-gray-600 border-white/50 hover:bg-white hover:text-red-500'
                      }`}
                    >
                      <Heart
                        size={20}
                        className={`transition-all duration-300 ${isFavorite ? 'fill-current scale-110' : ''}`}
                      />
                    </button>
                  </div>

                {/* Loading Skeleton */}
                  <div className="w-full h-[350px] lg:h-[450px] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl animate-pulse absolute inset-0 shadow-2xl"></div>
                  
                  <img
                    src={buildImageUrl(ad.images[currentImageIndex], { 
                      width: isSlowConnection ? 1200 : 1600, 
                      height: isSlowConnection ? 800 : 1000, 
                      quality: isSlowConnection ? 60 : 85, 
                      resize: 'cover', 
                      format: 'webp' 
                    })}
                    alt={ad.title}
                    className="w-full h-[350px] lg:h-[450px] object-cover rounded-2xl cursor-zoom-in transition-all duration-500 relative z-10 shadow-2xl hover:shadow-3xl hover:scale-[1.02] border border-white/50"
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
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 hover:scale-110 backdrop-blur-sm border border-white/50"
                    >
                      <ChevronLeft size={24} className="text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      aria-label="Sonraki görsel"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 hover:scale-110 backdrop-blur-sm border border-white/50"
                    >
                      <ChevronRight size={24} className="text-gray-700" />
                    </button>
                    
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-black/80 to-gray-900/80 text-white px-4 py-2 rounded-full text-sm font-medium shadow-xl backdrop-blur-sm border border-white/20">
                      {currentImageIndex + 1} / {ad.images.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-[350px] lg:h-[450px] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl flex items-center justify-center shadow-2xl border border-white/50">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-500 dark:to-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📷</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Fotoğraf Yok</span>
                </div>
              </div>
            )}

            {/* Thumbnail Images */}
            {ad.images.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-2 px-1">
                {ad.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden border-3 transition-all duration-300 shadow-lg hover:shadow-xl ${
                      index === currentImageIndex 
                        ? 'border-gradient-to-r from-blue-500 to-purple-500 shadow-blue-500/50 scale-110 ring-2 ring-blue-400/30' 
                        : 'border-white/70 dark:border-gray-500 hover:border-blue-300 hover:scale-105'
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
              <div className="bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-2xl p-6 shadow-xl border border-blue-100/50 dark:border-gray-600 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📝</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    İlan Açıklaması
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                  {ad.description}
                </p>
              </div>
          </div>

            {/* Right Side - Info Grid */}
            <div className="grid grid-cols-1 gap-3">
              
              {/* Title and Price Card */}
              <div className="bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-2xl p-6 shadow-xl border border-blue-100/50 dark:border-gray-600 backdrop-blur-sm">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  {ad.title}
                </h1>
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  {formatPrice(ad.price)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                    <MapPin size={16} className="text-blue-500" />
                    <span className="font-medium">{ad.location.district}, {ad.location.city}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                    <Clock size={16} className="text-green-500" />
                    <span>{formatDate(ad.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                    <Eye size={16} className="text-purple-500" />
                    <span>{ad.viewCount} görüntülenme</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Card - Only for owners */}
              {(user && (user.id === ad.userId || user.role === 'admin')) && (
                <div className="bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-2xl p-6 shadow-xl border border-blue-100/50 dark:border-gray-600 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">⚙️</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      İşlemler
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowEditModal(true)}
                      aria-label="İlanı Düzenle"
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Edit size={16} />
                      <span>Düzenle</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      aria-label="İlanı Kaldır"
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                    >
                      <Trash2 size={16} />
                      <span>Kaldır</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Seller Info Card */}
              <div className="bg-gradient-to-br from-white via-green-50/30 to-white dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-2xl p-6 shadow-xl border border-green-100/50 dark:border-gray-600 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">👤</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Satıcı Bilgileri
                  </h3>
                </div>
                
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <User size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white text-base">
                      {seller?.name || 'Satıcı'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(seller?.createdAt || ad.createdAt).toLocaleDateString('tr-TR', { year:'numeric', month:'long' })} tarihinde üye
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl p-4 mb-4 border border-gray-200/50 dark:border-gray-600/50">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300 font-semibold flex items-center gap-2">
                      <span className="text-lg">📞</span>
                      Telefon
                    </span>
                    <span className="text-base font-bold text-gray-900 dark:text-white">
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
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <span className="text-base">💬</span>
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
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <span className="text-base">💌</span>
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