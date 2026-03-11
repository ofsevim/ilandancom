import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Ad, Category } from '../types';
import { adService, categoryService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Fallback categories for initial load or errors
export const fallbackCategories = [
  { id: 'emlak', name: 'Emlak', icon: 'Home' },
  { id: 'vasita', name: 'Vasıta', icon: 'Car' },
  { id: 'elektronik', name: 'Elektronik', icon: 'Smartphone' },
  { id: 'ikinci-el', name: 'İkinci El', icon: 'ShoppingBag' },
  { id: 'is-ilanlari', name: 'İş İlanları', icon: 'Briefcase' },
  { id: 'hizmetler', name: 'Hizmetler', icon: 'Wrench' },
  { id: 'hobiler', name: 'Hobiler', icon: 'TreePine' },
  { id: 'topluluk', name: 'Topluluk', icon: 'Users' },
];

interface ListingContextType {
  listings: Ad[];
  categories: Category[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  loading: boolean;
}

const ListingContext = createContext<ListingContextType | undefined>(undefined);

export const ListingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [listings, setListings] = useState<Ad[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { favorites, toggleFavorite } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [adsData, catData] = await Promise.all([
          adService.getAllAds(),
          categoryService.getAllCategories()
        ]);
        setListings(adsData);
        
        // Transform Supabase categories to our Category interface if necessary
        const transformedCats: Category[] = catData.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug || c.name.toLowerCase(),
          icon: c.icon || 'Home'
        }));
        
        setCategories(transformedCats.length > 0 ? transformedCats : (fallbackCategories as any));
      } catch (error) {
        console.error('Error fetching data in context:', error);
        setCategories(fallbackCategories as any);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ListingContext.Provider value={{
      listings,
      categories,
      favorites,
      toggleFavorite,
      loading
    }}>
      {children}
    </ListingContext.Provider>
  );
};

export const useListings = () => {
  const context = useContext(ListingContext);
  if (context === undefined) {
    throw new Error('useListings must be used within a ListingProvider');
  }
  return context;
};

// Backwards compatibility for the custom Listing type if needed
export type { Ad as Listing };
