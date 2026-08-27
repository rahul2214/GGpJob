import { NextResponse } from 'next/server';
import { getPresignedUploadUrl } from '@/lib/r2';
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id: userId } = params;

    if (!isOwnerOrAdmin(authUser!, userId)) {
      return NextResponse.json({ error: 'Forbidden: Access denied to generate upload URL for this user.' }, { status: 403 });
    }

    const { fileName, contentType } = await request.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'fileName and contentType are required' },
        { status: 400 }
      );
    }

    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedMimeTypes.includes(contentType.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and Word documents are permitted for resumes.' },
        { status: 400 }
      );
    }

    // Generate a secure, unique key for R2
    const fileExt = fileName.split('.').pop() || 'pdf';
    const uniqueFileName = `resume-${Date.now()}.${fileExt}`;
    const key = `resumes/${userId}/${uniqueFileName}`;

    // Get the presigned URL (valid for 15 minutes)
    const { url, r2Uri } = await getPresignedUploadUrl(key, contentType, 900);

    return NextResponse.json({ url, r2Uri });
  } catch (error: any) {
    console.error('[API_PRESIGNED_URL_ERROR]:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL', details: error.message },
      { status: 500 }
    );
  }
}
