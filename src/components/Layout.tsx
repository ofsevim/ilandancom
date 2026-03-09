import React from 'react';
import Header from './Header';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';

interface LayoutProps {
  children: React.ReactNode;
  onShowNewAd?: () => void;
  onShowAdminPanel?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onShowNewAd, onShowAdminPanel }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors flex flex-col">
      <Header onShowNewAd={onShowNewAd} onShowAdminPanel={onShowAdminPanel} />
      <main className="pt-16 md:pt-20 flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileBottomNav onShowNewAd={onShowNewAd || (() => { })} />
    </div>
  );
};

export default Layout;