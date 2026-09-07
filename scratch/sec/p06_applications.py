import sys; sys.path.insert(0, 'scratch/sec')
from patchlib import patch

# --- applications/[id]/feedback : unauthenticated write to any application ---
patch('src/app/api/applications/[id]/feedback/route.ts', [
(
r"""import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { rating, feedback } = await request.json();

    if (rating === undefined) {
      return NextResponse.json({ error: 'Rating is required' }, { status: 400 });
    }""",
r"""import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth } from '@/lib/auth-server';
import { getApplicationAccess } from '@/lib/authz';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id } = params;
    const { rating, feedback } = await request.json();

    if (rating === undefined) {
      return NextResponse.json({ error: 'Rating is required' }, { status: 400 });
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 0 || numericRating > 5) {
      return NextResponse.json({ error: 'Rating must be a number between 0 and 5' }, { status: 400 });
    }

    if (feedback !== undefined && feedback !== null) {
      if (typeof feedback !== 'string') {
        return NextResponse.json({ error: 'Feedback must be text' }, { status: 400 });
      }
      if (feedback.length > 5000) {
        return NextResponse.json({ error: 'Feedback must be 5000 characters or fewer' }, { status: 400 });
      }
    }

    // Rating and feedback are recorded by the party that posted the job.
    const access = await getApplicationAccess(authUser!, id);
    if (!access) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    if (!access.isJobOwner && !access.isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You do not have access to this application.' }, { status: 403 });
    }"""
),
(
r"""      .update({
        rating,
        feedback: feedback || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)""",
r"""      .update({
        rating: numericRating,
        feedback: feedback || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', access.applicationPk)"""
),
])

# --- applications/[id]/view : unauthenticated status advance on any application ---
patch('src/app/api/applications/[id]/view/route.ts', [
(
r"""import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    // 0. Resolve the numeric PK if a UUID is provided
    let targetPk = id;
    if (id.includes('-')) {
        const { data: resolvedApp } = await supabaseAdmin
            .from('applications')
            .select('id')
            .eq('uuid', id)
            .maybeSingle();
        if (resolvedApp) targetPk = resolvedApp.id.toString();
    }""",
r"""import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth } from '@/lib/auth-server';
import { getApplicationAccess } from '@/lib/authz';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    // 0. Resolve the application and confirm the caller posted the job. Only the
    // job owner viewing a candidate can move the application to "Profile Viewed".
    const access = await getApplicationAccess(authUser!, id);
    if (!access) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    if (!access.isJobOwner && !access.isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You do not have access to this application.' }, { status: 403 });
    }
    const targetPk = access.applicationPk;"""
),
])

# --- applications/[id]/status : authenticated but no ownership check ---
patch('src/app/api/applications/[id]/status/route.ts', [
(
r"""import { requireAuth } from '@/lib/auth-server';""",
r"""import { requireAuth } from '@/lib/auth-server';
import { getApplicationAccess } from '@/lib/authz';"""
),
(
r"""    const sId = Number(statusId);

    // 0. Resolve numeric PK if UUID provided
    let targetPk = params.id;
    if (params.id.includes('-')) {
        const { data: resolvedApp } = await supabaseAdmin
            .from('applications')
            .select('id')
            .eq('uuid', params.id)
            .maybeSingle();
        if (resolvedApp) targetPk = resolvedApp.id.toString();
    }""",
r"""    const sId = Number(statusId);

    if (!Number.isInteger(sId) || !Object.prototype.hasOwnProperty.call(statusMap, sId)) {
      return NextResponse.json({ error: 'Unknown status ID' }, { status: 400 });
    }

    // 0. Resolve the application and confirm the caller is a party to it.
    // Without this, any authenticated user could drive any candidate's pipeline.
    const access = await getApplicationAccess(authUser!, params.id);
    if (!access) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    if (!access.isApplicant && !access.isJobOwner && !access.isAdmin) {
        return NextResponse.json({ error: 'Forbidden: You do not have access to this application.' }, { status: 403 });
    }
    const targetPk = access.applicationPk;"""
),
])
