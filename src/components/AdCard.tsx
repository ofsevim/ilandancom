import React, { useState, useEffect } from 'react';
import { MapPin, Eye, Heart, Clock, Edit } from 'lucide-react';
import { Ad } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface AdCardProps {
  ad: Ad;
  onAdClick: (ad: Ad) => void;
  showEditButton?: boolean;
  onEditClick?: (ad: Ad) => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, onAdClick, showEditButton, onEditClick }) => {
  const { favorites, toggleFavorite, user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(favorites.includes(ad.id));
  
  // Fotoğraf galerisi state'leri
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Favorites değiştiğinde local state'i güncelle
  useEffect(() => {
    setIsFavorite(favorites.includes(ad.id));
  }, [favorites, ad.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' TL';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Bugün';
    if (diffDays === 2) return 'Dün';
    if (diffDays <= 7) return `${diffDays - 1} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavorite(ad.id);
      // Local state'i hemen güncelle
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Favori ekleme/çıkarma hatası:', error);
    }
  };

  // Swipe fonksiyonları
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 30; // Daha küçük mesafe
    const isRightSwipe = distance < -30;

    if (isLeftSwipe && currentImageIndex < ad.images.length - 1) {
      // Sola kaydırma - sonraki fotoğraf
      setCurrentImageIndex(prev => prev + 1);
    } else if (isRightSwipe && currentImageIndex > 0) {
      // Sağa kaydırma - önceki fotoğraf
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  return (
    <div
      onClick={() => onAdClick(ad)}
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg hover:shadow-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
      style={{ minHeight: 420 }}
    >
      {/* Image */}
      <div 
          className="relative h-56 bg-gray-200 dark:bg-gray-700 overflow-hidden touch-pan-y select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
        {ad.images.length > 0 ? (
          <>
            {/* Direct Image Loading - No transformation for speed */}
            <img
              src={ad.images[currentImageIndex]}
              alt={ad.title}
              className="w-full h-full object-cover transition-opacity duration-300"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            
            {/* Click Navigation - Sadece birden fazla fotoğraf varsa */}
            {ad.images.length > 1 && (
              <>
                {/* Sol taraftan tıklama - Önceki fotoğraf */}
                <div 
                  className="absolute left-0 top-0 w-1/3 h-full cursor-pointer z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentImageIndex > 0) {
                      setCurrentImageIndex(prev => prev - 1);
                    }
                  }}
                />
                
                {/* Sağ taraftan tıklama - Sonraki fotoğraf */}
                <div 
                  className="absolute right-0 top-0 w-1/3 h-full cursor-pointer z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentImageIndex < ad.images.length - 1) {
                      setCurrentImageIndex(prev => prev + 1);
                    }
                  }}
                />
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Fotoğraf Yok
          </div>
        )}
        
        {/* Featured Badge */}
        {ad.featured && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
            VİTRİN
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
        >
          <Heart
            size={16}
            className={isFavorite ? 'text-red-500 fill-current' : 'text-gray-600 dark:text-gray-400'}
          />
        </button>

        {/* Edit Button */}
        {showEditButton && onEditClick && user && (user.id === ad.userId || user.role === 'admin') && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(ad);
            }}
            className={`absolute top-2 w-8 h-8 bg-blue-500 bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all ${
              ad.featured ? 'left-16' : 'left-2'
            }`}
            title="İlanı Düzenle"
          >
            <Edit size={16} className="text-white" />
          </button>
        )}

        {/* Image Count */}
        {ad.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
            {currentImageIndex + 1} / {ad.images.length}
          </div>
        )}

        {/* Navigation Dots - Sadece birden fazla fotoğraf varsa */}
        {ad.images.length > 1 && (
          <div className="absolute bottom-2 left-2 flex space-x-1">
            {ad.images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentImageIndex 
                    ? 'bg-white' 
                    : 'bg-white bg-opacity-40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 text-base leading-tight">
          {ad.title}
        </h3>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 mb-3 group-hover:from-blue-100 group-hover:to-indigo-100 dark:group-hover:from-blue-900/30 dark:group-hover:to-indigo-900/30 transition-all">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {formatPrice(ad.price)}
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 py-1.5">
            <MapPin size={14} className="flex-shrink-0 text-blue-500" />
            <span className="truncate font-medium">
              {ad.location.district}, {ad.location.city}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 py-1.5 flex-1">
              <Clock size={14} className="flex-shrink-0 text-green-500" />
              <span className="text-xs">{formatDate(ad.createdAt)}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 py-1.5">
              <Eye size={14} className="flex-shrink-0 text-purple-500" />
              <span className="text-xs font-semibold">{ad.viewCount}</span>
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 group-hover:from-blue-100 group-hover:to-indigo-100 dark:group-hover:from-blue-900/30 dark:group-hover:to-indigo-900/30 transition-all">
            {ad.category?.name || 'Diğer'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdCard;