import { NextRequest, NextResponse } from 'next/server';

// Define which routes require authentication
const protectedRoutes = [
  '/plugin',
  '/plugin/add',
  '/plugin/edit',
  '/chatbot',
  '/chat',
];

// Define which routes are auth routes
const authRoutes = [
  '/auth/login',
  '/auth/signup',
];

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;
  
  // Check if the path requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Check if the path is an auth route
  const isAuthRoute = authRoutes.some(route => pathname === route);
  
  // If trying to access a protected route without auth, redirect to login
  if (isProtectedRoute && !authToken) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  // If already logged in and trying to access auth routes, redirect to dashboard
  if (isAuthRoute && authToken) {
    return NextResponse.redirect(new URL('/plugin', request.url));
  }
  
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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
