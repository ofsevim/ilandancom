import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import AdGrid from './components/AdGrid';
import AdDetailModal from './components/AdDetailModal';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { adService } from './services/api';
import { Ad } from './types';
import NewAdModal from './components/NewAdModal';
import EditAdModal from './components/EditAdModal';
import AdminDashboard from './components/AdminDashboard';
import AdminPanel from './components/AdminPanel';
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
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Admin panel kısayolu: Ctrl+Shift+A
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        if (user?.role === 'admin') {
          setShowAdminPanel(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [user]);

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

  const showAdminPanel = () => {
    if (user?.role === 'admin') {
      setShowAdminDashboard(true);
    }
  };

  if (error) {
    return (
      <Layout onSearch={handleSearch} onShowNewAd={() => setShowNewAdModal(true)}>
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
    <Layout onSearch={handleSearch} onShowNewAd={() => setShowNewAdModal(true)}>
      {isAdPage ? (
        <Routes>
          <Route path="/ad/:id" element={<AdDetailPage />} />
        </Routes>
      ) : (
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Desktop Category Grid - Hidden on mobile */}
          <div className="hidden lg:block mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📂</span>
                </div>
                Kategoriler
              </h2>
              <CategoryGrid
                onCategorySelect={handleCategorySelect}
                selectedCategoryId={filters.category}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <SidebarFilters filters={filters} onFiltersChange={setFilters} />
            </div>

            {/* Right Content - Ads */}
            <div className="lg:col-span-4 space-y-6">
              {/* Mobile Category Grid */}
              <div className="lg:hidden">
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">📂</span>
                    </div>
                    Kategoriler
                  </h2>
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

                {user?.role === 'admin' && (
                  <button
                    onClick={() => setShowAdminPanel(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all text-sm flex items-center gap-1.5"
                  >
                    <span>⚙️</span>
                    <span>Admin</span>
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

      {showAdminPanel && (
        <AdminPanel
          onClose={() => setShowAdminPanel(false)}
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