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
    <div className="space-y-8">
      {/* İlan Ara */}
      <div>
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-primary">search</span>
          İLAN ARA
        </label>
        <div className="relative group">
          <input
            type="text"
            placeholder="İlan adı, marka veya model..."
            value={filters.query || ''}
            onChange={(e) => handleInputChange('query', e.target.value)}
            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-700 rounded-2xl text-sm font-semibold transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Kategori */}
      <div>
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-primary">sell</span>
          KATEGORİ
        </label>
        <div className="relative">
          <select
            value={filters.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value || undefined)}
            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-700 rounded-2xl text-sm font-semibold transition-all outline-none appearance-none cursor-pointer text-slate-900 dark:text-white"
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
      <div>
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-primary">location_on</span>
          LOKASYON
        </label>
        <div className="space-y-3">
          <div className="relative">
            <select
              value={filters.city || ''}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-700 rounded-2xl text-sm font-semibold transition-all outline-none appearance-none cursor-pointer text-slate-900 dark:text-white"
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
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative">
                <select
                  value={filters.district || ''}
                  onChange={(e) => handleInputChange('district', e.target.value || undefined)}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-700 rounded-2xl text-sm font-semibold transition-all outline-none appearance-none cursor-pointer text-slate-900 dark:text-white"
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
      <div>
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-primary">payments</span>
          FİYAT ARALIĞI
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => handleInputChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-700 rounded-2xl text-xs font-bold transition-all outline-none text-slate-900 dark:text-white"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => handleInputChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-700 rounded-2xl text-xs font-bold transition-all outline-none text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Sıralama */}
      <div>
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-primary">sort</span>
          SIRALAMA
        </label>
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => handleInputChange('sortBy', e.target.value as any)}
            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-700 rounded-2xl text-sm font-semibold transition-all outline-none appearance-none cursor-pointer text-slate-900 dark:text-white"
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

      <div className="hidden lg:block sticky top-24 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl shadow-primary/5">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tighter">
            <span className="material-symbols-outlined text-primary">filter_alt</span>
            FİLTRELER
          </h3>
          <button onClick={clearFilters} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
            TEMİZLE
          </button>
        </div>
        {renderFilters()}
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
