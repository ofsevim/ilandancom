import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import AdminDashboard from './AdminDashboard';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080b20] transition-colors flex flex-col">
      <Header onShowAdminPanel={() => setShowAdminDashboard(true)} />
      <main className="pt-0 flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
      {showAdminDashboard && <AdminDashboard onClose={() => setShowAdminDashboard(false)} />}
    </div>
  );
};

export default Layout;