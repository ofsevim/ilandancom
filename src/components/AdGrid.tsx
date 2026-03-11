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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 h-[420px] animate-pulse">
            <div className="h-2/3 bg-slate-100 dark:bg-slate-700 rounded-t-[2rem]"></div>
            <div className="p-6 space-y-4">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-40 h-40 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-primary/5">
          <span className="material-symbols-outlined text-6xl text-slate-300">inventory_2</span>
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Aradığınız İlanı Bulamadık</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm font-medium">Farklı kriterler deneyebilir veya siz yeni bir ilan verebilirsiniz.</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {ads.map((ad, i) => (
        <AdCard key={ad.id} ad={ad} onAdClick={onAdClick} showEditButton={showEditButton} onEditClick={onEditClick} priority={i < 6} />
      ))}
    </motion.div>
  );
};

export default AdGrid;
