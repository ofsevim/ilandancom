import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { Search, Plus, Moon, Sun, User, Heart, Package, MessageSquare, Home } from 'lucide-react';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';
import MyAdsModal from './MyAdsModal';
import FavoritesModal from './FavoritesModal';
import MessagesModal from './MessagesModal';
import ConversationsModal from './ConversationsModal';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onShowNewAd?: () => void;
  onShowAdminPanel?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onShowNewAd, onShowAdminPanel }) => {
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
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleShowNewAd = () => {
    if (onShowNewAd) {
      onShowNewAd();
    }
  };

  React.useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const count = await (await import('../services/api')).messageService.getUnreadCount();
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
            <div className={`pointer-events-auto flex items-center gap-3 rounded-lg bg-white dark:bg-gray-800 shadow px-4 py-3 border border-gray-200 dark:border-gray-700 ${t.visible ? 'animate-fade-in' : ''}`}>
              <MessageSquare size={18} className="text-blue-600" />
              <div className="text-sm text-gray-900 dark:text-white">Yeni bir mesajınız var</div>
            </div>
          ), { duration: 3000 });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl fixed top-0 left-0 right-0 z-40 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Compact for Mobile */}
          <div className="flex items-center">
            <button
              onClick={() => { window.location.href = '/'; }}
              aria-label="Anasayfa"
              className="flex items-center text-base sm:text-xl font-bold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded-lg px-2 sm:px-3 py-2 transition-all hover:bg-white/10"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-1.5 sm:mr-2 shadow-lg">
                <Home size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  ilandan
                </span>
                <span className="text-[10px] sm:text-xs text-blue-300 -mt-1 tracking-[0.2em]">
                  online
                </span>
              </div>
            </button>
          </div>

          {/* Search Bar - Modern Design */}
          <div className="hidden md:block flex-1 max-w-2xl mx-2 md:mx-8">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                placeholder="Ne arıyorsunuz?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 transition-all hover:bg-white/15"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 group-hover:text-blue-400 transition-colors">
                <Search size={20} />
              </div>
            </form>
          </div>

          {/* Actions - Compact for Mobile */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* New Ad Button - Compact */}
            <button
              onClick={handleShowNewAd}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-2.5 sm:px-4 py-2 rounded-lg font-semibold shadow-lg transition-all flex items-center gap-1.5"
            >
              <Plus size={16} className="flex-shrink-0" style={{ width: '16px', height: '16px' }} />
              <span className="hidden sm:inline text-sm">İlan Ver</span>
            </button>

            {/* Messages Button - Compact */}
            {user && (
              <button
                onClick={() => { setShowConversationsModal(true); setUnreadCount(0); try { (async () => { (await import('../services/api')).messageService.markAllRead(); })(); } catch { } }}
                className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-all"
                title="Mesajlar"
              >
                <MessageSquare size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-[9px] font-bold leading-[18px] text-center shadow-lg animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Dark Mode Toggle - Compact */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-all hidden sm:block"
              title={isDarkMode ? 'Açık Tema' : 'Koyu Tema'}
            >
              {isDarkMode ? <Sun size={18} className="flex-shrink-0" style={{ width: '18px', height: '18px' }} /> : <Moon size={18} className="flex-shrink-0" style={{ width: '18px', height: '18px' }} />}
            </button>

            {/* User Menu - Modern Design */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-white hover:bg-white/10 px-3 py-2 rounded-xl transition-all"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {user.name[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:block font-semibold">
                    {user.name}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 overflow-hidden">
                    <button
                      onClick={() => {
                        setShowProfileModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 flex items-center gap-3 transition-all group"
                    >
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <User size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" style={{ width: '16px', height: '16px' }} />
                      </div>
                      <span className="font-medium">Profilim</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMyAdsModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:to-gray-600 flex items-center gap-3 transition-all group"
                    >
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Package size={16} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="font-medium">İlanlarım</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowFavoritesModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:to-gray-600 flex items-center gap-3 transition-all group"
                    >
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Heart size={16} className="text-red-600 dark:text-red-400" />
                      </div>
                      <span className="font-medium">Favorilerim</span>
                    </button>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          if (onShowAdminPanel) onShowAdminPanel();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 dark:hover:from-gray-700 dark:hover:to-gray-600 flex items-center gap-3 border-t border-gray-200 dark:border-gray-700 transition-all"
                      >
                        <span className="text-lg">⚙️</span>
                        <span className="font-medium">Admin Panel</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 border-t border-gray-200 dark:border-gray-700 transition-all font-medium"
                    >
                      <span className="text-lg">🚪</span>
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-2.5 sm:px-4 py-2 rounded-lg font-semibold transition-all backdrop-blur-sm text-sm"
              >
                <User size={16} className="flex-shrink-0" style={{ width: '16px', height: '16px' }} />
                <span>Giriş</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}

      {showMyAdsModal && (
        <MyAdsModal
          onClose={() => setShowMyAdsModal(false)}
          onShowNewAd={handleShowNewAd}
        />
      )}

      {showFavoritesModal && (
        <FavoritesModal onClose={() => setShowFavoritesModal(false)} />
      )}

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
    </header>
  );
};

export default Header;