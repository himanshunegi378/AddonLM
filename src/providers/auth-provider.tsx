'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user/userStore';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: number; name: string } | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Get user state and actions from the store
  const { id, name, setUser, clearUser } = useUserStore();
  
  const isAuthenticated = !!id && id > 0;
  
  // Memoize the user value
  const user = useMemo(() => 
    isAuthenticated ? { id, name } : null
  , [isAuthenticated, id, name]);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser({ id: data.user.id, name: data.user.name });
        } else {
          clearUser();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        clearUser();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setUser, clearUser]);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      setUser({ id: data.user.id, name: data.user.name });
      
      return data;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  // Signup function
  const signup = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      const data = await response.json();
      setUser({ id: data.user.id, name: data.user.name });
      
      return data;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      clearUser();
      router.push('/auth/login');
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }, [clearUser, router]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isAuthenticated,
    user,
    login,
    signup,
    logout,
    isLoading,
  }), [isAuthenticated, user, isLoading, login, signup, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
