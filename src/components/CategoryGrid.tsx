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
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            whileHover={{ y: -4 }}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className={`w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border
              ${selectedCategoryId === category.id 
                ? 'bg-neon-indigo text-white border-primary-500 shadow-lg shadow-primary-500/20' 
                : 'bg-white dark:bg-[#12142d] border-primary-100 dark:border-primary-800/30 text-slate-600 dark:text-slate-300 group-hover:border-primary-400 group-hover:text-primary-500'}`}>
              <span className="material-symbols-outlined text-[28px]">
                {getIcon(category.icon)}
              </span>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors mt-3 text-center px-1
              ${selectedCategoryId === category.id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-primary-500'}`}>
              {category.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
