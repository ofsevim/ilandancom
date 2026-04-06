import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import FeaturedListings from '../components/FeaturedListings';
import SEO from '../components/SEO';

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/ilanlar?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const quickCategories = [
    { label: 'Emlak', icon: 'home', path: '/ilanlar?kategori=emlak' },
    { label: 'Vasıta', icon: 'directions_car', path: '/ilanlar?kategori=vasita' },
    { label: 'Elektronik', icon: 'smartphone', path: '/ilanlar?kategori=elektronik' },
    { label: 'İş İlanları', icon: 'work', path: '/ilanlar?kategori=is-ilanlari' },
    { label: 'Alışveriş', icon: 'shopping_bag', path: '/ilanlar?kategori=alisveris' },
    { label: 'Hizmetler', icon: 'groups', path: '/ilanlar?kategori=hizmetler' },
    { label: 'Yedek Parça', icon: 'build', path: '/ilanlar?kategori=yedek-parca' },
    { label: 'Ev & Bahçe', icon: 'forest', path: '/ilanlar?kategori=ev-bahce' },
  ];

  return (
    <Layout>
      <SEO title="Ana Sayfa" description="ilandan.online — Türkiye'nin en modern ilan platformu." />

      {/* Search Hero */}
      <section className="bg-slate-50 dark:bg-navy-950 border-b border-slate-200 dark:border-silver-700/10">
        <div className="container-premium py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-silver-50 tracking-tight">
                Ne arıyorsunuz?
              </h1>
              <p className="text-sm text-slate-500 dark:text-silver-400 mt-1">
                Binlerce ilan arasından size uygun olanı bulun
              </p>
            </div>
            <Link to="/ilan-ver" className="btn-primary text-sm shrink-0">
              <span className="material-symbols-outlined text-base">add</span>
              Ücretsiz İlan Ver
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1 group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-silver-500 text-xl group-focus-within:text-accent transition-colors">search</span>
              <input
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-navy-800 border border-slate-200 dark:border-silver-700/20 rounded-xl text-sm text-slate-900 dark:text-silver-100 placeholder:text-slate-400 dark:placeholder:text-silver-500 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                placeholder="İlan, ürün, kategori veya kelime ara..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className="btn-primary px-6"
            >
              <span className="material-symbols-outlined text-xl">search</span>
            </button>
          </div>

          {/* Quick Categories */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 dark:text-silver-400 font-semibold py-1.5">Hızlı erişim:</span>
            {quickCategories.map((cat) => (
              <Link
                key={cat.label}
                to={cat.path}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-silver-700/20 rounded-full text-xs font-medium text-slate-600 dark:text-silver-300 hover:border-accent/40 hover:text-accent dark:hover:text-accent transition-colors"
              >
                <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="section-padding">
        <div className="container-premium">
          <FeaturedListings />
        </div>
      </section>
    </Layout>
  );
};

export default Index;
