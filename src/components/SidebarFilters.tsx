import React, { useState } from 'react';
import { SearchFilters } from '../types';
import { useCategories } from '../hooks/useCategories';
import { useCities } from '../hooks/useCities';
import { useDistricts } from '../hooks/useDistricts';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({ filters, onFiltersChange }) => {
  const { categories } = useCategories();
  const { cities } = useCities();
  const { districts } = useDistricts(filters.city);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const handleInputChange = (name: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [name]: value });
  };

  const handleCityChange = (city: string) => {
    onFiltersChange({ ...filters, city, district: undefined });
  };

  const clearFilters = () => {
    onFiltersChange({ sortBy: 'newest' });
  };

  const renderFilters = () => (
    <div className="space-y-6">
      {/* İlan Ara */}
      <div className="filter-section pb-4">
        <label className="dark-section-title mb-4 block flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-500">search</span>
          İlan Ara
        </label>
        <div className="relative group">
          <input
            type="text"
            placeholder="Kelime veya ilan no..."
            value={filters.query || ''}
            onChange={(e) => handleInputChange('query', e.target.value)}
            className="w-full px-4 py-3.5 dark-filter-input transition-all outline-none"
          />
        </div>
      </div>

      {/* Kategori */}
      <div className="filter-section pb-4">
        <label className="dark-section-title mb-4 block flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-500">category</span>
          Kategori
        </label>
        <div className="relative">
          <select
            value={filters.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value || undefined)}
            className="w-full px-4 py-3.5 dark-filter-select transition-all outline-none appearance-none cursor-pointer"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
        </div>
      </div>

      {/* Lokasyon */}
      <div className="filter-section pb-4">
        <label className="dark-section-title mb-4 block flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-500">location_on</span>
          Lokasyon
        </label>
        <div className="space-y-3">
          <div className="relative">
            <select
              value={filters.city || ''}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full px-4 py-3.5 dark-filter-select transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="">Tüm Şehirler</option>
              {cities.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
          </div>

          <AnimatePresence>
            {filters.city && districts && districts.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative mt-3">
                <select
                  value={filters.district || ''}
                  onChange={(e) => handleInputChange('district', e.target.value || undefined)}
                  className="w-full px-4 py-3.5 dark-filter-select transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="">İlçe Seçin</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fiyat Aralığı */}
      <div className="filter-section pb-4">
        <label className="dark-section-title mb-4 block flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-500">payments</span>
          Fiyat Aralığı
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min ₺"
            value={filters.minPrice || ''}
            onChange={(e) => handleInputChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-4 py-3.5 dark-filter-input transition-all outline-none"
          />
          <input
            type="number"
            placeholder="Max ₺"
            value={filters.maxPrice || ''}
            onChange={(e) => handleInputChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-4 py-3.5 dark-filter-input transition-all outline-none"
          />
        </div>
      </div>

      {/* Sıralama */}
      <div className="filter-section pb-2">
        <label className="dark-section-title mb-4 block flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-500">sort</span>
          Sıralama
        </label>
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => handleInputChange('sortBy', e.target.value as any)}
            className="w-full px-4 py-3.5 dark-filter-select transition-all outline-none appearance-none cursor-pointer"
          >
            <option value="newest">En Yeni İlanlar</option>
            <option value="oldest">En Eski İlanlar</option>
            <option value="price_low">Fiyat (Düşükten Yükseğe)</option>
            <option value="price_high">Fiyat (Yüksekten Düşüğe)</option>
            <option value="most_viewed">En Çok Görüntülenen</option>
          </select>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 px-6 rounded-2xl transition-all flex items-center justify-center font-black text-xs uppercase tracking-widest shadow-xl active:scale-95"
        >
          <span className="material-symbols-outlined mr-2">filter_list</span>
          FİLTRELEMEYİ DÜZENLE
        </button>
      </div>

      <div className="hidden lg:block filter-sidebar w-[320px] shrink-0">
        <div className="premium-sidebar-bg p-8 w-full">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-primary-800/20">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
              Filtreler
            </h3>
            <button onClick={clearFilters} className="clear-btn bg-slate-100 dark:bg-transparent text-slate-600 dark:text-primary-100/50 hover:bg-slate-200 dark:hover:bg-primary-500/10">
              Temizle
            </button>
          </div>
          {renderFilters()}
        </div>
      </div>

      <AnimatePresence>
        {isMobileFiltersOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-end justify-center p-4">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="bg-white dark:bg-slate-900 w-full rounded-[3rem] overflow-hidden max-h-[90vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">filter_list</span>
                  FİLTRELEYİN
                </h3>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-8 pb-32 overflow-y-auto scrollbar-hide flex-1">
                {renderFilters()}
                <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white dark:from-slate-900 via-white dark:via-slate-900 to-transparent flex gap-3">
                  <button onClick={clearFilters} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">TEMİZLE</button>
                  <button onClick={() => setIsMobileFiltersOpen(false)} className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20">UYGULA</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SidebarFilters;
