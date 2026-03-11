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
      whileHover={{ y: -8 }}
      onClick={() => onAdClick(ad)}
      className="premium-card cursor-pointer flex flex-col h-full group pb-2"
    >
      <div className="relative aspect-[4/3] overflow-hidden m-2 rounded-xl">
        {ad.images && ad.images.length > 0 ? (
          <img
            src={buildImageUrl(ad.images[0], { width: 600, height: 450 })}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="w-full h-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-300 dark:text-slate-600">
            <span className="material-symbols-outlined text-[48px] opacity-50">image_not_supported</span>
          </div>
        )}

        {/* Favorite Button */}
        <div 
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 bg-white/90 dark:bg-[#12142d]/90 backdrop-blur-md p-2 rounded-full shadow-lg cursor-pointer hover:text-red-500 transition-colors z-10 border border-white/20 dark:border-white/5"
        >
          <span className={`material-symbols-outlined text-[20px] leading-none ${isFavorite ? 'text-red-500 fill-1' : 'text-slate-600 dark:text-slate-300'}`}>favorite</span>
        </div>

        {/* Badges */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          {ad.featured && (
            <span className="bg-neon-indigo text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest shadow-lg shadow-primary-500/20">VİTRİN</span>
          )}
          {ad.price < 50000 && (
            <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest shadow-lg shadow-red-500/20">ACİL</span>
          )}
        </div>
      </div>

      <div className="px-5 pt-4 pb-3 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 text-primary-500 dark:text-primary-400 text-[11px] font-black uppercase tracking-widest mb-3">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          <span>{ad.location?.city || 'Bilinmeyen'}, {ad.location?.district || 'Konum'}</span>
        </div>
        
        <h4 className="font-extrabold text-[17px] leading-snug mb-2 line-clamp-2 text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">
          {ad.title}
        </h4>
        
        <p className="text-slate-500 dark:text-slate-400 text-[13px] font-medium mb-5 truncate">
          {ad.category?.name || 'Genel'} • {formatDate(ad.createdAt)}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-primary-800/30">
          <div className="text-[20px] font-black text-slate-900 dark:text-white tracking-tight">
            {formatPrice(ad.price)}
          </div>
          {showEditButton && onEditClick && user && (user.id === ad.userId || user.role === 'admin') && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEditClick(ad); }}
              className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-primary-900/40 border border-slate-200 dark:border-primary-800/50 flex items-center justify-center text-slate-600 dark:text-primary-300 hover:bg-neon-indigo hover:text-white hover:border-transparent transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdCard;
