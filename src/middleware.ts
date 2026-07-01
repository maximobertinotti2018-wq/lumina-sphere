import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const protectedPaths = ['/library', '/reader', '/settings', '/analytics'];

export default auth((req) => {
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));
  
  if (isProtectedPath && !req.auth) {
    const newUrl = new URL('/login', req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
