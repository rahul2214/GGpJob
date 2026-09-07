import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Structural guard on the API surface.
 *
 * Every route handler runs with the Supabase service-role key, which bypasses
 * Row Level Security, so an unguarded handler is an open door to the whole
 * table. This test walks every route file and requires that each one either
 * performs an authentication check or is named explicitly below as public.
 *
 * When you add a new endpoint this test will fail until you either add a guard
 * or make a deliberate decision to list it as public.
 */

const API_ROOT = path.resolve(__dirname, '../src/app/api');

/** Endpoints that are intentionally reachable without a session. */
const INTENTIONALLY_PUBLIC = new Set([
  // Pre-authentication flows.
  '/api/auth/signup',
  '/api/auth/login',
  '/api/auth/password-reset',
  '/api/auth/confirm-reset',
  '/api/auth/confirm-email',
  '/api/auth/send-verification',

  // Public reference data rendered on marketing and search pages.
  '/api/benefits',
  '/api/company-sizes',
  '/api/currencies',
  '/api/currency/detect',
  '/api/experience-levels',
  '/api/job-types',
  '/api/notice-periods',
  '/api/skills',
  '/api/workplace-types',
  '/api/visa-requirements',
  '/api/payments/prices',
  '/api/geo',
  '/api/health',
  '/api/og',

  // Public job search and listing pages.
  '/api/jobs',

  // Public community reads.
  '/api/communities',
  '/api/communities/[id]',
  '/api/communities/[id]/jobs',
  '/api/communities/[id]/posts',
  '/api/communities/[id]/events',
  '/api/communities/[id]/resources',
  '/api/communities/posts/[postId]',
  '/api/communities/posts/[postId]/comments',

  // Coupon code check on the checkout screen (rate limited at the edge).
  '/api/coupons/validate',
  '/api/referral/validate',

  // Submitted by anonymous visitors.
  '/api/feedback',

  // Unsubscribe target for outbound email; carries no session by design.
  '/api/crm/preferences',

  // Verified by provider signature rather than a session.
  '/api/webhooks/brevo',
  '/api/inngest',

  // Disabled stubs that return 404/410 before doing any work.
  '/api/init-admin',
  '/api/admin/payouts',
  '/api/users/[id]/change-password',
]);

const AUTH_MARKERS = [
  'requireAuth',
  'requireAdmin',
  'requireSuperAdmin',
  'getAuthenticatedUser',
  'CRON_SECRET',
  'verifyBrevoWebhookSignature',
];

function collectRoutes(dir: string, acc: { endpoint: string; file: string }[] = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectRoutes(full, acc);
    } else if (/^route\.(ts|tsx|js)$/.test(entry.name)) {
      const endpoint =
        '/api' +
        path.relative(API_ROOT, path.dirname(full)).split(path.sep).filter(Boolean).map(s => '/' + s).join('');
      acc.push({ endpoint, file: full });
    }
  }
  return acc;
}

const routes = collectRoutes(API_ROOT);

describe('API surface', () => {
  it('finds the route files', () => {
    expect(routes.length).toBeGreaterThan(80);
  });

  const unguarded: string[] = [];

  for (const route of routes) {
    const source = fs.readFileSync(route.file, 'utf8');
    const guarded = AUTH_MARKERS.some(m => source.includes(m));
    const allowed = INTENTIONALLY_PUBLIC.has(route.endpoint);

    if (!guarded && !allowed) unguarded.push(route.endpoint);

    it(`${route.endpoint} is authenticated or explicitly public`, () => {
      expect(
        guarded || allowed,
        `${route.endpoint} has no authentication check and is not in INTENTIONALLY_PUBLIC. ` +
          `Add a guard, or add it to the allowlist with a reason.`,
      ).toBe(true);
    });
  }

  it('reports the full set of unguarded endpoints in one place', () => {
    expect(unguarded).toEqual([]);
  });
});

/**
 * Endpoints that must never become public again, regardless of the allowlist.
 * These handle money, credentials, personal data or administrative state.
 */
