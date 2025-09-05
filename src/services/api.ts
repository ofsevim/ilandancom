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
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getUserById(id: string) {
    // Doğrudan sorgu kullan - maybeSingle ile güvenli
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user:', error);
      throw new Error('Kullanıcı bilgileri alınamadı');
    }
    
    if (!data) {
      throw new Error('Kullanıcı bulunamadı');
    }
    
    return data;
  },

  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
};

// Public User Service (read-only limited fields for public visibility)
export const publicUserService = {
  async getPublicUserById(id: string) {
    try {
      // Önce users tablosunu dene - maybeSingle kullan
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, phone, avatar, role, created_at, is_active')
        .eq('id', id)
        .maybeSingle();
      
      if (!error && data) {
        return data;
      }
    } catch (e) {
      console.log('Users table access failed, using fallback:', e);
    }

    // Fallback: Sadece temel bilgileri döndür
    console.log('Using fallback user data for ID:', id);
    return {
      id,
      name: 'Kullanıcı',
      email: '',
      phone: '',
      avatar: '',
      role: 'user',
      created_at: new Date().toISOString(),
      is_active: true
    };
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
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async updateAd(id: string, updates: {
    title?: string;
    description?: string;
    price?: number;
    categoryId?: string;
    city?: string;
    district?: string;
    images?: string[];
  }) {
    // AdBlock engellerini aşmak için önce RPC dene
    try {
      const { data, error } = await supabase.rpc('update_ad_safe', {
        ad_id: id,
        ad_title: updates.title || null,
        ad_description: updates.description || null,
        ad_price: updates.price || null,
        ad_category_id: updates.categoryId || null,
        ad_city: updates.city || null,
        ad_district: updates.district || null,
        ad_images: updates.images || null
      });
      
      if (!error && data) {
        return data;
      }
    } catch (rpcError) {
      console.log('RPC update failed, trying direct table update:', rpcError);
    }

    // Fallback: Asıl ads tablosunu güncelle
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.district !== undefined) updateData.district = updates.district;
    if (updates.images !== undefined) updateData.images = updates.images;

    try {
      // Önce ID'nin varlığını kontrol et
      const { data: existingAd, error: checkError } = await supabase
        .from('ads')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      
      if (checkError) {
        console.error('Ad existence check failed:', checkError);
        throw new Error('İlan kontrol edilirken hata oluştu.');
      }
      
      if (!existingAd) {
        throw new Error('İlan bulunamadı.');
      }
      
      // ID varsa güncelle
      const { data, error } = await supabase
        .from('ads')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) {
        console.error('Ads table update failed:', error);
        throw new Error('İlan güncellenirken hata oluştu. Lütfen AdBlock\'u devre dışı bırakın ve tekrar deneyin.');
      }
      
      if (!data) {
        throw new Error('İlan güncellenemedi.');
      }
      
      return data;
    } catch (e) {
      console.error('Update failed:', e);
      throw new Error('İlan güncellenirken hata oluştu. Lütfen AdBlock\'u devre dışı bırakın ve tekrar deneyin.');
    }
  },

  async deleteAd(id: string) {
    // Asıl ads tablosunu kullan
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async incrementViewCount(id: string) {
    try {
      // En temiz yöntem: RPC function kullan
      const { data, error } = await supabase.rpc('increment_view_safe', {
        ad_id: id
      });
      
      if (!error && data) {
        return data;
      }
    } catch (rpcError) {
      console.log('RPC view count update failed, trying direct update:', rpcError);
    }

    // Fallback: Direct update (maybeSingle ile)
    try {
      const { data: currentAd, error: fetchError } = await supabase
        .from('ads')
        .select('view_count')
        .eq('id', id)
        .maybeSingle();
      
      if (fetchError) {
        console.log('View count fetch failed:', fetchError);
        return null; // Sessizce devam et
      }
      
      if (!currentAd) {
        console.log('Ad not found for view count update');
        return null;
      }
      
      const { data: updated, error: updErr } = await supabase
        .from('ads')
        .update({ view_count: (currentAd.view_count || 0) + 1 })
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (updErr) {
        console.log('View count update failed:', updErr);
        return null; // Sessizce devam et
      }
      
      return updated;
    } catch (e) {
      console.log('View count update failed:', e);
      return null; // Sessizce devam et
    }
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
      .maybeSingle();
    
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

// Message Services
export const messageService = {
  async sendMessage(params: { receiverId: string; adId?: string; content: string }) {
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
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getConversation(otherUserId: string, adId?: string) {
    let query = supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${(await supabase.auth.getUser()).data.user?.id},receiver_id.eq.${(await supabase.auth.getUser()).data.user?.id}`)
      .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
      .order('created_at', { ascending: true });

    if (adId) {
      query = query.eq('ad_id', adId);
    }

    const { data, error } = await query;
    if (error) throw error;
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

    const map: Record<string, any> = {};
    (data || []).forEach((m: any) => {
      const otherId = m.sender_id === myId ? m.receiver_id : m.sender_id;
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

    // İlan ve kullanıcı bilgilerini ayrı ayrı getir
    const adIds = [...new Set(messages?.map(m => m.ad_id).filter(Boolean) || [])];
    const userIds = [...new Set(messages?.flatMap(m => [m.sender_id, m.receiver_id]).filter(id => id !== myId) || [])];

    const { data: ads } = await supabase
      .from('listings')
      .select('id, title')
      .in('id', adIds);

    // Kullanıcı bilgilerini güvenli şekilde getir
    let users: any[] = [];
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name')
        .in('id', userIds);
      
      if (!usersError && usersData) {
        users = usersData;
      }
    } catch (error) {
      console.log('Users fetch failed, using fallback:', error);
      // Fallback: Sadece ID'leri kullan
      users = userIds.map(id => ({ id, name: 'Kullanıcı' }));
    }

    // Map'leri oluştur
    const adsMap = new Map(ads?.map(ad => [ad.id, ad]) || []);
    const usersMap = new Map(users?.map(user => [user.id, user]) || []);

    // Konuşmaları grupla
    const conversationsMap = new Map();
    
    (messages || []).forEach((m: any) => {
      const otherId = m.sender_id === myId ? m.receiver_id : m.sender_id;
      const adId = m.ad_id;
      const key = `${adId}-${otherId}`;
      
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
