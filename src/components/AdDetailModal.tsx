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
    <div className={asPage ? "w-full max-w-full mx-auto py-0 px-0" : "fixed inset-0 bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-2 lg:p-4"}>
      <motion.div
        initial={!asPage ? { opacity: 0, scale: 0.95, y: 20 } : {}}
        animate={!asPage ? { opacity: 1, scale: 1, y: 0 } : {}}
        className={`bg-navy-800 w-full overflow-hidden flex flex-col md:flex-row relative
          ${asPage ? 'rounded-2xl border border-silver-700/20 shadow-xl max-w-[1400px] mx-auto' : 'max-w-[1380px] max-h-[92vh] rounded-2xl shadow-xl border border-silver-700/20'}`}
      >
        {!asPage && (
          <button onClick={onClose} className="absolute top-4 right-4 z-50 w-10 h-10 bg-navy-950/80 backdrop-blur-md rounded-full flex items-center justify-center text-silver-100 border border-silver-700/20 hover:bg-navy-950 transition-all shadow-lg">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}

        <div className="md:w-[50%] relative bg-navy-900 flex flex-col min-h-[400px]">
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
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 flex justify-between pointer-events-none">
                <button onClick={prevImage} className="w-10 h-10 rounded-full bg-navy-950/80 backdrop-blur-md flex items-center justify-center shadow-lg pointer-events-auto hover:bg-navy-950 transition-all text-silver-100 border border-silver-700/20">
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>
                <button onClick={nextImage} className="w-10 h-10 rounded-full bg-navy-950/80 backdrop-blur-md flex items-center justify-center shadow-lg pointer-events-auto hover:bg-navy-950 transition-all text-silver-100 border border-silver-700/20">
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>
              </div>
            )}

            <div className="absolute bottom-3 left-4">
              <span className="px-3 py-1.5 rounded-lg bg-navy-950/80 backdrop-blur-md text-silver-100 text-[10px] font-medium border border-silver-700/20">
                {currentImageIndex + 1} / {ad.images.length}
              </span>
            </div>
          </div>

          <div className="p-3 flex gap-2 overflow-x-auto">
            {ad.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={`w-[72px] h-[54px] rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all duration-300
                  ${i === currentImageIndex ? 'border-accent' : 'border-transparent opacity-50 hover:opacity-100'}`}
              >
                <img src={buildImageUrl(img, { width: 100, height: 80 })} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="md:w-[50%] flex flex-col bg-navy-800 overflow-y-auto max-h-[90vh]">
          <div className="p-5 lg:p-6 flex-1">
            <div className="mb-4 pb-4 border-b border-silver-700/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-lg text-[10px] font-semibold">{ad.category?.name || 'GENEL'}</span>
                <span className="text-[10px] text-silver-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {ad.createdAt && !isNaN(new Date(ad.createdAt).getTime()) ? new Date(ad.createdAt).toLocaleDateString('tr-TR') : 'YENİ'}
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-silver-100 leading-tight tracking-tight mb-3">{ad.title}</h1>
              <div className="text-2xl lg:text-3xl font-bold text-accent">{formatPrice(ad.price)}</div>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setShowMessages(true)}
                className="btn-primary flex-1 py-3 text-sm"
              >
                <span className="material-symbols-outlined text-lg">mail</span>
                Satıcıyla İletişim
              </button>
              <button
                onClick={handleFavoriteClick}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all
                  ${isFavorite ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-navy-900 border-silver-700/10 text-silver-500 hover:text-silver-100'}`}
              >
                <span className={`material-symbols-outlined text-xl ${isFavorite ? 'fill-1' : ''}`}>favorite</span>
              </button>
            </div>

            <div className="space-y-5 mb-6">
              <div>
                <h3 className="text-[10px] font-semibold text-silver-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-accent">description</span>İlan Detayları
                </h3>
                <div className="text-sm text-silver-400 leading-relaxed whitespace-pre-wrap">{ad.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-silver-700/10">
                <div className="p-3 rounded-xl bg-navy-900 border border-silver-700/10">
                  <div className="text-[10px] font-semibold text-silver-500 mb-1 flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span>Görüntülenme</div>
                  <div className="text-base font-bold text-silver-100">{ad.viewCount}</div>
                </div>
                <div className="p-3 rounded-xl bg-navy-900 border border-silver-700/10">
                  <div className="text-[10px] font-semibold text-silver-500 mb-1 flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>Konum</div>
                  <div className="text-sm font-semibold text-silver-100 truncate">{ad.location?.city || 'Bilinmeyen'}, {ad.location?.district || 'Konum'}</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-navy-900 border border-silver-700/10">
              <h3 className="text-[10px] font-semibold text-silver-500 uppercase tracking-wider mb-4">Satıcı Profili</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold">
                  {seller?.avatar ? <img src={seller.avatar} className="w-full h-full object-cover rounded-full" /> : (seller?.name || 'S')[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-base font-bold text-silver-100">{seller?.name || 'Değerli Kullanıcımız'}</div>
                  <div className="text-[10px] text-silver-500 flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-sm text-accent">verified</span>
                    {seller?.role === 'admin' ? 'Yönetici' : 'Kayıtlı Satıcı'}
                  </div>
                </div>
              </div>
              {seller?.phone && (
                <a href={`tel:${seller.phone}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-silver-100 bg-navy-800 py-2 px-3 rounded-lg border border-silver-700/10 hover:border-accent/30 transition-colors w-fit">
                  <span className="material-symbols-outlined text-base text-accent">call</span>
                  {seller.phone}
                </a>
              )}
            </div>

            {user && (user.id === ad.userId || user.role === 'admin') && (
              <div className="mt-6 flex gap-3 pt-6 border-t border-silver-700/10">
                <button onClick={() => setShowEditModal(true)} className="btn-secondary flex-1 py-3 text-xs">
                  <span className="material-symbols-outlined text-base">edit</span>
                  Düzenle
                </button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 px-4 bg-red-500/10 text-red-400 rounded-xl text-xs font-semibold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 border border-red-500/20">
                  <span className="material-symbols-outlined text-base">delete</span>
                  {deleting ? 'Siliniyor...' : 'Sil'}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-navy-950 flex items-center justify-center p-4 md:p-12"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
              className="absolute top-4 right-4 md:top-8 md:right-8 w-12 h-12 bg-navy-800/80 backdrop-blur-md rounded-full flex items-center justify-center text-silver-100 border border-silver-700/20 hover:bg-navy-800 transition-all shadow-lg z-10"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            {ad.images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 bg-navy-800/80 backdrop-blur-md rounded-full flex items-center justify-center text-silver-100 border border-silver-700/20 hover:bg-navy-800 transition-all z-10"
                >
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 bg-navy-800/80 backdrop-blur-md rounded-full flex items-center justify-center text-silver-100 border border-silver-700/20 hover:bg-navy-800 transition-all z-10"
                >
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>
              </>
            )}
            <img
              src={ad.images[currentImageIndex]}
              className="max-w-full max-h-full object-contain rounded-xl select-none pointer-events-none"
              alt={ad.title}
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-navy-800/80 backdrop-blur-md rounded-lg text-silver-100 text-xs font-medium border border-silver-700/20">
              {currentImageIndex + 1} / {ad.images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showMessages && <MessagesModal receiverId={ad.userId} adId={ad.id} onClose={() => setShowMessages(false)} />}
      {showEditModal && <EditAdModal ad={ad} onClose={() => setShowEditModal(false)} onAdUpdated={() => { setShowEditModal(false); onDeleted?.(); onClose(); }} />}
    </div>
  );
};

export default AdDetailModal;
