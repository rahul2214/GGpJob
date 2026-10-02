import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

const {
  mockListUsers,
  mockDeleteUser,
  mockRequireSuperAdmin,
  mockSupabaseAdminFrom,
} = vi.hoisted(() => ({
  mockListUsers: vi.fn(),
  mockDeleteUser: vi.fn(),
  mockRequireSuperAdmin: vi.fn(),
  mockSupabaseAdminFrom: vi.fn(),
}));

vi.mock('@/lib/auth-server', () => ({
  requireSuperAdmin: mockRequireSuperAdmin,
}));

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        listUsers: mockListUsers,
        deleteUser: mockDeleteUser,
      },
    },
    from: mockSupabaseAdminFrom,
  },
}));

import { GET, POST } from '@/app/api/cron/cleanup-unverified/route';

describe('Unverified Account Automated Cleanup Cron (/api/cron/cleanup-unverified)', () => {
  const TEST_SECRET = 'super-secret-cron-token-12345';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = TEST_SECRET;

    // Default mock for DB queries
    mockSupabaseAdminFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    mockListUsers.mockResolvedValue({
      data: { users: [] },
      error: null,
    });

    mockDeleteUser.mockResolvedValue({ error: null });

    mockRequireSuperAdmin.mockResolvedValue({
      errorResponse: NextResponse.json(
        { error: 'Forbidden: Super Administrator privileges required.' },
        { status: 403 }
      ),
    });
  });

  describe('Authentication and Authorization Guards', () => {
    it('rejects unauthorized request with missing token and no admin session', async () => {
      const req = new Request('http://localhost:9500/api/cron/cleanup-unverified', {
        method: 'GET',
      });
      const res = await GET(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toMatch(/Super Administrator privileges required/i);
    });

    it('rejects request with invalid bearer token', async () => {
      const req = new Request('http://localhost:9500/api/cron/cleanup-unverified', {
        method: 'POST',
        headers: {
          authorization: 'Bearer wrong-secret-token',
        },
      });
      const res = await POST(req);
      expect(res.status).toBe(403);
    });

    it('authorizes request with valid Bearer CRON_SECRET header', async () => {
      const req = new Request('http://localhost:9500/api/cron/cleanup-unverified', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${TEST_SECRET}`,
        },
      });
      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it('authorizes request with valid x-cron-secret header', async () => {
      const req = new Request('http://localhost:9500/api/cron/cleanup-unverified', {
        method: 'GET',
        headers: {
          'x-cron-secret': TEST_SECRET,
        },
      });
      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it('authorizes request with valid ?secret= query param', async () => {
      const req = new Request(`http://localhost:9500/api/cron/cleanup-unverified?secret=${TEST_SECRET}`, {
        method: 'GET',
      });
      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it('authorizes request when authenticated as Super Admin without cron secret', async () => {
      mockRequireSuperAdmin.mockResolvedValueOnce({
        user: { id: 1, uuid: 'admin-uuid', role: 'Super Admin', isSuperAdmin: true },
      });

      const req = new Request('http://localhost:9500/api/cron/cleanup-unverified', {
        method: 'POST',
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });

  describe('Cleanup Logic & Safety Rules', () => {
    const now = Date.now();
    const threeDaysAgo = new Date(now - 72 * 60 * 60 * 1000).toISOString();
    const tenMinutesAgo = new Date(now - 10 * 60 * 1000).toISOString();

    const sampleUsers = [
      // 1. Unverified bot account > 48h old -> MUST be cleaned up
      {
        id: 'bot-user-1',
        email: 'spambot123@temp.com',
        created_at: threeDaysAgo,
        email_confirmed_at: null,
        confirmed_at: null,
        user_metadata: { role: 'Job Seeker' },
      },
      // 2. Verified user > 48h old -> MUST NEVER be deleted
      {
        id: 'verified-user-2',
        email: 'legit@gmail.com',
        created_at: threeDaysAgo,
        email_confirmed_at: threeDaysAgo,
        confirmed_at: threeDaysAgo,
        user_metadata: { role: 'Job Seeker' },
      },
      // 3. Fresh unverified user (10 mins ago) -> MUST NOT be deleted (within grace period)
      {
        id: 'fresh-user-3',
        email: 'inprogress@outlook.com',
        created_at: tenMinutesAgo,
        email_confirmed_at: null,
        confirmed_at: null,
        user_metadata: { role: 'Job Seeker' },
      },
      // 4. Admin account unverified -> MUST NEVER be deleted
      {
        id: 'admin-user-4',
        email: 'admin@jobportal.com',
        created_at: threeDaysAgo,
        email_confirmed_at: null,
        confirmed_at: null,
        user_metadata: { role: 'Admin' },
      },
    ];

    it('identifies unverified candidates in dryRun mode without executing deletion', async () => {
      mockListUsers.mockResolvedValueOnce({
        data: { users: sampleUsers },
        error: null,
      });

      const req = new Request(`http://localhost:9500/api/cron/cleanup-unverified?dryRun=true&olderThanHours=48`, {
        method: 'GET',
        headers: { authorization: `Bearer ${TEST_SECRET}` },
      });

      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.dryRun).toBe(true);
      expect(json.scannedCount).toBe(4);
      expect(json.candidateCount).toBe(1);
      expect(json.deletedCount).toBe(0);
      expect(json.deleted[0].id).toBe('bot-user-1');
      expect(json.deleted[0].email).toBe('spambot123@temp.com');

      // deleteUser must not be called during dry run
      expect(mockDeleteUser).not.toHaveBeenCalled();
    });

    it('purges candidate account and associated profile rows during actual execution', async () => {
      mockListUsers.mockResolvedValueOnce({
        data: { users: sampleUsers },
        error: null,
      });

      const req = new Request(`http://localhost:9500/api/cron/cleanup-unverified?olderThanHours=48`, {
        method: 'POST',
        headers: { authorization: `Bearer ${TEST_SECRET}` },
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.dryRun).toBe(false);
      expect(json.deletedCount).toBe(1);
      expect(json.deleted[0].id).toBe('bot-user-1');

      // Assert auth delete was invoked for the spam bot account
      expect(mockDeleteUser).toHaveBeenCalledTimes(1);
      expect(mockDeleteUser).toHaveBeenCalledWith('bot-user-1');
    });

    it('enforces minimum 1 hour safety threshold even if 0 hours requested', async () => {
      mockListUsers.mockResolvedValueOnce({
        data: {
          users: [
            {
              id: 'recent-bot',
              email: 'fresh@example.com',
              created_at: new Date(now - 15 * 60 * 1000).toISOString(), // 15 mins ago
              email_confirmed_at: null,
            },
          ],
        },
        error: null,
      });

      const req = new Request(`http://localhost:9500/api/cron/cleanup-unverified?olderThanHours=0&dryRun=true`, {
        method: 'GET',
        headers: { authorization: `Bearer ${TEST_SECRET}` },
      });

      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      // OlderThanHours is clamped to 1 hour minimum
      expect(json.olderThanHours).toBe(1);
      expect(json.candidateCount).toBe(0);
    });

    it('protects users present in admins table even if metadata does not say Admin', async () => {
      mockListUsers.mockResolvedValueOnce({
        data: {
          users: [
            {
              id: 'stealth-admin',
              email: 'hiddenadmin@example.com',
              created_at: threeDaysAgo,
              email_confirmed_at: null,
              user_metadata: {},
            },
          ],
        },
        error: null,
      });

      // Mock DB: found in admins table
      mockSupabaseAdminFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: { id: 99 }, error: null }),
      });

      const req = new Request(`http://localhost:9500/api/cron/cleanup-unverified?dryRun=true`, {
        method: 'GET',
        headers: { authorization: `Bearer ${TEST_SECRET}` },
      });

      const res = await GET(req);
      const json = await res.json();

      expect(json.candidateCount).toBe(0);
      expect(mockDeleteUser).not.toHaveBeenCalled();
    });
  });
});
