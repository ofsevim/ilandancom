import React, { useState, useEffect } from 'react';
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
      } catch { }
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
      } catch (error) { console.warn('View count artırılamadı:', error); }
    };
    incrementView();
  }, [ad.id, ad.userId, user]);

  const isFavorite = favorites.includes(ad.id);
  const formatPrice = (price: number) => new Intl.NumberFormat('tr-TR').format(price) + ' TL';
  const nextImage = () => setCurrentImageIndex((p) => (p === ad.images.length - 1 ? 0 : p + 1));
  const prevImage = () => setCurrentImageIndex((p) => (p === 0 ? ad.images.length - 1 : p - 1));

  const handleFavoriteClick = () => {
    if (!user) { toast.error('Lütfen önce giriş yapın'); return; }
    toggleFavorite(ad.id);
  };

  const handleDelete = async () => {
    if (!user || user.id !== ad.userId || deleting) return;
    if (!window.confirm('Emin misiniz?')) return;
    try {
      setDeleting(true);
      await adService.deleteAd(ad.id);
      onDeleted?.();
      onClose();
    } catch { toast.error('Hata oluştu'); } finally { setDeleting(false); }
  };

  return (
    <div className={asPage ? "w-full max-w-full mx-auto py-0 px-0" : "fixed inset-0 bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center z-[100] p-2 lg:p-4"}>
      <motion.div 
        initial={!asPage ? { opacity: 0, scale: 0.95, y: 20 } : {}}
        animate={!asPage ? { opacity: 1, scale: 1, y: 0 } : {}}
        className={`bg-white dark:bg-[#12142d] w-full overflow-hidden flex flex-col md:flex-row relative
          ${asPage ? 'rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-premium max-w-[1400px] mx-auto' : 'max-w-[1380px] max-h-[92vh] rounded-[2rem] shadow-premium-hover border border-white/10'}`}
      >
        {!asPage && (
          <button onClick={onClose} className="absolute top-6 right-6 z-50 w-12 h-12 bg-black/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-black/40 hover:scale-105 transition-all shadow-lg">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        )}

        {/* Gallery Section */}
        <div className="md:w-[50%] relative bg-slate-100 dark:bg-[#0a0e27] flex flex-col min-h-[450px]">
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-0">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={buildImageUrl(ad.images[currentImageIndex], { width: 1200, height: 900 })}
                className="w-full h-full object-cover cursor-zoom-in rounded-[1.5rem]"
                onClick={() => setIsFullscreen(true)}
              />
            </AnimatePresence>

            {ad.images.length > 1 && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-8 flex justify-between pointer-events-none">
                <button onClick={prevImage} className="w-12 h-12 rounded-full glass flex items-center justify-center shadow-lg pointer-events-auto hover:scale-105 transition-all text-slate-900 dark:text-white">
                  <span className="material-symbols-outlined text-2xl">chevron_left</span>
                </button>
                <button onClick={nextImage} className="w-12 h-12 rounded-full glass flex items-center justify-center shadow-lg pointer-events-auto hover:scale-105 transition-all text-slate-900 dark:text-white">
                  <span className="material-symbols-outlined text-2xl">chevron_right</span>
                </button>
              </div>
            )}

            <div className="absolute bottom-4 left-6 flex gap-2">
              <div className="px-4 py-2 rounded-xl glass-premium text-white text-[11px] font-black tracking-widest uppercase shadow-lg">
                GÖRSEL {currentImageIndex + 1} / {ad.images.length}
              </div>
            </div>
          </div>

          <div className="p-4 flex gap-3 overflow-x-auto scrollbar-hide">
            {ad.images.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentImageIndex(i)}
                className={`w-[88px] h-[66px] rounded-xl overflow-hidden border-[3px] flex-shrink-0 transition-all duration-300
                  ${i === currentImageIndex ? 'border-primary-500 shadow-glow' : 'border-transparent opacity-50 hover:opacity-100'}`}
              >
                <img src={buildImageUrl(img, { width: 100, height: 80 })} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="md:w-[50%] flex flex-col bg-white dark:bg-[#12142d] overflow-y-auto max-h-[90vh] custom-scrollbar">
          <div className="p-5 lg:p-7 flex-1">
            <div className="mb-4 pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-4 py-1.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-lg text-[10px] font-black uppercase tracking-widest">{ad.category?.name || 'GENEL'}</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {ad.createdAt && !isNaN(new Date(ad.createdAt).getTime()) ? new Date(ad.createdAt).toLocaleDateString('tr-TR') : 'YENİ'}
                </span>
              </div>
              <h1 className="text-[28px] lg:text-[34px] font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight mb-4">{ad.title}</h1>
              <div className="text-[36px] lg:text-[40px] font-black text-primary-500 dark:text-primary-400 tracking-tighter drop-shadow-sm">{formatPrice(ad.price)}</div>
            </div>

            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => setShowMessages(true)}
                className="flex-1 h-16 bg-neon-indigo text-white rounded-[1.5rem] font-black text-[14px] uppercase tracking-widest shadow-gold-heavy hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined text-[20px]">mail</span>
                Satıcıyla İletişim
              </button>
              <button 
                onClick={handleFavoriteClick}
                className={`w-16 h-16 rounded-[1.5rem] border flex items-center justify-center shadow-sm hover:shadow-md transition-all
                  ${isFavorite ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-500' : 'bg-white dark:bg-[#1a1e3a] border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <span className={`material-symbols-outlined text-[28px] ${isFavorite ? 'fill-1' : ''}`}>favorite</span>
              </button>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <h3 className="dark-section-title text-slate-900 mb-2 uppercase tracking-widest text-[13px] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary-500">subject</span>İlan Detayları
                </h3>
                <div className="text-[15px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{ad.description}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">visibility</span>GÖRÜNTÜLENME</div>
                  <div className="text-[17px] font-black text-slate-900 dark:text-white">{ad.viewCount}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">map</span>KONUM</div>
                  <div className="text-[15px] font-black text-slate-900 dark:text-white truncate">{ad.location?.city || 'Bilinmeyen'}, {ad.location?.district || 'Konum'}</div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]">account_circle</span>
              </div>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-5">Satıcı Profıli</h3>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 text-2xl font-black border-2 border-primary-200 dark:border-primary-800">
                  {seller?.avatar ? <img src={seller.avatar} className="w-full h-full object-cover rounded-full" /> : (seller?.name || 'S')[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-[18px] font-black text-slate-900 dark:text-white leading-tight">{seller?.name || 'Değerli Kullanıcımız'}</div>
                  <div className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    AKTİF SATICI
                  </div>
                </div>
              </div>
              {seller?.phone && (
                <a href={`tel:${seller.phone}`} className="inline-flex items-center gap-2 text-[14px] font-black text-slate-700 dark:text-slate-300 bg-white dark:bg-[#12142d] py-2 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-primary-500 transition-colors relative z-10 w-fit">
                  <span className="material-symbols-outlined text-[18px] text-primary-500">call</span>
                  {seller.phone}
                </a>
              )}
            </div>

            {user && (user.id === ad.userId || user.role === 'admin') && (
              <div className="mt-8 flex gap-4 pt-8 border-t border-slate-100 dark:border-white/5">
                <button onClick={() => setShowEditModal(true)} className="flex-1 py-4 px-6 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  DÜZENLE
                </button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-4 px-6 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-500/20 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  {deleting ? 'SİLİNİYOR...' : 'SİL'}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center p-8">
            <button onClick={() => setIsFullscreen(false)} className="absolute top-8 right-8 w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
            <img src={ad.images[currentImageIndex]} className="max-w-full max-h-full object-contain rounded-[3rem]" />
          </motion.div>
        )}
      </AnimatePresence>

      {showMessages && <MessagesModal receiverId={ad.userId} adId={ad.id} onClose={() => setShowMessages(false)} />}
      {showEditModal && <EditAdModal ad={ad} onClose={() => setShowEditModal(false)} onAdUpdated={() => { setShowEditModal(false); window.location.reload(); }} />}
    </div>
  );
};

export default AdDetailModal;
