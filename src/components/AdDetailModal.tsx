import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Eye, Heart, ChevronLeft, ChevronRight, Trash2, Edit } from 'lucide-react';
import { Ad } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { adService, publicUserService } from '../services/api';
import MessagesModal from './MessagesModal';
import EditAdModal from './EditAdModal';
import toast from 'react-hot-toast';
import { buildImageUrl } from '../lib/images';
import { motion, AnimatePresence } from 'framer-motion';

interface AdDetailModalProps {
  ad: Ad;
  onClose: () => void;
  onDeleted?: () => void;
  asPage?: boolean;
}

const AdDetailModal: React.FC<AdDetailModalProps> = ({ ad, onClose, onDeleted, asPage = false }) => {
  const { favorites, toggleFavorite, user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [seller, setSeller] = useState(ad.user);
  const [showMessages, setShowMessages] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (asPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [asPage]);

  useEffect(() => {
    let isMounted = true;
    const loadSeller = async () => {
      try {
        if (!ad.userId) return;
        const sellerData = await publicUserService.getPublicUserById(ad.userId);
        if (!isMounted) return;
        setSeller({
          id: sellerData.id,
          email: sellerData.email,
          name: sellerData.name,
          phone: sellerData.phone,
          avatar: sellerData.avatar,
          role: (sellerData as any).role || 'user',
          createdAt: (sellerData as any).created_at || (sellerData as any).createdAt,
          isActive: (sellerData as any).is_active || (sellerData as any).isActive
        });
      } catch {
        // fallback to ad.user
      }
    };
    loadSeller();
    return () => { isMounted = false; };
  }, [ad.userId]);

  useEffect(() => {
    const incrementView = async () => {
      try {
        if (!user || user.id !== ad.userId) {
          await adService.incrementViewCount(ad.id);
        }
      } catch (error) {
        console.warn('View count artırılamadı:', error);
      }
    };
    incrementView();
  }, [ad.id, ad.userId, user]);

  const isFavorite = favorites.includes(ad.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' TL';
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === ad.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? ad.images.length - 1 : prev - 1));
  };

  const handleFavoriteClick = () => {
    if (!user) {
      toast.error('Favorilere eklemek için önce giriş yapmalısınız');
      return;
    }
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
      toast.error('İlan silinirken bir hata oluştu.');
    } finally {
      setDeleting(false);
    }
  };

  const modalVariants: any = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.95, y: 20 }
  };

  return (
    <div className={asPage ? "w-full mx-auto" : "fixed inset-0 bg-primary-950/80 backdrop-blur-md flex items-start justify-center z-50 p-4 overflow-y-auto"}>
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`bg-white dark:bg-primary-900 rounded-[2.5rem] w-full relative overflow-hidden shadow-premium border border-primary-100 dark:border-primary-800 ${asPage ? 'scale-90 origin-top' : 'max-w-[95vw] my-4'}`}
      >
        {!asPage && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 w-12 h-12 glass rounded-full flex items-center justify-center text-primary-600 dark:text-white hover:scale-110 active:scale-95 transition-all shadow-premium border-white/20"
          >
            <X size={20} />
          </button>
        )}

        <div className="flex flex-col lg:flex-row min-h-[700px]">
          {/* Left Side - Photo Gallery */}
          <div className="lg:w-[50%] relative bg-primary-50 dark:bg-black/20 flex flex-col">
            <div className="relative flex-1 min-h-[400px] lg:min-h-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  src={buildImageUrl(ad.images[currentImageIndex], { width: 1200, height: 900, quality: 85 })}
                  alt={ad.title}
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setIsFullscreen(true)}
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
              {ad.images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 dark:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-primary-900 dark:text-white hover:scale-110 transition-all shadow-premium border border-primary-200 dark:border-white/20">
                    <ChevronLeft size={20} className="md:w-6 md:h-6" />
                  </button>
                  <button onClick={nextImage} className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 dark:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-primary-900 dark:text-white hover:scale-110 transition-all shadow-premium border border-primary-200 dark:border-white/20">
                    <ChevronRight size={20} className="md:w-6 md:h-6" />
                  </button>
                </>
              )}

              {/* Top Badges */}
              <div className="absolute top-4 left-4 md:top-6 md:left-6 flex flex-col gap-2 md:gap-3">
                {ad.featured && (
                  <div className="gold-gradient text-primary-950 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-premium">
                    PREMIUM VİTRİN
                  </div>
                )}
                <div className="bg-primary-900/90 dark:bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase text-white shadow-premium border border-white/20">
                  {ad.category?.name || 'GENEL'}
                </div>
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-primary-900/90 dark:bg-black/50 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl text-[10px] font-black tracking-widest text-white border border-white/20 shadow-premium">
                {currentImageIndex + 1} / {ad.images.length}
              </div>
            </div>

            {/* Thumbnails Sidebar/Bottom */}
            {ad.images.length > 1 && (
              <div className="p-6 overflow-x-auto flex gap-4 scrollbar-hide bg-white dark:bg-primary-900/50 backdrop-blur-xl border-t border-primary-100 dark:border-white/5">
                {ad.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${idx === currentImageIndex
                      ? 'border-accent-premium shadow-premium scale-105'
                      : 'border-transparent opacity-50 hover:opacity-100'
                      }`}
                  >
                    <img src={buildImageUrl(img, { width: 200, height: 200, quality: 60 })} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Info Section */}
          <div className="lg:w-[50%] flex flex-col h-full bg-white dark:bg-primary-900 border-l border-primary-100 dark:border-primary-800">
            <div className="p-8 lg:p-10 flex-1 overflow-y-auto">
              {/* Header Info */}
              <div className="space-y-6 mb-10 pb-8 border-b border-primary-100 dark:border-primary-800">
                <div className="flex items-center gap-4 text-[10px] font-black tracking-widest uppercase text-accent-premium">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} />
                    {new Date(ad.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye size={12} />
                    {ad.viewCount} Görüntüleme
                  </div>
                </div>

                <h1 className="text-3xl font-black text-primary-950 dark:text-white leading-[1.2] tracking-tight">
                  {ad.title}
                </h1>

                <div className="flex items-center justify-between">
                  <div className="text-4xl font-black text-accent-premium gold-text">
                    {formatPrice(ad.price)}
                  </div>
                  <button
                    onClick={handleFavoriteClick}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-premium border-2 active:scale-95 ${isFavorite
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'bg-white dark:bg-primary-800 border-primary-100 dark:border-primary-700 text-primary-400 hover:text-red-500 hover:border-red-500'
                      }`}
                  >
                    <Heart size={24} className={isFavorite ? 'fill-current' : ''} />
                  </button>
                </div>

                <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-800/50 rounded-2xl border border-primary-100 dark:border-primary-800 transition-colors group">
                  <div className="w-10 h-10 bg-accent-premium rounded-xl flex items-center justify-center text-white shadow-premium transition-transform group-hover:rotate-12">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-0.5">Konum</div>
                    <div className="text-sm font-black text-primary-900 dark:text-white uppercase">
                      {ad.location.district}, {ad.location.city}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-10">
                <h3 className="text-xs font-black text-primary-700 dark:text-primary-400 uppercase tracking-[0.25em] mb-6">İlan Detayları</h3>
                <div className="text-primary-700 dark:text-primary-300 leading-[1.8] text-sm whitespace-pre-wrap font-medium">
                  {ad.description}
                </div>
              </div>

              {/* Seller Info */}
              <div className="mb-10">
                <h3 className="text-xs font-black text-primary-700 dark:text-primary-400 uppercase tracking-[0.25em] mb-6">Yayınlayan</h3>
                <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-primary-100 dark:bg-gradient-premium border border-primary-200 dark:border-white/5 shadow-premium">
                  <div className="w-16 h-16 rounded-2xl bg-accent-premium flex items-center justify-center shadow-premium ring-4 ring-primary-200/50 dark:ring-white/10">
                    <span className="text-2xl font-black text-white">
                      {(seller?.name || 'S')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-black text-primary-900 dark:text-white mb-1">{seller?.name || 'Satıcı'}</div>
                    <div className="text-xs font-bold text-primary-600 dark:text-white/50 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Online Satıcı
                    </div>
                  </div>
                </div>
              </div>

              {/* Management Buttons (If Owner) */}
              {user && (user.id === ad.userId || user.role === 'admin') && (
                <div className="mb-10 grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center justify-center gap-2 py-4 bg-primary-50 dark:bg-primary-800 text-primary-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white dark:hover:bg-primary-700 transition-all border border-primary-100 dark:border-primary-800 shadow-sm"
                  >
                    <Edit size={16} className="text-accent-premium" />
                    Düzenle
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    {deleting ? 'Siliniyor' : 'İlanı Sil'}
                  </button>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-8 lg:p-10 border-t border-primary-100 dark:border-primary-800 bg-white dark:bg-primary-900/80 backdrop-blur-xl">
              <div className="flex flex-col gap-3">
                {seller?.phone && (
                  <a
                    href={`tel:${seller.phone}`}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-white dark:bg-primary-800 text-primary-900 dark:text-white rounded-xl font-bold text-sm border-2 border-primary-200 dark:border-primary-700 shadow-sm transition-all hover:border-primary-300 dark:hover:border-primary-600 active:scale-98"
                  >
                    <span className="text-lg">💬</span>
                    {seller.phone}
                  </a>
                )}
                <button
                  onClick={() => {
                    if (!user) {
                      toast.error('Mesaj göndermek için önce giriş yapmalısınız');
                      return;
                    }
                    setShowMessages(true);
                  }}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-accent-premium hover:bg-accent-premium/90 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-98"
                >
                  <span className="text-lg">✉️</span>
                  Mesaj Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Viewer */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 lg:p-12"
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 md:top-10 md:right-10 w-10 h-10 md:w-14 md:h-14 glass rounded-full flex items-center justify-center text-white active:scale-90 transition-all z-[110]"
            >
              <X size={24} className="md:w-7 md:h-7" />
            </button>
            <img
              src={ad.images[currentImageIndex]}
              alt={ad.title}
              className="max-w-full max-h-full object-contain rounded-3xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {showMessages && (
        <MessagesModal receiverId={ad.userId} adId={ad.id} onClose={() => setShowMessages(false)} />
      )}

      {showEditModal && (
        <EditAdModal
          ad={ad}
          onClose={() => setShowEditModal(false)}
          onAdUpdated={() => {
            setShowEditModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default AdDetailModal;
