import React from 'react';
import { MapPin, Eye, Heart, Clock } from 'lucide-react';
import { Ad } from '../types';
import { buildImageUrl } from '../lib/images';
import { useAuth } from '../contexts/AuthContext';

interface AdCardProps {
  ad: Ad;
  onAdClick: (ad: Ad) => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, onAdClick }) => {
  const { favorites, toggleFavorite } = useAuth();
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
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Bugün';
    if (diffDays === 2) return 'Dün';
    if (diffDays <= 7) return `${diffDays - 1} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(ad.id);
  };

  return (
    <div
      onClick={() => onAdClick(ad)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer group transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {ad.images.length > 0 ? (
          <img
            src={buildImageUrl(ad.images[0], { width: 400, height: 300, quality: 60, resize: 'cover', format: 'webp' })}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
            loading="lazy"
            onLoad={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTE2LjU2OSA3MCAxMzAgODMuNDMxIDEzMCAxMDBDMTMwIDExNi41NjkgMTE2LjU2OSAxMzAgMTAwIDEzMEM4My40MzEgMTMwIDcwIDExNi41NjkgNzAgMTAwQzcwIDgzLjQzMSA4My40MzEgNzAgMTAwIDcwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
            }}
            style={{ opacity: 0 }}
          />
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

        {/* Image Count */}
        {ad.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
            {ad.images.length} Fotoğraf
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
          {ad.title}
        </h3>

        <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2.5">
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