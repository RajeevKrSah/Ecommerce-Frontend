export interface User {
  id: number;
  name: string;
  email: string;
  roles?: Array<{ id: number; name: 'user' | 'admin' | 'super_admin' }>;
  email_verified_at: string | null;
  created_at?: string;
  updated_at?: string;
  failed_login_attempts?: number;
  locked_until?: string | null;
}

export interface UserRole {
  id: number;
  name: 'user' | 'admin' | 'super_admin';
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
  data?: {
    user: User;
    role: 'user' | 'admin' | 'super_admin';
    token: string;
  };
  user?: User;
  role?: 'user' | 'admin' | 'super_admin';
  access_token?: string;
  token?: string;
  token_type?: string;
  expires_in?: number;
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