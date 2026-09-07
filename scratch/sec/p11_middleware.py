import sys; sys.path.insert(0, 'scratch/sec')
from patchlib import patch

patch('src/middleware.ts', [
(
r"""const rateLimitMap = new Map<string, RateLimitEntry>();
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
}""",
r"""const rateLimitMap = new Map<string, RateLimitEntry>();
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
}"""
),
(
r"""  // Skip static Next.js assets, images, and public files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // file extensions like .ico, .png, .jpg, .svg, .css, .js
  ) {
    return NextResponse.next();
  }""",
r"""  // Skip static Next.js assets, images, and public files.
  // API routes are never skipped: a path such as /api/x. contains a dot and
  // would otherwise slip past the WAF and the rate limiter entirely.
  if (
    !pathname.startsWith('/api/') &&
    (pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      pathname.includes('.')) // file extensions like .ico, .png, .jpg, .svg, .css, .js
  ) {
    return NextResponse.next();
  }"""
),
(
r"""  // 2. Web Application Firewall (WAF) - Injection & Traversal Payload check in URL / Query
  const fullUrlDecoded = decodeURIComponent(pathname + search);""",
r"""  // 2. Web Application Firewall (WAF) - Injection & Traversal Payload check in URL / Query
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
  }"""
),
(
r"""  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self'; object-src 'none'; base-uri 'self';"
  );""",
r"""  // `form-action` and `upgrade-insecure-requests` are safe to add without a
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
  }"""
),
])
