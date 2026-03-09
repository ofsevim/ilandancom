import React, { useState } from 'react';
import { Search, Filter, MapPin, Tag, DollarSign, SortAsc, X } from 'lucide-react';
import { SearchFilters } from '../types';
import { useCategories } from '../hooks/useCategories';
import { useCities } from '../hooks/useCities';
import { useDistricts } from '../hooks/useDistricts';

interface SidebarFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

import { motion, AnimatePresence } from 'framer-motion';

const SidebarFilters: React.FC<SidebarFiltersProps> = ({ filters, onFiltersChange }) => {
  const { categories } = useCategories();
  const { cities } = useCities();
  const { districts } = useDistricts(filters.city);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const handleInputChange = (name: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [name]: value
    });
  };

  const handleCityChange = (city: string) => {
    onFiltersChange({
      ...filters,
      city,
      district: undefined
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      sortBy: 'newest'
    });
  };

  const renderFilters = () => (
    <div className="flex flex-col">
      {/* Kategori */}
      <div className="filter-section relative">
        <label className="dark-section-title flex items-center gap-2 text-[12px] uppercase tracking-widest mb-2.5">
          <Tag size={15} className="text-indigo-500" />
          Kategori
        </label>
        <div className="relative">
          <select
            value={filters.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value || undefined)}
            className="dark-filter-select w-full px-3.5 py-3 rounded-xl text-[14px] font-medium transition-all duration-300 cursor-pointer appearance-none"
          >
            <option value="" className="bg-white dark:bg-primary-900">Tümü</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id} className="bg-white dark:bg-primary-900">
                {category.name}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary-400">
            <SortAsc size={14} className="rotate-90" />
          </div>
        </div>
      </div>

      {/* Arama */}
      <div className="filter-section relative">
        <label className="dark-section-title flex items-center gap-2 text-[12px] uppercase tracking-widest mb-2.5">
          <Search size={15} className="text-indigo-500" />
          Arama
        </label>
        <div className="relative group">
          <input
            type="text"
            placeholder="Anahtar kelime..."
            value={filters.query || ''}
            onChange={(e) => handleInputChange('query', e.target.value)}
            className="dark-filter-input w-full px-3.5 py-3 rounded-xl text-[14px] font-medium transition-all duration-300"
          />
        </div>
      </div>

      {/* Lokasyon */}
      <div className="filter-section relative">
        <label className="dark-section-title flex items-center gap-2 text-[12px] uppercase tracking-widest mb-2.5">
          <MapPin size={15} className="text-indigo-500" />
          Lokasyon
        </label>

        <div className="space-y-3">
          <div className="relative">
            <select
              value={filters.city || ''}
              onChange={(e) => handleCityChange(e.target.value)}
              className="dark-filter-select w-full px-3.5 py-3 rounded-xl text-[14px] font-medium transition-all duration-300 cursor-pointer appearance-none"
            >
              <option value="" className="bg-white dark:bg-primary-900">Şehir seçin</option>
              {cities.map((city) => (
                <option key={city.id} value={city.name} className="bg-white dark:bg-primary-900">
                  {city.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary-400">
              <SortAsc size={14} className="rotate-90" />
            </div>
          </div>

          <AnimatePresence>
            {filters.city && districts && districts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative"
              >
                <select
                  value={filters.district || ''}
                  onChange={(e) => handleInputChange('district', e.target.value || undefined)}
                  className="dark-filter-select w-full px-3.5 py-3 rounded-xl text-[14px] font-medium transition-all duration-300 cursor-pointer appearance-none"
                >
                  <option value="" className="bg-white dark:bg-primary-900">İlçe seçin</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.name} className="bg-white dark:bg-primary-900">
                      {district.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary-400">
                  <SortAsc size={14} className="rotate-90" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fiyat Aralığı */}
      <div className="filter-section relative">
        <label className="dark-section-title flex items-center gap-2 text-[12px] uppercase tracking-widest mb-2.5">
          <DollarSign size={15} className="text-indigo-500" />
          Fiyat Aralığı
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => handleInputChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="dark-filter-input w-full px-3.5 py-3 rounded-xl text-[14px] font-medium transition-all"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => handleInputChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="dark-filter-input w-full px-3.5 py-3 rounded-xl text-[14px] font-medium transition-all"
          />
        </div>
      </div>

      {/* Sıralama */}
      <div className="filter-section">
        <label className="dark-section-title flex items-center gap-2 text-[12px] uppercase tracking-widest mb-2.5">
          <SortAsc size={15} className="text-indigo-500" />
          Sıralama
        </label>
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => handleInputChange('sortBy', e.target.value as any)}
            className="dark-filter-select w-full px-3.5 py-3 rounded-xl text-[14px] font-medium transition-all duration-300 appearance-none cursor-pointer"
          >
            <option value="newest" className="bg-white dark:bg-primary-900">En Yeni</option>
            <option value="oldest" className="bg-white dark:bg-primary-900">En Eski</option>
            <option value="price_low" className="bg-white dark:bg-primary-900">Fiyat (Artan)</option>
            <option value="price_high" className="bg-white dark:bg-primary-900">Fiyat (Azalan)</option>
            <option value="most_viewed" className="bg-white dark:bg-primary-900">En Popüler</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary-400">
            <SortAsc size={14} className="rotate-90" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="w-full bg-primary-900 dark:bg-accent-premium text-white py-4 px-6 rounded-2xl transition-all flex items-center justify-center font-bold shadow-premium active:scale-95"
        >
          <Filter size={20} className="mr-2" />
          Filtreleri Düzenle
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-full premium-sidebar-bg p-6 pb-8">

        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Filter size={20} className="text-indigo-500" />
            Filtreler
          </h3>
          <button
            onClick={clearFilters}
            className="clear-btn text-[10px] font-bold uppercase tracking-widest"
          >
            Temizle
          </button>
        </div>

        {renderFilters()}
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary-950/80 backdrop-blur-md flex items-end justify-center z-50 lg:hidden"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="premium-sidebar-bg w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-primary-100 dark:border-primary-800">
                <h3 className="text-lg font-black text-primary-950 dark:text-white flex items-center">
                  <Filter size={20} className="mr-3 text-accent-premium" />
                  Filtreler
                </h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-8 h-8 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center text-primary-500 hover:text-primary-900 dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Filters Content */}
              <div className="p-5 pb-32">
                {renderFilters()}

                {/* Mobile Actions */}
                <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white dark:from-primary-900 via-white dark:via-primary-900 to-transparent flex space-x-3">
                  <button
                    onClick={clearFilters}
                    className="flex-1 px-4 py-3 bg-primary-100 dark:bg-primary-800 text-primary-900 dark:text-white rounded-xl font-bold transition-all text-sm"
                  >
                    Temizle
                  </button>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="flex-[2] bg-primary-900 dark:bg-accent-premium text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md transition-all"
                  >
                    Uygula
                  </button>
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
