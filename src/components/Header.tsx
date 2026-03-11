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
  onShowNewAd?: () => void;
  onShowAdminPanel?: () => void;
}


const Header: React.FC<HeaderProps> = ({ onShowNewAd, onShowAdminPanel }) => {
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
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-8 mb-4">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer shrink-0 group"
              onClick={() => navigate('/')}
            >
              <div className="bg-primary p-2 rounded-xl text-white group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">layers</span>
              </div>
              <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                ilandan<span className="text-primary">.online</span>
              </h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-6">
                {!user ? (
                  <>
                    <button onClick={() => setShowAuthModal(true)} className="text-sm font-semibold hover:text-primary transition-colors text-slate-600 dark:text-slate-300">Giriş Yap</button>
                    <button onClick={() => setShowAuthModal(true)} className="text-sm font-semibold hover:text-primary transition-colors text-slate-600 dark:text-slate-300">Kayıt Ol</button>
                  </>
                ) : (
                  <div className="flex items-center gap-4">
                    <Link to="/mesajlar" className="relative p-2 text-slate-500 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-2xl">mail</span>
                      {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-slate-900"></span>}
                    </Link>
                    <div className="relative">
                      <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="text-sm font-bold">{user.name[0].toUpperCase()}</span>}
                      </button>
                      <AnimatePresence>
                        {showUserMenu && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 py-3 z-[60]">
                            <div className="px-5 py-2 mb-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hesabım</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                            </div>
                            <div className="px-2 space-y-1">
                              {[
                                { icon: 'analytics', label: 'Panelim', path: '/dashboard' },
                                { icon: 'inventory_2', label: 'İlanlarım', path: '/dashboard' },
                                { icon: 'favorite', label: 'Favorilerim', path: '/favoriler' },
                                { icon: 'chat', label: 'Mesajlarım', path: '/mesajlar' }
                              ].map((item, i) => (
                                <Link 
                                  key={i} 
                                  to={item.path} 
                                  onClick={() => setShowUserMenu(false)} 
                                  className="w-full text-left px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-3 transition-colors font-medium text-sm"
                                >
                                  <span className="material-symbols-outlined text-xl">{item.icon}</span>{item.label}
                                </Link>
                              ))}
                              {user.role === 'admin' && (
                                <button onClick={() => { onShowAdminPanel?.(); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-primary hover:bg-primary/5 rounded-xl flex items-center gap-3 transition-colors font-bold text-sm">
                                  <span className="material-symbols-outlined text-xl">admin_panel_settings</span>Admin Paneli
                                </button>
                              )}
                              <button onClick={() => { logout(); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-xl flex items-center gap-3 transition-colors font-bold text-sm">
                                <span className="material-symbols-outlined text-xl">logout</span>Çıkış Yap
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
                <button onClick={toggleDarkMode} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined text-xl">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
                </button>
              </div>

              <button 
                onClick={onShowNewAd}
                className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                <span className="hidden sm:inline">İlan Ver</span>
              </button>
              <button className="md:hidden">
                <span className="material-symbols-outlined text-3xl">menu</span>
              </button>
            </div>
          </div>

          {/* Integrated Search Area */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full flex flex-col md:flex-row items-center gap-1 border border-slate-200 dark:border-slate-700 shadow-sm focus-within:shadow-md focus-within:border-primary/30 transition-all">
              <div className="flex-1 flex items-center px-6 w-full">
                <span className="material-symbols-outlined text-slate-400 mr-3">search</span>
                <input 
                  className="w-full border-none focus:ring-0 bg-transparent text-sm font-semibold py-2 outline-none text-slate-900 dark:text-white placeholder:text-slate-400" 
                  placeholder="Kelime, ilan no veya kategori ara..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden md:block mx-2"></div>
              <div className="flex items-center gap-2 px-2 py-1 overflow-x-auto no-scrollbar max-w-full hidden md:flex">
                <button onClick={() => navigate('/ilanlar')} className="px-4 py-1.5 rounded-full hover:bg-white dark:hover:bg-slate-700 text-xs font-bold transition-all whitespace-nowrap text-slate-500 dark:text-slate-400 hover:text-primary">Emlak</button>
                <button onClick={() => navigate('/ilanlar')} className="px-4 py-1.5 rounded-full hover:bg-white dark:hover:bg-slate-700 text-xs font-bold transition-all whitespace-nowrap text-slate-500 dark:text-slate-400 hover:text-primary">Vasıta</button>
                <button onClick={() => navigate('/ilanlar')} className="px-4 py-1.5 rounded-full hover:bg-white dark:hover:bg-slate-700 text-xs font-bold transition-all whitespace-nowrap text-slate-500 dark:text-slate-400 hover:text-primary">İkinci El</button>
              </div>
              <button 
                onClick={handleSearch}
                className="bg-primary text-white px-8 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-colors w-full md:w-auto shadow-lg shadow-primary/20"
              >
                Ara
              </button>
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
          onShowNewAd={onShowNewAd || (() => {})}
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