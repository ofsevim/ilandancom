import React, { useState, useMemo } from 'react';
import { SearchFilters } from '../types';
import { useCategories } from '../hooks/useCategories';
import { useCities } from '../hooks/useCities';
import { useDistricts } from '../hooks/useDistricts';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const inputBase =
  'w-full px-4 py-3.5 bg-[#111d35] border border-[rgba(192,192,192,0.08)] rounded-xl text-[#f1f3f5] text-sm placeholder-[#6c7a89] transition-all outline-none focus:border-[#3b82f6]/40 focus:ring-1 focus:ring-[#3b82f6]/20';

const selectBase =
  'w-full px-4 py-3.5 bg-[#111d35] border border-[rgba(192,192,192,0.08)] rounded-xl text-[#f1f3f5] text-sm appearance-none cursor-pointer transition-all outline-none focus:border-[#3b82f6]/40 focus:ring-1 focus:ring-[#3b82f6]/20';

const sectionLabel =
  'mb-3 block flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#8899aa]';

const chevronIcon =
  'material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6c7a89] text-[20px]';

const SidebarFilters: React.FC<SidebarFiltersProps> = ({ filters, onFiltersChange }) => {
  const { categories } = useCategories();
  const { cities } = useCities();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const cityId = useMemo(
    () => (filters.city ? cities.find((c) => c.name === filters.city)?.id : undefined),
    [filters.city, cities]
  );

  const { districts } = useDistricts(cityId);

  const handleInputChange = (name: keyof SearchFilters, value: unknown) => {
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
      <div className="pb-4">
        <label className={sectionLabel}>
          <span className="material-symbols-outlined text-[#3b82f6] text-[18px]">search</span>
          İlan Ara
        </label>
        <input
          type="text"
          placeholder="Kelime veya ilan no..."
          value={filters.query || ''}
          onChange={(e) => handleInputChange('query', e.target.value)}
          className={inputBase}
        />
      </div>

      {/* Kategori */}
      <div className="pb-4">
        <label className={sectionLabel}>
          <span className="material-symbols-outlined text-[#3b82f6] text-[18px]">category</span>
          Kategori
        </label>
        <div className="relative">
          <select
            value={filters.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value || undefined)}
            className={selectBase}
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <span className={chevronIcon}>expand_more</span>
        </div>
      </div>

      {/* Lokasyon */}
      <div className="pb-4">
        <label className={sectionLabel}>
          <span className="material-symbols-outlined text-[#3b82f6] text-[18px]">location_on</span>
          Lokasyon
        </label>
        <div className="space-y-3">
          <div className="relative">
            <select
              value={filters.city || ''}
              onChange={(e) => handleCityChange(e.target.value)}
              className={selectBase}
            >
              <option value="">Tüm Şehirler</option>
              {cities.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className={chevronIcon}>expand_more</span>
          </div>

          <AnimatePresence>
            {filters.city && districts && districts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative mt-3"
              >
                <select
                  value={filters.district || ''}
                  onChange={(e) => handleInputChange('district', e.target.value || undefined)}
                  className={selectBase}
                >
                  <option value="">İlçe Seçin</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <span className={chevronIcon}>expand_more</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fiyat Aralığı */}
      <div className="pb-4">
        <label className={sectionLabel}>
          <span className="material-symbols-outlined text-[#3b82f6] text-[18px]">payments</span>
          Fiyat Aralığı
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min ₺"
            value={filters.minPrice || ''}
            onChange={(e) =>
              handleInputChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            className={inputBase}
          />
          <input
            type="number"
            placeholder="Max ₺"
            value={filters.maxPrice || ''}
            onChange={(e) =>
              handleInputChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            className={inputBase}
          />
        </div>
      </div>

      {/* Sıralama */}
      <div className="pb-2">
        <label className={sectionLabel}>
          <span className="material-symbols-outlined text-[#3b82f6] text-[18px]">sort</span>
          Sıralama
        </label>
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => handleInputChange('sortBy', e.target.value as SearchFilters['sortBy'])}
            className={selectBase}
          >
            <option value="newest">En Yeni İlanlar</option>
            <option value="oldest">En Eski İlanlar</option>
            <option value="price_low">Fiyat (Düşükten Yükseğe)</option>
            <option value="price_high">Fiyat (Yüksekten Düşüğe)</option>
            <option value="most_viewed">En Çok Görüntülenen</option>
          </select>
          <span className={chevronIcon}>expand_more</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="w-full bg-[#1a2540] text-[#f1f3f5] py-4 px-6 rounded-2xl transition-all flex items-center justify-center font-bold text-xs uppercase tracking-widest border border-[rgba(192,192,192,0.08)] active:scale-[0.98]"
        >
          <span className="material-symbols-outlined mr-2 text-[18px]">filter_list</span>
          Filtrelemeyi Düzenle
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-[320px] shrink-0">
        <div className="bg-[#0a1628] border border-[rgba(192,192,192,0.08)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(192,192,192,0.08)]">
            <h3 className="text-sm font-bold text-[#f1f3f5] uppercase tracking-wider">Filtreler</h3>
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-[#6c7a89] hover:text-[#3b82f6] transition-colors"
            >
              Temizle
            </button>
          </div>
          {renderFilters()}
        </div>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0a1628]/90 backdrop-blur-xl z-[100] flex items-end justify-center p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#0a1628] border border-[rgba(192,192,192,0.08)] w-full rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-[rgba(192,192,192,0.08)]">
                <h3 className="text-sm font-bold text-[#f1f3f5] uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#3b82f6] text-[20px]">filter_list</span>
                  Filtrele
                </h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-10 h-10 rounded-full bg-[#1a2540] flex items-center justify-center text-[#8899aa] hover:text-[#f1f3f5] transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6 pb-32 overflow-y-auto flex-1">
                {renderFilters()}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a1628] via-[#0a1628] to-transparent flex gap-3">
                  <button
                    onClick={clearFilters}
                    className="flex-1 py-4 bg-[#1a2540] text-[#8899aa] rounded-2xl font-bold text-xs uppercase tracking-widest border border-[rgba(192,192,192,0.08)] hover:text-[#f1f3f5] transition-colors"
                  >
                    Temizle
                  </button>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="flex-[2] py-4 bg-[#3b82f6] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#3b82f6]/90 transition-colors"
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
