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
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-silver-100">
      <Header onShowAdminPanel={() => setShowAdminDashboard(true)} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
      {showAdminDashboard && <AdminDashboard onClose={() => setShowAdminDashboard(false)} />}
    </div>
  );
};

export default Layout;
