// Path: src\middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  if (!isApiRoute) {
    return NextResponse.next();
  }

  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', '100');
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
