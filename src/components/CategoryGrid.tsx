import React from 'react';
import { useCategories } from '../hooks/useCategories';
import { motion } from 'framer-motion';

interface CategoryGridProps {
  onCategorySelect: (categoryId: string) => void;
  selectedCategoryId?: string;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategorySelect, selectedCategoryId }) => {
  const { categories, loading, error } = useCategories();

  // Material Symbols matching
  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      'Home': 'home_work',
      'Car': 'directions_car',
      'ShoppingBag': 'shopping_bag',
      'Briefcase': 'work',
      'Wrench': 'build',
      'Smartphone': 'smartphone',
      'TreePine': 'forest',
      'Users': 'groups'
    };
    return iconMap[iconName] || 'category';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-50 dark:bg-slate-800/50 rounded-3xl h-32 border border-slate-100 dark:border-slate-800"></div>
        ))}
      </div>
    );
  }

  if (error) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            whileHover={{ y: -4 }}
            className="flex flex-col items-center gap-2 group cursor-pointer shrink-0"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-sm border
              ${selectedCategoryId === category.id 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 group-hover:border-primary group-hover:text-primary'}`}>
              <span className="material-symbols-outlined text-2xl">
                {getIcon(category.icon)}
              </span>
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors
              ${selectedCategoryId === category.id ? 'text-primary' : 'text-slate-500 dark:text-slate-400 group-hover:text-primary'}`}>
              {category.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
