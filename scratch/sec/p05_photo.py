import sys; sys.path.insert(0, 'scratch/sec')
from patchlib import patch

patch('src/app/api/users/[id]/profile-photo/upload/route.ts', [
(
r"""import { resolveResumeUrl } from '@/lib/resolve-resume';""",
r"""import { resolveResumeUrl } from '@/lib/resolve-resume';
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';
import { validateFileContent, buildStorageKey, IMAGE_FILE_RULES } from '@/lib/upload-validation';"""
),
(
r"""    try {
        const { id } = params;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);""",
r"""    try {
        const { user: authUser, errorResponse } = await requireAuth(request);
        if (errorResponse) return errorResponse;

        const { id } = params;

        if (!isOwnerOrAdmin(authUser!, id)) {
            return NextResponse.json({ error: 'Forbidden: Cannot upload to another user profile.' }, { status: 403 });
        }

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);"""
),
(
r"""        // 3. Enforce File Type Constraints (Image only)
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
        }""",
r"""        // 3. Enforce File Type Constraints.
        // A bare `image/*` Content-Type check would accept image/svg+xml, which
        // can carry script and would then be served from our storage origin.
        // The allowlist below is raster-only and is confirmed against the file's
        // magic bytes rather than the client's claim.
        if (file.size === 0) {
            return NextResponse.json({ error: 'The uploaded file is empty' }, { status: 400 });
        }
        const photoBuffer = Buffer.from(await file.arrayBuffer());
        const validation = validateFileContent(photoBuffer, file.name, file.type, IMAGE_FILE_RULES);
        if (!validation.ok) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }"""
),
(
"        // 5. Upload file buffer to R2\n"
"        const bytes = await file.arrayBuffer();\n"
"        const buffer = Buffer.from(bytes);\n"
"        \n"
"        const fileExt = file.name.split('.').pop() || 'jpg';\n"
"        const key = `avatars/${id}/${Date.now()}.${fileExt}`;\n"
"        \n"
"        const { r2Uri } = await uploadToR2(key, buffer, file.type);",

"        // 5. Upload file buffer to R2 under a server-generated key, so a\n"
"        // crafted filename cannot traverse or overwrite another object.\n"
"        const key = buildStorageKey('avatars', id, validation.extension);\n"
"\n"
"        const { r2Uri } = await uploadToR2(key, photoBuffer, validation.contentType);"
),
])
