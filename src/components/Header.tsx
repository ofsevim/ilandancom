import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';
import MyAdsModal from './MyAdsModal';
import FavoritesModal from './FavoritesModal';
import MessagesModal from './MessagesModal';
import ConversationsModal from './ConversationsModal';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onShowAdminPanel?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowAdminPanel }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMyAdsModal, setShowMyAdsModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showConversationsModal, setShowConversationsModal] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<{ receiverId: string, adId: string | null } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/ilanlar?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
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
            <div className={`pointer-events-auto flex items-center gap-3 rounded-xl bg-navy-800 shadow-xl px-4 py-3 border border-silver-700/20 ${t.visible ? 'animate-fade-in' : ''}`}>
              <span className="material-symbols-outlined text-accent text-lg">mail</span>
              <div className="text-sm font-medium text-silver-100">Yeni bir mesajınız var</div>
            </div>
          ), { duration: 3000 });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg' : 'bg-transparent'}`}>
        <div className="container-premium">
          <div className="flex items-center justify-between h-16 md:h-18 gap-4">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer shrink-0"
              onClick={() => navigate('/')}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-glow">
                <span className="material-symbols-outlined text-white text-xl">storefront</span>
              </div>
              <h1 className="text-lg font-bold tracking-tight text-navy-950 dark:text-silver-50">
                ilandan<span className="text-accent">.online</span>
              </h1>
            </div>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-silver-500 text-lg group-focus-within:text-accent transition-colors">search</span>
                <input
                  className="w-full pl-10 pr-4 py-2.5 bg-navy-800/50 dark:bg-navy-900/50 border border-silver-700/20 rounded-xl text-sm text-navy-950 dark:text-silver-100 placeholder:text-silver-500 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  placeholder="İlan, ürün veya kategori ara..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-silver-500 hover:text-navy-950 dark:hover:text-silver-100 hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
              </button>

              {!user ? (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="hidden sm:inline-flex text-sm font-semibold text-silver-600 dark:text-silver-400 hover:text-accent transition-colors"
                >
                  Giriş Yap
                </button>
              ) : (
                <>
                  {/* Messages */}
                  <button
                    onClick={() => navigate('/mesajlar')}
                    className="relative w-9 h-9 rounded-lg flex items-center justify-center text-silver-500 hover:text-navy-950 dark:hover:text-silver-100 hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">chat_bubble</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-navy-950">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Favorites */}
                  <button
                    onClick={() => navigate('/favoriler')}
                    className="hidden sm:flex w-9 h-9 rounded-lg items-center justify-center text-silver-500 hover:text-navy-950 dark:hover:text-silver-100 hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">favorite</span>
                  </button>

                  {/* User menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="w-9 h-9 rounded-lg bg-navy-100 dark:bg-navy-800 flex items-center justify-center overflow-hidden border border-silver-700/20 hover:border-accent/40 transition-colors"
                    >
                      {user.avatar ? (
                        <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="text-xs font-bold text-silver-600 dark:text-silver-300">{user.name[0].toUpperCase()}</span>
                      )}
                    </button>
                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-64 bg-white dark:bg-navy-800 rounded-xl shadow-xl border border-silver-200 dark:border-silver-700/20 py-2 z-[60]"
                        >
                          <div className="px-4 py-3 mb-1 border-b border-silver-200 dark:border-silver-700/20">
                            <p className="text-sm font-bold text-navy-950 dark:text-silver-50 truncate">{user.name}</p>
                            <p className="text-xs text-silver-500 mt-0.5">{user.email}</p>
                          </div>
                          <div className="px-2 space-y-0.5">
                            {[
                              { icon: 'person', label: 'Profil', action: () => setShowProfileModal(true) },
                              { icon: 'inventory_2', label: 'İlanlarım', action: () => setShowMyAdsModal(true) },
                              { icon: 'favorite', label: 'Favorilerim', path: '/favoriler' },
                              { icon: 'chat', label: 'Mesajlarım', path: '/mesajlar' }
                            ].map((item, i) => (
                              item.path ? (
                                <Link
                                  key={i}
                                  to={item.path}
                                  onClick={() => setShowUserMenu(false)}
                                  className="w-full text-left px-3 py-2.5 text-sm text-silver-600 dark:text-silver-300 hover:bg-navy-50 dark:hover:bg-navy-700/50 rounded-lg flex items-center gap-3 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                  {item.label}
                                </Link>
                              ) : (
                                <button
                                  key={i}
                                  onClick={() => { (item as any).action(); setShowUserMenu(false); }}
                                  className="w-full text-left px-3 py-2.5 text-sm text-silver-600 dark:text-silver-300 hover:bg-navy-50 dark:hover:bg-navy-700/50 rounded-lg flex items-center gap-3 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                  {item.label}
                                </button>
                              )
                            ))}
                            {user.role === 'admin' && (
                              <button
                                onClick={() => { onShowAdminPanel?.(); setShowUserMenu(false); }}
                                className="w-full text-left px-3 py-2.5 mt-1 text-sm text-accent hover:bg-accent/5 rounded-lg flex items-center gap-3 transition-colors font-semibold"
                              >
                                <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                                Admin Paneli
                              </button>
                            )}
                            <div className="border-t border-silver-200 dark:border-silver-700/20 my-1" />
                            <button
                              onClick={() => { logout(); setShowUserMenu(false); }}
                              className="w-full text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg flex items-center gap-3 transition-colors"
                            >
                              <span className="material-symbols-outlined text-lg">logout</span>
                              Çıkış Yap
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}

              {/* Post Ad Button */}
              <Link
                to="/ilan-ver"
                className="btn-primary text-sm py-2 px-4"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span className="hidden sm:inline">İlan Ver</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
      {showMyAdsModal && (
        <MyAdsModal
          onClose={() => setShowMyAdsModal(false)}
          onShowNewAd={() => { setShowMyAdsModal(false); navigate('/ilan-ver'); }}
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
