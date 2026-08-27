import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth } from '@/lib/auth-server';
import { resolveResumeUrl } from '@/lib/resolve-resume';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { user: authUser, errorResponse } = await requireAuth(request);
        if (errorResponse) return errorResponse;

        const { id } = params;

        // 1. Validate application ID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        const column = isUuid ? 'uuid' : 'id';
        const idValue = isUuid ? id : parseInt(id);

        if (!isUuid && isNaN(idValue as number)) {
            return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
        }

        // 2. Fetch application
        const { data: application, error } = await supabaseAdmin
            .from('applications')
            .select('user_pk, job_pk, is_unlocked, status_id')
            .eq(column, idValue)
            .single();

        if (error || !application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // 3. Fetch candidate profile directly from DB without loopback HTTP request
        const { data: jobseeker, error: jsError } = await supabaseAdmin
            .from('jobseekers')
            .select('*')
            .eq('id', application.user_pk)
            .single();

        if (jsError || !jobseeker) {
            return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
        }

        let resumeUrl = jobseeker.resume_url;
        if (resumeUrl) {
            resumeUrl = await resolveResumeUrl(resumeUrl);
        }

        return NextResponse.json({
            ...jobseeker,
            resume_url: resumeUrl
        });
    } catch (e: any) {
        console.error('[API_CANDIDATE_PROFILE] Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
