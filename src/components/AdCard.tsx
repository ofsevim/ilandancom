import React, { useState, useEffect } from 'react';
import { Ad } from '../types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { buildImageUrl } from '../lib/images';
import { motion } from 'framer-motion';

interface AdCardProps {
  ad: Ad;
  onAdClick: (ad: Ad) => void;
  showEditButton?: boolean;
  onEditClick?: (ad: Ad) => void;
  priority?: boolean;
}

const AdCard: React.FC<AdCardProps> = ({ ad, onAdClick, showEditButton, onEditClick, priority = false }) => {
  const { favorites, toggleFavorite, user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(favorites.includes(ad.id));

  useEffect(() => {
    setIsFavorite(favorites.includes(ad.id));
  }, [favorites, ad.id]);

  const formatPrice = (price: number) => new Intl.NumberFormat('tr-TR').format(price) + ' TL';

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Bilinmiyor';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Bilinmiyor';
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Bugün';
    if (diffDays === 2) return 'Dün';
    return date.toLocaleDateString('tr-TR');
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Favorilere eklemek için önce giriş yapmalısınız');
      return;
    }
    toggleFavorite(ad.id);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={() => onAdClick(ad)}
      className="group cursor-pointer flex flex-col h-full rounded-xl bg-navy-900 border border-silver-600/8 overflow-hidden hover:border-accent/30 hover:shadow-card-hover"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {ad.images && ad.images.length > 0 ? (
          <img
            src={buildImageUrl(ad.images[0], { width: 600, height: 450 })}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="w-full h-full bg-navy-950 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-silver-700/40">image_not_supported</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-navy-950/70 backdrop-blur-sm border border-silver-600/12 hover:bg-navy-950/90 transition-colors z-10"
        >
          <span className={`material-symbols-outlined text-lg transition-colors ${isFavorite ? 'text-red-500 [font-variation-settings:"FILL"_1]' : 'text-silver-400 hover:text-silver-100'}`}>favorite</span>
        </button>

        {/* Badges */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          {ad.featured && (
            <span className="bg-gradient-to-r from-accent to-accent-dark text-silver-100 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-lg shadow-accent/20">Vitrin</span>
          )}
          {ad.price < 50000 && (
            <span className="bg-red-600/90 backdrop-blur-sm text-silver-100 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-lg shadow-red-500/20">Acil</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-3.5 pb-3 flex flex-col flex-1">
        {/* Location */}
        <div className="flex items-center gap-1 text-silver-700 text-[11px] font-medium mb-2">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          <span>{ad.location?.city || 'Bilinmeyen'}, {ad.location?.district || 'Konum'}</span>
        </div>

        {/* Title */}
        <h4 className="font-semibold text-[15px] leading-snug mb-2 line-clamp-2 text-silver-100 group-hover:text-accent-light transition-colors">
          {ad.title}
        </h4>

        {/* Category + Date */}
        <p className="text-silver-700 text-[12px] mb-4 truncate">
          {ad.category?.name || 'Genel'} &middot; {formatDate(ad.createdAt)}
        </p>

        {/* Price + Edit */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-silver-600/6">
          <div className="text-lg font-bold text-silver-100 tracking-tight">
            {formatPrice(ad.price)}
          </div>
          {showEditButton && onEditClick && user && (user.id === ad.userId || user.role === 'admin') && (
            <button
              onClick={(e) => { e.stopPropagation(); onEditClick(ad); }}
              className="w-8 h-8 rounded-lg bg-navy-800 border border-silver-600/8 flex items-center justify-center text-silver-500 hover:text-silver-100 hover:border-accent/30 hover:bg-accent/10 transition-all"
            >
              <span className="material-symbols-outlined text-base">edit</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdCard;
