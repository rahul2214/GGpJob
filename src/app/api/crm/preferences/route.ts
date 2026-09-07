import { NextResponse, NextRequest } from 'next/server';
import { updateCandidatePreference } from '@/lib/crm/candidate-crm';
import { requireAdmin } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

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

/** Escapes text that is interpolated into the unsubscribe HTML response. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const EMAIL_PATTERN = /^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[A-Za-z]{2,24}$/;

// This endpoint is reachable without a session because it is the target of the
// unsubscribe link in outbound email. It renders HTML, so the address is both
// format-checked and escaped before it is echoed back.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const action = searchParams.get('action');

  if (email && !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

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
            <p style="color:#64748b;">${escapeHtml(email)} has been unsubscribed from JobsDart automated job recommendation alerts.</p>
            <a href="/" style="display:inline-block; margin-top:20px; background:#3525cd; color:#fff; padding:12px 24px; border-radius:12px; text-decoration:none; font-weight:bold;">Return to JobsDart</a>
          </div>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  }

  return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
}
