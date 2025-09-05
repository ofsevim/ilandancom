import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ve Anon Key gerekli!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'ilandan-web',
      'User-Agent': 'Mozilla/5.0 (compatible; ilandan-bot/1.0)',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  },
  db: {
    schema: 'public'
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone?: string;
          avatar?: string;
          role: 'user' | 'admin';
          created_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          phone?: string;
          avatar?: string;
          role?: 'user' | 'admin';
          created_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string;
          avatar?: string;
          role?: 'user' | 'admin';
          created_at?: string;
          is_active?: boolean;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string;
          created_at?: string;
        };
      };
      ads: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          category_id: string;
          city: string;
          district: string;
          latitude?: number;
          longitude?: number;
          images: string[];
          user_id: string;
          status: 'pending' | 'active' | 'sold' | 'rejected';
          created_at: string;
          updated_at: string;
          view_count: number;
          featured: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: number;
          category_id: string;
          city: string;
          district: string;
          latitude?: number;
          longitude?: number;
          images?: string[];
          user_id: string;
          status?: 'pending' | 'active' | 'sold' | 'rejected';
          created_at?: string;
          updated_at?: string;
          view_count?: number;
          featured?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: number;
          category_id?: string;
          city?: string;
          district?: string;
          latitude?: number;
          longitude?: number;
          images?: string[];
          user_id?: string;
          status?: 'pending' | 'active' | 'sold' | 'rejected';
          created_at?: string;
          updated_at?: string;
          view_count?: number;
          featured?: boolean;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          ad_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ad_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ad_id?: string;
          created_at?: string;
        };
      };
    };
  };
}
