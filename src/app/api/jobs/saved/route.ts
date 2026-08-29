import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Helper to map Supabase snake_case job to camelCase Job type
function mapJobToFrontend(job: any): any {
    return {
        id: job.id,           // Numeric PK (BIGINT)
        uuid: job.uuid,       // Public identifier (UUID string)
        jobId: job.job_id,    // Custom Job ID
        title: job.title,
        description: job.description,
        companyName: job.company_name,
        companyLogo: job.company_logo,
        jobTypeId: job.job_types?.uuid || null,
        jobTypePk: job.job_type_pk,
        workplaceTypeId: job.workplace_types?.uuid || null,
        workplaceTypePk: job.workplace_type_pk,
        locationIds: job.location_uuids || [], // Resolved UUIDs
        locationPks: job.location_pks || [],
        salaryMin: job.salary_min ?? job.salary_min_usd_cents ?? null,
        salaryMax: job.salary_max ?? job.salary_max_usd_cents ?? null,
        minExperience: job.experience_min,
        maxExperience: job.experience_max,
        isReferral: job.is_referral,
        recruiterId: job.recruiter_pk || job.recruiter_id,
        employeeId: job.employee_pk || job.employee_id,
        adminId: job.admin_pk || job.admin_id,
        postedAt: job.posted_at,
        expiresAt: job.expires_at,
        appExpiresAt: job.app_expires_at,
        maxApplies: job.max_applies,
        planTypeAtPosting: job.plan_type_at_posting,
        status: job.status,
        vacancies: job.vacancies,
        jobLink: job.job_link,
        sections: job.sections || [],
        skillIds: job.skill_uuids || [],     // Resolved UUIDs
        skills: job.skill_names || [],       // Resolved Skill Names
        benefitIds: job.benefit_uuids || [], // Resolved UUIDs
        benefits: job.benefit_names || [],
        country: job.country || null,
        state: job.state || null,
        city: job.city || null,
        remoteType: job.remote_type || null,
        industry: job.industry || null,
        visaSponsorship: job.visa_sponsorship || false,
        type: job.job_types?.name || 'N/A',
        workplaceType: job.workplace_types?.name || 'N/A',
        companySizeId: job.company_sizes?.uuid || null, // Map to UUID
        companySize: job.company_sizes?.name || 'N/A',
        companyLinkedinUrl: job.company_linkedin_url,
        companyOverview: job.company_overview,
        companyWebsite: job.company_website,
        address: job.address,
        // Support for labels
        location: job.location_names ? job.location_names.join(', ') : 'N/A',
        locations: job.location_names || [],
        experienceLevel: job.experience_min === job.experience_max ? `${job.experience_min} Years` : `${job.experience_min} - ${job.experience_max} Years`,
        applicantCount: job.applicantCount ?? job.applications_count?.[0]?.count ?? 0,
        selectedApplicantCount: job.selectedApplicantCount ?? 0,
        referredApplicantCount: job.referredApplicantCount ?? 0,
        hiredApplicantCount: job.hiredApplicantCount ?? 0,
        employeeTrustScore: 100,
        employeeEmail: null,
        employeeName: null,
        employeeLevel: null,
        employeeCompany: null,
        requiredSkills: job.skill_names || [],
        isBoosted: job.plan_type_at_posting === 'boosted' || (job.plan_type_at_posting && job.plan_type_at_posting.endsWith('_boosted')) || false,
    };
}

