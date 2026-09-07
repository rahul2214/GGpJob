import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

/**
 * Regression tests for the broken-access-control findings.
 *
 * Each of these endpoints previously ran with the Supabase service-role key and
 * no identity check at all, so any anonymous caller could read or modify another
 * account's data. The tests drive the real route handlers with the auth layer
 * stubbed to "not signed in" and assert that the handler refuses before it
 * reaches the database.
 *
 * If a guard is ever removed the handler will fall through to the (unmocked)
 * database layer and the assertion on the 401 will fail.
 */

const unauthorized = () =>
  NextResponse.json({ error: 'Unauthorized: Valid authentication token is required.' }, { status: 401 });

const forbiddenAdmin = () =>
  NextResponse.json({ error: 'Forbidden: Administrator privileges required.' }, { status: 403 });

vi.mock('@/lib/auth-server', () => ({
  requireAuth: vi.fn(async () => ({ errorResponse: unauthorized() })),
  requireAdmin: vi.fn(async () => ({ errorResponse: forbiddenAdmin() })),
  requireSuperAdmin: vi.fn(async () => ({ errorResponse: forbiddenAdmin() })),
  getAuthenticatedUser: vi.fn(async () => null),
  isOwnerOrAdmin: vi.fn(() => false),
}));

// The service-role client must never be reached by an unauthenticated request.
// Any property access here means a guard was missing.
vi.mock('@/lib/supabase-admin', () => {
  const trap = new Proxy(
    {},
    {
      get() {
        throw new Error('SECURITY REGRESSION: database was reached without authentication');
      },
    },
  );
  return { supabaseAdmin: trap, getSupabaseAdmin: () => trap };
});

function jsonRequest(url: string, method: string, body: unknown = {}) {
  return new Request(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: method === 'GET' || method === 'DELETE' ? undefined : JSON.stringify(body),
  });
}

interface Case {
  name: string;
  module: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  body?: unknown;
  params?: Record<string, string>;
  expected: number;
}

const ownershipCases: Case[] = [
  {
    name: 'GET /api/resume/drafts — reading another user\'s resume draft',
    module: '@/app/api/resume/drafts/route',
    method: 'GET',
    url: 'http://localhost/api/resume/drafts?userId=00000000-0000-4000-8000-000000000001',
    expected: 401,
  },
  {
    name: 'POST /api/resume/drafts — overwriting another user\'s resume draft',
    module: '@/app/api/resume/drafts/route',
    method: 'POST',
    url: 'http://localhost/api/resume/drafts',
    body: { userId: '00000000-0000-4000-8000-000000000001', resumeData: { a: 1 } },
    expected: 401,
  },
  {
    name: 'DELETE /api/resume/drafts — deleting another user\'s resume draft',
    module: '@/app/api/resume/drafts/route',
    method: 'DELETE',
    url: 'http://localhost/api/resume/drafts?id=1&userId=00000000-0000-4000-8000-000000000001',
    expected: 401,
  },
  {
    name: 'POST /api/extension/get-answers — dumping another user\'s personal details',
    module: '@/app/api/extension/get-answers/route',
    method: 'POST',
    url: 'http://localhost/api/extension/get-answers',
    body: { userId: '00000000-0000-4000-8000-000000000001', questions: ['name'] },
    expected: 401,
  },
  {
    name: 'PUT /api/users/[id]/resume — repointing another user\'s resume',
    module: '@/app/api/users/[id]/resume/route',
    method: 'PUT',
    url: 'http://localhost/api/users/2/resume',
    body: { resumeUrl: 'r2://bucket/resumes/2/x.pdf' },
    params: { id: '2' },
    expected: 401,
  },
  {
    name: 'POST /api/users/[id]/skills — wiping another user\'s skills',
    module: '@/app/api/users/[id]/skills/route',
    method: 'POST',
    url: 'http://localhost/api/users/2/skills',
    body: { skills: [] },
    params: { id: '2' },
    expected: 401,
  },
  {
    name: 'POST /api/account/restore — undeleting another user\'s account',
    module: '@/app/api/account/restore/route',
    method: 'POST',
    url: 'http://localhost/api/account/restore',
    body: { userId: '00000000-0000-4000-8000-000000000001' },
    expected: 401,
  },
  {
    name: 'PUT /api/applications/[id]/feedback — rating another recruiter\'s applicant',
    module: '@/app/api/applications/[id]/feedback/route',
    method: 'PUT',
    url: 'http://localhost/api/applications/1/feedback',
    body: { rating: 5, feedback: 'x' },
    params: { id: '1' },
    expected: 401,
  },
  {
    name: 'POST /api/applications/[id]/view — advancing another recruiter\'s application',
    module: '@/app/api/applications/[id]/view/route',
    method: 'POST',
    url: 'http://localhost/api/applications/1/view',
    params: { id: '1' },
    expected: 401,
  },
  {
    name: 'PUT /api/applications/[id]/status — driving another candidate\'s pipeline',
    module: '@/app/api/applications/[id]/status/route',
    method: 'PUT',
    url: 'http://localhost/api/applications/1/status',
    body: { statusId: 3 },
    params: { id: '1' },
    expected: 401,
  },
  {
    name: 'POST /api/referral/claim — farming referral credits onto other accounts',
    module: '@/app/api/referral/claim/route',
    method: 'POST',
    url: 'http://localhost/api/referral/claim',
    body: { referralCode: 'ABC123', userUuid: '00000000-0000-4000-8000-000000000001' },
    expected: 401,
  },
  {
    name: 'POST /api/jobs/[id]/boost — spending another account\'s credits',
    module: '@/app/api/jobs/[id]/boost/route',
    method: 'POST',
    url: 'http://localhost/api/jobs/1/boost',
    body: { employeeId: '00000000-0000-4000-8000-000000000001' },
    params: { id: '1' },
    expected: 401,
  },
  {
    name: 'POST /api/payments/create-order — creating an order for another account',
    module: '@/app/api/payments/create-order/route',
    method: 'POST',
    url: 'http://localhost/api/payments/create-order',
    body: { userId: '00000000-0000-4000-8000-000000000001', planId: 'pro', amount: 1 },
    expected: 401,
  },
  {
    name: 'POST /api/jobs — publishing a listing as another recruiter',
    module: '@/app/api/jobs/route',
    method: 'POST',
    url: 'http://localhost/api/jobs',
    body: { recruiterId: '1', title: 'x', description: 'y', location: 'z', skills: ['a'] },
    expected: 401,
  },
  {
    name: 'POST /api/career-assistant — acting as another user',
    module: '@/app/api/career-assistant/route',
    method: 'POST',
    url: 'http://localhost/api/career-assistant',
    body: { userId: '00000000-0000-4000-8000-000000000001', message: 'hi' },
    expected: 401,
  },
];

