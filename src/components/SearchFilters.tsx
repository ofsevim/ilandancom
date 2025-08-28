import React from 'react';
import { Filter } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../types';
import { useCities } from '../hooks/useCities';
import { useDistricts } from '../hooks/useDistricts';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onFiltersChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { cities } = useCities();
  const selectedCityId = React.useMemo(() => {
    const city = cities.find((c: any) => c.name === filters.city);
    return city?.id as string | undefined;
  }, [cities, filters.city]);
  const { districts } = useDistricts(selectedCityId);

  const handleFilterChange = (key: keyof SearchFiltersType, value: any) => {
    // Şehir değişince ilçe filtresini sıfırla
    if (key === 'city') {
      onFiltersChange({ ...filters, city: value, district: undefined });
      return;
    }
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      sortBy: 'newest',
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => 
    key !== 'sortBy' && value !== undefined && value !== ''
  ).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-xs"
        >
          <Filter size={16} />
          <span className="font-medium">Filtreler</span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white px-1 py-0 rounded-full text-[9px]">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-red-500 hover:text-red-600 text-[11px] font-medium"
          >
            Temizle
          </button>
        )}
      </div>

      {/* Filters Content */}
      {isOpen && (
        <div className="p-2 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
            {/* Category */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kategori
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="w-full px-2 py-1 h-8 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Tüm Kategoriler</option>
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                Şehir
              </label>
              <select
                value={filters.city || ''}
                onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
                className="w-full px-2 py-1 h-8 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Tüm Şehirler</option>
                {cities.map((c: any) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                İlçe
              </label>
              <select
                value={filters.district || ''}
                onChange={(e) => handleFilterChange('district', e.target.value || undefined)}
                className="w-full px-2 py-1 h-8 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={!selectedCityId}
              >
                <option value="">Tüm İlçeler</option>
                {districts.map((d: any) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Fiyat (₺)
              </label>
              <input
                type="number"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-2 py-1 h-8 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Fiyat (₺)
              </label>
              <input
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-2 py-1 h-8 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="∞"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sıralama
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
              className="w-full md:w-auto px-2 py-1 h-8 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="newest">En Yeni</option>
              <option value="oldest">En Eski</option>
              <option value="price_low">Fiyat (Düşük-Yüksek)</option>
              <option value="price_high">Fiyat (Yüksek-Düşük)</option>
              <option value="most_viewed">En Çok Görüntülenen</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;