// Helper to resolve location and benefit names for a list of jobs
async function resolveJobNames(jobs: any[]): Promise<any[]> {
    if (!jobs || jobs.length === 0) return [];

    const jobPks = jobs.map(j => j.id).filter(Boolean);
    const allLocationPks = Array.from(new Set(jobs.flatMap(j => j.location_pks || [])));
    const allBenefitPks = Array.from(new Set(jobs.flatMap(j => j.benefit_ids || [])));
    const allSkillPks = Array.from(new Set(jobs.flatMap(j => j.skill_pks || [])));

    const [
        { data: benefits },
        { data: skills },
        { data: jobLocs },
        { data: jobSkills },
        { data: jobBenefits }
    ] = await Promise.all([
        allBenefitPks.length > 0 ? supabaseAdmin.from('benefits').select('id, uuid, name').in('id', allBenefitPks) : { data: [] },
        allSkillPks.length > 0 ? supabaseAdmin.from('skills').select('id, uuid, name').in('id', allSkillPks) : { data: [] },
        jobPks.length > 0 ? supabaseAdmin.from('job_locations').select('job_id, countries:country_id(name), states_provinces:state_province_id(name), cities:city_id(name)').in('job_id', jobPks) : { data: [] },
        jobPks.length > 0 ? supabaseAdmin.from('job_skills').select('job_pk, skills:skill_pk(id, uuid, name)').in('job_pk', jobPks) : { data: [] },
        jobPks.length > 0 ? supabaseAdmin.from('job_benefits').select('job_pk, benefits:benefit_pk(id, uuid, name)').in('job_pk', jobPks) : { data: [] }
    ]);

    const benefitMap = new Map<string, any>(benefits?.map((b: any) => [String(b.id), { name: b.name, uuid: b.uuid }]) || []);
    const skillMap = new Map<string, any>(skills?.map((s: any) => [String(s.id), { name: s.name, uuid: s.uuid }]) || []);

    const relSkillMap = new Map<number, any[]>();
    (jobSkills || []).forEach((js: any) => {
        if (js.skills) {
            const existing = relSkillMap.get(js.job_pk) || [];
            existing.push(js.skills);
            relSkillMap.set(js.job_pk, existing);
        }
    });

    const relBenefitMap = new Map<number, any[]>();
    (jobBenefits || []).forEach((jb: any) => {
        if (jb.benefits) {
            const existing = relBenefitMap.get(jb.job_pk) || [];
            existing.push(jb.benefits);
            relBenefitMap.set(jb.job_pk, existing);
        }
    });

    const jobLocMap = new Map<number, string[]>();
    (jobLocs || []).forEach((jl: any) => {
        const parts = [jl.cities?.name, jl.states_provinces?.name, jl.countries?.name].filter(Boolean);
        if (parts.length > 0) {
            const locName = parts.join(', ');
            const existing = jobLocMap.get(jl.job_id) || [];
            existing.push(locName);
            jobLocMap.set(jl.job_id, existing);
        }
    });

    return jobs.map(job => {
        const jlNames = jobLocMap.get(job.id) || [];
        const relBens = relBenefitMap.get(job.id) || [];
        const mappedBenefits = relBens.length > 0 
            ? relBens 
            : (job.benefit_ids || []).map((id: number) => benefitMap.get(String(id))).filter(Boolean);

        const relSks = relSkillMap.get(job.id) || [];
        const mappedSkills = relSks.length > 0 
            ? relSks 
            : (job.skill_pks || []).map((id: number) => skillMap.get(String(id))).filter(Boolean);
        
        return mapJobToFrontend({ 
            ...job, 
            location_names: jlNames,
            benefit_uuids: mappedBenefits.map((b: any) => b.uuid),
            benefit_names: mappedBenefits.map((b: any) => b.name),
            skill_uuids: mappedSkills.map((s: any) => s.uuid),
            skill_names: mappedSkills.map((s: any) => s.name)
        });
    });
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId'); // auth UUID
        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // 1. Resolve userPk from userId
        const { data: seeker } = await supabaseAdmin
            .from('jobseekers')
            .select('id')
            .eq('uuid', userId)
            .maybeSingle();

        if (!seeker) {
            return NextResponse.json([]); // Seeker profile doesn't exist yet
        }

        // 2. Fetch saved jobs
        const { data: saved, error } = await supabaseAdmin
            .from('saved_jobs')
            .select('job_pk')
            .eq('user_pk', seeker.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!saved || saved.length === 0) {
            return NextResponse.json([]);
        }

        const jobPks = saved.map((s: any) => s.job_pk);

        // 3. Fetch jobs details
        const { data: jobs, error: jobsError } = await supabaseAdmin
            .from('jobs')
            .select(`
                *,
                job_types(name, uuid),
                workplace_types(name, uuid),
                company_sizes(name, uuid),
                applications_count:applications(count)
            `)
            .in('id', jobPks);

        if (jobsError) {
            return NextResponse.json({ error: jobsError.message }, { status: 500 });
        }

        const resolved = await resolveJobNames(jobs || []);
        return NextResponse.json(resolved);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId, jobId } = await request.json(); // userId = user.uuid, jobId = job.uuid
        if (!userId || !jobId) {
            return NextResponse.json({ error: 'User ID and Job ID are required' }, { status: 400 });
        }

        // Resolve userPk
        const { data: seeker } = await supabaseAdmin
            .from('jobseekers')
            .select('id')
            .eq('uuid', userId)
            .single();

        // Resolve jobPk
        const { data: job } = await supabaseAdmin
            .from('jobs')
            .select('id')
            .eq('uuid', jobId)
            .single();

        if (!seeker || !job) {
            return NextResponse.json({ error: 'User or Job not found' }, { status: 404 });
        }

        // Insert into saved_jobs
        const { error } = await supabaseAdmin
            .from('saved_jobs')
            .upsert({ user_pk: seeker.id, job_pk: job.id }, { onConflict: 'user_pk,job_pk' });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Job bookmarked successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const jobId = searchParams.get('jobId');

        if (!userId || !jobId) {
            return NextResponse.json({ error: 'User ID and Job ID are required' }, { status: 400 });
        }

        // Resolve userPk
        const { data: seeker } = await supabaseAdmin
            .from('jobseekers')
            .select('id')
            .eq('uuid', userId)
            .single();

        // Resolve jobPk
        const { data: job } = await supabaseAdmin
            .from('jobs')
            .select('id')
            .eq('uuid', jobId)
            .single();

        if (!seeker || !job) {
            return NextResponse.json({ error: 'User or Job not found' }, { status: 404 });
        }

        // Delete from saved_jobs
        const { error } = await supabaseAdmin
            .from('saved_jobs')
            .delete()
            .eq('user_pk', seeker.id)
            .eq('job_pk', job.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Job unbookmarked successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
