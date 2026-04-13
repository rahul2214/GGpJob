import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { rating, feedback } = await request.json();

    if (rating === undefined) {
      return NextResponse.json({ error: 'Rating is required' }, { status: 400 });
    }

    // Update the application with rating and feedback
    // We target the primary key 'id'
    const { data, error } = await supabaseAdmin
      .from('applications')
      .update({
        rating,
        feedback: feedback || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
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
