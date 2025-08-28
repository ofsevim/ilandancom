import { supabase } from '../lib/supabase';
import { Ad, Category, User, SearchFilters } from '../types';

// Auth Services
export const authService = {
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
};

// User Services
export const userService = {
  async createUser(userData: Omit<User, 'id' | 'createdAt'> & { id?: string }) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: userData.id || undefined,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        avatar: userData.avatar,
        role: userData.role || 'user',
        created_at: new Date().toISOString(),
        is_active: true
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Category Services
export const categoryService = {
  async getAllCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getCategoryById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Ad Services
export const adService = {
  async getAllAds(filters?: SearchFilters) {
    let query = supabase
      .from('listings')
      .select(`*`)
      .eq('status', 'active');

    // Apply filters
    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters?.query) {
      query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'price_low':
        query = query.order('price', { ascending: true });
        break;
      case 'price_high':
        query = query.order('price', { ascending: false });
        break;
      case 'most_viewed':
        query = query.order('view_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async getAdById(id: string) {
    const { data, error } = await supabase
      .from('listings')
      .select(`*`)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createAd(adData: {
    title: string;
    description: string;
    price: number;
    categoryId: string;
    city: string;
    district: string;
    images: string[];
    userId: string;
  }) {
    const { data, error } = await supabase
      .from('ads')
      .insert([{
        title: adData.title,
        description: adData.description,
        price: adData.price,
        category_id: adData.categoryId,
        city: adData.city,
        district: adData.district,
        images: adData.images || [],
        user_id: adData.userId,
        status: 'active', // İlanı aktif olarak oluştur
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        view_count: 0,
        featured: false
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateAd(id: string, updates: Partial<Ad>) {
    const { data, error } = await supabase
      .from('ads')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteAd(id: string) {
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async incrementViewCount(id: string) {
    // Reklam engelleyicilerden kaçınmak için RPC kullan
    const { data, error } = await supabase.rpc('increment_view', { ad_id: id });
    if (error) {
      // Geriye dönük uyumluluk: RPC yoksa eski yöntemi dene (engelleyici bloklayabilir)
      const { data: currentAd, error: fetchError } = await supabase
        .from('ads')
        .select('view_count')
        .eq('id', id)
        .single();
      if (fetchError) throw fetchError;
      const { data: updated, error: updErr } = await supabase
        .from('ads')
        .update({ view_count: (currentAd.view_count || 0) + 1 })
        .eq('id', id)
        .select()
        .single();
      if (updErr) throw updErr;
      return updated;
    }
    return data;
  },

  async getUserAds(userId: string) {
    const { data, error } = await supabase
      .from('listings')
      .select(`*`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

// Favorite Services
export const favoriteService = {
  async getUserFavorites(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        ads (
          *,
          categories (*),
          users (*)
        )
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  },

  async addToFavorites(userId: string, adId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .insert([{
        user_id: userId,
        ad_id: adId
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async removeFromFavorites(userId: string, adId: string) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('ad_id', adId);
    
    if (error) throw error;
  },

  async isFavorite(userId: string, adId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('ad_id', adId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }
};

// Storage Services
export const storageService = {
  async uploadImage(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('ad-images')
      .upload(path, file);
    
    if (error) throw error;
    return data;
  },

  async getImageUrl(path: string) {
    const { data } = supabase.storage
      .from('ad-images')
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  async deleteImage(path: string) {
    const { error } = await supabase.storage
      .from('ad-images')
      .remove([path]);
    
    if (error) throw error;
  }
};

// Location Services
export const locationService = {
  async getCities() {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async getDistrictsByCity(cityId: string) {
    const { data, error } = await supabase
      .from('districts')
      .select('*')
      .eq('city_id', cityId)
      .order('name');
    if (error) throw error;
    return data || [];
  }
};
