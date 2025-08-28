import { useState, useEffect } from 'react';
import { Ad, SearchFilters } from '../types';
import { adService, categoryService } from '../services/api';

export const useAds = (filters?: SearchFilters) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, categories] = await Promise.all([
        adService.getAllAds(filters),
        categoryService.getAllCategories().catch(() => [] as any[])
      ]);

      const categoryById: Record<string, any> = {};
      (categories || []).forEach((c: any) => { if (c?.id) categoryById[c.id] = c; });
      
      // Transform data to match our Ad interface (null join'lara dayanıklı)
      const transformedAds: Ad[] = (data || []).map((item: any) => ({
        id: item?.id ?? '',
        title: item.title,
        description: item.description,
        price: item.price,
        category: {
          id: item?.categories?.id ?? item?.category_id ?? 'unknown',
          name: item?.categories?.name ?? categoryById[item?.category_id]?.name ?? 'Diğer',
          slug: item?.categories?.slug ?? categoryById[item?.category_id]?.slug ?? 'diger',
          icon: item?.categories?.icon ?? categoryById[item?.category_id]?.icon ?? 'tag'
        },
        location: {
          city: item.city ?? '',
          district: item.district ?? '',
          coordinates: item.latitude && item.longitude ? {
            lat: item.latitude,
            lng: item.longitude
          } : undefined
        },
        images: Array.isArray(item.images) ? item.images : [],
        userId: item.user_id ?? '',
        user: {
          id: item?.users?.id ?? item.user_id ?? 'unknown',
          email: item?.users?.email ?? '',
          name: item?.users?.name ?? 'Gizli Kullanıcı',
          phone: item?.users?.phone ?? '',
          avatar: item?.users?.avatar ?? '',
          role: item?.users?.role ?? 'user',
          createdAt: item?.users?.created_at ?? item.created_at ?? new Date().toISOString(),
          isActive: item?.users?.is_active ?? true
        },
        status: item.status,
        createdAt: item.created_at ?? new Date().toISOString(),
        updatedAt: item.updated_at ?? item.created_at ?? new Date().toISOString(),
        viewCount: item.view_count ?? 0,
        featured: item.featured ?? false
      }))
      .filter((ad: Ad) => !!ad && !!ad.id);
      
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
