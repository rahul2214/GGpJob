import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
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

        // 3. Fetch candidate profile from existing API
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host') || 'localhost:3000';
        const baseUrl = `${protocol}://${host}`;
        
        const userRes = await fetch(`${baseUrl}/api/users/${application.user_pk}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!userRes.ok) {
            return NextResponse.json({ error: 'Failed to fetch candidate profile' }, { status: userRes.status });
        }

        const candidateProfile = await userRes.json();

        // 4. Check unlock status (Unlocked if status_id >= 4 or is_unlocked true)
        const isUnlocked = application.is_unlocked || application.status_id >= 4;

        if (!isUnlocked) {
            // Mask sensitive contact details
            candidateProfile.email = '[Hidden until unlocked]';
            candidateProfile.phone = '[Hidden until unlocked]';
            candidateProfile.resumeUrl = null;
            candidateProfile.linkedinUrl = null;
            candidateProfile.githubUrl = null;
            candidateProfile.portfolioUrl = null;
        }

        return NextResponse.json(candidateProfile);
    } catch (e: any) {
        console.error('[API_CANDIDATE_PROFILE] Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
