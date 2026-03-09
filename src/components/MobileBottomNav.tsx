import React from 'react';
import { Home, Search, PlusCircle, Heart, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileBottomNavProps {
    onShowNewAd: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onShowNewAd }) => {
    const navigate = useNavigate();
    const location = useLocation();
    // const { user } = useAuth(); // Sonra eklenecekse yorumda tut

    const navItems = [
        { icon: Home, label: 'Ana Sayfa', action: () => navigate('/') },
        { icon: Search, label: 'Ara', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
        { icon: PlusCircle, label: 'İlan Ver', action: onShowNewAd, isPrimary: true },
        { icon: Heart, label: 'Favoriler', action: () => { /* Favoriler Modal veya Sayfasına Git */ } },
        { icon: User, label: 'Profil', action: () => { /* Auth veya Profile Modal Aç */ } }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 bg-white/80 dark:bg-primary-900/80 backdrop-blur-xl border-t border-primary-200 dark:border-primary-800 pb-safe">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === '/' && item.label === 'Ana Sayfa'; // Basit active check

                    if (item.isPrimary) {
                        return (
                            <button
                                key={index}
                                onClick={item.action}
                                className="relative -top-5 w-14 h-14 bg-accent-premium rounded-full flex flex-col items-center justify-center text-white shadow-md border-4 border-white dark:border-primary-950 transform hover:scale-105 active:scale-95 transition-all"
                            >
                                <Icon size={24} />
                            </button>
                        );
                    }

                    return (
                        <button
                            key={index}
                            onClick={item.action}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-accent-premium font-bold' : 'text-primary-500 dark:text-primary-400 hover:text-primary-900 dark:hover:text-white'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'transform scale-110' : ''} />
                            <span className="text-[10px] uppercase tracking-wide">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileBottomNav;
