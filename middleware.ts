import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/', '/products', '/cart', '/admin/login'];
  
  // Admin routes that require admin authentication
  const adminRoutes = ['/admin/dashboard', '/admin/users', '/admin/products', '/admin/orders'];
  
  // User routes that require user authentication
  const userRoutes = ['/dashboard', '/profile', '/orders', '/checkout'];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  
  // Check if it's an admin route
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  
  // Check if it's a user route
  const isUserRoute = userRoutes.some(route => pathname.startsWith(route));
  
  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // For admin and user routes, authentication will be handled client-side
  // This middleware just ensures proper routing structure
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};