import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
  onShowNewAd?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onSearch, onShowNewAd }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <Header onSearch={onSearch} onShowNewAd={onShowNewAd} />
      <main className="pt-16 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;