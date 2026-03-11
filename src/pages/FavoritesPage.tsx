import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import FavoritesModal from '../components/FavoritesModal';
import SEO from '../components/SEO';

const FavoritesPage = () => {
  const navigate = useNavigate();
  return (
    <Layout>
      <SEO title="Favorilerim" description="ilandan.online'da favori ilanlarınıza göz atın." />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <FavoritesModal onClose={() => navigate('/')} asPage={true} />
      </div>
    </Layout>
  );
};

export default FavoritesPage;
