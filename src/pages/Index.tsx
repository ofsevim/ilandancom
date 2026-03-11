import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import CategoryGrid from '../components/CategoryGrid';
import FeaturedListings from '../components/FeaturedListings';
import SEO from '../components/SEO';

const Index = () => {
  const navigate = useNavigate();

  const handleCategorySelect = (categoryId: string) => {
    navigate(`/ilanlar?kategori=${categoryId}`);
  };

  return (
    <Layout>
      <SEO title="Ana Sayfa" description="ilandan.online — Türkiye'nin en modern ilan platformu. Emlak, vasıta, elektronik ve daha fazlasında alışveriş yapın." />
      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-10">
        <CategoryGrid onCategorySelect={handleCategorySelect} />
        <div className="h-px bg-slate-200 dark:bg-white/10 my-12" />
        <FeaturedListings />
      </main>
    </Layout>
  );
};

export default Index;
