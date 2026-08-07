import { NextResponse, NextRequest } from 'next/server';
import { updateCandidatePreference } from '@/lib/crm/candidate-crm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, frequency, isUnsubscribed } = body;

    if (!email) {
      return NextResponse.json({ error: 'Candidate email is required' }, { status: 400 });
    }

    updateCandidatePreference(email, frequency || 'WEEKLY', isUnsubscribed ?? false);

    return NextResponse.json({
      success: true,
      message: `Email preferences updated for ${email}`,
      email,
      frequency: frequency || 'WEEKLY',
      isUnsubscribed: isUnsubscribed ?? false,
    });
  } catch (err: any) {
    console.error('[API_CRM_PREFERENCES] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update candidate preference' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const action = searchParams.get('action');

  if (email && action === 'unsubscribe') {
    updateCandidatePreference(email, 'PAUSED', true);
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head><title>Unsubscribed - JobsDart</title></head>
        <body style="font-family:sans-serif; text-align:center; padding:50px; background:#f8fafc;">
          <div style="max-width:500px; margin:0 auto; background:#fff; padding:40px; border-radius:24px; box-shadow:0 10px 25px rgba(0,0,0,0.05);">
            <h2 style="color:#0f172a;">You have unsubscribed</h2>
            <p style="color:#64748b;">${email} has been unsubscribed from JobsDart automated job recommendation alerts.</p>
            <a href="/" style="display:inline-block; margin-top:20px; background:#3525cd; color:#fff; padding:12px 24px; border-radius:12px; text-decoration:none; font-weight:bold;">Return to JobsDart</a>
          </div>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
}
