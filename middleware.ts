import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // For all requests, continue as normal
  // Add any future non-WebSocket middleware logic here
  return NextResponse.next();
}

// Configuration for middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * 
     * It will now run on API routes like /api/auth/*
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 