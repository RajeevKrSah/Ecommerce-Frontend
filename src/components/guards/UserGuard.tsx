/**
 * User Guard Component
 * MNC-Grade Production Implementation
 * 
 * Features:
 * - Token validation
 * - User authentication check
 * - Automatic redirects
 * - Loading states
 * - Error handling
 * 
 * @module components/guards/UserGuard
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth.services';
import TokenManager from '@/lib/tokenManager';

interface UserGuardProps {
  children: React.ReactNode;
}

export default function UserGuard({ children }: UserGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Step 1: Check if token exists
        if (!TokenManager.isAuthenticated()) {
          console.log('[UserGuard] No valid token found');
          router.replace('/login?redirect=' + encodeURIComponent(pathname));
          return;
        }

        // Step 2: Get user role from localStorage
        const userRole = authService.getUserRole();
        
        if (!userRole) {
          console.log('[UserGuard] No role found');
          TokenManager.clearToken();
          localStorage.removeItem('user_role');
          router.replace('/login?redirect=' + encodeURIComponent(pathname));
          return;
        }

        // Step 3: Verify token with backend
        try {
          await authService.getProfile();
        } catch (error: any) {
          console.error('[UserGuard] Profile verification failed:', error);
          
          // If 401, token is invalid
          if (error?.response?.status === 401) {
            TokenManager.clearToken();
            localStorage.removeItem('user_role');
            router.replace('/login?redirect=' + encodeURIComponent(pathname));
            return;
          }
          
          // For other errors, allow access but log the error
          console.warn('[UserGuard] Profile verification failed but allowing access');
        }

        // All checks passed
        console.log('[UserGuard] Authorization successful for role:', userRole);
        setIsAuthorized(true);
      } catch (error) {
        console.error('[UserGuard] Auth check failed:', error);
        setError('Authentication failed. Please login again.');
        
        TokenManager.clearToken();
        localStorage.removeItem('user_role');
        
        setTimeout(() => {
          router.replace('/login');
        }, 1500);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Verifying access...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            <span>Redirecting...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    return null;
  }

  // Authorized - render children
  return <>{children}</>;
}
