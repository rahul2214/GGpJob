import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

/**
 * Regression tests for VULN-018 (rate limits were keyed on the left-most
 * X-Forwarded-For entry, which the client supplies and can change per request)
 * and for the WAF skip rule that let any path containing a dot bypass both the
 * payload screen and the rate limiter.
 */

function request(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(new Request(`https://jobsdart.test${path}`, { headers }));
}

describe('Rate limiting cannot be bypassed by spoofing X-Forwarded-For', () => {
  it('keys on the proxy-appended address, not the client-supplied one', async () => {
    const realClient = '203.0.113.77';
    let blocked = false;

    // 40 requests against the auth tier (limit 15/min). Each one claims a
    // different left-most address, which is exactly what an attacker would do.
    for (let i = 0; i < 40; i++) {
      const res = await middleware(
        request('/api/auth/send-verification', {
          // Spoofed hop, then the address our own proxy appended.
          'x-forwarded-for': `10.9.9.${i}, ${realClient}`,
        }),
      );
      if (res.status === 429) {
        blocked = true;
        break;
      }
    }

    expect(blocked).toBe(true);
  });

  it('still rate limits a single honest client', async () => {
    let blocked = false;
    for (let i = 0; i < 40; i++) {
      const res = await middleware(
        request('/api/auth/confirm-reset', { 'x-forwarded-for': '198.51.100.5' }),
      );
      if (res.status === 429) {
        blocked = true;
        break;
      }
    }
    expect(blocked).toBe(true);
  });

  it('returns Retry-After when it rejects', async () => {
    let limited: Response | null = null;
    for (let i = 0; i < 40; i++) {
      const res = await middleware(
        request('/api/payments/verify', { 'x-forwarded-for': '198.51.100.9' }),
      );
      if (res.status === 429) {
        limited = res as unknown as Response;
        break;
      }
    }
    expect(limited).not.toBeNull();
    expect(limited!.headers.get('Retry-After')).toBeTruthy();
  });

  it('treats distinct real clients independently', async () => {
    const res = await middleware(
      request('/api/auth/send-verification', { 'x-forwarded-for': '203.0.113.200' }),
    );
    expect(res.status).not.toBe(429);
  });
});

describe('WAF screening', () => {
  it('blocks known scanner user agents', async () => {
    const res = await middleware(
      request('/api/jobs', { 'user-agent': 'sqlmap/1.7#stable', 'x-forwarded-for': '203.0.113.30' }),
    );
    expect(res.status).toBe(403);
  });

  it('blocks SQL injection payloads in the query string', async () => {
    const res = await middleware(
      request('/api/jobs?search=1%20UNION%20SELECT%20password%20FROM%20users', {
        'x-forwarded-for': '203.0.113.31',
      }),
    );
    expect(res.status).toBe(403);
  });

  it('blocks traversal payloads', async () => {
    const res = await middleware(
      request('/api/jobs?file=../../../../etc/passwd', { 'x-forwarded-for': '203.0.113.32' }),
    );
    expect(res.status).toBe(403);
  });

  it('blocks double-encoded traversal payloads', async () => {
    // %252e%252e%252f decodes to ../ only on the second pass.
    const res = await middleware(
      request('/api/jobs?file=%252e%252e%252fetc%252fpasswd', { 'x-forwarded-for': '203.0.113.33' }),
    );
    expect(res.status).toBe(403);
  });

  it('does not let an API path with a dot skip screening', async () => {
    const res = await middleware(
      request('/api/jobs.json?q=1%20UNION%20SELECT%20a%20FROM%20b', {
        'x-forwarded-for': '203.0.113.34',
      }),
    );
    expect(res.status).toBe(403);
  });

  it('allows an ordinary request through', async () => {
    const res = await middleware(
      request('/api/jobs?search=engineer', { 'x-forwarded-for': '203.0.113.35' }),
    );
    expect(res.status).toBe(200);
  });
});

describe('Security response headers', () => {
  it('sets the expected hardening headers', async () => {
    const res = await middleware(request('/jobs', { 'x-forwarded-for': '203.0.113.40' }));
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(res.headers.get('Strict-Transport-Security')).toContain('max-age=');
    expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    const csp = res.headers.get('Content-Security-Policy') || '';
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
  });

  it('marks API responses as uncacheable by shared caches', async () => {
    const res = await middleware(request('/api/jobs', { 'x-forwarded-for': '203.0.113.41' }));
    expect(res.headers.get('Cache-Control')).toContain('no-store');
  });
});
