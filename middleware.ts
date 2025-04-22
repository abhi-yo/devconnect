import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle WebSocket upgrade requests
  const { pathname } = request.nextUrl;
  
  // Allow WebSocket connections for Socket.IO
  if (
    pathname.startsWith('/api/socket') && 
    (
      request.headers.get('upgrade') === 'websocket' || 
      request.headers.get('connection')?.includes('upgrade') ||
      pathname.includes('socket.io')
    )
  ) {
    return NextResponse.next();
  }

  // For all other requests, continue as normal
  return NextResponse.next();
}

// Configuration for middleware to run only on socket paths
export const config = {
  matcher: ['/api/socket/:path*'],
}; 