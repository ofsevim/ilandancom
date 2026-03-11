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
    <div className={asPage ? "w-full max-w-7xl mx-auto py-8 px-6" : "fixed inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 lg:p-8"}>
      <motion.div 
        initial={!asPage ? { opacity: 0, scale: 0.9, y: 30 } : {}}
        animate={!asPage ? { opacity: 1, scale: 1, y: 0 } : {}}
        className={`bg-white dark:bg-slate-900 w-full overflow-hidden flex flex-col md:flex-row relative shadow-3xl shadow-black/20
          ${asPage ? 'rounded-[3rem] border border-slate-100 dark:border-slate-800' : 'max-w-6xl max-h-[90vh] rounded-[3rem]'}`}
      >
        {!asPage && (
          <button onClick={onClose} className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:scale-110 transition-all">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        )}

        {/* Gallery Section */}
        <div className="md:w-3/5 relative bg-slate-50 dark:bg-slate-950 flex flex-col min-h-[400px]">
          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={buildImageUrl(ad.images[currentImageIndex], { width: 1200, height: 900 })}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setIsFullscreen(true)}
              />
            </AnimatePresence>

            {ad.images.length > 1 && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 flex justify-between pointer-events-none">
                <button onClick={prevImage} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg pointer-events-auto hover:bg-white hover:text-slate-900 transition-all">
                  <span className="material-symbols-outlined text-2xl">chevron_left</span>
                </button>
                <button onClick={nextImage} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg pointer-events-auto hover:bg-white hover:text-slate-900 transition-all">
                  <span className="material-symbols-outlined text-2xl">chevron_right</span>
                </button>
              </div>
            )}

            <div className="absolute bottom-6 left-6 flex gap-2">
              <div className="px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-md text-white border border-white/10 text-[10px] font-black tracking-widest uppercase">
                {currentImageIndex + 1} / {ad.images.length}
              </div>
            </div>
          </div>

          <div className="p-6 flex gap-3 overflow-x-auto scrollbar-hide border-t border-slate-100 dark:border-slate-800">
            {ad.images.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentImageIndex(i)}
                className={`w-20 h-16 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all
                  ${i === currentImageIndex ? 'border-primary shadow-xl scale-105' : 'border-transparent opacity-40 hover:opacity-100'}`}
              >
                <img src={buildImageUrl(img, { width: 100, height: 80 })} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="md:w-2/5 flex flex-col bg-white dark:bg-slate-900 overflow-y-auto max-h-[90vh]">
          <div className="p-10 flex-1">
            <div className="mb-8 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">{ad.category?.name || 'GENEL'}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  {new Date(ad.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter mb-4">{ad.title}</h1>
              <div className="text-4xl font-black text-primary tracking-tight">{formatPrice(ad.price)}</div>
            </div>

            <div className="flex gap-3 mb-10">
              <button 
                onClick={() => setShowMessages(true)}
                className="flex-1 h-14 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">mail</span>
                MESAJ GÖNDER
              </button>
              <button 
                onClick={handleFavoriteClick}
                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all
                  ${isFavorite ? 'bg-red-500 border-red-500 text-white shadow-xl shadow-red-500/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}
              >
                <span className={`material-symbols-outlined text-2xl ${isFavorite ? 'fill-1' : ''}`}>favorite</span>
              </button>
            </div>

            <div className="space-y-8 mb-10">
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">İlan Detayları</h3>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-loose whitespace-pre-wrap">{ad.description}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">GÖRÜNTÜLENME</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">{ad.viewCount}</div>
                </div>
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">KONUM</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white truncate">{ad.location.city}, {ad.location.district}</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Satıcı Bilgileri</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-black">
                  {seller?.avatar ? <img src={seller.avatar} className="w-full h-full object-cover rounded-2xl" /> : (seller?.name || 'S')[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">{seller?.name || 'Değerli Kullanıcımız'}</div>
                  <div className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    ONLINE SATICI
                  </div>
                </div>
              </div>
              {seller?.phone && (
                <a href={`tel:${seller.phone}`} className="flex items-center gap-3 text-xs font-black text-slate-900 dark:text-white">
                  <span className="material-symbols-outlined text-primary">call</span>
                  {seller.phone}
                </a>
              )}
            </div>

            {user && (user.id === ad.userId || user.role === 'admin') && (
              <div className="mt-8 flex gap-3">
                <button onClick={() => setShowEditModal(true)} className="flex-1 py-4 px-6 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">edit</span>
                  DÜZENLE
                </button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-4 px-6 border-2 border-red-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">delete</span>
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
