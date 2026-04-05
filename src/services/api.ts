import { supabase } from '../lib/supabase';
import { User, SearchFilters } from '../types';

// Auth Services
export const authService = {
  async signUp(email: string, password: string, name: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
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

// Public User Service (read-only limited fields for public visibility)
export const publicUserService = {
  async getPublicUserById(id: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, avatar, phone, email, role, created_at, is_active')
        .eq('id', id)
        .single();

      if (error) {
        console.warn('User fetch error:', error);
        return { id, name: 'Bilinmeyen Kullanıcı', avatar: null, phone: null, email: null, role: 'user', created_at: new Date().toISOString(), is_active: true };
      }

      return data;
    } catch (error) {
      console.warn('User service error:', error);
      return { id, name: 'Bilinmeyen Kullanıcı', avatar: null, phone: null, email: null, role: 'user', created_at: new Date().toISOString(), is_active: true };
    }
  }
};

// Ad Transformer
const transformAd = (item: any): any => {
  if (!item) return null;
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    price: item.price,
    category: item.categories ? {
      id: item.categories.id,
      name: item.categories.name,
      slug: item.categories.slug,
      icon: item.categories.icon
    } : {
      id: item.category_id,
      name: 'Genel',
      slug: 'genel',
      icon: 'tag'
    },
    location: {
      city: item.city || 'Bilinmeyen',
      district: item.district || 'Konum',
      coordinates: item.latitude && item.longitude ? {
        lat: item.latitude,
        lng: item.longitude
      } : undefined
    },
    images: item.images || [],
    userId: item.user_id,
    user: item.users ? {
      id: item.users.id,
      email: item.users.email,
      name: item.users.name,
      phone: item.users.phone,
      avatar: item.users.avatar,
      role: item.users.role,
      createdAt: item.users.created_at,
      isActive: item.users.is_active
    } : undefined,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    viewCount: item.view_count || 0,
    featured: item.featured || false
  };
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
      .from('ads')
      .select(`
        *,
        categories (id, name, slug, icon),
        users (id, name, email, phone, avatar, role, created_at, is_active)
      `)
      .eq('status', 'active');

    // Apply filters
    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }

    if (filters?.district) {
      query = query.eq('district', filters.district);
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
    return (data || []).map(transformAd);
  },

  async getAdById(id: string) {
    const { data, error } = await supabase
      .from('ads')
      .select(`
        *,
        categories (id, name, slug, icon),
        users (id, name, email, phone, avatar, role, created_at, is_active)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    
    return transformAd(data);
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
    try {
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
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          view_count: 0,
          featured: false
        }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Create ad error:', error);
      throw error;
    }
  },

  async updateAd(id: string, updates: {
    status?: 'pending' | 'active' | 'sold' | 'rejected';
    title?: string;
    description?: string;
    price?: number;
    categoryId?: string;
    city?: string;
    district?: string;
    images?: string[];
  }) {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
      if (updates.city !== undefined) updateData.city = updates.city;
      if (updates.district !== undefined) updateData.district = updates.district;
      if (updates.images !== undefined) updateData.images = updates.images;

      const { error } = await supabase
        .from('ads')
        .update(updateData)
        .eq('id', id);

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error('Update ad error:', error);
      throw error;
    }
  },

  async deleteAd(id: string) {
    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error('Delete ad error:', error);
      throw error;
    }
  },

  async incrementViewCount(id: string) {
    try {
      // RPC fonksiyonu kullan (en güvenli yöntem)
      const { error } = await supabase.rpc('increment_view', { ad_id: id });

      if (error) {
        console.warn('View count RPC error:', error);
        // Fallback: mevcut view_count'u al ve 1 artır
        const { data: currentAd } = await supabase
          .from('ads')
          .select('view_count')
          .eq('id', id)
          .single();

        const newViewCount = (currentAd?.view_count || 0) + 1;

        const { error: updErr } = await supabase
          .from('ads')
          .update({ view_count: newViewCount })
          .eq('id', id);

        if (updErr) {
          console.warn('View count update error:', updErr);
        }
      }
    } catch (error) {
      console.warn('View count increment failed:', error);
      // Hata durumunda sessizce devam et
    }
  },

  async getUserAds(userId: string) {
    const { data, error } = await supabase
      .from('ads')
      .select(`
        *,
        categories (id, name, slug, icon),
        users (id, name, email, phone, avatar, role, created_at, is_active)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(transformAd);
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

  async getImageUrl(path: string, transform?: { width?: number; height?: number; quality?: number }) {
    const { data } = supabase.storage
      .from('ad-images')
      .getPublicUrl(path, {
        transform: transform ? {
          width: transform.width,
          height: transform.height,
          quality: transform.quality
        } : undefined
      });

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

// Message Services
export const messageService = {
  async sendMessage(params: { receiverId: string; adId?: string | null; content: string }) {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          receiver_id: params.receiverId,
          ad_id: params.adId || null,
          content: params.content,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getConversation(otherUserId: string, adId?: string | null) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
      .order('created_at', { ascending: true });

    if (adId) {
      query = query.eq('ad_id', adId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Filter by local hidden timestamp
    const hidden = JSON.parse(localStorage.getItem('hidden_conversations') || '{}');
    const key = `${adId || 'null'}-${otherUserId}`;
    const hiddenAt = hidden[key];

    if (hiddenAt) {
      return (data || []).filter((m: any) => new Date(m.created_at) > new Date(hiddenAt));
    }

    return data || [];
  },

  async listConversations() {
    const { data: me } = await supabase.auth.getUser();
    const myId = me.user?.id;
    if (!myId) return [];

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const hidden = JSON.parse(localStorage.getItem('hidden_conversations') || '{}');
    const map: Record<string, any> = {};
    (data || []).forEach((m: any) => {
      const otherId = m.sender_id === myId ? m.receiver_id : m.sender_id;
      const key = `${m.ad_id || 'null'}-${otherId}`;
      const hiddenAt = hidden[key];
      
      // If conversation is hidden and message is older/equal to hide time, skip
      if (hiddenAt && new Date(m.created_at) <= new Date(hiddenAt)) return;

      if (!map[otherId]) map[otherId] = { otherUserId: otherId, lastMessage: m, adId: m.ad_id };
    });
    return Object.values(map);
  },

  async getUnreadCount() {
    const { data: me } = await supabase.auth.getUser();
    const myId = me.user?.id;
    if (!myId) return 0;
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', myId)
      .is('read_at', null);
    if (error) throw error;
    return count || 0;
  },

  async markConversationRead(otherUserId?: string, adId?: string) {
    const { data: me } = await supabase.auth.getUser();
    const myId = me.user?.id;
    if (!myId) return;
    let query = supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('receiver_id', myId)
      .is('read_at', null);

    if (otherUserId) query = query.eq('sender_id', otherUserId);
    if (adId) query = query.eq('ad_id', adId);

    const { error } = await query;
    if (error) throw error;

    // Reset hidden status if new messages arrive and we read them
    // Actually, usually reading means it's visible. But here we just want to be sure.
  },

  async deleteConversation(otherUserId: string, adId: string | null | undefined) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Oturum açmanız gerekiyor');
    const myId = user.id;

    // Normalize adId: "" or undefined -> null
    const targetAdId = adId === "" || !adId ? null : adId;

    // 1. Local Hiding (En güvenli yöntem: RLS engellese bile listeden gider)
    const hidden = JSON.parse(localStorage.getItem('hidden_conversations') || '{}');
    const hideKey = `${targetAdId || 'null'}-${otherUserId}`;
    hidden[hideKey] = new Date().toISOString();
    localStorage.setItem('hidden_conversations', JSON.stringify(hidden));

    // 2. DB Silme: Benim gönderdiklerim
    let query1 = supabase.from('messages').delete()
      .eq('sender_id', myId)
      .eq('receiver_id', otherUserId);
    
    if (targetAdId) query1 = query1.eq('ad_id', targetAdId);
    else query1 = query1.is('ad_id', null);
    
    await query1;

    // 3. DB Silme: Karşıdan bana gelenler (Eğer RLS izin veriyorsa)
    let query2 = supabase.from('messages').delete()
      .eq('sender_id', otherUserId)
      .eq('receiver_id', myId);
    
    if (targetAdId) query2 = query2.eq('ad_id', targetAdId);
    else query2 = query2.is('ad_id', null);
    
    await query2;
  },

  async markAllRead() {
    return this.markConversationRead();
  },

  async getConversations() {
    const { data: me } = await supabase.auth.getUser();
    const myId = me.user?.id;
    if (!myId) return [];

    // Önce mesajları getir
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
      .order('created_at', { ascending: false });

    if (messagesError) throw messagesError;

    // Hidden listesini al
    const hidden = JSON.parse(localStorage.getItem('hidden_conversations') || '{}');

    // İlan ve kullanıcı bilgilerini ayrı ayrı getir
    const adIds = [...new Set(messages?.map(m => m.ad_id).filter(Boolean) || [])];
    const userIds = [...new Set(messages?.flatMap(m => [m.sender_id, m.receiver_id]).filter(id => id !== myId) || [])];

    const { data: ads } = await supabase
      .from('ads')
      .select('id, title')
      .in('id', adIds);

    const { data: users } = await supabase
      .from('users')
      .select('id, name')
      .in('id', userIds);

    // Map'leri oluştur
    const adsMap = new Map(ads?.map(ad => [ad.id, ad]) || []);
    const usersMap = new Map(users?.map(user => [user.id, user]) || []);

    // Konuşmaları grupla
    const conversationsMap = new Map();

    (messages || []).forEach((m: any) => {
      const otherId = m.sender_id === myId ? m.receiver_id : m.sender_id;
      const adId = m.ad_id;
      const key = `${adId || 'null'}-${otherId}`;
      
      // Hidden kontrolü: Eğer mesaj silinme zamanından önceyse atla
      const hiddenAt = hidden[key];
      if (hiddenAt && new Date(m.created_at) <= new Date(hiddenAt)) return;

      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          ad_id: adId,
          ad_title: adsMap.get(adId)?.title || 'Bilinmeyen İlan',
          other_user_id: otherId,
          other_user_name: usersMap.get(otherId)?.name || 'Bilinmeyen Kullanıcı',
          last_message: m.content,
          last_message_time: m.created_at,
          unread_count: 0
        });
      } else {
        const conv = conversationsMap.get(key);
        if (new Date(m.created_at) > new Date(conv.last_message_time)) {
          conv.last_message = m.content;
          conv.last_message_time = m.created_at;
        }
        if (m.receiver_id === myId && !m.read_at) {
          conv.unread_count++;
        }
      }
    });

    return Array.from(conversationsMap.values()).sort((a, b) =>
      new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
    );
  },
};

// Block Services
export const blockService = {
  async blockUser(blockedUserId: string) {
    const { data: me } = await supabase.auth.getUser();
    const myId = me.user?.id;
    if (!myId) throw new Error('Oturum açılmadı');

    const { data, error } = await supabase
      .from('blocked_users')
      .insert([{
        blocker_id: myId,
        blocked_id: blockedUserId,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new Error('Bu kullanıcı zaten engelli');
      throw error;
    }
    return data;
  },

  async isBlocked(userId: string) {
    const { data: me } = await supabase.auth.getUser();
    const myId = me.user?.id;
    if (!myId) return false;

    const { data, error } = await supabase
      .from('blocked_users')
      .select('*')
      .or(`and(blocker_id.eq.${myId},blocked_id.eq.${userId}),and(blocker_id.eq.${userId},blocked_id.eq.${myId})`)
      .maybeSingle();

    if (error) return false;
    return !!data;
  }
};
