import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import FavoritesModal from '../components/FavoritesModal';

const FavoritesPage = () => {
  const navigate = useNavigate();
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <FavoritesModal onClose={() => navigate('/')} />
      </div>
    </Layout>
  );
};

export default FavoritesPage;
