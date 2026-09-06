import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { containsSuspiciousPayload } from '@/lib/security';

// In-memory sliding window rate limiter
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
let lastCleanTime = Date.now();

// Automated periodic cleanup to prevent memory exhaustion
function cleanupRateLimitMap() {
  const now = Date.now();
  if (now - lastCleanTime > 60000) {
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetAt) {
        rateLimitMap.delete(key);
      }
    }
    lastCleanTime = now;
  }
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  return '127.0.0.1';
}

function getRateLimitConfig(pathname: string): { limit: number; windowMs: number } {
  // Strict limits on authentication and payment endpoints
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/payments/')) {
    return { limit: 15, windowMs: 60000 };
  }
  // Moderate limits on computationally heavy AI and generation endpoints
  if (
    pathname.startsWith('/api/ats-score') ||
    pathname.startsWith('/api/resume/') ||
    pathname.startsWith('/api/career-assistant')
  ) {
    return { limit: 20, windowMs: 60000 };
  }
  // Standard limits for other API routes
  if (pathname.startsWith('/api/')) {
    return { limit: 100, windowMs: 60000 };
  }
  // Higher limits for web pages and navigation
  return { limit: 300, windowMs: 60000 };
}

const BLOCKED_USER_AGENTS = [
  'sqlmap',
  'nikto',
  'acunetix',
  'masscan',
  'wpscan',
  'nessus',
  'gobuster',
  'dirbuster',
  'nmap',
  'openvas'
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip static Next.js assets, images, and public files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // file extensions like .ico, .png, .jpg, .svg, .css, .js
  ) {
    return NextResponse.next();
  }

  // 1. Web Application Firewall (WAF) - Scanner User-Agent check
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  if (BLOCKED_USER_AGENTS.some(agent => userAgent.includes(agent))) {
    return new NextResponse('Forbidden: Automated security scanner blocked.', { status: 403 });
  }

  // 2. Web Application Firewall (WAF) - Injection & Traversal Payload check in URL / Query
  const fullUrlDecoded = decodeURIComponent(pathname + search);
  if (containsSuspiciousPayload(fullUrlDecoded)) {
    console.warn(`[WAF_BLOCKED] Suspicious payload detected from IP: ${getClientIp(request)} on ${pathname}`);
    return new NextResponse('Forbidden: Malicious request payload detected.', { status: 403 });
  }

  // 3. Anti-DDoS Rate Limiting
  cleanupRateLimitMap();
  const clientIp = getClientIp(request);
  const { limit, windowMs } = getRateLimitConfig(pathname);
  const rateLimitKey = `${clientIp}:${pathname.startsWith('/api/') ? 'api' : 'page'}:${limit}`;

  const now = Date.now();
  const currentEntry = rateLimitMap.get(rateLimitKey);

  if (!currentEntry || now > currentEntry.resetAt) {
    rateLimitMap.set(rateLimitKey, {
      count: 1,
      resetAt: now + windowMs
    });
  } else {
    currentEntry.count += 1;
    if (currentEntry.count > limit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((currentEntry.resetAt - now) / 1000));
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests. Rate limit exceeded. Please try again later.',
          retryAfter: retryAfterSeconds
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfterSeconds),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(currentEntry.resetAt / 1000))
          }
        }
      );
    }
  }

  // 4. Proceed and dynamically attach defense-in-depth security headers
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self'; object-src 'none'; base-uri 'self';"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
