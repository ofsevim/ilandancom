import React from 'react';
import { useCategories } from '../hooks/useCategories';
import { motion } from 'framer-motion';

interface CategoryGridProps {
  onCategorySelect: (categoryId: string) => void;
  selectedCategoryId?: string;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategorySelect, selectedCategoryId }) => {
  const { categories, loading, error } = useCategories();

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
          <div key={i} className="animate-pulse bg-[#111d35] rounded-full h-[72px] sm:h-[88px] border border-[rgba(192,192,192,0.06)]"></div>
        ))}
      </div>
    );
  }

  if (error) return null;

  return (
    <div className="mt-8">
      <div className="flex gap-4 overflow-x-auto pb-2 sm:overflow-visible sm:grid sm:grid-cols-4 lg:grid-cols-8 sm:gap-6 scrollbar-none snap-x snap-mandatory">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            whileHover={{ y: -4 }}
            className="flex flex-col items-center group cursor-pointer flex-shrink-0 snap-start min-w-[72px] sm:min-w-0"
          >
            <div className={`w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center transition-all duration-300 border
              ${selectedCategoryId === category.id 
                ? 'bg-[#3b82f6] text-[#f1f3f5] border-[#3b82f6] shadow-lg shadow-[#3b82f6]/20' 
                : 'bg-[#111d35] border-[rgba(192,192,192,0.08)] text-[#8899aa] group-hover:border-[#3b82f6]/50 group-hover:text-[#f1f3f5] group-hover:shadow-md group-hover:shadow-[#3b82f6]/10'}`}>
              <span className="material-symbols-outlined text-[22px] sm:text-[28px]">
                {getIcon(category.icon)}
              </span>
            </div>
            <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-colors mt-2 sm:mt-3 text-center px-1 leading-tight w-16 sm:w-auto
              ${selectedCategoryId === category.id ? 'text-[#3b82f6]' : 'text-[#6c7a89] group-hover:text-[#f1f3f5]'}`}>
              {category.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
