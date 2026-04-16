import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { uploadToR2, deleteFromR2 } from '@/lib/r2';
import { resolveResumeUrl } from '@/lib/resolve-resume';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 1. Validation
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 2MB limit' }, { status: 400 });
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    const lookupField = isUUID ? 'uuid' : 'id';
    const lookupId = isUUID ? userId : parseInt(userId, 10);

    // 2. Prepare R2 Key
    const fileExt = file.name.split('.').pop() || 'pdf';
    const fileName = `resume-${Date.now()}.${fileExt}`;
    const key = `resumes/${userId}/${fileName}`;

    // 3. Convert File to Buffer for Upload
    const buffer = Buffer.from(await file.arrayBuffer());

    // 4. Upload to R2 (Server-Side Proxy)
    const { r2Uri } = await uploadToR2(key, buffer, file.type);

    // 5. Database Cleanup & Update
    const { data: existingUser } = await supabaseAdmin
      .from('jobseekers')
      .select('resume_url')
      .eq(lookupField, lookupId)
      .maybeSingle();

    const oldResumeUrl = existingUser?.resume_url;

    // Cleanup old R2 file if it exists
    if (oldResumeUrl && oldResumeUrl.startsWith('r2://') && oldResumeUrl !== r2Uri) {
      await deleteFromR2(oldResumeUrl);
    }

    // Update profile
    const { data: profile, error: dbError } = await supabaseAdmin
      .from('jobseekers')
      .update({ resume_url: r2Uri, updated_at: new Date().toISOString() })
      .eq(lookupField, lookupId)
      .select('resume_url')
      .single();

    if (dbError) throw dbError;

    // 6. Resolve final URL for frontend (Signed HTTPS)
    const resolvedUrl = await resolveResumeUrl(profile.resume_url);

    return NextResponse.json({
      success: true,
      resumeUrl: resolvedUrl,
      r2Uri: profile.resume_url
    });

  } catch (error: any) {
    console.error('[API_RESUME_UPLOAD_ERROR]:', error);
    return NextResponse.json(
      { error: 'Failed to upload resume', details: error.message },
      { status: 500 }
    );
  }
}
