import sys; sys.path.insert(0, 'scratch/sec')
from patchlib import patch

# ---------- career-assistant: unauth + Host-derived internal origin ----------
patch('src/app/api/career-assistant/route.ts', [
(
r"""export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, message, pathname, jobContext, action, jobId, history } = body;""",
r"""export async function POST(req: NextRequest) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { userId, message, pathname, jobContext, action, jobId, history } = body;

    // The assistant reads the profile and can submit applications, so the
    // caller must be acting for their own account.
    if (userId && !isOwnerOrAdmin(authUser!, userId)) {
      return NextResponse.json(
        { error: "Forbidden: Cannot act on behalf of another user." },
        { status: 403 }
      );
    }"""
),
(
r"""      const origin = req.nextUrl.origin;
      try {
        const appRes = await fetch(`${origin}/api/applications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },""",
r"""      // `req.nextUrl.origin` follows the Host header, which a caller controls,
      // so the internal call is addressed using the configured application URL
      // instead. The caller's credentials are forwarded so /api/applications can
      // apply its own authorisation check.
      const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
      const forwardedAuth = req.headers.get("authorization");
      const forwardedCookie = req.headers.get("cookie");
      try {
        const appRes = await fetch(`${origin}/api/applications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(forwardedAuth ? { authorization: forwardedAuth } : {}),
            ...(forwardedCookie ? { cookie: forwardedCookie } : {}),
          },"""
),
])

# ---------- linkedin/auto-apply: fetch stored resume through the SSRF guard ----------
patch('src/app/api/linkedin/auto-apply/route.ts', [
(
r"""import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';""",
r"""import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';
import { safeFetch } from '@/lib/ssrf-guard';"""
),
(
r"""                const resolvedUrl = await resolveResumeUrl(userData.resume_url);
                if (resolvedUrl) {
                    const res = await fetch(resolvedUrl);""",
r"""                const resolvedUrl = await resolveResumeUrl(userData.resume_url);
                if (resolvedUrl) {
                    // resume_url is user-settable, so the download is screened
                    // against private and metadata address ranges.
                    const res = await safeFetch(resolvedUrl, { maxBytes: 5 * 1024 * 1024 });"""
),
])
