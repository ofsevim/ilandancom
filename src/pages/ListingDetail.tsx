import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import AdDetailModal from '../components/AdDetailModal';
import SEO from '../components/SEO';
import { adService } from '../services/api';
import { Ad } from '../types';

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchAd = async () => {
        try {
          const data = await adService.getAdById(id);
          setAd(data as any);
        } catch (error) {
          console.error('Error fetching ad detail:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchAd();
    }
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <SEO title="İlan Detayı" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (!ad) {
    return (
      <Layout>
        <SEO title="İlan Bulunamadı" />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-silver-100">İlan bulunamadı</h2>
          <button onClick={() => navigate('/')} className="mt-4 text-accent font-semibold hover:underline">Ana Sayfaya Dön</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title={ad.title} description={`${ad.title} — ${ad.price.toLocaleString('tr-TR')} TL. ${ad.location?.city}, ${ad.location?.district}. ilandan.online'da hemen inceleyin.`} />
      <div className="max-w-7xl mx-auto px-0 sm:px-4 py-0 sm:py-12">
        <AdDetailModal ad={ad} onClose={() => navigate(-1)} asPage={true} />
      </div>
    </Layout>
  );
};

export default ListingDetail;
