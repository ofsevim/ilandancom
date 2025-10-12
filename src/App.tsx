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
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [showNewAdModal, setShowNewAdModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

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

  const isAdPage = location.pathname.startsWith('/ad/');

  return (
    <Layout onSearch={handleSearch} onShowNewAd={() => setShowNewAdModal(true)}>
      {isAdPage ? (
        <Routes>
          <Route path="/ad/:id" element={<AdDetailPage />} />
        </Routes>
      ) : (
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <SidebarFilters filters={filters} onFiltersChange={setFilters} />
            </div>

            {/* Right Content - Ads */}
            <div className="lg:col-span-4">
              {/* Mobile Category Grid */}
              <div className="lg:hidden mb-6">
                <CategoryGrid
                  onCategorySelect={handleCategorySelect}
                  selectedCategoryId={filters.category}
                />
              </div>

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