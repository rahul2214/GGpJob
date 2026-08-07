import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * JobsDart SEO Middleware
 * Enforces 301 Permanent Redirects from www.jobsdart.in -> jobsdart.in
 * and http -> https to avoid duplicate content penalties and canonical mismatches.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  // If request arrives at www.jobsdart.in, issue a 301 Permanent Redirect to jobsdart.in
  if (host.startsWith('www.')) {
    const primaryHost = host.replace(/^www\./, '');
    const targetUrl = `https://${primaryHost}${pathname}${search}`;
    return NextResponse.redirect(targetUrl, 301);
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
