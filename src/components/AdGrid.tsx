import React from 'react';
import { Ad } from '../types';
import AdCard from './AdCard';

interface AdGridProps {
  ads: Ad[];
  loading?: boolean;
  onAdClick: (ad: Ad) => void;
  showEditButton?: boolean;
  onEditClick?: (ad: Ad) => void;
}

const AdGrid: React.FC<AdGridProps> = ({ ads, loading, onAdClick, showEditButton, onEditClick }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-gray-300 dark:bg-gray-600"></div>
            <div className="p-3 space-y-2.5">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              <div className="space-y-1.5">
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-12">
        <div className="text-gray-400 dark:text-gray-500 text-5xl mb-3">🔍</div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">
          İlan bulunamadı
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
          Arama kriterlerinizi değiştirerek tekrar deneyin
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {ads.map((ad) => (
        <AdCard 
          key={ad.id} 
          ad={ad} 
          onAdClick={onAdClick}
          showEditButton={showEditButton}
          onEditClick={onEditClick}
        />
      ))}
    </div>
  );
};

export default AdGrid;