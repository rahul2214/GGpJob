import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { containsSuspiciousPayload } from '@/lib/security';
import { SITE_URL } from '@/lib/site';

// In-memory sliding window rate limiter
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
let lastCleanTime = Date.now();

// Hard ceiling on tracked keys, so a flood of distinct keys between scheduled
// cleanups cannot grow the map without bound.
const MAX_RATE_LIMIT_KEYS = 20000;

// Automated periodic cleanup to prevent memory exhaustion
function cleanupRateLimitMap() {
  const now = Date.now();
  if (now - lastCleanTime > 60000 || rateLimitMap.size > MAX_RATE_LIMIT_KEYS) {
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetAt) {
        rateLimitMap.delete(key);
      }
    }
    // If expiring entries was not enough, drop the oldest keys outright rather
    // than letting the map keep growing.
    if (rateLimitMap.size > MAX_RATE_LIMIT_KEYS) {
      const excess = rateLimitMap.size - MAX_RATE_LIMIT_KEYS;
      let dropped = 0;
      for (const key of rateLimitMap.keys()) {
        rateLimitMap.delete(key);
        if (++dropped >= excess) break;
      }
    }
    lastCleanTime = now;
  }
}

/**
 * Number of trusted reverse proxies in front of the app. Each hop appends to
 * X-Forwarded-For, so the trustworthy client address is counted from the right.
 * 1 (the default) suits a single platform load balancer; raise it to 2 when a
 * CDN such as Cloudflare sits in front of that load balancer.
 */
const TRUSTED_PROXY_HOPS = Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS || 1));

/**
 * Resolves the client IP used for rate limiting.
 *
 * The left-most X-Forwarded-For entry is supplied by the client and can be set
 * to anything, so keying rate limits on it lets a caller mint a fresh bucket per
 * request. Only the entries appended by our own proxies are trustworthy, and
 * those are at the right-hand end of the list.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const hops = forwarded
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);

    if (hops.length > 0) {
      const index = Math.max(0, hops.length - TRUSTED_PROXY_HOPS);
      return hops[index];
    }
  }

  // These are single-valued and are overwritten by the edge that sets them.
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

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

const CANONICAL_HOST = new URL(SITE_URL).host;

/**
 * Serving the site on both www and the apex host splits ranking signals and
 * makes every canonical tag disagree with the URL that was actually requested.
 * Redirect the non-canonical variant of our own domain to the one that
 * NEXT_PUBLIC_APP_URL names.
 *
 * Deliberately narrow: only the www/apex pair of the canonical host is touched,
 * so localhost, LAN addresses and preview deployments are never redirected.
 */
function canonicalHostRedirect(request: NextRequest): URL | null {
  const requestHost = request.headers.get('host');
  if (!requestHost || requestHost === CANONICAL_HOST) return null;

  const apex = CANONICAL_HOST.replace(/^www\./, '');
  const isOwnDomain = requestHost === apex || requestHost === `www.${apex}`;
  if (!isOwnDomain) return null;

  const target = new URL(request.nextUrl);
  target.host = CANONICAL_HOST;
  target.protocol = 'https:';
  target.port = '';
  return target;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Canonical host first: everything downstream should see the final URL.
  const canonicalTarget = canonicalHostRedirect(request);
  if (canonicalTarget) {
    return NextResponse.redirect(canonicalTarget, 308);
  }

  // Skip static Next.js assets, images, and public files.
  // API routes are never skipped: a path such as /api/x. contains a dot and
  // would otherwise slip past the WAF and the rate limiter entirely.
  if (
    !pathname.startsWith('/api/') &&
    (pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      pathname.includes('.')) // file extensions like .ico, .png, .jpg, .svg, .css, .js
  ) {
    return NextResponse.next();
  }

  // 1. Web Application Firewall (WAF) - Scanner User-Agent check
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  if (BLOCKED_USER_AGENTS.some(agent => userAgent.includes(agent))) {
    return new NextResponse('Forbidden: Automated security scanner blocked.', { status: 403 });
  }

  // 2. Web Application Firewall (WAF) - Injection & Traversal Payload check in URL / Query
  // Decode repeatedly so a double-encoded payload is screened too, and treat a
  // malformed encoding as hostile rather than letting it through.
  let fullUrlDecoded = pathname + search;
  try {
    for (let i = 0; i < 3; i++) {
      const decoded = decodeURIComponent(fullUrlDecoded);
      if (decoded === fullUrlDecoded) break;
      fullUrlDecoded = decoded;
    }
  } catch {
    return new NextResponse('Forbidden: Malformed request encoding.', { status: 400 });
  }
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
  // `form-action` and `upgrade-insecure-requests` are safe to add without a
  // nonce pipeline. A restrictive `script-src` is deliberately not set here:
  // Next.js emits inline bootstrap scripts, so tightening it requires per-request
  // nonces and must be rolled out with Report-Only first (see the audit report).
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"
  );

  // Responses carrying account data must not be retained by shared caches.
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
  }

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
