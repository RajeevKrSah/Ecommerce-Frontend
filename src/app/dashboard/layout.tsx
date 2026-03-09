'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import UserGuard from '@/components/guards/UserGuard';
import { authService } from '@/services/auth.services';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Redirect admins to admin dashboard
    if (!isLoading && isAuthenticated) {
      const userRole = authService.getUserRole();
      if (userRole === 'admin' || userRole === 'super_admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <UserGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Page content */}
        <main className="container mx-auto px-4 md:px-12 lg:px-24 py-8">
          {children}
        </main>
      </div>
    </UserGuard>
  );
}
