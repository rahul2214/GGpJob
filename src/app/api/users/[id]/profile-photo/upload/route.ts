import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { uploadToR2, deleteFromR2 } from '@/lib/r2';
import { resolveResumeUrl } from '@/lib/resolve-resume';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        const idValue = isUuid ? id : parseInt(id, 10);

        if (!isUuid && isNaN(idValue as number)) {
            return NextResponse.json({ error: 'Invalid User ID format' }, { status: 400 });
        }

        // 1. Parse FormData
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // 2. Enforce File Size Constraints (Max 2MB)
        const maxFileSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxFileSize) {
            return NextResponse.json({ error: 'File size exceeds 2MB limit' }, { status: 400 });
        }

        // 3. Enforce File Type Constraints (Image only)
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
        }

        // 4. Identify user role/table
        const [jobseekerRes, recruiterRes, employeeRes] = await Promise.all([
            supabaseAdmin.from('jobseekers').select('id, profile_photo_url').eq(isUuid ? 'uuid' : 'id', idValue).maybeSingle(),
            supabaseAdmin.from('recruiters').select('id, profile_photo_url').eq(isUuid ? 'uuid' : 'id', idValue).maybeSingle(),
            supabaseAdmin.from('employees').select('id, profile_photo_url').eq(isUuid ? 'uuid' : 'id', idValue).maybeSingle(),
        ]);

        let targetTable = '';
        let existingPhotoUrl = null;

        if (jobseekerRes.data) {
            targetTable = 'jobseekers';
            existingPhotoUrl = jobseekerRes.data.profile_photo_url;
        } else if (employeeRes.data) {
            targetTable = 'employees';
            existingPhotoUrl = employeeRes.data.profile_photo_url;
        } else if (recruiterRes.data) {
            targetTable = 'recruiters';
            existingPhotoUrl = recruiterRes.data.profile_photo_url;
        } else {
            return NextResponse.json({ error: 'User profile not found across active tables' }, { status: 404 });
        }

        // 5. Upload file buffer to R2
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const fileExt = file.name.split('.').pop() || 'jpg';
        const key = `avatars/${id}/${Date.now()}.${fileExt}`;
        
        const { r2Uri } = await uploadToR2(key, buffer, file.type);

        // 6. Delete old avatar if it exists in R2
        if (existingPhotoUrl && existingPhotoUrl.startsWith('r2://')) {
            await deleteFromR2(existingPhotoUrl);
        }

        // 7. Update database pointer
        const { error: updateError } = await supabaseAdmin
            .from(targetTable)
            .update({ 
                profile_photo_url: r2Uri, 
                updated_at: new Date().toISOString() 
            })
            .eq(isUuid ? 'uuid' : 'id', idValue);

        if (updateError) {
            throw updateError;
        }

        // 8. Resolve the URI to a signed URL and return
        const resolvedUrl = await resolveResumeUrl(r2Uri);

        return NextResponse.json({ 
            message: 'Profile photo uploaded successfully',
            profilePhotoUrl: resolvedUrl 
        }, { status: 200 });

    } catch (e: any) {
        console.error('[API_PROFILE_PHOTO_UPLOAD_POST] Error:', e);
        return NextResponse.json({ error: 'Failed to upload profile photo', details: e.message }, { status: 500 });
    }
}
