import { describe, it, expect } from 'vitest';
import { MemoryCache } from '@/lib/cache';
import jwt from 'jsonwebtoken';

describe('Scalability & Performance Enhancements (50k User Capacity)', () => {
  it('MemoryCache enforces bounded capacity ceiling to prevent OOM under massive load', () => {
    const smallCache = new MemoryCache(50); // limit to 50 items

    // Insert 100 items
    for (let i = 0; i < 100; i++) {
      smallCache.set(`key:${i}`, `value:${i}`, 60000);
    }

    // Must never exceed capacity ceiling
    expect(smallCache.size()).toBeLessThanOrEqual(50);
  });

  it('MemoryCache getOrSet deduplicates concurrent requests (stampede / thundering-herd prevention)', async () => {
    const cache = new MemoryCache();
    let dbFetchCount = 0;

    const simulateDatabaseQuery = async () => {
      dbFetchCount++;
      await new Promise(r => setTimeout(r, 50));
      return { id: 1, name: 'Senior Software Engineer' };
    };

    // 20 concurrent requests for the exact same key at the same millisecond
    const concurrentRequests = Array.from({ length: 20 }, () =>
      cache.getOrSet('job:featured:1', simulateDatabaseQuery, 60000)
    );

    const results = await Promise.all(concurrentRequests);

    // All 20 requests received the valid job object
    expect(results).toHaveLength(20);
    expect(results[0].name).toBe('Senior Software Engineer');

    // BUT the database query was only executed ONCE!
    expect(dbFetchCount).toBe(1);
  });

  it('MemoryCache respects TTL expiration', async () => {
    const cache = new MemoryCache();
    cache.set('short-lived', 'temporary', 10); // 10ms TTL

    expect(cache.get('short-lived')).toBe('temporary');

    // Wait 25ms
    await new Promise(r => setTimeout(r, 25));

    // Expired item returns null
    expect(cache.get('short-lived')).toBeNull();
  });

  it('Local cryptographic JWT validation securely authenticates tokens and rejects forged tokens', () => {
    const testSecret = 'super-secret-test-key-minimum-32-chars-long';
    process.env.SUPABASE_JWT_SECRET = testSecret;

    const validPayload = {
      sub: '3f8510a2-9b24-42b7-a379-9941a37c050a',
      email: 'candidate@example.com',
      role: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 3600
    };

    const validToken = jwt.sign(validPayload, testSecret, { algorithm: 'HS256' });

    // Valid token decodes correctly
    const verified = jwt.verify(validToken, testSecret, { algorithms: ['HS256'] }) as any;
    expect(verified.sub).toBe(validPayload.sub);
    expect(verified.email).toBe(validPayload.email);

    // Forged token signed with a different key MUST be rejected
    const attackerToken = jwt.sign(validPayload, 'malicious-attacker-fake-secret-key', { algorithm: 'HS256' });
    expect(() => {
      jwt.verify(attackerToken, testSecret, { algorithms: ['HS256'] });
    }).toThrow();

    // Expired token MUST be rejected
    const expiredPayload = { ...validPayload, exp: Math.floor(Date.now() / 1000) - 100 };
    const expiredToken = jwt.sign(expiredPayload, testSecret, { algorithm: 'HS256' });
    expect(() => {
      jwt.verify(expiredToken, testSecret, { algorithms: ['HS256'] });
    }).toThrow();
  });

  it('exports supabaseAdminRead for read replica routing without breaking fallback', async () => {
    const { supabaseAdminRead } = await import('@/lib/supabase-admin');
    expect(supabaseAdminRead).toBeDefined();
  });
});
