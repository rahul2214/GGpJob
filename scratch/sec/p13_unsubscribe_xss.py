import sys; sys.path.insert(0, 'scratch/sec')
from patchlib import patch

patch('src/app/api/crm/preferences/route.ts', [
(
r"""export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const action = searchParams.get('action');

  if (email && action === 'unsubscribe') {""",
r"""/** Escapes text that is interpolated into the unsubscribe HTML response. */
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

  if (email && action === 'unsubscribe') {"""
),
(
r"""            <p style="color:#64748b;">${email} has been unsubscribed from JobsDart automated job recommendation alerts.</p>""",
r"""            <p style="color:#64748b;">${escapeHtml(email)} has been unsubscribed from JobsDart automated job recommendation alerts.</p>"""
),
(
r"""      { headers: { 'Content-Type': 'text/html' } }""",
r"""      {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
          'X-Content-Type-Options': 'nosniff',
        },
      }"""
),
])
