import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { Search, Plus, Moon, Sun, User, Heart, Package, MessageSquare } from 'lucide-react';
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
              className="flex items-center text-xl font-bold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
            >
              <div className="w-6 h-6 border-2 border-white rounded mr-2"></div>
              ilanYeri
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-white hover:text-gray-300 font-medium">Ana Sayfa</a>
            <a href="/category/emlak" className="text-white hover:text-gray-300 font-medium">Emlak</a>
            <a href="/category/vasita" className="text-white hover:text-gray-300 font-medium">Vasıta</a>
            <a href="/category/ikinci-el" className="text-white hover:text-gray-300 font-medium">İkinci El</a>
            <a href="/category/is-ilanlari" className="text-white hover:text-gray-300 font-medium">İş İlanları</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
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

            {/* New Ad Button */}
            <button
              onClick={handleShowNewAd}
              className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 border border-white/20 items-center font-medium"
            >
              İlan Ver
            </button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-3">
                {user.role === 'admin' && (
                  <button
                    onClick={() => window.location.href = '/admin'}
                    className="bg-yellow-500 text-slate-800 px-4 py-2 rounded-lg hover:bg-yellow-400 font-medium"
                  >
                    Admin
                  </button>
                )}
                
                <button
                  onClick={() => {
                    logout();
                  }}
                  className="bg-white text-slate-800 px-4 py-2 rounded-lg hover:bg-gray-100 font-medium"
                >
                  Çıkış Yap
                </button>
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