const adminCases: Case[] = [
  {
    name: 'GET /api/debug-db — schema disclosure',
    module: '@/app/api/debug-db/route',
    method: 'GET',
    url: 'http://localhost/api/debug-db',
    expected: 403,
  },
  {
    name: 'GET /api/debug-signup-error — internal error disclosure',
    module: '@/app/api/debug-signup-error/route',
    method: 'GET',
    url: 'http://localhost/api/debug-signup-error',
    expected: 403,
  },
  {
    name: 'GET /api/crm/config — reading the Brevo configuration',
    module: '@/app/api/crm/config/route',
    method: 'GET',
    url: 'http://localhost/api/crm/config',
    expected: 403,
  },
  {
    name: 'POST /api/crm/config — writing values into the server .env file',
    module: '@/app/api/crm/config/route',
    method: 'POST',
    url: 'http://localhost/api/crm/config',
    body: { apiKey: 'xkeysib-aaaaaaaaaaaa', senderName: 'x\nINJECTED=1' },
    expected: 403,
  },
  {
    name: 'PUT /api/job-types/[id] — editing reference data',
    module: '@/app/api/job-types/[id]/route',
    method: 'PUT',
    url: 'http://localhost/api/job-types/1',
    body: { name: 'x' },
    params: { id: '1' },
    expected: 403,
  },
  {
    name: 'DELETE /api/job-types/[id] — deleting reference data',
    module: '@/app/api/job-types/[id]/route',
    method: 'DELETE',
    url: 'http://localhost/api/job-types/1',
    params: { id: '1' },
    expected: 403,
  },
  {
    name: 'PUT /api/experience-levels/[id] — editing reference data',
    module: '@/app/api/experience-levels/[id]/route',
    method: 'PUT',
    url: 'http://localhost/api/experience-levels/1',
    body: { name: 'x' },
    params: { id: '1' },
    expected: 403,
  },
  {
    name: 'PUT /api/workplace-types/[id] — editing reference data',
    module: '@/app/api/workplace-types/[id]/route',
    method: 'PUT',
    url: 'http://localhost/api/workplace-types/1',
    body: { name: 'x' },
    params: { id: '1' },
    expected: 403,
  },
  {
    name: 'POST /api/notice-periods — creating reference data',
    module: '@/app/api/notice-periods/route',
    method: 'POST',
    url: 'http://localhost/api/notice-periods',
    body: { name: 'x' },
    expected: 403,
  },
];

async function runCase(c: Case) {
  const mod: any = await import(/* @vite-ignore */ c.module);
  const handler = mod[c.method];
  expect(handler, `${c.module} does not export ${c.method}`).toBeTypeOf('function');

  const req = jsonRequest(c.url, c.method, c.body);
  const res = c.params ? await handler(req, { params: c.params }) : await handler(req);
  return res;
}

describe('Broken access control — anonymous callers are refused', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  for (const c of ownershipCases) {
    it(c.name, async () => {
      const res = await runCase(c);
      expect(res.status).toBe(c.expected);
    });
  }
});

describe('Privilege escalation — non-admins are refused on admin surfaces', () => {
  for (const c of adminCases) {
    it(c.name, async () => {
      const res = await runCase(c);
      expect(res.status).toBe(c.expected);
    });
  }
});
