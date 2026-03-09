import api from '@/lib/api';
import TokenManager from '@/lib/tokenManager';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/auth';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/register', data);
      
      if (response.data.access_token) {
        TokenManager.setToken({
          access_token: response.data.access_token,
          token_type: response.data.token_type,
          expires_in: response.data.expires_in
        });
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/login', data);
      
      // Handle new backend response format
      const responseData = response.data;
      const token = responseData.data?.token || responseData.access_token || responseData.token;
      const user = responseData.data?.user || responseData.user;
      const role = responseData.data?.role || responseData.role;
      
      if (token) {
        TokenManager.setToken({
          access_token: token,
          token_type: responseData.token_type || 'Bearer',
          expires_in: responseData.expires_in || 3600
        });
        
        // Store role for quick access
        if (role) {
          localStorage.setItem('user_role', role);
        }
      }
      
      return {
        ...responseData,
        user,
        role,
        access_token: token
      };
    } catch (error: any) {
      throw error;
    }
  },

  async adminLogin(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/admin/login', data);
      
      // Handle new backend response format
      const responseData = response.data;
      const token = responseData.data?.token || responseData.access_token || responseData.token;
      const user = responseData.data?.user || responseData.user;
      const role = responseData.data?.role || responseData.role;
      
      if (token) {
        TokenManager.setToken({
          access_token: token,
          token_type: responseData.token_type || 'Bearer',
          expires_in: responseData.expires_in || 3600
        });
        
        // Store role for quick access
        if (role) {
          localStorage.setItem('user_role', role);
        }
        
        // Store complete admin data
        if (user && role) {
          localStorage.setItem('admin_data', JSON.stringify({ ...user, role }));
        }
      }
      
      return {
        ...responseData,
        user,
        role,
        access_token: token
      };
    } catch (error: any) {
      console.error('Admin login error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/logout');
    } catch (error) {
      // Even if logout fails on server, clear local token
      console.warn('Logout request failed:', error);
    } finally {
      TokenManager.clearToken();
      localStorage.removeItem('user_role');
      localStorage.removeItem('admin_data');
    }
  },

  async logoutAll(): Promise<void> {
    try {
      await api.post('/logout-all');
    } catch (error) {
      console.warn('Logout all request failed:', error);
    } finally {
      TokenManager.clearToken();
      localStorage.removeItem('user_role');
      localStorage.removeItem('admin_data');
    }
  },

  async getProfile(): Promise<User> {
    try {
      const response = await api.get('/profile');
      return response.data.user;
    } catch (error: any) {
      throw error;
    }
  },

  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await api.post('/refresh');
      
      if (response.data.access_token) {
        TokenManager.setToken({
          access_token: response.data.access_token,
          token_type: response.data.token_type,
          expires_in: response.data.expires_in
        });
      }
      
      return response.data;
    } catch (error: any) {
      TokenManager.clearToken();
      throw error;
    }
  },

  isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  },

  getToken(): string | null {
    return TokenManager.getToken();
  },

  getUserRole(): 'user' | 'admin' | 'super_admin' | null {
    return localStorage.getItem('user_role') as 'user' | 'admin' | 'super_admin' | null;
  },

  hasRole(role: 'user' | 'admin' | 'super_admin'): boolean {
    const userRole = this.getUserRole();
    if (!userRole) return false;
    
    // Super admin has all permissions
    if (userRole === 'super_admin') return true;
    
    // Admin has admin and user permissions
    if (userRole === 'admin' && (role === 'admin' || role === 'user')) return true;
    
    // User only has user permissions
    return userRole === role;
  },

  isAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'admin' || role === 'super_admin';
  },

  isSuperAdmin(): boolean {
    return this.getUserRole() === 'super_admin';
  }
};