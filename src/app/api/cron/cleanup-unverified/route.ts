import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireSuperAdmin } from '@/lib/auth-server';
import { safeErrorResponse } from '@/lib/security';

export const dynamic = 'force-dynamic';

/**
 * Validates whether the incoming request is authorized via CRON_SECRET.
 * Uses timing-safe string comparison to prevent timing attacks.
 * Supports:
 *  1. Authorization: Bearer <CRON_SECRET> (Standard Vercel Cron & external schedulers)
 *  2. x-cron-secret: <CRON_SECRET> header
 *  3. ?secret=<CRON_SECRET> query parameter
 */
function isAuthorisedCronRequest(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  // 1. Check Bearer token in Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.substring(7).trim();
    const provided = Buffer.from(token);
    const expected = Buffer.from(cronSecret);
    if (provided.length === expected.length && crypto.timingSafeEqual(provided, expected)) {
      return true;
    }
  }

  // 2. Check x-cron-secret header
  const customHeader = request.headers.get('x-cron-secret');
  if (customHeader) {
    const provided = Buffer.from(customHeader.trim());
    const expected = Buffer.from(cronSecret);
    if (provided.length === expected.length && crypto.timingSafeEqual(provided, expected)) {
      return true;
    }
  }

  // 3. Check query param ?secret=
  try {
    const url = new URL(request.url);
    const querySecret = url.searchParams.get('secret');
    if (querySecret) {
      const provided = Buffer.from(querySecret.trim());
      const expected = Buffer.from(cronSecret);
      if (provided.length === expected.length && crypto.timingSafeEqual(provided, expected)) {
        return true;
      }
    }
  } catch {}

  return false;
}

/**
 * Core cleanup handler for purging unverified user accounts from Supabase Auth
 * and associated profile tables after an expiration threshold (default: 48 hours).
 */
