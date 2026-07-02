import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // We can't fully verify JWT in Edge runtime without extra libs easily,
  // so we rely on client-side and backend protection, 
  // but we can check if token exists for basic routing.
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/admin/dashboard')) {
    // Note: LocalStorage isn't accessible in server middleware.
    // In a real app we'd use cookies for the admin token.
    // For this simple setup, we'll let the client-side component handle the redirect if unauthenticated.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
