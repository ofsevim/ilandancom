import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService, userService, favoriteService } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  favorites: string[];
  toggleFavorite: (adId: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = authService.onAuthStateChange(async (supabaseUser) => {
      if (supabaseUser) {
        try {
          const userData = await userService.getUserById(supabaseUser.id);
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            phone: userData.phone,
            avatar: userData.avatar,
            role: userData.role,
            createdAt: userData.created_at,
            isActive: userData.is_active
          });
          
          // Load user favorites
          await loadUserFavorites(supabaseUser.id);
        } catch (error: any) {
          console.error('Error fetching user data:', error);
          if (supabaseUser.user_metadata?.name) {
            try {
              const newUser = await userService.createUser({
                id: supabaseUser.id,
                email: supabaseUser.email!,
                name: supabaseUser.user_metadata.name,
                role: 'user',
                phone: '',
                avatar: '',
                isActive: true
              });
              setUser({
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                phone: newUser.phone,
                avatar: newUser.avatar,
                role: newUser.role,
                createdAt: newUser.created_at,
                isActive: newUser.is_active
              });
            } catch (createError: any) {
              console.error('Error creating user:', createError);
              setUser({
                id: supabaseUser.id,
                email: supabaseUser.email!,
                name: supabaseUser.user_metadata.name,
                role: 'user',
                createdAt: new Date().toISOString(),
                isActive: true
              });
            }
          }
        }
      } else {
        setUser(null);
        setFavorites([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserFavorites = async (userId: string) => {
    try {
      const favoritesData = await favoriteService.getUserFavorites(userId);
      const favoriteIds = favoritesData.map((item: any) => item.ads.id);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  };

  const login = async (email: string, password: string) => {
    const { user: supabaseUser } = await authService.signIn(email, password);
    if (supabaseUser) {
      await loadUserFavorites(supabaseUser.id);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const { user: supabaseUser } = await authService.signUp(email, password, name);
    if (supabaseUser) {
      await loadUserFavorites(supabaseUser.id);
    }
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
    setFavorites([]);
  };

  const toggleFavorite = async (adId: string) => {
    if (!user) return;

    try {
      const isCurrentlyFavorite = favorites.includes(adId);
      
      if (isCurrentlyFavorite) {
        await favoriteService.removeFromFavorites(user.id, adId);
        setFavorites(prev => prev.filter(id => id !== adId));
      } else {
        await favoriteService.addToFavorites(user.id, adId);
        setFavorites(prev => [...prev, adId]);
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  };

  const value = { user, login, register, logout, favorites, toggleFavorite, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};