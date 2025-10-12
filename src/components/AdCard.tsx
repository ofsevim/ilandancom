import React, { useState, useEffect } from 'react';
import { MapPin, Eye, Heart, Clock, Edit } from 'lucide-react';
import { Ad } from '../types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { buildImageUrl } from '../lib/images';

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
    if (!user) {
      toast.error('Favorilere eklemek için önce giriş yapmalısınız');
      return;
    }
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
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {ad.images.length > 0 ? (
          <img
            src={buildImageUrl(ad.images[0], { width: 400, quality: 80, format: 'webp' })}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
            width="400"
            height="192"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">📷</span>
          </div>
        )}
        
        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {ad.featured && (
            <span className="bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-bold">
              VİTRİN
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-md"
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
            className="absolute top-2 left-2 w-8 h-8 bg-blue-500/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-md"
            title="İlanı Düzenle"
          >
            <Edit size={16} className="text-white" />
          </button>
        )}

        {/* Image Count */}
        {ad.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
            <span>📷</span>
            <span>{ad.images.length}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Category Badge */}
        <div className="mb-2">
          <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
            {ad.category?.name || 'Diğer'}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {ad.title}
        </h3>

        {/* Price */}
        <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">
          {formatPrice(ad.price)}
        </div>

        {/* Location & Stats */}
        <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="truncate">{ad.location.city}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock size={12} className="flex-shrink-0" />
              <span>{formatDate(ad.createdAt)}</span>
            </div>

            <div className="flex items-center gap-1">
              <Eye size={12} className="flex-shrink-0" />
              <span>{ad.viewCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdCard;