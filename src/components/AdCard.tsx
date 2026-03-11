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
    const date = new Date(dateString);
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
      className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-slate-100 dark:border-slate-800 cursor-pointer flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {ad.images && ad.images.length > 0 ? (
          <img
            src={buildImageUrl(ad.images[0], { width: 600, height: 450 })}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-4xl">image_not_supported</span>
          </div>
        )}

        {/* Favorite Button */}
        <div 
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 p-2 rounded-full shadow-md cursor-pointer hover:text-red-500 transition-colors z-10"
        >
          <span className={`material-symbols-outlined text-xl leading-none ${isFavorite ? 'text-red-500 fill-1' : ''}`}>favorite</span>
        </div>

        {/* Badges */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          {ad.featured && (
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">VİTRİN</span>
          )}
          {ad.price < 50000 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Acil Satılık</span>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-2 font-medium">
          <span className="material-symbols-outlined text-xs">location_on</span>
          <span>{ad.location.city}, {ad.location.district}</span>
        </div>
        
        <h4 className="font-bold text-lg mb-1 truncate text-slate-900 dark:text-white group-hover:text-primary transition-colors">
          {ad.title}
        </h4>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-1">
          {ad.category?.name || 'Genel'} • {formatDate(ad.createdAt)}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div className="text-xl font-black text-primary tracking-tight">
            {formatPrice(ad.price)}
          </div>
          {showEditButton && onEditClick && user && (user.id === ad.userId || user.role === 'admin') && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEditClick(ad); }}
              className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all shadow-sm"
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
