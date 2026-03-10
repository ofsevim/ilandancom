import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { Plus, Moon, Sun, User, Heart, Package, MessageSquare, Home } from 'lucide-react';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';
import MyAdsModal from './MyAdsModal';
import FavoritesModal from './FavoritesModal';
import MessagesModal from './MessagesModal';
import ConversationsModal from './ConversationsModal';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface HeaderProps {
  onShowNewAd?: () => void;
  onShowAdminPanel?: () => void;
}

import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC<HeaderProps> = ({ onShowNewAd, onShowAdminPanel }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMyAdsModal, setShowMyAdsModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showConversationsModal, setShowConversationsModal] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<{ receiverId: string, adId: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleShowNewAd = () => {
    if (onShowNewAd) {
      onShowNewAd();
    }
  };

  React.useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const api = await import('../services/api');
        const count = await api.messageService.getUnreadCount();
        setUnreadCount(count);
      } catch { }
    })();
    const channel = supabase
      .channel('messages-header-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
        const m = payload.new;
        if (m.receiver_id === user.id) {
          setUnreadCount((c) => c + 1);
          toast.custom((t) => (
            <div className={`pointer-events-auto flex items-center gap-3 rounded-2xl bg-white dark:bg-primary-900 shadow-premium px-4 py-3 border border-primary-200 dark:border-primary-800 ${t.visible ? 'animate-fade-in' : ''}`}>
              <MessageSquare size={18} className="text-accent-premium" />
              <div className="text-sm font-medium text-primary-900 dark:text-white">Yeni bir mesajınız var</div>
            </div>
          ), { duration: 3000 });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <>
      <header className="premium-header w-full border-b border-white/10 shadow-premium transition-all">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 h-16 md:h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => { window.location.href = '/'; }}
              aria-label="Anasayfa"
              className="flex items-center group"
            >
              <div className="w-10 h-10 bg-accent-premium rounded-xl flex items-center justify-center mr-3 shadow-md group-hover:bg-accent-light transition-colors duration-300">
                <Home size={20} className="text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl sm:text-2xl font-black tracking-tighter text-primary-950 dark:text-white outfit-font">
                  ilandan<span className="text-accent-premium">.online</span>
                </span>
              </div>
            </button>
          </div>

          {/* Center Space - Search moved to Hero */}
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            {/* Boş bırakıldı, logo ile menü arası alan açık kalsın (Whitespace) */}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleShowNewAd}
              className="hidden sm:flex items-center gap-2 bg-primary-900 dark:bg-white hover:bg-black dark:hover:bg-primary-50 text-white dark:text-primary-950 px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all duration-300 active:scale-95"
            >
              <Plus size={18} />
              <span>İlan Ver</span>
            </button>

            <div className="flex items-center bg-primary-100 dark:bg-primary-800/50 p-1 rounded-xl border border-primary-200 dark:border-primary-700">
              {user && (
                <button
                  onClick={() => { setShowConversationsModal(true); setUnreadCount(0); try { (async () => { (await import('../services/api')).messageService.markAllRead(); })(); } catch { } }}
                  className="relative p-2 text-primary-600 dark:text-primary-300 hover:bg-white dark:hover:bg-primary-800 rounded-lg transition-all"
                >
                  <MessageSquare size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 shadow-md animate-pulse"></span>
                  )}
                </button>
              )}

              <button
                onClick={toggleDarkMode}
                className="p-2 text-primary-600 dark:text-primary-300 hover:bg-white dark:hover:bg-primary-800 rounded-lg transition-all"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center p-1 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-xl transition-all border border-transparent hover:border-primary-200 dark:hover:border-primary-700"
                >
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-800 rounded-xl flex items-center justify-center border border-primary-200 dark:border-primary-700 overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary-900 dark:text-white font-bold">{user.name[0].toUpperCase()}</span>
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 bg-white dark:bg-primary-900 rounded-2xl shadow-premium-hover border border-primary-200 dark:border-primary-800 py-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-primary-100 dark:border-primary-800 mb-1">
                        <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider">Hoş Geldiniz</p>
                        <p className="text-sm font-bold text-primary-900 dark:text-white truncate">{user.name}</p>
                      </div>

                      {[
                        { icon: User, label: 'Profilim', color: 'text-indigo-500', bg: 'bg-indigo-50', onClick: () => setShowProfileModal(true) },
                        { icon: Package, label: 'İlanlarım', color: 'text-primary-600', bg: 'bg-primary-50', onClick: () => setShowMyAdsModal(true) },
                        { icon: Heart, label: 'Favorilerim', color: 'text-red-500', bg: 'bg-red-50', onClick: () => setShowFavoritesModal(true) },
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={() => { item.onClick(); setShowUserMenu(false); }}
                          className="w-full text-left px-4 py-2.5 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-800 flex items-center gap-3 transition-colors group"
                        >
                          <div className={`p-2 rounded-lg ${item.bg} dark:bg-primary-800 group-hover:scale-110 transition-transform`}>
                            <item.icon size={16} className={item.color} />
                          </div>
                          <span className="font-semibold text-sm">{item.label}</span>
                        </button>
                      ))}

                      {user.role === 'admin' && (
                        <button
                          onClick={() => { onShowAdminPanel?.(); setShowUserMenu(false); }}
                          className="w-full text-left px-4 py-2.5 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-800 flex items-center gap-3 border-t border-primary-100 dark:border-primary-800"
                        >
                          <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800">
                            <span>⚙️</span>
                          </div>
                          <span className="font-semibold text-sm">Admin Panel</span>
                        </button>
                      )}

                      <button
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 border-t border-primary-100 dark:border-primary-800 font-bold text-sm"
                      >
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                          <span>🚪</span>
                        </div>
                        <span>Çıkış Yap</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 bg-primary-100 dark:bg-primary-800 hover:bg-primary-200 dark:hover:bg-primary-700 text-primary-900 dark:text-white px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95"
              >
                <User size={18} />
                <span>Giriş Yap</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Modals - Moved outside header tag for correct positioning */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
      {showMyAdsModal && (
        <MyAdsModal
          onClose={() => setShowMyAdsModal(false)}
          onShowNewAd={handleShowNewAd}
        />
      )}
      {showFavoritesModal && <FavoritesModal onClose={() => setShowFavoritesModal(false)} />}
      {showConversationsModal && (
        <ConversationsModal
          onClose={() => setShowConversationsModal(false)}
          onOpenConversation={(receiverId, adId) => {
            setCurrentConversation({ receiverId, adId });
            setShowConversationsModal(false);
          }}
        />
      )}
      {currentConversation && (
        <MessagesModal
          receiverId={currentConversation.receiverId}
          adId={currentConversation.adId}
          onClose={() => setCurrentConversation(null)}
        />
      )}
    </>
  );
};

export default Header;