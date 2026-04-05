import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import AdminDashboard from './AdminDashboard';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 text-silver-100 flex flex-col">
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