async function executeUnverifiedCleanup(request: Request) {
  try {
    // 1. Authentication: Require CRON_SECRET or Super Admin session
    if (!isAuthorisedCronRequest(request)) {
      const { user: superAdmin, errorResponse } = await requireSuperAdmin(request);
      if (errorResponse) {
        return errorResponse;
      }
    }

    // 2. Parse configuration and parameters
    let olderThanHours = 48; // Default: 48 hours (2 days grace period)
    let dryRun = false;
    let limit = 100; // Batch limit per execution to avoid serverless timeouts

    try {
      const url = new URL(request.url);
      const qHours = url.searchParams.get('olderThanHours') || url.searchParams.get('hours');
      const qDays = url.searchParams.get('olderThanDays') || url.searchParams.get('days');
      const qDryRun = url.searchParams.get('dryRun');
      const qLimit = url.searchParams.get('limit');

      if (qHours !== null && qHours !== undefined) {
        const parsed = parseFloat(qHours);
        if (!isNaN(parsed)) olderThanHours = parsed;
      } else if (qDays !== null && qDays !== undefined) {
        const parsed = parseFloat(qDays);
        if (!isNaN(parsed)) olderThanHours = parsed * 24;
      }

      if (qDryRun !== null && qDryRun !== undefined) {
        dryRun = qDryRun === 'true' || qDryRun === '1';
      }

      if (qLimit) {
        const parsed = parseInt(qLimit, 10);
        if (!isNaN(parsed) && parsed > 0) limit = Math.min(500, parsed);
      }

      // If POST request, check for body parameters
      if (request.method === 'POST') {
        try {
          const cloned = request.clone();
          const body = await cloned.json();
          if (body && typeof body === 'object') {
            if (typeof body.olderThanHours === 'number') {
              olderThanHours = body.olderThanHours;
            } else if (typeof body.olderThanDays === 'number') {
              olderThanHours = body.olderThanDays * 24;
            }
            if (typeof body.dryRun === 'boolean') {
              dryRun = body.dryRun;
            }
            if (typeof body.limit === 'number' && body.limit > 0) {
              limit = Math.min(500, body.limit);
            }
          }
        } catch {}
      }
    } catch (parseErr) {
      console.warn('[CLEANUP_UNVERIFIED] Error parsing query parameters:', parseErr);
    }

    // Safety guardrail: Never allow deleting accounts created less than 1 hour ago
    olderThanHours = Math.max(1, olderThanHours);

    const now = new Date();
    const cutoff = new Date(now.getTime() - olderThanHours * 60 * 60 * 1000);

    // 3. Scan Supabase Auth users with pagination
    let page = 1;
    const perPage = 100;
    let hasMore = true;
    let totalScanned = 0;
    const candidates: Array<{
      id: string;
      email: string;
      createdAt: string;
      ageHours: number;
      role: string;
    }> = [];

    while (hasMore && candidates.length < limit) {
      const { data, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });

      if (listErr) {
        console.error('[CLEANUP_UNVERIFIED] Failed to list auth users:', listErr);
        throw listErr;
      }

      const users = data?.users || [];
      if (users.length === 0) break;
      totalScanned += users.length;

      for (const u of users) {
        if (candidates.length >= limit) break;

        // Skip verified accounts
        const isEmailConfirmed = Boolean(u.email_confirmed_at || (u as any).confirmed_at);
        if (isEmailConfirmed) continue;

        // Skip users within grace period
        const createdAt = new Date(u.created_at);
        if (isNaN(createdAt.getTime()) || createdAt >= cutoff) {
          continue;
        }

        // Never touch Administrator accounts
        const roleMeta = u.user_metadata?.role;
        if (roleMeta === 'Admin' || roleMeta === 'Super Admin') {
          continue;
        }

        const ageHours = Math.round(((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)) * 10) / 10;
        candidates.push({
          id: u.id,
          email: u.email || 'no-email',
          createdAt: u.created_at,
          ageHours,
          role: roleMeta || 'Job Seeker',
        });
      }

      if (users.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }
    }

    // 4. Secondary safety verification: Confirm candidate is not in admins table
    const verifiedCandidates: typeof candidates = [];
    for (const cand of candidates) {
      const { data: adminRow } = await supabaseAdmin
        .from('admins')
        .select('id')
        .eq('uuid', cand.id)
        .maybeSingle();

      if (!adminRow) {
        verifiedCandidates.push(cand);
      }
    }

    // 5. Perform deletions (unless dryRun)
    const deleted: Array<{ id: string; email: string; createdAt: string; role: string }> = [];
    const errors: Array<{ id: string; email: string; error: string }> = [];

    if (!dryRun) {
      for (const cand of verifiedCandidates) {
        try {
          // Delete jobseeker profile sub-tables if any exist
          await Promise.allSettled([
            supabaseAdmin.from('jobseeker_personal_details').delete().eq('jobseeker_id', cand.id),
            supabaseAdmin.from('education').delete().eq('jobseeker_id', cand.id),
            supabaseAdmin.from('experience').delete().eq('jobseeker_id', cand.id),
            supabaseAdmin.from('projects').delete().eq('jobseeker_id', cand.id),
            supabaseAdmin.from('languages').delete().eq('jobseeker_id', cand.id),
          ]);

          // Delete user notifications
          try {
            await supabaseAdmin.from('notifications').delete().or(`user_id.eq.${cand.id},user_pk.eq.${cand.id}`);
          } catch {}

          // Delete main profile row
          await Promise.allSettled([
            supabaseAdmin.from('jobseekers').delete().eq('uuid', cand.id),
            supabaseAdmin.from('recruiters').delete().eq('uuid', cand.id),
          ]);

          // Delete from Supabase Auth
          const { error: authDelErr } = await supabaseAdmin.auth.admin.deleteUser(cand.id);
          if (authDelErr) {
            console.error(`[CLEANUP_UNVERIFIED] Error deleting auth user ${cand.id} (${cand.email}):`, authDelErr);
            errors.push({ id: cand.id, email: cand.email, error: authDelErr.message });
          } else {
            deleted.push(cand);
          }
        } catch (delErr: any) {
          console.error(`[CLEANUP_UNVERIFIED] Unexpected error cleaning up user ${cand.id}:`, delErr);
          errors.push({ id: cand.id, email: cand.email, error: delErr?.message || String(delErr) });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: dryRun
        ? `Dry run complete. Found ${verifiedCandidates.length} unverified account(s) older than ${olderThanHours} hours.`
        : `Cleanup complete. Successfully removed ${deleted.length} unverified account(s) older than ${olderThanHours} hours.`,
      dryRun,
      cutoff: cutoff.toISOString(),
      olderThanHours,
      scannedCount: totalScanned,
      candidateCount: verifiedCandidates.length,
      deletedCount: dryRun ? 0 : deleted.length,
      deleted: dryRun ? verifiedCandidates : deleted,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    return safeErrorResponse(error, 'Failed to execute unverified account cleanup cron job');
  }
}

export async function GET(request: Request) {
  return executeUnverifiedCleanup(request);
}

export async function POST(request: Request) {
  return executeUnverifiedCleanup(request);
}
