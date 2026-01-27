export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
  type?: 'validation' | 'network' | 'rate_limit' | 'server';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}