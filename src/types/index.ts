export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  location: {
    city: string;
    district: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  userId: string;
  user: User;
  status: 'pending' | 'active' | 'sold' | 'rejected';
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  featured: boolean;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  district?: string;
  sortBy: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'most_viewed';
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  favorites: string[];
  toggleFavorite: (adId: string) => Promise<void>;
  loading: boolean;
}