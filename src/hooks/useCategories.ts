import { useState, useEffect } from 'react';
import { Category } from '../types';
import { categoryService } from '../services/api';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAllCategories();
      
      // Transform data to match our Category interface
      const transformedCategories: Category[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        icon: item.icon
      }));
      
      setCategories(transformedCategories);
    } catch (err: any) {
      setError(err.message || 'Kategoriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, error };
};
