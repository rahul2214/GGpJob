import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { deleteFromR2 } from '@/lib/r2';
import { resolveResumeUrl } from '@/lib/resolve-resume';
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';

/**
 * Update resume URL for a jobseeker.
 * Handles migration from Supabase Storage to Cloudflare R2 automatically.
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { user: authUser, errorResponse } = await requireAuth(request);
        if (errorResponse) return errorResponse;

        const { id: userId } = params;

        if (!isOwnerOrAdmin(authUser!, userId)) {
            return NextResponse.json({ error: 'Forbidden: Cannot modify another user profile.' }, { status: 403 });
        }

        let { resumeUrl } = await request.json();

        if (!resumeUrl || typeof resumeUrl !== 'string') {
            return NextResponse.json({ error: 'Resume URL is required' }, { status: 400 });
        }

        // Only storage URIs this application issues, or https links, may be stored.
        // This stops a caller pointing the profile at javascript:/data: URLs.
        if (!resumeUrl.startsWith('r2://') && !resumeUrl.startsWith('https://')) {
            return NextResponse.json({ error: 'Resume URL must be an https:// or r2:// location.' }, { status: 400 });
        }

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

        // 1. Fetch current resume URL to check if we need to clean up old storage
        const { data: existingUser } = await supabaseAdmin
            .from('jobseekers')
            .select('resume_url')
            .eq(isUUID ? 'uuid' : 'id', isUUID ? userId : parseInt(userId, 10))
            .maybeSingle();

        const oldResumeUrl = existingUser?.resume_url;

        // 2. Storage Cleanup
        // If the NEW URL is an R2 path, we check for an OLD R2 path to delete
        if (resumeUrl.startsWith('r2://')) {
            if (oldResumeUrl && oldResumeUrl.startsWith('r2://') && oldResumeUrl !== resumeUrl) {
                await deleteFromR2(oldResumeUrl);
            }
        } 
        
        // 3. Update Database Pointer

        const { data: profile, error } = await supabaseAdmin
            .from('jobseekers')
            .update({ resume_url: resumeUrl, updated_at: new Date().toISOString() })
            .eq(isUUID ? 'uuid' : 'id', isUUID ? userId : parseInt(userId, 10))
            .select('resume_url')
            .single();

        if (error) {
            if (error.code === 'PGRST116') return NextResponse.json({ error: 'User not found' }, { status: 404 });
            throw error;
        }
        
        // Resolve the URL before returning to frontend (converts r2:// to signed HTTPS)
        const resolvedUrl = await resolveResumeUrl(profile.resume_url);
        
        return NextResponse.json({
            ...profile,
            resume_url: resolvedUrl,
            resumeUrl: resolvedUrl // Compatibility field
        }, { status: 200 });

    } catch (e: any) {
        console.error('[API_RESUME_PUT] Error:', e);
        return NextResponse.json({ error: 'Failed to update resume', details: e.message }, { status: 500 });
    }
}
