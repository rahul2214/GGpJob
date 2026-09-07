import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
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
    }

    // Update the application with rating and feedback
    // We target the primary key 'id'
    const { data, error } = await supabaseAdmin
      .from('applications')
      .update({
        rating: numericRating,
        feedback: feedback || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', access.applicationPk)
      .select()
      .single();

    if (error) {
      console.error('[API_APPLICATION_FEEDBACK_PUT] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update feedback', details: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[API_APPLICATION_FEEDBACK_PUT] Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred', details: error.message }, { status: 500 });
  }
}
