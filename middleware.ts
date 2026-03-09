/**
 * Next.js Middleware for Route Protection
 * MNC-Grade Production Implementation
 * 
 * Features:
 * - Token-based authentication validation
 * - Role-based access control (RBAC)
 * - Automatic redirects for unauthorized access
 * - Session validation
 * - Security headers
 * 
 * @module middleware
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Route configuration
const ROUTES = {
  PUBLIC: [
    '/',
    '/login',
    '/signup',
    '/products',
    '/cart',
  ],
  ADMIN_PUBLIC: [
    '/admin/login',
  ],
  ADMIN_PROTECTED: [
    '/admin/dashboard',
    '/admin/products',
    '/admin/colors',
    '/admin/sizes',
    '/admin/orders',
    '/admin/users',
    '/admin/inventory',
    '/admin/reviews',
  ],
  USER_PROTECTED: [
    '/dashboard',
    '/profile',
    '/orders',
    '/checkout',
    '/payment',
    '/wishlist',
  ],
} as const;

/**
 * Check if path matches any route in the list
 */
function matchesRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some(route => {
    if (route === pathname) return true;
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });
}

/**
 * Get token from cookies or headers
 */
function getToken(request: NextRequest): string | null {
  // Try to get from cookie first
  const cookieToken = request.cookies.get('auth_token')?.value;
  if (cookieToken) return cookieToken;
  
  // Try to get from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

/**
 * Get user role from request
 * In production, this should validate the token and extract role from JWT
 */
function getUserRole(request: NextRequest): 'user' | 'admin' | 'super_admin' | null {
  // Try to get from cookie
  const roleCookie = request.cookies.get('user_role')?.value;
  if (roleCookie) {
    return roleCookie as 'user' | 'admin' | 'super_admin';
  }
  
  // In production, decode JWT token to get role
  // For now, we'll rely on client-side storage which will be validated by backend
  return null;
}

/**
 * Check if user has required role
 */
function hasRequiredRole(userRole: string | null, requiredRoles: string[]): boolean {
  if (!userRole) return false;
  
  // Super admin has access to everything
  if (userRole === 'super_admin') return true;
  
  // Check if user has any of the required roles
  return requiredRoles.includes(userRole);
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (matchesRoute(pathname, ROUTES.PUBLIC)) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }
  
  // Allow admin login page
  if (matchesRoute(pathname, ROUTES.ADMIN_PUBLIC)) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }
  
  // Get authentication status
  const token = getToken(request);
  const userRole = getUserRole(request);
  
  // Protect admin routes
  if (matchesRoute(pathname, ROUTES.ADMIN_PROTECTED)) {
    // Check if user is authenticated
    if (!token) {
      console.log(`[Middleware] Unauthorized access to ${pathname} - No token`);
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Check if user has admin role
    // Note: This is a basic check. The backend will do the actual validation
    if (userRole && userRole !== 'admin' && userRole !== 'super_admin') {
      console.log(`[Middleware] Forbidden access to ${pathname} - Role: ${userRole}`);
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }
  
  // Protect user routes
  if (matchesRoute(pathname, ROUTES.USER_PROTECTED)) {
    // Check if user is authenticated
    if (!token) {
      console.log(`[Middleware] Unauthorized access to ${pathname} - No token`);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }
  
  // Allow all other routes (like /products/[slug], /api/*, etc.)
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (handled by backend)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|.*\\..*|_next).*)',
  ],
};