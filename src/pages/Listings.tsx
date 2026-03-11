import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import AdGrid from '../components/AdGrid';
import SidebarFilters from '../components/SidebarFilters';
import { SearchFilters, Ad } from '../types';
import { adService } from '../services/api';

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-80 flex-shrink-0">
          <SidebarFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </aside>
        <main className="flex-1">
          <AdGrid ads={ads} loading={loading} onAdClick={handleAdClick} />
        </main>
      </div>
    </Layout>
  );
};

export default Listings;
