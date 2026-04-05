import React, { useState } from 'react';
import { Home, Search, PlusCircle, Heart, User, Package, LogOut, MessageSquare, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';
import MyAdsModal from './MyAdsModal';
import FavoritesModal from './FavoritesModal';
import ConversationsModal from './ConversationsModal';
import MessagesModal from './MessagesModal';

interface MobileBottomNavProps {
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showMyAdsModal, setShowMyAdsModal] = useState(false);
    const [showFavoritesModal, setShowFavoritesModal] = useState(false);
    const [showConversationsModal, setShowConversationsModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [currentConversation, setCurrentConversation] = useState<{ receiverId: string, adId: string | null } | null>(null);

    const handleProfileClick = () => {
        if (!user) {
            setShowAuthModal(true);
        } else {
            setShowUserMenu(!showUserMenu);
        }
    };

    const navItems = [
        { icon: Home, label: 'ANA SAYFA', path: '/', action: () => navigate('/') },
        { icon: Search, label: 'ARA', path: '/ilanlar', action: () => navigate('/ilanlar') },
        { icon: PlusCircle, label: 'İLAN VER', path: '/ilan-ver', action: () => navigate('/ilan-ver'), isPrimary: true },
        { icon: Heart, label: 'FAVORİLER', path: '/favoriler', action: () => { if (!user) setShowAuthModal(true); else setShowFavoritesModal(true); } },
        { icon: User, label: 'PROFİL', path: null, action: handleProfileClick }
    ];

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 bg-white/80 dark:bg-navy-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-silver-700/10 pb-safe">
                <div className="flex justify-around items-center h-16 px-2">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = item.path 
                            ? (item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path))
                            : false;

                        if (item.isPrimary) {
                            return (
                                <button
                                    key={index}
                                    onClick={item.action}
                                    className="relative -top-5 w-14 h-14 bg-accent rounded-full flex flex-col items-center justify-center text-white shadow-glow border-4 border-white dark:border-navy-950 transform active:scale-95 transition-all"
                                >
                                    <Icon size={24} />
                                </button>
                            );
                        }

                        return (
                            <button
                                key={index}
                                onClick={item.action}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-accent font-bold' : 'text-silver-500 dark:text-silver-400'
                                    }`}
                            >
                                <Icon size={20} className={isActive ? 'transform scale-110' : ''} />
                                <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence>
                {showUserMenu && user && (
                    <div className="fixed inset-0 z-[60] md:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowUserMenu(false)}
                            className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 500, mass: 0.8 }}
                            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-navy-900 rounded-t-[2rem] shadow-2xl border-t border-slate-200 dark:border-silver-700/10 p-5 pb-10 max-h-[85vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div className="w-12 h-1.5 bg-slate-200 dark:bg-silver-700 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
                                <button 
                                    onClick={() => setShowUserMenu(false)}
                                    className="ml-auto p-2 bg-slate-100 dark:bg-navy-800 rounded-full text-slate-600 dark:text-silver-400 active:scale-90 transition-all hover:bg-slate-200 dark:hover:bg-navy-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-5 p-4 bg-accent/5 dark:bg-accent/5 rounded-2xl border border-accent/10 dark:border-accent/10">
                                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-white shadow-glow flex-shrink-0">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <span className="text-lg font-bold">{user.name[0].toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-silver-500 dark:text-silver-600 uppercase tracking-widest mb-0.5">HESABIM</p>
                                    <h4 className="text-base font-black text-slate-900 dark:text-silver-100 truncate">{user.name}</h4>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2.5">
                                {[
                                    { icon: User, label: 'Profilimi Düzenle', color: 'text-accent', bg: 'bg-accent/10', onClick: () => setShowProfileModal(true) },
                                    { icon: Package, label: 'İlanlarımı Yönet', color: 'text-accent', bg: 'bg-accent/10', onClick: () => setShowMyAdsModal(true) },
                                    { icon: Heart, label: 'Favorilerim', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10', onClick: () => setShowFavoritesModal(true) },
                                    { icon: MessageSquare, label: 'Mesajlarım', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', onClick: () => setShowConversationsModal(true) },
                                ].map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { item.onClick(); setShowUserMenu(false); }}
                                        className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 dark:border-silver-700/10 hover:bg-slate-50 dark:hover:bg-navy-800 transition-all active:scale-[0.98]"
                                    >
                                        <div className={`p-2 rounded-lg ${item.bg} dark:bg-navy-800`}>
                                            <item.icon size={18} className={item.color} />
                                        </div>
                                        <span className="font-bold text-sm text-slate-900 dark:text-silver-100">{item.label}</span>
                                    </button>
                                ))}

                                <button
                                    onClick={() => { logout(); setShowUserMenu(false); }}
                                    className="mt-2 flex items-center gap-3.5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold uppercase tracking-widest text-[10px] border border-red-100 dark:border-red-900/30 active:scale-95 transition-all"
                                >
                                    <div className="p-1.5 bg-white dark:bg-red-900/30 rounded-lg">
                                        <LogOut size={14} />
                                    </div>
                                    OTURUMU KAPAT
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
            {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
            {showMyAdsModal && <MyAdsModal onClose={() => setShowMyAdsModal(false)} onShowNewAd={() => navigate('/ilan-ver')} />}
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

export default MobileBottomNav;
