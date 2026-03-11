import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import NewAdModal from '../components/NewAdModal';
import SEO from '../components/SEO';

const CreateListing = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <SEO title="İlan Ver" description="ilandan.online'da ücretsiz ilan verin. Binlerce alıcıya ulaşın." />
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <NewAdModal onClose={() => navigate('/')} onAdCreated={() => navigate('/ilanlar')} />
        </div>
      </div>
    </Layout>
  );
};

export default CreateListing;
