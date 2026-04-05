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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl bg-[#111d35] border border-[rgba(192,192,192,0.08)] overflow-hidden">
            {/* Image skeleton */}
            <div className="relative aspect-[4/3] bg-[#1a2540] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(192,192,192,0.04)] to-transparent animate-[shimmer_1.5s_infinite]" />
            </div>
            {/* Content skeleton */}
            <div className="px-4 pt-3.5 pb-3 space-y-3">
              <div className="h-3 bg-[#1a2540] rounded-full w-2/3" />
              <div className="h-4 bg-[#1a2540] rounded-full w-4/5" />
              <div className="h-3 bg-[#1a2540] rounded-full w-1/2" />
              <div className="pt-3 border-t border-[rgba(192,192,192,0.06)]">
                <div className="h-5 bg-[#1a2540] rounded-full w-1/3" />
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-24 h-24 rounded-full bg-[#111d35] border border-[rgba(192,192,192,0.08)] flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-5xl text-[#6c7a89]">inventory_2</span>
        </div>
        <h3 className="text-xl font-semibold text-[#f1f3f5] mb-2">Aradığınız İlanı Bulamadık</h3>
        <p className="text-[#6c7a89] max-w-sm text-sm">Farklı kriterler deneyebilir veya siz yeni bir ilan verebilirsiniz.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {ads.map((ad, i) => (
        <AdCard
          key={ad.id}
          ad={ad}
          onAdClick={onAdClick}
          showEditButton={showEditButton}
          onEditClick={onEditClick}
          priority={i < 6}
        />
      ))}
    </motion.div>
  );
};

export default AdGrid;
