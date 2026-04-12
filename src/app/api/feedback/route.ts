import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
    try {
        const { data: feedbackData, error } = await supabaseAdmin
            .from('portal_feedback')
            .select(`
                *,
                jobseekers:user_pk(uuid, name, email)
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;

        const feedbackList = (feedbackData || []).map(item => ({
            id: item.id,
            userId: (item as any).jobseekers?.uuid,
            userPk: item.user_pk,
            rating: item.rating,
            feedback: item.feedback,
            submittedAt: item.created_at,
            userName: (item as any).jobseekers?.name || 'Anonymous',
            userEmail: (item as any).jobseekers?.email || ''
        }));
        
        return NextResponse.json(feedbackList);
    } catch (e: any) {
        console.error('[API_FEEDBACK_GET] Error:', e);
        return NextResponse.json({ error: 'Failed to fetch portal feedback', details: e.message }, { status: 500 });
    }
}


export async function POST(request: Request) {
  try {
    const { userId, rating, feedback } = await request.json();

    if (!userId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Resolve internal numeric PK
    const { data: userProfile } = await supabaseAdmin
        .from('jobseekers')
        .select('id')
        .eq('uuid', userId)
        .single();

    const { data: newFeedback, error } = await supabaseAdmin
        .from('portal_feedback')
        .insert([{
            user_pk: userProfile?.id || null, // Internal BIGINT
            rating,
            feedback: feedback || '',
            created_at: new Date().toISOString()
        }])
        .select()
        .single();
    
    if (error) throw error;
    
    return NextResponse.json(newFeedback, { status: 201 });
  } catch (e: any) {
    console.error('[API_FEEDBACK_POST] Error:', e);
    return NextResponse.json({ error: 'Failed to submit feedback', details: e.message }, { status: 500 });
  }
}
