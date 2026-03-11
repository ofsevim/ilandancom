import React from 'react';
import Layout from '../components/Layout';
import FavoritesModal from '../components/FavoritesModal';

const FavoritesPage = () => {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <FavoritesModal onClose={() => {}} />
      </div>
    </Layout>
  );
};

export default FavoritesPage;
