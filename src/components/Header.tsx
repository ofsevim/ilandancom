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
}

const Header: React.FC<HeaderProps> = ({ onSearch, onShowNewAd }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMyAdsModal, setShowMyAdsModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showConversationsModal, setShowConversationsModal] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<{receiverId: string, adId: string} | null>(null);
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
      } catch {}
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
    <header className="bg-slate-800 shadow-sm fixed top-0 left-0 right-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => { window.location.href = '/'; }}
              aria-label="Anasayfa"
              className="flex items-center text-xl font-bold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded"
            >
              <Home size={24} className="mr-2" />
              ilandan.online
            </button>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-white hover:text-gray-300 font-medium">Ana Sayfa</a>
            <a href="/emlak" className="text-white hover:text-gray-300 font-medium">Emlak</a>
            <a href="/vasita" className="text-white hover:text-gray-300 font-medium">Vasıta</a>
            <a href="/ikinci-el" className="text-white hover:text-gray-300 font-medium">İkinci El</a>
            <a href="/is-ilanlari" className="text-white hover:text-gray-300 font-medium">İş İlanları</a>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* New Ad Button */}
            <button
              onClick={handleShowNewAd}
              className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 border border-white/20 items-center font-medium"
            >
              İlan Ver
            </button>

            {/* Messages Button */}
            {user && (
              <button
                onClick={() => { setShowConversationsModal(true); setUnreadCount(0); try { (async () => { (await import('../services/api')).messageService.markAllRead(); })(); } catch {} }}
                className="relative p-2 text-white hover:text-gray-300"
                title="Mesajlar"
              >
                <MessageSquare size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] leading-[18px] text-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-white hover:text-gray-300"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-white hover:text-gray-300"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User size={16} className="text-white" />
                    )}
                  </div>
                  <span className="hidden md:block font-medium">
                    {user.name}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    <button
                      onClick={() => {
                        setShowProfileModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <User size={16} className="mr-2" />
                      Profilim
                    </button>
                    <button
                      onClick={() => {
                        setShowMyAdsModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Package size={16} className="mr-2" />
                      İlanlarım
                    </button>
                    <button
                      onClick={() => {
                        setShowFavoritesModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Heart size={16} className="mr-2" />
                      Favorilerim
                    </button>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          window.location.href = '/admin';
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 border-t border-gray-200"
                      >
                        Admin Panel
                      </button>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 text-white hover:text-gray-300 font-medium"
              >
                <User size={18} className="md:hidden" />
                <span className="hidden md:inline">Giriş Yap</span>
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