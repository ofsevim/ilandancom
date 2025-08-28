import { useState, useEffect } from 'react';
import { Ad, SearchFilters } from '../types';
import { adService } from '../services/api';

export const useAds = (filters?: SearchFilters) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adService.getAllAds(filters);
      
      // Transform data to match our Ad interface
      const transformedAds: Ad[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        category: {
          id: item.categories.id,
          name: item.categories.name,
          slug: item.categories.slug,
          icon: item.categories.icon
        },
        location: {
          city: item.city,
          district: item.district,
          coordinates: item.latitude && item.longitude ? {
            lat: item.latitude,
            lng: item.longitude
          } : undefined
        },
        images: item.images || [],
        userId: item.user_id,
        user: {
          id: item.users.id,
          email: item.users.email,
          name: item.users.name,
          phone: item.users.phone,
          avatar: item.users.avatar,
          role: item.users.role,
          createdAt: item.users.created_at,
          isActive: item.users.is_active
        },
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        viewCount: item.view_count,
        featured: item.featured
      }));
      
      setAds(transformedAds);
    } catch (err: any) {
      setError(err.message || 'İlanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [filters]);

  const refreshAds = () => {
    fetchAds();
  };

  return { ads, loading, error, refreshAds };
};
