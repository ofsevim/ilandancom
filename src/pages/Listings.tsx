import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import AdGrid from '../components/AdGrid';
import SidebarFilters from '../components/SidebarFilters';
import SEO from '../components/SEO';
import { SearchFilters, Ad } from '../types';
import { adService } from '../services/api';

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filters: SearchFilters = {
    query: searchParams.get('q') || '',
    category: searchParams.get('kategori') || '',
    city: searchParams.get('sehir') || '',
    district: searchParams.get('ilce') || '',
    minPrice: searchParams.get('min') ? Number(searchParams.get('min')) : undefined,
    maxPrice: searchParams.get('max') ? Number(searchParams.get('max')) : undefined,
    sortBy: (searchParams.get('sort') as any) || 'newest'
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    const params = new URLSearchParams();
    if (newFilters.query) params.set('q', newFilters.query);
    if (newFilters.category) params.set('kategori', newFilters.category);
    if (newFilters.city) params.set('sehir', newFilters.city);
    if (newFilters.district) params.set('ilce', newFilters.district);
    if (newFilters.minPrice) params.set('min', newFilters.minPrice.toString());
    if (newFilters.maxPrice) params.set('max', newFilters.maxPrice.toString());
    if (newFilters.sortBy) params.set('sort', newFilters.sortBy);
    setSearchParams(params);
    setShowMobileFilters(false);
  };

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const data = await adService.getAllAds(filters);
        setAds(data);
      } catch (error) {
        console.error('Error fetching ads:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [searchParams]);

  const handleAdClick = (ad: Ad) => {
    navigate(`/ilan/${ad.id}`);
  };

  const activeFilterCount = [
    filters.query, filters.category, filters.city,
    filters.minPrice, filters.maxPrice
  ].filter(Boolean).length;

  return (
    <Layout>
      <SEO title="İlanlar" description="Türkiye'nin en büyük ilan platformunda aradığınız ürünü bulun. Binlerce ilan arasından filtreleyin." />
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="md:hidden mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-silver-600 dark:text-silver-400">
            {loading ? 'Yükleniyor...' : `${ads.length} ilan bulundu`}
          </p>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-navy-800 border border-silver-200 dark:border-silver-700/20 rounded-xl text-sm font-semibold text-slate-700 dark:text-silver-100 shadow-card hover:border-accent transition-all"
          >
            <SlidersHorizontal size={16} />
            Filtrele
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <aside className="hidden md:block w-80 flex-shrink-0">
            <SidebarFilters filters={filters} onFiltersChange={handleFiltersChange} />
          </aside>

          <main className="flex-1">
            <AdGrid ads={ads} loading={loading} onAdClick={handleAdClick} />
          </main>
        </div>

        <AnimatePresence>
          {showMobileFilters && (
            <div className="fixed inset-0 z-[200] md:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileFilters(false)}
                className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                className="absolute top-0 left-0 bottom-0 w-[85vw] max-w-sm bg-white dark:bg-navy-900 shadow-2xl overflow-y-auto"
              >
                <div className="flex items-center justify-between p-4 border-b border-silver-200 dark:border-silver-700/20 sticky top-0 bg-white dark:bg-navy-900 z-10">
                  <h3 className="font-bold text-slate-900 dark:text-silver-100">Filtreler</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-9 h-9 rounded-full bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-slate-600 dark:text-silver-400"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-4">
                  <SidebarFilters filters={filters} onFiltersChange={handleFiltersChange} />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Listings;
