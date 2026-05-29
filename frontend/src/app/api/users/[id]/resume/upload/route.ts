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

    console.log(`[API_RESUME_UPLOAD] Starting upload for user: ${userId}`);
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    
    // 2. Identify the user profile robustly
    let profileData = null;
    let lookupField = 'id';
    
    // Try finding by UUID (handles both id=UUID and uuid=UUID schemas)
    if (isUUID) {
        // First try the 'uuid' column if it exists in the new schema
        const { data: byUuid } = await supabaseAdmin
            .from('jobseekers')
            .select('id, resume_url')
            .eq('uuid', userId)
            .maybeSingle();
            
        if (byUuid) {
            profileData = byUuid;
            lookupField = 'id'; // We found the internal ID, so we update by 'id'
        } else {
            // Fallback to searching by 'id' (legacy schema where id = UUID)
            const { data: byId } = await supabaseAdmin
                .from('jobseekers')
                .select('id, resume_url')
                .eq('id', userId)
                .maybeSingle();
            if (byId) {
                profileData = byId;
                lookupField = 'id';
            }
        }
    } else {
        // Numeric ID lookup
        const { data: byNumeric } = await supabaseAdmin
            .from('jobseekers')
            .select('id, resume_url')
            .eq('id', parseInt(userId, 10))
            .maybeSingle();
        profileData = byNumeric;
        lookupField = 'id';
    }

    if (!profileData) {
        console.error(`[API_RESUME_UPLOAD] Profile not found for userId: ${userId}`);
        return NextResponse.json({ error: 'Profile not found. Please log in again.' }, { status: 404 });
    }

    const internalId = profileData.id;
    console.log(`[API_RESUME_UPLOAD] Resolved internal profile ID: ${internalId}`);

    // 3. Prepare R2 Key
    const fileExt = file.name.split('.').pop() || 'pdf';
    const fileName = `resume-${Date.now()}.${fileExt}`;
    const key = `resumes/${userId}/${fileName}`;

    // 4. Convert File to Buffer for Upload
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || 'application/pdf'; // Default to PDF if browser doesn't provide
    console.log(`[API_RESUME_UPLOAD] Final Buffer check. Size: ${buffer.length} bytes, Type: ${contentType}`);

    // 5. Upload to R2 (Server-Side Proxy)
    console.log(`[API_RESUME_UPLOAD] Sending PutObjectCommand: Key=${key}, Type=${contentType}`);
    const { r2Uri } = await uploadToR2(key, buffer, contentType);
    console.log(`[API_RESUME_UPLOAD] R2 Upload successful: ${r2Uri}`);

    // 6. Database Cleanup & Update
    const oldResumeUrl = profileData.resume_url;

    // Cleanup old R2 file if it exists
    if (oldResumeUrl && oldResumeUrl.startsWith('r2://') && oldResumeUrl !== r2Uri) {
      console.log(`[API_RESUME_UPLOAD] Cleaning up old resume: ${oldResumeUrl}`);
      await deleteFromR2(oldResumeUrl);
    }

    // Update profile
    const { data: updatedProfile, error: dbError } = await supabaseAdmin
      .from('jobseekers')
      .update({ resume_url: r2Uri, updated_at: new Date().toISOString() })
      .eq('id', internalId)
      .select('resume_url')
      .single();

    if (dbError) {
        console.error('[API_RESUME_UPLOAD] Database update failed:', dbError);
        throw dbError;
    }

    // 6. Resolve final URL for frontend (Signed HTTPS)
    const resolvedUrl = await resolveResumeUrl(updatedProfile.resume_url);

    return NextResponse.json({
      success: true,
      resumeUrl: resolvedUrl,
      r2Uri: updatedProfile.resume_url
    });

  } catch (error: any) {
    console.error('[API_RESUME_UPLOAD_ERROR]:', error);
    
    // Categorize common errors
    let userMessage = 'Failed to upload resume';
    if (error.code === 'P0001' || error.message?.includes('Database')) {
        userMessage = 'Database update error';
    } else if (error.$metadata) {
        userMessage = 'Storage provider error (R2)';
    }

    return NextResponse.json(
      { error: userMessage, details: error.message },
      { status: 500 }
    );
  }
}
