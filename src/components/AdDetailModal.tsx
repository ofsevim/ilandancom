import React, { useState } from 'react';
import { X, MapPin, Clock, Eye, Heart, Phone, MessageCircle, ChevronLeft, ChevronRight, User, Trash2, Send } from 'lucide-react';
import { Ad } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { adService, userService, publicUserService } from '../services/api';
import MessagesModal from './MessagesModal';

interface AdDetailModalProps {
  ad: Ad;
  onClose: () => void;
  onDeleted?: () => void;
}

const AdDetailModal: React.FC<AdDetailModalProps> = ({ ad, onClose, onDeleted }) => {
  const { favorites, toggleFavorite, user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [seller, setSeller] = useState(ad.user);
  const [showMessages, setShowMessages] = useState(false);

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
          role: sellerData.role,
          createdAt: sellerData.created_at,
          isActive: sellerData.is_active
        });
      } catch {
        // ignore, fallback ad.user
      }
    };
    loadSeller();
    return () => { isMounted = false; };
  }, [ad.userId]);

  const isFavorite = favorites.includes(ad.id);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full my-8 relative">
        <button
          onClick={onClose}
          aria-label="Kapat"
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-opacity-100 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Images */}
          <div className="space-y-4">
            {ad.images.length > 0 ? (
              <div className="relative">
                <img
                  src={ad.images[currentImageIndex]}
                  alt={ad.title}
                  className="w-full h-[520px] object-cover rounded-lg cursor-zoom-in"
                  loading="eager"
                  onClick={() => setIsFullscreen(true)}
                />
                
                {ad.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      aria-label="Önceki görsel"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      aria-label="Sonraki görsel"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                    >
                      <ChevronRight size={20} />
                    </button>
                    
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {ad.images.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-[520px] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Fotoğraf Yok</span>
              </div>
            )}

            {/* Thumbnail Images */}
            {ad.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {ad.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex 
                        ? 'border-blue-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <img
                      src={image}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  {ad.featured && (
                    <span className="inline-block bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium mb-2">
                      VİTRİN İLANI
                    </span>
                  )}
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {ad.title}
                  </h1>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(ad.price)}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-10 md:mt-0 mr-10 md:mr-16">
                  {(user && (user.id === ad.userId || user.role === 'admin')) && (
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      aria-label="İlanı Kaldır"
                      className="w-12 h-12 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-full flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                      title="İlanı Kaldır"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                  <button
                    onClick={handleFavoriteClick}
                    aria-label="Favorilere ekle"
                    className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                    title="Favorilere Ekle"
                  >
                    <Heart
                      size={20}
                      className={isFavorite ? 'text-red-500 fill-current' : 'text-gray-500 dark:text-gray-400'}
                    />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1" />
                  <span>{ad.location.district}, {ad.location.city}</span>
                </div>
                
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

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Açıklama
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {ad.description}
              </p>
            </div>

            {/* Category */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Kategori
              </h3>
              <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg text-sm font-medium">
                {ad.category.name}
              </span>
            </div>

            {/* Seller Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Satıcı Bilgileri
              </h3>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <User size={20} className="text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {seller?.name || 'Satıcı'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Üyelik: {formatDate(seller?.createdAt || ad.createdAt)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {!showContactInfo ? (
                  <button
                    onClick={() => setShowContactInfo(true)}
                    aria-label="Telefonu göster"
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                  >
                    <Phone size={18} />
                    <span>Telefonu Göster</span>
                  </button>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                        <Phone size={18} />
                        <span className="font-medium">
                          {seller?.phone || '+90 5XX XXX XX XX'}
                        </span>
                      </div>
                      {seller?.phone && (
                        <a href={`tel:${seller.phone}`} className="text-blue-600 dark:text-blue-300 text-sm font-medium hover:underline" aria-label="Telefon et">Ara</a>
                      )}
                    </div>
                    {seller?.email && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                          <MessageCircle size={18} />
                          <span className="font-medium">{seller.email}</span>
                        </div>
                        <a href={`mailto:${seller.email}`} className="text-blue-600 dark:text-blue-300 text-sm font-medium hover:underline" aria-label="E-posta gönder">E‑posta</a>
                      </div>
                    )}
                    {seller?.phone && (
                      <a
                        href={`https://wa.me/${seller.phone.replace(/\D/g,'')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-green-700 dark:text-green-300 text-sm font-medium hover:underline"
                        aria-label="WhatsApp ile yaz"
                      >
                        WhatsApp ile yaz
                      </a>
                    )}
                  </div>
                )}
                <button
                  onClick={() => setShowMessages(true)}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Send size={18} />
                  <span>Mesaj Gönder</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {isFullscreen && ad.images.length > 0 && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center">
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
    </div>
  );
};

export default AdDetailModal;