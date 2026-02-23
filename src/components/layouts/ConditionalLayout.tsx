/**
 * Conditional Layout Component
 * Automatically shows/hides header and footer based on the current route
 * - Admin routes (/admin/*): No header/footer (admin has its own layout)
 * - Auth routes (/login, /signup): No header/footer
 * - All other routes: Show header and footer
 */

'use client';

import { usePathname } from 'next/navigation';
import Nav from '@/components/navbar';
import Footer from '@/components/footer/page';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Routes that should NOT have header/footer
  const noLayoutRoutes = [
    '/admin',           // Admin section
    '/login',           // Login page
    '/signup',          // Signup page
    '/admin/login',     // Admin login
  ];

  // Check if current route should have layout
  const shouldShowLayout = !noLayoutRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  // If no layout needed, return children only
  if (!shouldShowLayout) {
    return <>{children}</>;
  }

  // Return with header and footer
  return (
    <>
      <Nav />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
