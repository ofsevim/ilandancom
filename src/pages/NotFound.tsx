import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';

const NotFound = () => {
  return (
    <Layout>
      <SEO title="Sayfa Bulunamadı" description="Aradığınız sayfa mevcut değil. Ana sayfaya dönün." />
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-6xl font-black text-accent mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-silver-100 mb-6">Sayfa Bulunamadı</h2>
        <p className="text-silver-500 dark:text-silver-600 mb-8 max-w-md">Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanım dışı olabilir.</p>
        <Link 
          to="/" 
          className="bg-accent text-white px-8 py-3 rounded-xl font-bold shadow-glow hover:scale-105 active:scale-95 transition-all"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;
