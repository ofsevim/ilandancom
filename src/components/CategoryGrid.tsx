import React from 'react';
import { Home, Car, ShoppingBag, Briefcase, Wrench, Smartphone, TreePine, Users } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

interface CategoryGridProps {
  onCategorySelect: (categoryId: string) => void;
  selectedCategoryId?: string;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategorySelect, selectedCategoryId }) => {
  const { categories, loading, error } = useCategories();

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      Home,
      Car,
      ShoppingBag,
      Briefcase,
      Wrench,
      Smartphone,
      TreePine,
      Users
    };
    return icons[iconName] || Home;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 h-24"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Kategoriler yüklenirken hata oluştu</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {categories.map((category) => {
        const IconComponent = getIcon(category.icon);
        const isSelected = selectedCategoryId === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 group transform hover:scale-105 ${
              isSelected 
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-500 dark:border-blue-400 shadow-lg scale-105' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl'
            }`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-all ${
              isSelected
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg'
                : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 group-hover:from-blue-500 group-hover:to-indigo-600'
            }`}>
              <IconComponent 
                size={28} 
                className={`transition-colors ${
                  isSelected 
                    ? 'text-white' 
                    : 'text-gray-600 dark:text-gray-300 group-hover:text-white'
                }`}
              />
            </div>
            <span className={`text-xs font-semibold text-center leading-tight ${
              isSelected 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryGrid;