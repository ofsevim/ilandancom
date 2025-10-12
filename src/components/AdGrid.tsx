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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse"
            style={{ minHeight: '384px' }}
          >
            <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" style={{ aspectRatio: '400/192' }}></div>
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg"></div>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-2/3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-4/5"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-20">
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full w-32 h-32 flex items-center justify-center mb-6 shadow-xl">
          <span className="text-6xl">🔍</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          İlan Bulunamadı
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center text-base max-w-md">
          Arama kriterlerinizi değiştirerek tekrar deneyin veya farklı bir kategori seçin
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {ads.map((ad, index) => (
        <div
          key={ad.id}
          style={{ animationDelay: `${index * 50}ms` }}
          className="animate-fade-in"
        >
          <AdCard 
            ad={ad} 
            onAdClick={onAdClick}
            showEditButton={showEditButton}
            onEditClick={onEditClick}
            priority={index < 6}
          />
        </div>
      ))}
    </div>
  );
};

export default AdGrid;