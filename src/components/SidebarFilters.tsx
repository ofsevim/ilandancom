import React from 'react';
import { Search, Filter, MapPin, Tag, DollarSign, SortAsc } from 'lucide-react';
import { SearchFilters } from '../types';
import { useCategories } from '../hooks/useCategories';
import { useCities } from '../hooks/useCities';
import { useDistricts } from '../hooks/useDistricts';

interface SidebarFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({ filters, onFiltersChange }) => {
  const { categories } = useCategories();
  const { cities } = useCities();
  const { districts } = useDistricts(filters.city);

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
      district: undefined // Şehir değişince ilçeyi sıfırla
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      sortBy: 'newest'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Filter size={20} className="mr-2" />
          Filtreler
        </h3>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          Temizle
        </button>
      </div>

      <div className="space-y-6">
        {/* Arama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Search size={16} className="inline mr-2" />
            Arama
          </label>
          <input
            type="text"
            placeholder="Anahtar kelime..."
            value={filters.query || ''}
            onChange={(e) => handleInputChange('query', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Tag size={16} className="inline mr-2" />
            Kategori
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tümü</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Lokasyon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin size={16} className="inline mr-2" />
            Lokasyon
          </label>
          
          {/* Şehir */}
          <select
            value={filters.city || ''}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-2"
          >
            <option value="">Şehir seçin</option>
            {cities.map((city) => (
              <option key={city.id} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>

          {/* İlçe */}
          {filters.city && districts && districts.length > 0 && (
            <select
              value={filters.district || ''}
              onChange={(e) => handleInputChange('district', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">İlçe seçin</option>
              {districts.map((district) => (
                <option key={district.id} value={district.name}>
                  {district.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Fiyat Aralığı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <DollarSign size={16} className="inline mr-2" />
            Fiyat Aralığı
          </label>
          <div className="space-y-3">
            <input
              type="number"
              placeholder="Min fiyat"
              value={filters.minPrice || ''}
              onChange={(e) => handleInputChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <input
              type="number"
              placeholder="Max fiyat"
              value={filters.maxPrice || ''}
              onChange={(e) => handleInputChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Sıralama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <SortAsc size={16} className="inline mr-2" />
            Sıralama
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleInputChange('sortBy', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="newest">En Yeni</option>
            <option value="oldest">En Eski</option>
            <option value="price_low">Fiyat (Düşük → Yüksek)</option>
            <option value="price_high">Fiyat (Yüksek → Düşük)</option>
            <option value="most_viewed">En Çok Görüntülenen</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SidebarFilters;
