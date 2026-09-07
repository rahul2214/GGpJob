import sys; sys.path.insert(0, 'scratch/sec')
from patchlib import patch

# ---------------- resume upload ----------------
patch('src/app/api/users/[id]/resume/upload/route.ts', [
(
r"""import { resolveResumeUrl } from '@/lib/resolve-resume';""",
r"""import { resolveResumeUrl } from '@/lib/resolve-resume';
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';
import { validateFileContent, buildStorageKey, RESUME_FILE_RULES } from '@/lib/upload-validation';"""
),
(
r"""  try {
    const { id: userId } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 1. Validation
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 2MB limit' }, { status: 400 });
    }""",
r"""  try {
    const { user: authUser, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id: userId } = params;

    if (!isOwnerOrAdmin(authUser!, userId)) {
      return NextResponse.json({ error: 'Forbidden: Cannot upload to another user profile.' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 1. Validation
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 2MB limit' }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: 'The uploaded file is empty' }, { status: 400 });
    }"""
),
(
r"""    // 3. Prepare R2 Key
    const fileExt = file.name.split('.').pop() || 'pdf';
    const fileName = `resume-${Date.now()}.${fileExt}`;
    const key = `resumes/${userId}/${fileName}`;

    // 4. Convert File to Buffer for Upload
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || 'application/pdf'; // Default to PDF if browser doesn't provide
    console.log(`[API_RESUME_UPLOAD] Final Buffer check. Size: ${buffer.length} bytes, Type: ${contentType}`);""",
r"""    // 3. Read the file and confirm it really is one of the allowed document
    // types. The browser-supplied name and Content-Type are not trusted; the
    // leading magic bytes decide.
    const buffer = Buffer.from(await file.arrayBuffer());
    const validation = validateFileContent(buffer, file.name, file.type, RESUME_FILE_RULES);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 4. Build a storage key from server-controlled parts only, so a crafted
    // filename cannot traverse or overwrite another object.
    const contentType = validation.contentType;
    const key = buildStorageKey('resumes', internalId, validation.extension);
    console.log(`[API_RESUME_UPLOAD] Final Buffer check. Size: ${buffer.length} bytes, Type: ${contentType}`);"""
),
])

# ---------------- profile photo upload ----------------
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
        // A `image/*` Content-Type check alone would accept image/svg+xml, which
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
r"""        // 5. Upload file buffer to R2
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileExt = file.name.split('.').pop() || 'jpg';
        const key = `avatars/${id}/${Date.now()}.${fileExt}`;

        const { r2Uri } = await uploadToR2(key, buffer, file.type);""",
r"""        // 5. Upload file buffer to R2 under a server-generated key.
        const key = buildStorageKey('avatars', id, validation.extension);

        const { r2Uri } = await uploadToR2(key, photoBuffer, validation.contentType);"""
),
])
