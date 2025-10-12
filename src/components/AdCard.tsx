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
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Favori ekleme/çıkarma hatası:', error);
    }
  };

  return (
    <div
      onClick={() => onAdClick(ad)}
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg hover:shadow-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
      style={{ minHeight: 420 }}
    >
      {/* Image */}
      <div className="relative h-56 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {ad.images.length > 0 ? (
          <>
            {/* Ultra-Fast Image Loading */}
            <img
              src={ad.images[0]}
              alt={ad.title}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
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

        {/* Image Count Badge */}
        {ad.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm">
            📷 {ad.images.length}
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