/**
 * Admin Guard Component
 * MNC-Grade Production Implementation
 * 
 * Features:
 * - Token validation
 * - Role-based access control
 * - Automatic redirects
 * - Loading states
 * - Error handling
 * 
 * @module components/guards/AdminGuard
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth.services';
import TokenManager from '@/lib/tokenManager';

interface AdminGuardProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export default function AdminGuard({ children, requireSuperAdmin = false }: AdminGuardProps) {
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
          console.log('[AdminGuard] No valid token found');
          router.replace('/admin/login?redirect=' + encodeURIComponent(pathname));
          return;
        }

        // Step 2: Get user role from localStorage
        const userRole = authService.getUserRole();
        
        if (!userRole) {
          console.log('[AdminGuard] No role found');
          TokenManager.clearToken();
          localStorage.removeItem('user_role');
          localStorage.removeItem('admin_data');
          router.replace('/admin/login?redirect=' + encodeURIComponent(pathname));
          return;
        }

        // Step 3: Check if user is trying to access admin routes with user role
        if (userRole === 'user') {
          console.log('[AdminGuard] User role detected, redirecting to user dashboard');
          setError('Access denied. Admin privileges required.');
          
          // Clear admin-related data
          localStorage.removeItem('admin_data');
          
          // Redirect to user dashboard
          setTimeout(() => {
            router.replace('/dashboard');
          }, 1500);
          return;
        }

        // Step 4: Check super admin requirement
        if (requireSuperAdmin && userRole !== 'super_admin') {
          console.log('[AdminGuard] Super admin required but user is:', userRole);
          setError('Access denied. Super admin privileges required.');
          
          setTimeout(() => {
            router.replace('/admin/dashboard');
          }, 1500);
          return;
        }

        // Step 5: Verify role is admin or super_admin
        if (userRole !== 'admin' && userRole !== 'super_admin') {
          console.log('[AdminGuard] Invalid role:', userRole);
          setError('Access denied. Invalid role.');
          
          TokenManager.clearToken();
          localStorage.removeItem('user_role');
          localStorage.removeItem('admin_data');
          
          setTimeout(() => {
            router.replace('/login');
          }, 1500);
          return;
        }

        // Step 6: Verify token with backend (optional but recommended)
        try {
          await authService.getProfile();
        } catch (error: any) {
          console.error('[AdminGuard] Profile verification failed:', error);
          
          // If 401, token is invalid
          if (error?.response?.status === 401) {
            TokenManager.clearToken();
            localStorage.removeItem('user_role');
            localStorage.removeItem('admin_data');
            router.replace('/admin/login?redirect=' + encodeURIComponent(pathname));
            return;
          }
          
          // For other errors, allow access but log the error
          console.warn('[AdminGuard] Profile verification failed but allowing access');
        }

        // All checks passed
        console.log('[AdminGuard] Authorization successful for role:', userRole);
        setIsAuthorized(true);
      } catch (error) {
        console.error('[AdminGuard] Auth check failed:', error);
        setError('Authentication failed. Please login again.');
        
        TokenManager.clearToken();
        localStorage.removeItem('user_role');
        localStorage.removeItem('admin_data');
        
        setTimeout(() => {
          router.replace('/admin/login');
        }, 1500);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname, requireSuperAdmin]);

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
