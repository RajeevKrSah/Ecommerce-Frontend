'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.services';
import { User, LoginRequest, RegisterRequest, AuthState } from '@/types/auth';
import { formatError } from '@/lib/utils';

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = await authService.getProfile();
          setState(prev => ({
            ...prev,
            user: user || null,
            isAuthenticated: true,
            isLoading: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: formatError(error),
        }));
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.login(credentials);
      const user = response.data?.user || response.user;
      const role = response.data?.role || response.role;
      
      setState(prev => ({
        ...prev,
        user: user || null,
        isAuthenticated: true,
        isLoading: false,
      }));
      
      // Role-based redirect
      if (role === 'admin' || role === 'super_admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
      
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: formatError(error),
      }));
      throw error;
    }
  }, [router]);

  const adminLogin = useCallback(async (credentials: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.adminLogin(credentials);
      const user = response.data?.user || response.user;
      const role = response.data?.role || response.role;
      
      // Store admin data in localStorage for immediate access
      if (user && role) {
        localStorage.setItem('admin_data', JSON.stringify({ ...user, role }));
      }
      
      setState(prev => ({
        ...prev,
        user: user || null,
        isAuthenticated: true,
        isLoading: false,
      }));
      
      // Use replace instead of push to prevent back button issues
      router.replace('/admin/dashboard');
      
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: formatError(error),
      }));
      throw error;
    }
  }, [router]);

  const register = useCallback(async (userData: RegisterRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.register(userData);
      setState(prev => ({
        ...prev,
        user: response.user || null,
        isAuthenticated: true,
        isLoading: false,
      }));
      
      router.push('/dashboard');
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: formatError(error),
      }));
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      router.push('/login');
    }
  }, [router]);

  const logoutAll = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authService.logoutAll();
    } catch (error) {
      console.warn('Logout all error:', error);
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      router.push('/login');
    }
  }, [router]);

  const refreshProfile = useCallback(async () => {
    if (!state.isAuthenticated) return;
    
    try {
      const user = await authService.getProfile();
      setState(prev => ({ ...prev, user: user || null }));
      return user;
    } catch (error) {
      console.warn('Profile refresh error:', error);
      throw error;
    }
  }, [state.isAuthenticated]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    adminLogin,
    register,
    logout,
    logoutAll,
    refreshProfile,
    clearError,
    getUserRole: authService.getUserRole,
    hasRole: authService.hasRole,
    isAdmin: authService.isAdmin,
    isSuperAdmin: authService.isSuperAdmin,
  };
}