import React from 'react';
import { Home, Car, ShoppingBag, Briefcase, Wrench, Smartphone, TreePine, Users } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

interface CategoryGridProps {
  onCategorySelect: (categoryId: string) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategorySelect }) => {
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
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {categories.map((category) => {
        const IconComponent = getIcon(category.icon);
        return (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
          >
            <IconComponent 
              size={32} 
              className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2 transition-colors" 
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryGrid;