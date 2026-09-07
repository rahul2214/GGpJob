import sys; sys.path.insert(0, 'scratch/sec')
from patchlib import patch

# --- /api/users/[id]/resume (PUT) : unauth resume pointer overwrite + file deletion ---
patch('src/app/api/users/[id]/resume/route.ts', [
(
r"""import { resolveResumeUrl } from '@/lib/resolve-resume';""",
r"""import { resolveResumeUrl } from '@/lib/resolve-resume';
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';"""
),
(
"    try {\n"
"        const { id: userId } = params;\n"
"        let { resumeUrl } = await request.json();\n"
"        \n"
"        if (!resumeUrl) {\n"
"            return NextResponse.json({ error: 'Resume URL is required' }, { status: 400 });\n"
"        }",

"    try {\n"
"        const { user: authUser, errorResponse } = await requireAuth(request);\n"
"        if (errorResponse) return errorResponse;\n"
"\n"
"        const { id: userId } = params;\n"
"\n"
"        if (!isOwnerOrAdmin(authUser!, userId)) {\n"
"            return NextResponse.json({ error: 'Forbidden: Cannot modify another user profile.' }, { status: 403 });\n"
"        }\n"
"\n"
"        let { resumeUrl } = await request.json();\n"
"\n"
"        if (!resumeUrl || typeof resumeUrl !== 'string') {\n"
"            return NextResponse.json({ error: 'Resume URL is required' }, { status: 400 });\n"
"        }\n"
"\n"
"        // Only storage URIs this application issues, or https links, may be stored.\n"
"        // This stops a caller pointing the profile at javascript:/data: URLs.\n"
"        if (!resumeUrl.startsWith('r2://') && !resumeUrl.startsWith('https://')) {\n"
"            return NextResponse.json({ error: 'Resume URL must be an https:// or r2:// location.' }, { status: 400 });\n"
"        }"
),
])

# --- /api/account/restore : unauthenticated un-deletion of any account ---
patch('src/app/api/account/restore/route.ts', [
(
r"""import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';""",
r"""import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';"""
),
(
r"""    if (!targetId) {
      return NextResponse.json({ error: 'Missing required userId/uuid parameter' }, { status: 400 });
    }""",
r"""    if (!targetId) {
      return NextResponse.json({ error: 'Missing required userId/uuid parameter' }, { status: 400 });
    }

    // Restoring an account reactivates all of its access, so only the account
    // holder (who can still authenticate during the grace period) or an
    // administrator may do it.
    if (!isOwnerOrAdmin(authUser!, targetId)) {
      return NextResponse.json({ error: 'Forbidden: Cannot restore another user account.' }, { status: 403 });
    }"""
),
(
r"""  try {
    const { userId, uuid, id } = await request.json();""",
r"""  try {
    const { user: authUser, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { userId, uuid, id } = await request.json();"""
),
])
