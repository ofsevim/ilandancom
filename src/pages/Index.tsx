import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import CategoryGrid from '../components/CategoryGrid';
import FeaturedListings from '../components/FeaturedListings';
import SEO from '../components/SEO';

const Index = () => {
  return (
    <Layout>
      <SEO title="Ana Sayfa" description="ilandan.online — Türkiye'nin en modern ilan platformu." />

      {/* Hero Section */}
      <section className="hero-gradient pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="container-premium text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-navy-950 dark:text-silver-50 mb-4">
            Aradığın Her Şey
            <span className="text-gradient block">Bir Tık Uzağında</span>
          </h1>
          <p className="text-base md:text-lg text-silver-600 dark:text-silver-400 max-w-2xl mx-auto mb-8">
            Emlak, vasıta, elektronik ve daha fazlası. Güvenilir satıcılar, uygun fiyatlar.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/ilanlar" className="btn-primary text-sm">
              <span className="material-symbols-outlined text-base">search</span>
              İlanları Keşfet
            </Link>
            <Link to="/ilan-ver" className="btn-secondary text-sm">
              <span className="material-symbols-outlined text-base">add_circle</span>
              Ücretsiz İlan Ver
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding border-t border-silver-200 dark:border-silver-700/10">
        <div className="container-premium">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-navy-950 dark:text-silver-50">Kategoriler</h2>
              <p className="text-sm text-silver-500 dark:text-silver-400 mt-1">İlgi alanına göre göz at</p>
            </div>
          </div>
          <CategoryGrid onCategorySelect={(id) => window.location.href = `/ilanlar?kategori=${id}`} />
        </div>
      </section>

      {/* Featured Listings */}
      <section className="section-padding border-t border-silver-200 dark:border-silver-700/10">
        <div className="container-premium">
          <FeaturedListings />
        </div>
      </section>
    </Layout>
  );
};

export default Index;
