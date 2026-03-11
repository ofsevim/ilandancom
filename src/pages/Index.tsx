import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import CategoryGrid from '../components/CategoryGrid';
import FeaturedListings from '../components/FeaturedListings';

const Index = () => {
  const navigate = useNavigate();

  const handleCategorySelect = (categoryId: string) => {
    navigate(`/ilanlar?kategori=${categoryId}`);
  };

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-6">
        <CategoryGrid onCategorySelect={handleCategorySelect} />
        <FeaturedListings />
        
        {/* Popüler Aramalar - HTML'deki bölüm */}
        <section className="mt-20 mb-20">
          <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Popüler Aramalar</h3>
          <div className="flex flex-wrap gap-3">
            {[
              'BMW 3 Serisi', 'Deniz Manzaralı Villa', 'PlayStation 5', 
              'Antika Eşyalar', 'Satılık Karavan', 'MacBook Air M2', 'Daire Kiralık'
            ].map((tag) => (
              <a 
                key={tag}
                className="px-5 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary transition-all shadow-sm" 
                href="#"
                onClick={(e) => { e.preventDefault(); navigate(`/ilanlar?q=${tag}`); }}
              >
                {tag}
              </a>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default Index;
