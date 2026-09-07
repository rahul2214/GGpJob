import sys; sys.path.insert(0, 'scratch/sec')
from patchlib import patch

# ---------- referral/claim: unauth credit farming + reward race ----------
patch('src/app/api/referral/claim/route.ts', [
(
r"""import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { referralCode, userUuid } = body;""",
r"""import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => ({}));
    const { referralCode, userUuid } = body;"""
),
(
r"""    const code = referralCode.trim().toUpperCase();""",
r"""    // The claim credits both parties, so the caller must be the referee. Without
    // this check anyone could redeem their own code against arbitrary accounts.
    if (!isOwnerOrAdmin(authUser!, userUuid.trim())) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot claim a referral for another account.' },
        { status: 403 }
      );
    }

    const code = referralCode.trim().toUpperCase();"""
),
(
r"""    // 6. Check if email is verified in auth.users to award credits now
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(referee.uuid);
    const isEmailConfirmed = Boolean(authUser?.user?.email_confirmed_at);

    if (isEmailConfirmed && !(referee.referral_rewarded ?? referee.metadata?.referral_rewarded)) {""",
r"""    // 6. Check if email is verified in auth.users to award credits now
    const { data: refereeAuth } = await supabaseAdmin.auth.admin.getUserById(referee.uuid);
    const isEmailConfirmed = Boolean(refereeAuth?.user?.email_confirmed_at);

    // Claim the reward atomically. The update only matches while the referral is
    // still unrewarded, so concurrent requests cannot both pass the check and
    // award credits twice.
    let rewardClaimed = false;
    if (isEmailConfirmed && !(referee.referral_rewarded ?? referee.metadata?.referral_rewarded)) {
      const claimIso = new Date().toISOString();
      const { data: claimedRows } = await supabaseAdmin
        .from('jobseekers')
        .update({
          referral_rewarded: true,
          referral_rewarded_at: claimIso,
          updated_at: claimIso,
        })
        .eq('id', referee.id)
        .or('referral_rewarded.is.null,referral_rewarded.eq.false')
        .select('id');
      rewardClaimed = Array.isArray(claimedRows) && claimedRows.length > 0;
    }

    if (rewardClaimed) {"""
),
(
r"""      // 4. Mark referral as rewarded
      const nowIso = new Date().toISOString();
      await supabaseAdmin
        .from('jobseekers')
        .update({
          referral_rewarded: true,
          referral_rewarded_at: nowIso,
          updated_at: nowIso,
        })
        .eq('id', referee.id);
    }""",
r"""      // The rewarded flag was already set atomically when the claim was won.
    }"""
),
])

