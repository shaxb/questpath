'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
  id: number;
  email: string;
  total_exp: number;
  display_name?: string;
  profile_picture?: string;
  is_premium?: boolean;
  premium_expiry?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  
  // Helper methods
  getLevel: () => number;
  getXPProgress: () => { current: number; needed: number; percentage: number };
  
  // Update methods
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  
  // Auth methods
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user data from server (source of truth)
  const refreshUser = async () => {
    // Only set global loading if we don't have a user yet (initial load or logged out)
    // This prevents the whole UI from unmounting during background XP updates
    if (!user && !loading) {
      setLoading(true);
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Use silent mode to prevent toast on errors during initial load
      const response = await api.get('/auth/me', { silent: true } as any);
      setUser(response.data);
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch user:', error);
      
      // If unauthorized, clear token and user
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
      } else {
        // For other errors, keep user as null but loading complete
        setUser(null);
        setLoading(false);
      }
    }
  };

  // Initialize: Fetch user on mount
  useEffect(() => {
    refreshUser();
  }, []);

  // Calculate level from XP (100 XP per level)
  const getLevel = (): number => {
    if (!user || typeof user.total_exp !== 'number') return 1;
    return Math.floor(user.total_exp / 100) + 1;
  };

  // Calculate XP progress to next level
  const getXPProgress = () => {
    if (!user || typeof user.total_exp !== 'number') {
      return { current: 0, needed: 100, percentage: 0 };
    }
    
    const totalExp = user.total_exp || 0;
    const current = totalExp % 100;
    const needed = 100;
    const percentage = (current / needed) * 100;
    
    return { current, needed, percentage };
  };

  // Update user data (partial update)
  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  // Logout: Clear user state and redirect
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setLoading(false); // Ensure loading is false after logout
    router.push('/login');
  };

  const value: UserContextType = {
    user,
    loading,
    getLevel,
    getXPProgress,
    refreshUser,
    updateUser,
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the UserContext
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
