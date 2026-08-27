import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { resolveResumeUrl } from '@/lib/resolve-resume';
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { user: authUser, errorResponse } = await requireAuth(request);
        if (errorResponse) return errorResponse;

        const { id } = params;
        
        // 1. Fetch User Data with joined metadata names
        const isNumeric = /^\d+$/.test(id);
        const query = supabaseAdmin.from('jobseekers').select('*');
        const { data: profile, error } = await (isNumeric ? query.eq('id', id) : query.eq('uuid', id)).single();

        if (error || !profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!isOwnerOrAdmin(authUser!, profile.id) && !isOwnerOrAdmin(authUser!, profile.uuid)) {
            return NextResponse.json({ error: 'Forbidden: Access denied to this profile.' }, { status: 403 });
        }
        
        const locationName = profile.current_city || profile.location_id || "Remote";
        // Fallback to preferred job titles, or a generic default if none exists
        const preferredTitles = Array.isArray(profile.preferred_job_titles) && profile.preferred_job_titles.length > 0 
            ? profile.preferred_job_titles 
            : ["Software Engineer"];

        // 2. Format as AutoJobApply config.json structure
        const firstName = profile.name?.split(' ')[0] || '';
        const lastName = profile.name?.split(' ').slice(1).join(' ') || '';

        const exportData = {
            personal_info: {
                first_name: firstName,
                last_name: lastName,
                phone: profile.phone || "",
                city: locationName,
                email: profile.email || ""
            },
            preferences: {
                resume_path: "resume.pdf",
                job_titles: preferredTitles,
                locations: [locationName, "Remote"].filter(Boolean),
                workplace_type: profile.work_status === 'Remote' ? 'Remote' : 'On-site'
            },
            qa: {
                years_of_experience: String(profile.experience_years || 0),
                sponsorship_required: "No",
                legally_authorized: "Yes",
                clearance: "No",
                degree: "Bachelor's" // Fallback as this field might not be explicitly in profiles yet
            },
            resume_url: await resolveResumeUrl(profile.resume_url)
        };

        return NextResponse.json(exportData);

    } catch (error: any) {
        console.error('Failed to export user profile:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
