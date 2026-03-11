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
  const [currentConversation, setCurrentConversation] = useState<{ receiverId: string, adId: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
            <div className={`pointer-events-auto flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-900 shadow-xl px-4 py-3 border border-slate-100 dark:border-slate-800 ${t.visible ? 'animate-fade-in' : ''}`}>
              <span className="material-symbols-outlined text-primary">mail</span>
              <div className="text-sm font-medium text-slate-900 dark:text-white">Yeni bir mesajınız var</div>
            </div>
          ), { duration: 3000 });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <>
      <header className="sticky top-0 z-50 premium-header">
        <div className="premium-container py-1.5">
          <div className="flex items-center justify-between gap-6 md:gap-12">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer shrink-0 group"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-neon-indigo rounded-[14px] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-primary-500/20">
                <span className="material-symbols-outlined text-xl">layers</span>
              </div>
              <h1 className="text-lg md:text-xl font-black tracking-tighter text-slate-900 dark:text-white">
                ilandan<span className="text-neon-indigo">.online</span>
              </h1>
            </div>

            {/* Integrated Search Area (Desktop Only, centered) */}
            <div className="hidden lg:block flex-1 max-w-2xl mx-auto">
              <div className="search-bar w-full flex items-center justify-between">
                <div className="flex-1 flex items-center gap-3 px-2">
                  <span className="material-symbols-outlined text-primary-400">search</span>
                  <input 
                    className="w-full bg-transparent border-none outline-none text-[12px] font-semibold text-primary-950 dark:text-white placeholder:text-primary-400/70" 
                    placeholder="Ürün veya kategori ara..." 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="flex items-center gap-2 border-l border-primary-200 dark:border-primary-800/50 pl-4">
                  <span className="text-xs font-bold text-primary-400 uppercase tracking-widest hidden xl:block mr-2">Hızlı Ara</span>
                  <button onClick={handleSearch} className="w-8 h-8 bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-neon-indigo hover:text-white rounded-lg flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="hidden md:flex items-center gap-6">
                {!user ? (
                  <>
                    <button onClick={() => setShowAuthModal(true)} className="text-[11px] font-extrabold hover:text-primary-500 transition-colors text-slate-600 dark:text-slate-300">Giriş Yap</button>
                    <button onClick={() => setShowAuthModal(true)} className="text-[11px] font-extrabold hover:text-primary-500 transition-colors text-slate-600 dark:text-slate-300">Kayıt Ol</button>
                  </>
                ) : (
                  <div className="flex items-center gap-6">
                    <Link to="/mesajlar" className="relative text-slate-400 hover:text-primary-500 transition-colors">
                      <span className="material-symbols-outlined text-[26px]">mail</span>
                      {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white dark:border-primary-950"></span>}
                    </Link>
                    <div className="relative">
                      <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-[42px] h-[42px] rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-primary-500 transition-colors">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="text-sm font-bold">{user.name[0].toUpperCase()}</span>}
                      </button>
                      <AnimatePresence>
                        {showUserMenu && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-64 bg-white dark:bg-[#12142d] rounded-3xl shadow-premium border border-primary-100 dark:border-primary-800/50 py-3 z-[60]">
                            <div className="px-6 py-3 mb-2 border-b border-primary-50 dark:border-primary-800/30">
                              <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Hesabım</p>
                              <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user.name}</p>
                            </div>
                            <div className="px-3 space-y-1">
                              {[
                                { icon: 'person', label: 'Profil Bilgilerim', action: () => setShowProfileModal(true) },
                                { icon: 'inventory_2', label: 'İlanlarım Yönet', path: '/dashboard' },
                                { icon: 'favorite', label: 'Favorilerim', path: '/favoriler' },
                                { icon: 'chat', label: 'Mesajlarım', path: '/mesajlar' }
                              ].map((item, i) => (
                                item.path ? (
                                  <Link 
                                    key={i} 
                                    to={item.path} 
                                    onClick={() => setShowUserMenu(false)} 
                                    className="w-full text-left px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-800/50 rounded-2xl flex items-center gap-3 transition-colors font-bold text-sm"
                                  >
                                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>{item.label}
                                  </Link>
                                ) : (
                                  <button
                                    key={i}
                                    onClick={() => { (item as any).action(); setShowUserMenu(false); }}
                                    className="w-full text-left px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-800/50 rounded-2xl flex items-center gap-3 transition-colors font-bold text-sm"
                                  >
                                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>{item.label}
                                  </button>
                                )
                              ))}
                              {user.role === 'admin' && (
                                <button onClick={() => { onShowAdminPanel?.(); setShowUserMenu(false); }} className="w-full text-left px-4 py-2.5 mt-2 bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center gap-3 transition-colors font-black text-sm border border-primary-100 dark:border-primary-800/50">
                                  <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>Admin Paneli
                                </button>
                              )}
                              <button onClick={() => { logout(); setShowUserMenu(false); }} className="w-full text-left px-4 py-2.5 mt-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl flex items-center gap-3 transition-colors font-bold text-sm">
                                <span className="material-symbols-outlined text-[20px]">logout</span>Çıkış Yap
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                <button onClick={toggleDarkMode} className="w-10 h-10 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <span className="material-symbols-outlined text-[22px]">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
                </button>
              </div>

              <Link 
                to="/ilan-ver"
                className="bg-neon-indigo text-white px-4 sm:px-5 py-1.5 rounded-full font-black text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-gold-heavy hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="hidden sm:inline">İlan Ver</span>
              </Link>
              
              <button 
                onClick={() => navigate('/ilanlar')}
                className="md:hidden w-10 h-10 flex items-center justify-center glass-premium rounded-full text-slate-600 dark:text-slate-300"
              >
                <span className="material-symbols-outlined">search</span>
              </button>
            </div>
          </div>

          {/* Mobile Search Area (Visible only on mobile) */}
          <div className="lg:hidden mt-4">
            <div className="search-bar w-full flex items-center">
              <span className="material-symbols-outlined text-primary-400 mr-2">search</span>
              <input 
                className="w-full bg-transparent border-none outline-none text-sm font-semibold text-primary-950 dark:text-white placeholder:text-primary-400/70" 
                placeholder="Kelime, ilan no veya kategori..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Modals - Moved outside header tag for correct positioning */}
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