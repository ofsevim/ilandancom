import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import AdGrid from './components/AdGrid';
import AdDetailModal from './components/AdDetailModal';
import NewAdModal from './components/NewAdModal';
import EditAdModal from './components/EditAdModal';
import AdminDashboard from './components/AdminDashboard';
import SidebarFilters from './components/SidebarFilters';
import { useAuth } from './contexts/AuthContext';
import { SearchFilters as SearchFiltersType } from './types';
import { useAds } from './hooks/useAds';
import { useCategories } from './hooks/useCategories';
import { adService } from './services/api';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [showNewAdModal, setShowNewAdModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  const [filters, setFilters] = useState<SearchFiltersType>({
    sortBy: 'newest',
  });

  const { ads, loading, error, refreshAds } = useAds(filters);
  const { categories } = useCategories();

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
  };

  const handleAdClick = async (ad: any) => {
    setSelectedAd(ad);
    try {
      await adService.incrementViewCount(ad.id);
      refreshAds();
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleAdCreated = () => {
    refreshAds();
  };

  const handleEditAd = (ad: any) => {
    setEditingAd(ad);
    setShowEditModal(true);
  };

  const showAdminPanel = () => {
    if (user?.role === 'admin') {
      setShowAdminDashboard(true);
    }
  };

  if (error) {
    return (
      <Layout onSearch={handleSearch} onShowNewAd={() => setShowNewAdModal(true)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Hata Oluştu
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onSearch={handleSearch} onShowNewAd={() => setShowNewAdModal(true)}>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-8">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-2">
            <SidebarFilters filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Right Content - Ads */}
          <div className="lg:col-span-6">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {loading ? 'Yükleniyor...' : `${ads.length} ilan bulundu`}
                {filters.category && categories.length > 0 && (
                  <>
                    {' - '}
                    <span className="text-blue-600 dark:text-blue-400">
                      {categories.find(c => c.id === filters.category)?.name}
                    </span>
                  </>
                )}
              </h2>
              
              {user?.role === 'admin' && (
                <button
                  onClick={showAdminPanel}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  Admin Panel
                </button>
              )}
            </div>

            {/* Ads Grid */}
            <AdGrid 
              ads={ads} 
              loading={loading} 
              onAdClick={handleAdClick}
              showEditButton={!!user}
              onEditClick={handleEditAd}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedAd && (
        <AdDetailModal
          ad={selectedAd}
          onClose={() => setSelectedAd(null)}
          onDeleted={() => {
            setSelectedAd(null);
            refreshAds();
          }}
        />
      )}

      {showNewAdModal && (
        <NewAdModal
          onClose={() => setShowNewAdModal(false)}
          onAdCreated={handleAdCreated}
        />
      )}

      {/* Edit Ad Modal */}
      {showEditModal && editingAd && (
        <EditAdModal
          ad={editingAd}
          onClose={() => {
            setShowEditModal(false);
            setEditingAd(null);
          }}
          onAdUpdated={() => {
            setShowEditModal(false);
            setEditingAd(null);
            refreshAds();
          }}
        />
      )}

      {showAdminDashboard && (
        <AdminDashboard
          onClose={() => setShowAdminDashboard(false)}
        />
      )}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </Layout>
  );
};

export default AppContent;