# ---------- jobs/[id]/boost: client-asserted identity + credit race ----------
patch('src/app/api/jobs/[id]/boost/route.ts', [
(
r"""import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();""",
r"""import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id } = params;
    const body = await request.json();"""
),
(
r"""    if (empError || !employee) {
      return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 });
    }""",
r"""    if (empError || !employee) {
      return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 });
    }

    // The employee id arrives in the request body, so bind it to the verified
    // session before spending that account's credits.
    const isAdminCaller =
      authUser!.role === 'Admin' || authUser!.role === 'Super Admin' || Boolean(authUser!.isSuperAdmin);
    const ownsEmployeeProfile =
      isAdminCaller ||
      isOwnerOrAdmin(authUser!, employee.uuid) ||
      (Boolean(employee.email) && employee.email === authUser!.email);

    if (!ownsEmployeeProfile) {
      return NextResponse.json({ error: 'Forbidden: Cannot spend credits from another account.' }, { status: 403 });
    }"""
),
(
r"""      .select('id, credits')
      .eq('uuid', employeeId)
      .single();""",
r"""      .select('id, uuid, email, credits')
      .eq('uuid', employeeId)
      .single();"""
),
(
r"""    const [
      { error: updateJobError },
      { error: updateEmpError }
    ] = await Promise.all([
      supabaseAdmin
        .from('jobs')
        .update({ plan_type_at_posting: newPlan })
        .eq('id', job.id),
      supabaseAdmin
        .from('employees')
        .update({ credits: currentBalance - boostCost })
        .eq('id', employee.id)
    ]);

    if (updateJobError || updateEmpError) {
      console.error('[API_JOB_BOOST] Update error:', { updateJobError, updateEmpError });
      return NextResponse.json({ error: 'Failed to complete boosting transaction' }, { status: 500 });
    }""",
r"""    // Deduct first, with the balance we read as an optimistic lock. If a
    // concurrent boost already spent the credits the row will not match and no
    // second boost is granted.
    const { data: debited, error: updateEmpError } = await supabaseAdmin
      .from('employees')
      .update({ credits: currentBalance - boostCost })
      .eq('id', employee.id)
      .eq('credits', currentBalance)
      .select('id');

    if (updateEmpError) {
      console.error('[API_JOB_BOOST] Credit deduction error:', updateEmpError);
      return NextResponse.json({ error: 'Failed to complete boosting transaction' }, { status: 500 });
    }

    if (!debited || debited.length === 0) {
      return NextResponse.json(
        { error: 'Your credit balance changed while the boost was being processed. Please retry.' },
        { status: 409 }
      );
    }

    const { error: updateJobError } = await supabaseAdmin
      .from('jobs')
      .update({ plan_type_at_posting: newPlan })
      .eq('id', job.id);

    if (updateJobError) {
      // Refund so a failed boost never silently consumes credits.
      await supabaseAdmin
        .from('employees')
        .update({ credits: currentBalance })
        .eq('id', employee.id);
      console.error('[API_JOB_BOOST] Update error:', updateJobError);
      return NextResponse.json({ error: 'Failed to complete boosting transaction' }, { status: 500 });
    }"""
),
])

# ---------- debug endpoints: unauthenticated internal disclosure ----------
patch('src/app/api/debug-db/route.ts', [
(
r"""import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
    const tables""",
r"""import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(request: Request) {
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const tables"""
),
])

patch('src/app/api/debug-signup-error/route.ts', [
(
r"""import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {""",
r"""import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(request: Request) {
  try {
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;
"""
),
])

# ---------- subscription cron: hardcoded default secret ----------
patch('src/app/api/subscription/cron/route.ts', [
(
r"""import { supabaseAdmin } from '@/lib/supabase-admin';""",
r"""import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

/**
 * Constant-time comparison of the cron bearer token. Fails closed when
 * CRON_SECRET is not configured, rather than falling back to a known default.
 */
function isAuthorisedCronRequest(authHeader: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || !authHeader) return false;

  const provided = Buffer.from(authHeader);
  const expected = Buffer.from(`Bearer ${cronSecret}`);
  if (provided.length !== expected.length) return false;
  return crypto.timingSafeEqual(provided, expected);
}"""
),
(
r"""    // Simple auth check for cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'cron-secret-default';
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }""",
r"""    // Cron authentication. A missing CRON_SECRET denies the request instead of
    // falling back to a guessable default.
    if (!isAuthorisedCronRequest(request.headers.get('authorization'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }"""
),
])

# ---------- payments/create-order: no authentication ----------
patch('src/app/api/payments/create-order/route.ts', [
(
r"""import { getPlanPrices } from '@/lib/plan-prices-service';""",
r"""import { getPlanPrices } from '@/lib/plan-prices-service';
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';"""
),
(
r"""export async function POST(request: Request) {
  try {
    const { userId, planId, amount, couponCode, currency = 'USD' } = await request.json();

    if (!userId || !planId || amount === undefined) {
      return NextResponse.json({ error: 'User ID, Plan ID, and Amount are required' }, { status: 400 });
    }""",
r"""export async function POST(request: Request) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { userId, planId, amount, couponCode, currency = 'USD' } = await request.json();

    if (!userId || !planId || amount === undefined) {
      return NextResponse.json({ error: 'User ID, Plan ID, and Amount are required' }, { status: 400 });
    }

    if (!isOwnerOrAdmin(authUser!, userId)) {
      return NextResponse.json({ error: 'Forbidden: Cannot create an order for another user account.' }, { status: 403 });
    }"""
),
])