describe('High-value endpoints keep an explicit guard', () => {
  const mustBeGuarded: Array<[string, string[]]> = [
    ['/api/coupons', ['requireAdmin']],
    ['/api/coupons/[id]', ['requireAdmin']],
    ['/api/crm/config', ['requireAdmin']],
    ['/api/crm/campaigns', ['requireAdmin']],
    ['/api/crm/send-recommendations', ['requireAdmin']],
    ['/api/crm/sync-contacts', ['requireAdmin']],
    ['/api/crm/analytics', ['requireAdmin']],
    ['/api/create-admin', ['requireSuperAdmin']],
    ['/api/debug-db', ['requireAdmin']],
    ['/api/debug-signup-error', ['requireAdmin']],
    ['/api/skills/[id]', ['requireAdmin']],
    ['/api/payments/create-order', ['requireAuth', 'isOwnerOrAdmin']],
    ['/api/payments/verify', ['requireAuth', 'isOwnerOrAdmin']],
    ['/api/payments/activate-free', ['requireAuth', 'isOwnerOrAdmin']],
    ['/api/account/restore', ['requireAuth', 'isOwnerOrAdmin']],
    ['/api/account/delete', ['requireAuth']],
    ['/api/referral/claim', ['requireAuth', 'isOwnerOrAdmin']],
    ['/api/jobs/[id]/boost', ['requireAuth', 'isOwnerOrAdmin']],
    ['/api/users/[id]/resume', ['requireAuth', 'isOwnerOrAdmin']],
    ['/api/users/[id]/resume/upload', ['requireAuth', 'isOwnerOrAdmin']],
    ['/api/users/[id]/profile-photo/upload', ['requireAuth', 'isOwnerOrAdmin']],
    ['/api/users/[id]/skills', ['requireAuth', 'isOwnerOrAdmin']],
    ['/api/resume/drafts', ['requireAuth', 'isOwnerOrAdmin']],
    ['/api/extension/get-answers', ['requireAuth', 'isOwnerOrAdmin']],
    ['/api/ats-score', ['requireAuth', 'isOwnerOrAdmin']],
    ['/api/career-assistant', ['requireAuth', 'isOwnerOrAdmin']],
    ['/api/notifications', ['requireAuth', 'isOwnerOrAdmin']],
    ['/api/notifications/token', ['requireAuth', 'isOwnerOrAdmin']],
    ['/api/jobs/saved', ['requireAuth', 'isOwnerOrAdmin']],
    ['/api/subscription/check', ['requireAuth', 'isOwnerOrAdmin']],
    ['/api/subscription/cron', ['CRON_SECRET']],
    ['/api/linkedin/auto-apply', ['requireAuth', 'isOwnerOrAdmin']],
    ['/api/applications/[id]/status', ['requireAuth', 'getApplicationAccess']],
    ['/api/applications/[id]/feedback', ['requireAuth', 'getApplicationAccess']],
    ['/api/applications/[id]/view', ['requireAuth', 'getApplicationAccess']],
  ];

  for (const [endpoint, markers] of mustBeGuarded) {
    it(`${endpoint} enforces ${markers.join(' + ')}`, () => {
      const route = routes.find(r => r.endpoint === endpoint);
      expect(route, `route file for ${endpoint} not found`).toBeTruthy();
      const source = fs.readFileSync(route!.file, 'utf8');
      for (const marker of markers) {
        expect(source, `${endpoint} no longer references ${marker}`).toContain(marker);
      }
    });
  }
});

/**
 * The cron entry point must fail closed when its secret is absent, rather than
 * falling back to a guessable default.
 */
describe('Cron authentication fails closed', () => {
  it('does not fall back to a default secret', () => {
    const source = fs.readFileSync(path.join(API_ROOT, 'subscription/cron/route.ts'), 'utf8');
    expect(source).not.toContain('cron-secret-default');
    expect(source).toContain('timingSafeEqual');
  });
});

/**
 * The service-role key must never be exposed to the browser bundle.
 */
describe('Secret handling', () => {
  it('never reads the service-role key through a NEXT_PUBLIC_ variable', () => {
    for (const route of routes) {
      const source = fs.readFileSync(route.file, 'utf8');
      expect(source).not.toMatch(/NEXT_PUBLIC_[A-Z_]*SERVICE_ROLE/);
    }
  });

  it('keeps the service-role key out of client components', () => {
    const clientDirs = [path.resolve(__dirname, '../src/components'), path.resolve(__dirname, '../src/contexts')];
    for (const dir of clientDirs) {
      if (!fs.existsSync(dir)) continue;
      const walk = (d: string): string[] =>
        fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
          e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)],
        );
      for (const file of walk(dir)) {
        if (!/\.(ts|tsx)$/.test(file)) continue;
        const source = fs.readFileSync(file, 'utf8');
        expect(source, `${file} references the service-role key`).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
      }
    }
  });
});
