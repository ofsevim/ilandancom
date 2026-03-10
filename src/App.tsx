import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import AdGrid from './components/AdGrid';
import AdDetailModal from './components/AdDetailModal';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { adService } from './services/api';
import { Ad } from './types';
import SearchCenter from './components/SearchCenter';
import NewAdModal from './components/NewAdModal';
import EditAdModal from './components/EditAdModal';
import AdminDashboard from './components/AdminDashboard';

import SidebarFilters from './components/SidebarFilters';
import CategoryGrid from './components/CategoryGrid';
import { useAuth } from './contexts/AuthContext';
import { SearchFilters as SearchFiltersType } from './types';
import { useAds } from './hooks/useAds';
import { useCategories } from './hooks/useCategories';

const AdDetailPage: React.FC = () => {
  const { id } = useParams();
  const [ad, setAd] = useState<Ad | null>(null);
  const navigate = useNavigate();

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      try {
        const item = await adService.getAdById(id);
        if (!mounted) return;

        // Basit dönüşüm - API'den gelen data zaten doğru formatta olmalı
        const transformed: Ad = {
          id: item.id,
          title: item.title,
          description: item.description,
          price: item.price,
          category: {
            id: item.category_id,
            name: item.category_name || 'Diğer',
            slug: item.category_slug || 'diger',
            icon: item.category_icon || 'tag'
          },
          location: {
            city: item.city,
            district: item.district,
            coordinates: item.latitude && item.longitude ? { lat: item.latitude, lng: item.longitude } : undefined
          },
          images: item.images || [],
          userId: item.user_id,
          user: {
            id: item.user_id,
            email: item.user_email || '',
            name: item.user_name || 'Gizli Kullanıcı',
            phone: item.user_phone || '',
            avatar: item.user_avatar || '',
            role: item.user_role || 'user',
            createdAt: item.user_created_at || item.created_at,
            isActive: item.user_is_active ?? true
          },
          status: item.status,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          viewCount: item.view_count || 0,
          featured: item.featured || false
        };

        setAd(transformed);

        // Görüntülenme sayısını artır
        adService.incrementViewCount(id).catch(console.warn);

        // Sayfa başlığını güncelle
        if (transformed.title) {
          document.title = `${transformed.title} - İlandan`;
        }
      } catch (error) {
        console.error('İlan yüklenirken hata:', error);
        navigate('/');
      }
    };
    load();
    return () => { mounted = false; };
  }, [id, navigate]);

  if (!ad) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-600 dark:text-gray-300">Yükleniyor...</div>
  );

  return (
    <AdDetailModal ad={ad} onClose={() => navigate(-1)} asPage />
  );
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [showNewAdModal, setShowNewAdModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [filters, setFilters] = useState<SearchFiltersType>({
    sortBy: 'newest',
  });

  const { ads, loading, error, refreshAds } = useAds(filters);
  const { categories } = useCategories();

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === categoryId ? undefined : categoryId
    }));
  };

  const navigate = useNavigate();
  const handleAdClick = async (ad: Ad) => {
    navigate(`/ad/${ad.id}`);
  };

  const handleAdCreated = () => {
    refreshAds();
  };

  const handleEditAd = (ad: Ad) => {
    setEditingAd(ad);
    setShowEditModal(true);
  };

  if (error) {
    return (
      <Layout onShowNewAd={() => setShowNewAdModal(true)} onShowAdminPanel={() => setShowAdminDashboard(true)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-12 border-2 border-red-200 dark:border-red-800">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Hata Oluştu
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              {error}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const isAdPage = location.pathname.startsWith('/ad/');

  return (
    <Layout onShowNewAd={() => setShowNewAdModal(true)} onShowAdminPanel={() => setShowAdminDashboard(true)}>
      {isAdPage ? (
        <Routes>
          <Route path="/ad/:id" element={<AdDetailPage />} />
        </Routes>
      ) : (
        <div className="w-full">
          <SearchCenter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            onCategoryClick={(catName) => {
              const cat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
              if (cat) handleCategorySelect(cat.id);
            }}
          />



          {/* MAIN CONTENT AREA: FILTER SIDEBAR + ADS GRID */}
          <div className="w-full px-4 md:px-6 lg:px-10 py-4 md:py-6">
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-10 items-start">

              {/* Left Sidebar: Independent Filter Panel */}
              <aside className="filter-sidebar z-30 hidden lg:block">
                <SidebarFilters
                  filters={filters}
                  onFiltersChange={(newFilters) => {
                    setFilters(newFilters);
                    setSearchQuery(newFilters.query || '');
                  }}
                />
              </aside>

              {/* Right Content: Stats + Ad Grid */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="page-title !text-primary-900 dark:!text-white flex items-center gap-2">
                      {filters.query ? `"${filters.query}"` : 'Tüm İlanlar'}
                    </h2>
                    {filters.category && (
                      <>
                        <span className="text-primary-300 dark:text-primary-600 text-2xl">/</span>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-accent-premium/10 text-accent-premium border border-accent-premium/20 uppercase tracking-wider">
                          {categories.find(c => c.id === filters.category)?.name}
                        </span>
                      </>
                    )}
                  </div>

                  {user?.role === 'admin' && (
                    <button
                      onClick={() => setShowAdminDashboard(true)}
                      className="admin-btn flex items-center gap-2 text-sm uppercase tracking-widest"
                    >
                      <span>⚙️</span>
                      <span>Admin Paneli</span>
                    </button>
                  )}
                </div>

                {/* Mobile Category Grid */}
                <div className="lg:hidden mb-10">
                  <div className="bg-white dark:bg-primary-900 rounded-2xl p-4 shadow-sm border border-primary-200 dark:border-primary-800">
                    <CategoryGrid
                      onCategorySelect={handleCategorySelect}
                      selectedCategoryId={filters.category}
                    />
                  </div>
                </div>

                {/* Results Header - Compact Design */}
                <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    {loading ? (
                      <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        Yükleniyor...
                      </span>
                    ) : (
                      <>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          {ads.length} ilan
                        </span>
                        {filters.category && categories.length > 0 && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              {categories.find(c => c.id === filters.category)?.name}
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </div>


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
        </div>
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
            background: 'rgba(15, 23, 42, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(12px)',
            borderRadius: '1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1rem 1.5rem',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#fbbf24',
              secondary: '#0f172a',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </Layout>
  );
};

export default AppContent;