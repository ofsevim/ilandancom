import React from 'react';
import { Ad } from '../types';
import AdCard from './AdCard';
import { motion } from 'framer-motion';

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
      <div
        className="grid gap-3 sm:gap-4 md:gap-5"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}
      >
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="premium-card animate-pulse flex flex-col"
            style={{ minHeight: '280px' }}
          >
            <div className="h-32 sm:h-44 bg-primary-200 dark:bg-primary-800"></div>
            <div className="p-3 sm:p-4 flex-1 space-y-3 sm:space-y-4">
              <div className="h-5 bg-primary-200 dark:bg-primary-800 rounded-lg w-3/4"></div>
              <div className="h-4 bg-primary-200 dark:bg-primary-800 rounded-lg w-1/2"></div>
              <div className="pt-4 border-t border-primary-100 dark:border-primary-800 flex justify-between">
                <div className="h-3 bg-primary-100 dark:bg-primary-800 rounded w-1/4"></div>
                <div className="h-3 bg-primary-100 dark:bg-primary-800 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="col-span-full flex flex-col items-center justify-center py-32"
      >
        <div className="bg-primary-100 dark:bg-primary-900 rounded-full w-40 h-40 flex items-center justify-center mb-8 shadow-premium border border-primary-200 dark:border-primary-800">
          <span className="text-7xl">💎</span>
        </div>
        <h3 className="text-3xl font-bold text-primary-950 dark:text-white mb-4">
          Aradığınızı Bulamadık
        </h3>
        <p className="text-primary-500 dark:text-primary-400 text-center text-lg max-w-md">
          Henüz bu kriterlere uygun bir ilan yok. Belki de ilk ilanı siz vermek istersiniz?
        </p>
      </motion.div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-3 sm:gap-4 md:gap-5"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}
    >
      {ads.map((ad, index) => (
        <AdCard
          key={ad.id}
          ad={ad}
          onAdClick={onAdClick}
          showEditButton={showEditButton}
          onEditClick={onEditClick}
          priority={index < 6}
        />
      ))}
    </motion.div>
  );
};

export default AdGrid;
