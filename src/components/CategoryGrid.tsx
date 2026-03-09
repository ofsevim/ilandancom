import React from 'react';
import { Home, Car, ShoppingBag, Briefcase, Wrench, Smartphone, TreePine, Users } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { motion } from 'framer-motion';

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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse bg-primary-100 dark:bg-primary-800/50 rounded-3xl h-28"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
        <p className="text-red-600 dark:text-red-400 font-bold uppercase tracking-[0.2em] text-[10px]">Kategoriler yüklenemedi</p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04
      }
    }
  };

  const item: any = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6"
    >
      {categories.map((category) => {
        const IconComponent = getIcon(category.icon);
        const isSelected = selectedCategoryId === category.id;
        return (
          <motion.div
            variants={item}
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className="flex flex-col items-center gap-4 group cursor-pointer"
          >
            {/* Premium Category Icon Box */}
            <div
              className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center transition-all duration-500 relative
                ${isSelected
                  ? 'bg-neon-indigo text-white shadow-xl shadow-indigo-600/30 scale-105 ring-2 ring-white/20'
                  : 'glass-premium text-primary-500 dark:text-primary-400 group-hover:bg-white/10 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-indigo-600/20 group-active:scale-95'
                }`}
            >
              <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 ${isSelected ? 'hidden' : ''}`}></div>
              <IconComponent size={28} className={`transition-all duration-500 ${isSelected ? 'scale-110' : 'group-hover:text-indigo-500 group-hover:scale-110'}`} />
            </div>

            {/* Label */}
            <span
              className={`text-[13px] font-bold text-center leading-tight transition-all duration-300 uppercase tracking-widest
                ${isSelected
                  ? 'text-indigo-600 dark:text-indigo-400 scale-105'
                  : 'text-primary-500 dark:text-primary-400 group-hover:text-primary-900 dark:group-hover:text-white'
                }`}
            >
              {category.name}
            </span>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default CategoryGrid;
