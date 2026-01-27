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

  async logout(): Promise<void> {
    try {
      await api.post('/logout');
    } catch (error) {
      // Even if logout fails on server, clear local token
      console.warn('Logout request failed:', error);
    } finally {
      TokenManager.clearToken();
    }
  },

  async logoutAll(): Promise<void> {
    try {
      await api.post('/logout-all');
    } catch (error) {
      console.warn('Logout all request failed:', error);
    } finally {
      TokenManager.clearToken();
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
  }
};