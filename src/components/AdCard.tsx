import React, { useState, useEffect } from 'react';
import { Heart, Edit } from 'lucide-react';
import { Ad } from '../types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { buildImageUrl } from '../lib/images';

interface AdCardProps {
  ad: Ad;
  onAdClick: (ad: Ad) => void;
  showEditButton?: boolean;
  onEditClick?: (ad: Ad) => void;
  priority?: boolean;
}

import { motion } from 'framer-motion';

const AdCard: React.FC<AdCardProps> = ({ ad, onAdClick, showEditButton, onEditClick, priority = false }) => {
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onAdClick(ad)}
      className="listing-card cursor-pointer group flex flex-col relative w-full"
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
        {ad.images.length > 0 ? (
          <img
            src={buildImageUrl(ad.images[0], { width: 500, height: 400, quality: 85 })}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-primary-100 dark:bg-primary-800 text-primary-300">
            <span className="text-5xl mb-2">💎</span>
            <span className="text-xs font-bold uppercase tracking-widest">Görsel Yok</span>
          </div>
        )}

        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute inset-0 bg-accent-premium/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {ad.featured && (
            <div className="bg-accent-premium text-white px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase shadow-sm">
              VİTRİN
            </div>
          )}
          <div className="bg-white/95 dark:bg-primary-900/95 text-primary-900 dark:text-white px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase border border-primary-100 dark:border-primary-700 shadow-sm">
            {ad.category?.name || 'GENEL'}
          </div>
        </div>

        {/* Favorite Button */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleFavoriteClick}
            className="w-8 h-8 bg-white dark:bg-primary-800 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-md border border-primary-100 dark:border-primary-700"
          >
            <Heart
              size={14}
              className={`transition-colors duration-300 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-primary-400 dark:text-primary-300 hover:text-red-400'}`}
            />
          </button>
        </div>

        {/* Edit Button */}
        {showEditButton && onEditClick && user && (user.id === ad.userId || user.role === 'admin') && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(ad);
            }}
            className="absolute bottom-4 left-4 w-10 h-10 bg-accent-premium rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-premium"
          >
            <Edit size={18} className="text-white" />
          </button>
        )}

        {/* Pre-Content Space (Sade tasarım için fiyatı image üzerinden sildik) */}
      </div>

      {/* Content Section */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-1 line-clamp-1 text-[14px]">
          {ad.title}
        </h3>

        <div className="text-[15px] font-bold text-accent-premium dark:text-accent-light mb-2">
          {formatPrice(ad.price)}
        </div>

        {/* Footer info (Location & Stats) */}
        <div className="flex items-center justify-between mt-auto">
          <div className="text-[12px] text-primary-500 dark:text-primary-400 capitalize truncate w-2/3">
            {ad.location.city} {ad.location.district ? `/ ${ad.location.district}` : ''}
          </div>
          <div className="text-[10px] text-primary-400 dark:text-primary-500">
            {formatDate(ad.createdAt)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default AdCard;