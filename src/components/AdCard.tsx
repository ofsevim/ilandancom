import React, { useState, useEffect } from 'react';
import { MapPin, Eye, Heart, Clock, Edit } from 'lucide-react';
import { Ad } from '../types';
import { buildImageUrl } from '../lib/images';
import { useAuth } from '../contexts/AuthContext';
import LazyImage from './LazyImage';

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
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      currencyDisplay: 'symbol'
    }).format(price).replace('₺', '') + ' ₺';
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
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
              <div 
          className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden touch-pan-y select-none group-hover:scale-105 transition-transform duration-300"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
        {ad.images.length > 0 ? (
          <>
            <LazyImage
              src={ad.images[currentImageIndex]}
              alt={ad.title}
              className="w-full h-full"
              width={400}
              height={300}
              quality={60}
              format="webp"
              resize="cover"
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
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 tracking-tight">
          {ad.title}
        </h3>

        <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2.5 group-hover:scale-105 transition-transform duration-300">
          {formatPrice(ad.price)}
        </div>

        <div className="space-y-1.5 text-[13px] text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <MapPin size={14} className="mr-1 flex-shrink-0" />
            <span className="truncate">
              {ad.location.district}, {ad.location.city}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock size={14} className="mr-1 flex-shrink-0" />
              <span>{formatDate(ad.createdAt)}</span>
            </div>

            <div className="flex items-center">
              <Eye size={14} className="mr-1 flex-shrink-0" />
              <span>{ad.viewCount}</span>
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="mt-2.5 pt-2.5 border-t border-gray-200 dark:border-gray-700">
          <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs">
            {ad.category?.name || 'Diğer'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdCard;