'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

// Cache auth result for 5 minutes
const AUTH_CACHE_KEY = 'auth_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const checkAuth = useCallback(async (forceRefresh = false) => {
    try {
      // Check cache first unless forcing refresh
      if (!forceRefresh) {
        const cached = localStorage.getItem(AUTH_CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const isFresh = Date.now() - timestamp < CACHE_DURATION;
          if (isFresh && data?.authenticated) {
            setIsAuthenticated(true);
            setUser(data.user);
            setIsLoading(false);
            return;
          }
        }
      }

      const response = await fetch('/api/auth/check', {
        cache: 'no-store' // Ensure fresh data when we do fetch
      });
      const data = await response.json();
      
      // Cache the result
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      
      if (data.authenticated) {
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      // Clear cache on error
      localStorage.removeItem(AUTH_CACHE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  const signOut = async () => {
    try {
      // Clear any stored tokens and cache
      localStorage.removeItem('sessionToken');
      localStorage.removeItem(AUTH_CACHE_KEY);
      
      // Clear authentication state
      setIsAuthenticated(false);
      setUser(null);
      
      // Redirect to sign-in
      router.push('/sign-in');
    } catch (error) {
      // Handle sign out error silently
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      user,
      checkAuth,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
