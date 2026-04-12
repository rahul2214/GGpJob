import { NextResponse } from 'next/server';
import { getPresignedUploadUrl } from '@/lib/r2';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = params;
    const { fileName, contentType } = await request.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'fileName and contentType are required' },
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
