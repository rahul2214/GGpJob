import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Job } from '@/lib/types';
import { awardXP } from '@/lib/gamification-logic';
import { getSubscriptionInfo, expiredResponse } from '@/lib/subscription';
import { intelligentSearchJobs } from '@/lib/intelligent-search';

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
        job_role: job.job_role,
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
        employmentType: job.employment_type || null,
        salaryCurrency: job.currencies?.code || job.salary_currency || 'USD',
        currencyId: job.currencies?.uuid || null,
        industry: job.industry || null,
        jobFunction: job.job_function || null,
        visaSponsorship: job.visa_sponsorship || false,
        workAuthorizationRequirement: job.work_authorization_requirement || [],
        languages: job.languages || [],
        companyVerification: job.company_verification || false,
        companyRating: job.company_rating || 0,
        latitude: job.latitude || null,
        longitude: job.longitude || null,
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
        selectedApplicantCount: job.selectedApplicantCount ?? job.selected_applications_count?.[0]?.count ?? 0,
        referredApplicantCount: job.referredApplicantCount ?? 0,
        hiredApplicantCount: job.hiredApplicantCount ?? 0,
        employeeTrustScore: (job.employees || job.employees?.[0])?.trust_score ?? 100,
        employeeEmail: (job.employees || job.employees?.[0])?.email ?? null,
        employeeName: (job.employees || job.employees?.[0])?.name ?? null,
        employeeLevel: (job.employees || job.employees?.[0])?.level ?? null,
        requiredSkills: (job.skill_names && job.skill_names.length > 0)
          ? job.skill_names 
          : (job.required_skills && job.required_skills.length > 0 ? job.required_skills : (job.requiredSkills || [])),
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
        { data: cities },
        { data: benefits },
        { data: skills },
        { data: jobLocs },
        { data: jobSkills },
        { data: jobBenefits }
    ] = await Promise.all([
        allLocationPks.length > 0 ? supabaseAdmin.from('cities').select('id, name').in('id', allLocationPks) : { data: [] },
        allBenefitPks.length > 0 ? supabaseAdmin.from('benefits').select('id, uuid, name').in('id', allBenefitPks) : { data: [] },
        allSkillPks.length > 0 ? supabaseAdmin.from('skills').select('id, uuid, name').in('id', allSkillPks) : { data: [] },
        jobPks.length > 0 ? supabaseAdmin.from('job_locations').select('job_id, countries:country_id(name), states_provinces:state_province_id(name), cities:city_id(name)').in('job_id', jobPks) : { data: [] },
        jobPks.length > 0 ? supabaseAdmin.from('job_skills').select('job_pk, skills:skill_pk(id, uuid, name)').in('job_pk', jobPks) : { data: [] },
        jobPks.length > 0 ? supabaseAdmin.from('job_benefits').select('job_pk, benefits:benefit_pk(id, uuid, name)').in('job_pk', jobPks) : { data: [] }
    ]);

    const cityMap = new Map<string, any>(cities?.map((c: any) => [String(c.id), { name: c.name, uuid: String(c.id) }]) || []);
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

    const resolved = jobs.map(job => {
        const jlNames = jobLocMap.get(job.id);
        const mappedLocations = (job.location_pks || []).map((id: number) => cityMap.get(String(id))).filter(Boolean);
        const locationNames = (jlNames && jlNames.length > 0) ? jlNames : mappedLocations.map((l: any) => l.name);

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
            location_names: locationNames,
            location_uuids: mappedLocations.map((l: any) => l.uuid),
            benefit_names: mappedBenefits.map((b: any) => b.name),
            benefit_uuids: mappedBenefits.map((b: any) => b.uuid),
            skill_uuids: mappedSkills.map((s: any) => s.uuid),
            skill_names: mappedSkills.map((s: any) => s.name),
            applicantCount: job.applicant_count || 0,
            selectedApplicantCount: job.selected_count || 0,
            referredApplicantCount: job.referred_count || 0,
            hiredApplicantCount: job.hired_count || 0
        });
    });

    resolved.sort((a: any, b: any) => {
        if (a.isBoosted && !b.isBoosted) return -1;
        if (!a.isBoosted && b.isBoosted) return 1;
        return 0;
    });

    return resolved;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    const userId = searchParams.get('userId');
    let appliedJobPks: number[] = [];

    if (userId) {
        const isUuid = userId.includes('-');
        
        const { data: jobseeker } = await supabaseAdmin.from('jobseekers').select('id').eq(isUuid ? 'uuid' : 'id', userId).maybeSingle();
        const user = jobseeker as any;

        if (user) {
            const { data: apps } = await supabaseAdmin.from('applications').select('job_pk').eq('user_pk', user.id);
            if (apps && apps.length > 0) {
                appliedJobPks = apps.map((ap: any) => ap.job_pk).filter(Boolean);
            }
        }
    }

    // Base Select with Joins
    // Recruiter dashboards may request non-active statuses (archived/draft/closed)
    const statusFilter = searchParams.get('status');
    const isRecruiterDashboard = !!searchParams.get('recruiterId') && searchParams.get('fresh') === 'true';

    let query = supabaseAdmin
        .from('jobs')
        .select(`
            *,
            job_types!job_type_pk(uuid, name),
            workplace_types!workplace_type_pk(uuid, name),
            company_sizes!company_size_id(uuid, name),
            currencies!currency_id(id, code, symbol, name),
            applications_count:applications(count)
        `);

    if (statusFilter) {
        // Explicit status filter (e.g. active, archived, draft, closed)
        query = query.eq('status', statusFilter);
    } else if (isRecruiterDashboard) {
        // Recruiter dashboard: return all statuses so tabs can filter client-side
        // (no status / expires_at filter)
    } else {
        // Public listings: only active, non-expired jobs
        query = query.eq('status', 'active').gt('expires_at', new Date().toISOString());
    }

    // Build exclusion list
    if (appliedJobPks.length > 0) {
        query = query.not('id', 'in', `(${appliedJobPks.join(',')})`);
    }

    // Dashboard View Logic
    if (searchParams.get('dashboard') === 'true') {
        
        const postedDays = searchParams.get('posted');

        const nowIso = new Date().toISOString();
        let recQuery = supabaseAdmin.from('jobs').select('*, job_types!job_type_pk(uuid, name), workplace_types!workplace_type_pk(uuid, name), company_sizes!company_size_id(name)').eq('status', 'active').gt('expires_at', nowIso).eq('is_referral', false).limit(10).order('posted_at', { ascending: false });
        let refQuery = supabaseAdmin.from('jobs').select('*, job_types!job_type_pk(uuid, name), workplace_types!workplace_type_pk(uuid, name), company_sizes!company_size_id(name)').eq('status', 'active').gt('expires_at', nowIso).eq('is_referral', true).limit(10).order('posted_at', { ascending: false });

        if (appliedJobPks.length > 0) {
            recQuery = recQuery.not('id', 'in', `(${appliedJobPks.join(',')})`);
            refQuery = refQuery.not('id', 'in', `(${appliedJobPks.join(',')})`);
        }

        if (postedDays && postedDays !== 'all') {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - parseInt(postedDays));
            recQuery = recQuery.gte('posted_at', cutoff.toISOString());
            refQuery = refQuery.gte('posted_at', cutoff.toISOString());
        }

        let [recSnap, refSnap] = await Promise.all([recQuery, refQuery]);
        
        if (recSnap.error && recSnap.error.code === '42703') {
            console.warn('[API_JOBS_GET] Dashboard query column missing (42703). Retrying fallback query...');
            let fallbackQuery = supabaseAdmin
                .from('jobs')
                .select('*, job_types!job_type_pk(uuid, name), workplace_types!workplace_type_pk(uuid, name), company_sizes!company_size_id(name)')
                .eq('status', 'active')
                .gt('expires_at', nowIso)
                .limit(10)
                .order('posted_at', { ascending: false });

            if (appliedJobPks.length > 0) {
                fallbackQuery = fallbackQuery.not('id', 'in', `(${appliedJobPks.join(',')})`);
            }
            if (postedDays && postedDays !== 'all') {
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - parseInt(postedDays));
                fallbackQuery = fallbackQuery.gte('posted_at', cutoff.toISOString());
            }

            recSnap = await fallbackQuery;
            refSnap = { data: [], error: null } as any;
        }

        const [recommended, referral] = await Promise.all([
            resolveJobNames(recSnap.data || []),
            resolveJobNames(refSnap.data || [])
        ]);

        return NextResponse.json({
            recommended,
            referral,
        });
    }

    // General Filters
    const isRecommended = searchParams.get('view') === 'recommended';

    if (searchParams.get('isReferral') !== null) {
      query = query.eq('is_referral', searchParams.get('isReferral') === 'true');
    }

    const isReferralParam = searchParams.get('isReferral') === 'true';
    // Handle Similar Jobs, Recommended Jobs, and Referral Lists
    const isSimilar = searchParams.get('similar') === 'true';
    const currentJobId = searchParams.get('currentJobId');
    if (currentJobId) {
        if (/^\d+$/.test(currentJobId)) {
            query = query.neq('id', parseInt(currentJobId));
        } else {
            query = query.neq('uuid', currentJobId);
        }
    }

    // Recommendation/similar filtering now uses skills/location instead of domain
    // (handled client-side via recommendation-engine.ts)

    
    const recruiterId = searchParams.get('recruiterId');
    let recruiterPk = null;
    const isValidRecruiterId = recruiterId && recruiterId !== 'undefined' && recruiterId !== 'null';
    if (isValidRecruiterId) {
        const { data: r } = await supabaseAdmin.from('recruiters').select('id').eq('uuid', recruiterId).single();
        if (r) recruiterPk = r.id;
    }

    if (isValidRecruiterId && recruiterPk !== null) query = query.eq('recruiter_pk', recruiterPk);

    
    const employeeId = searchParams.get('employeeId');
    let employeePk = null;
    const isValidEmployeeId = employeeId && employeeId !== 'undefined' && employeeId !== 'null';
    if (isValidEmployeeId) {
        const { data: e } = await supabaseAdmin.from('employees').select('id').eq('uuid', employeeId).single();
        if (e) employeePk = e.id;
    }

    if (isValidEmployeeId && employeePk !== null) query = query.eq('employee_pk', employeePk);
    
    // Helper to resolve IDs (UUID or Numeric) to PKs
    const resolveToPks = async (table: string, inputs: string[]) => {
        const uuidInputs = inputs.filter(i => i.includes('-'));
        const numericInputs = inputs.filter(i => /^\d+$/.test(i)).map(i => parseInt(i));
        
        const finalPks = [...numericInputs];
        if (uuidInputs.length > 0) {
            const { data } = await supabaseAdmin.from(table).select('id').in('uuid', uuidInputs);
            if (data) finalPks.push(...data.map((d: any) => d.id));
        }
        return Array.from(new Set(finalPks));
    };

    const locationsParams = searchParams.getAll('location').flatMap(l => l.split(',')).filter(l => l && l !== 'all');
    if (locationsParams.length > 0) {
        const lpks = await resolveToPks('locations', locationsParams);
        if (lpks.length > 0) query = query.overlaps('location_pks', lpks);
    } 

    // Industry filter (replaces domain filter)
    const industryParams = searchParams.getAll('industry').flatMap(i => i.split(',')).filter(i => i && i !== 'all');
    if (industryParams.length > 0) {
        query = query.in('industry', industryParams);
    }

    // Country filter
    const countryParams = searchParams.getAll('country').flatMap(c => c.split(',')).filter(c => c && c !== 'all');
    if (countryParams.length > 0) {
        query = query.in('country', countryParams);
    }

    // Remote type filter
    const remoteTypeParam = searchParams.get('remoteType');
    if (remoteTypeParam && remoteTypeParam !== 'all') {
        query = query.eq('remote_type', remoteTypeParam);
    }

    // Visa sponsorship filter (supports both ?visaSponsorship=true and ?visa=true)
    const visaSponsorshipParam = searchParams.get('visaSponsorship') || searchParams.get('visa');
    if (visaSponsorshipParam === 'true') {
        query = query.eq('visa_sponsorship', true);
    }

    const jobTypesParams = searchParams.getAll('jobType').flatMap(jt => jt.split(',')).filter(jt => jt && jt !== 'all');
    if (jobTypesParams.length > 0) {
        const jtpks = await resolveToPks('job_types', jobTypesParams);
        if (jtpks.length > 0) query = query.in('job_type_pk', jtpks);
    }

    const limitParam = searchParams.get('limit');
    const limitNum = limitParam ? parseInt(limitParam, 10) : null;
    const isValidLimit = limitNum !== null && !isNaN(limitNum) && limitNum > 0;

    query = query.order('posted_at', { ascending: false });
    if (isValidLimit) {
        query = query.limit(limitNum);
    }

    let { data: jobs, error } = await query;

    if (error && error.code === '42703') {
        console.warn('[API_JOBS_GET] Database column missing (42703). Retrying query without optional column filters...', error.message);
        let fallbackQuery = supabaseAdmin
            .from('jobs')
            .select(`
                *,
                job_types!job_type_pk(uuid, name),
                workplace_types!workplace_type_pk(uuid, name),
                company_sizes!company_size_id(uuid, name),
                applications_count:applications(count)
            `);

        if (statusFilter) {
            fallbackQuery = fallbackQuery.eq('status', statusFilter);
        } else if (!isRecruiterDashboard) {
            fallbackQuery = fallbackQuery.eq('status', 'active').gt('expires_at', new Date().toISOString());
        }

        if (appliedJobPks.length > 0) {
            fallbackQuery = fallbackQuery.not('id', 'in', `(${appliedJobPks.join(',')})`);
        }

        if (currentJobId) {
            if (/^\d+$/.test(currentJobId)) {
                fallbackQuery = fallbackQuery.neq('id', parseInt(currentJobId));
            } else {
                fallbackQuery = fallbackQuery.neq('uuid', currentJobId);
            }
        }

        if (isValidRecruiterId && recruiterPk !== null) {
            fallbackQuery = fallbackQuery.eq('recruiter_pk', recruiterPk);
        }

        if (locationsParams.length > 0) {
            const lpks = await resolveToPks('locations', locationsParams);
            if (lpks.length > 0) fallbackQuery = fallbackQuery.overlaps('location_pks', lpks);
        }

        if (industryParams.length > 0) {
            fallbackQuery = fallbackQuery.in('industry', industryParams);
        }

        if (countryParams.length > 0) {
            fallbackQuery = fallbackQuery.in('country', countryParams);
        }

        if (remoteTypeParam && remoteTypeParam !== 'all') {
            fallbackQuery = fallbackQuery.eq('remote_type', remoteTypeParam);
        }

        if (visaSponsorshipParam === 'true') {
            fallbackQuery = fallbackQuery.eq('visa_sponsorship', true);
        }

        if (jobTypesParams.length > 0) {
            const jtpks = await resolveToPks('job_types', jobTypesParams);
            if (jtpks.length > 0) fallbackQuery = fallbackQuery.in('job_type_pk', jtpks);
        }

        fallbackQuery = fallbackQuery.order('posted_at', { ascending: false });
        if (isValidLimit) {
            fallbackQuery = fallbackQuery.limit(limitNum);
        }

        const fallbackRes = await fallbackQuery;
        jobs = fallbackRes.data;
        error = fallbackRes.error;
    }

    if (error) throw error;

    let finalJobs = await resolveJobNames(jobs || []);

    const searchTerm = searchParams.get('search');
    if (searchTerm && searchTerm.trim() !== '') {
      finalJobs = intelligentSearchJobs(finalJobs, searchTerm);
    }

    if (isValidLimit) {
      finalJobs = finalJobs.slice(0, limitNum);
    }

    const response = NextResponse.json(finalJobs);
    if (!recruiterId && !employeeId) {
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    }
    return response;

  } catch (e: any) {
    console.error('[API_JOBS_GET] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch jobs', details: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { recruiterId, employeeId, adminId } = data;
    const userId = recruiterId || employeeId || adminId;

    if (!userId) {
        return NextResponse.json({ error: 'Recruiter ID or Employee ID is required' }, { status: 400 });
    }

    if (!data.title || !data.description) {
        return NextResponse.json({ error: 'Job Title and Description are required' }, { status: 400 });
    }

    const hasLocations = !!(data.countryId || data.cityId || data.country || data.city || data.locationIds?.length || data.locationId || data.locations?.length || data.location || data.locationPks?.length);
    const hasSkills = !!(data.skillIds?.length || data.requiredSkills?.length || data.skills?.length || data.skillPks?.length);

    if (!hasLocations) {
        return NextResponse.json({ error: 'Location is required for posting a job' }, { status: 400 });
    }
    if (!hasSkills) {
        return NextResponse.json({ error: 'Required Skills are required for posting a job' }, { status: 400 });
    }

    // ── Robust User Resolution ─────────────────────────────────────────────
    let user: any = null;
    let userTable: 'recruiters' | 'employees' | 'jobseekers' | 'admins' | null = null;
    const isNumericUserId = /^\d+$/.test(userId);
    const lookupId = isNumericUserId ? parseInt(userId) : userId;

    // Ordered search: Recruiters -> Employees -> Jobseekers
    const profileTables = [
        { name: 'recruiters', roleLabel: 'Recruiter' },
        { name: 'employees', roleLabel: 'Employee' },
        { name: 'jobseekers', roleLabel: 'Job Seeker' },
        { name: 'admins', roleLabel: 'Admin' }
    ];

    console.log(`[API_JOBS_POST] Starting robust user resolution for: ${userId} (lookUpId: ${lookupId})`);

    // Parallel search across all potential role tables
    const results = await Promise.all(profileTables.map(async (table) => {
        // Search by 'id' (UUID PK)
        let { data: profile, error } = await supabaseAdmin
            .from(table.name)
            .select('*')
            .eq('id', lookupId)
            .maybeSingle();

        if (error) {
            console.warn(`[API_JOBS_POST] Search error in ${table.name} (id):`, error.message);
        }

        // Fallback: Check 'uuid' column if search by 'id' failed
        if (!profile && !isNumericUserId) {
            const { data: fallbackProfile, error: fallbackError } = await supabaseAdmin
                .from(table.name)
                .select('*')
                .eq('uuid', lookupId)
                .maybeSingle();
            profile = fallbackProfile;
            if (fallbackError) {
                console.warn(`[API_JOBS_POST] Search error in ${table.name} (uuid):`, fallbackError.message);
            }
        }
        return { profile, tableName: table.name };
    }));

    const found = results.find(r => r.profile);
    if (found) {
        const profile = found.profile;
        const tableName = found.tableName;
        console.log(`[API_JOBS_POST] FOUND user in table: ${tableName}`);
        user = profile;
        
        if (tableName === 'jobseekers') {
            const role = profile.role?.toLowerCase() || '';
            if (role.includes('recruiter')) userTable = 'recruiters';
            else if (role.includes('employee')) userTable = 'employees';
            else userTable = 'jobseekers';
        } else {
            userTable = tableName as any;
        }
    }

    // ── Self-Healing: Auth Check & Auto-Provisioning ────────────────────────
    if (!user) {
        console.warn(`[API_JOBS_POST] Profile for ${userId} not found in DB tables. Checking Auth...`);
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(lookupId as string);
        const authUser = authData?.user;

        if (authUser) {
            console.log(`[API_JOBS_POST] User found in Auth. Provisioning database profile...`);
            const meta = authUser.user_metadata || {};
            const roleName = meta.role || 'Job Seeker';
            
            const tableMap: Record<string, string> = {
                'Recruiter': 'recruiters',
                'Employee': 'employees',
                'Admin': 'admins',
                'Super Admin': 'admins',
                'Job Seeker': 'jobseekers'
            };
            const targetTable = tableMap[roleName as keyof typeof tableMap] || 'jobseekers';
            
            const profileToCreate: any = {
                id: authUser.id,
                name: meta.name || authUser.email?.split('@')[0] || 'Unknown User',
                email: authUser.email,
                phone: meta.phone || ''
            };

            if (targetTable === 'recruiters' || targetTable === 'employees') {
                profileToCreate.company_name = meta.companyName || null;
                profileToCreate.role_id = targetTable === 'recruiters' ? 2 : 3;
            } else if (targetTable === 'jobseekers') {
                profileToCreate.role = roleName;
                profileToCreate.role_id = 1;
            }

            const { data: newProfile, error: createError } = await supabaseAdmin
                .from(targetTable)
                .insert(profileToCreate)
                .select('*')
                .single();

            if (createError) {
                console.error(`[API_JOBS_POST] Failed to auto-provision profile in ${targetTable}:`, createError.message);
            } else {
                console.log(`[API_JOBS_POST] Successfully auto-provisioned profile in ${targetTable}`);
                user = newProfile;
                userTable = targetTable as any;
            }
        }
    }

    if (!user) {
        return NextResponse.json({ 
            error: 'Recruiter or Employee profile not found',
            details: `Search failed for ID: ${userId} across tables: recruiters, employees, jobseekers, admins and Auth.`,
            passedId: userId
        }, { status: 404 });
    }

    const planType = user.plan_type || 'none';
    const planExpiresAt = user.plan_expires_at ? new Date(user.plan_expires_at) : null;
    const now = new Date();

    // Check user plan and limits - support both UUID and numeric pk (Employees may have plan_type 'none')
    // BYPASS plan checks for Admins
    // Structured subscription expiry check for recruiters
    if (userTable === 'recruiters') {
        const subInfo = getSubscriptionInfo(user);
        if (subInfo.isExpired) {
            return NextResponse.json(expiredResponse(), { status: 403 });
        }
    }

    // ── Job count check ────────────────────────────────────────────────────
    // BYPASS count checks for Admins
    let count: number | null = null;

    if (userTable === 'admins') {
        const { count: adminCount, error: countError } = await supabaseAdmin
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('admin_pk', user.id);
        if (countError) throw countError;
        count = adminCount;
        // Admins have no specific limit enforced here, but we set a high logical limit just in case
        const ADMIN_LIMIT = 5000;
        if (count !== null && count >= ADMIN_LIMIT) {
            return NextResponse.json({ error: 'System safety limit reached for Admin posts.' }, { status: 403 });
        }
    } else if (userTable === 'employees') {
      let jobsPostedThisMonth = user.jobs_posted_this_month ?? 0;
      let nextJobsResetAt = user.next_jobs_reset_at ?? null;
      const nextResetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));

      if (!nextJobsResetAt || now.getTime() >= new Date(nextJobsResetAt).getTime()) {
          jobsPostedThisMonth = 0;
          nextJobsResetAt = nextResetDate.toISOString();
      }

      const EMPLOYEE_MONTHLY_LIMIT = user.job_post_limit ?? 5;
      if (jobsPostedThisMonth >= EMPLOYEE_MONTHLY_LIMIT) {
        return NextResponse.json({
          error: `Monthly job posting limit (${EMPLOYEE_MONTHLY_LIMIT}/month) reached. Employees can post up to ${EMPLOYEE_MONTHLY_LIMIT} jobs per month. Quota resets on the 1st of next month.`,
        }, { status: 403 });
      }
    } else {
      // Recruiter: count active jobs
      const { count: activeCount, error: countError } = await supabaseAdmin
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('recruiter_pk', user.id)
        .gt('expires_at', now.toISOString())
        .eq('status', 'active');

      if (countError) throw countError;
      count = activeCount;

      const maxJobs = planType === 'pro' ? 50 : (planType === 'premium' ? 10 : 1);
      if (count !== null && count >= maxJobs) {
        return NextResponse.json({
          error: `Job limit reached. Your current plan allows only ${maxJobs} active jobs.`,
        }, { status: 403 });
      }
    }

    // Calculate expiry dates
    const isEmpOrReferral = userTable === 'employees' || !!data.isReferral;
    const jobExpiry = new Date();
    const jobValidityDays = isEmpOrReferral ? 14 : (planType === 'pro' ? 90 : 30);
    jobExpiry.setDate(now.getDate() + jobValidityDays);
    
    const appExpiry = new Date();
    const appAccessDays = isEmpOrReferral ? 14 : (planType === 'pro' ? 180 : (planType === 'premium' ? 90 : 30));
    appExpiry.setDate(now.getDate() + appAccessDays);


    // SAFE RESOLUTION HELPER SUPPORTING NAMES, UUIDs, AND NUMERIC PKs
    const safeResolveMetadata = async (table: string, idOrIdsOrNames: any | any[]) => {
      if (!idOrIdsOrNames) return Array.isArray(idOrIdsOrNames) ? [] : null;
      const inputs = (Array.isArray(idOrIdsOrNames) ? idOrIdsOrNames : [idOrIdsOrNames]).filter(Boolean);
      if (inputs.length === 0) return Array.isArray(idOrIdsOrNames) ? [] : null;

      const resolvedIds: number[] = [];

      for (const item of inputs) {
        const num = Number(item);
        if (!isNaN(num) && num > 0) {
          resolvedIds.push(num);
          continue;
        }

        const itemStr = String(item).trim();
        if (!itemStr) continue;

        if (itemStr.includes('-')) {
          // UUID lookup
          const { data: row } = await supabaseAdmin.from(table).select('id').eq('uuid', itemStr).maybeSingle();
          if (row) {
            resolvedIds.push(row.id);
            continue;
          }
        }

        // Case-insensitive Name lookup
        const { data: nameRow } = await supabaseAdmin.from(table).select('id').ilike('name', itemStr).maybeSingle();
        if (nameRow) {
          resolvedIds.push(nameRow.id);
        } else {
          // Auto-insert missing name for skills/locations/domains
          try {
            const { data: newRow } = await supabaseAdmin.from(table).insert({ name: itemStr }).select('id').single();
            if (newRow) resolvedIds.push(newRow.id);
          } catch (err) {
            console.error(`Auto-insert error for ${table} (${itemStr}):`, err);
          }
        }
      }

      if (Array.isArray(idOrIdsOrNames)) {
        return Array.from(new Set(resolvedIds));
      } else {
        return resolvedIds[0] || null;
      }
    };

    // RESOLVE PKs using the robust helper
    const jobTypePk = await safeResolveMetadata('job_types', data.jobTypePk || data.jobTypeId || data.type || data.jobType);
    const workplaceTypePk = await safeResolveMetadata('workplace_types', data.workplaceTypePk || data.workplaceTypeId || data.workplaceType);
    
    // Resolve Company Size
    const companySizeIdToResolve = user.company_size_id || data.companySizeId || data.companySize;
    const companySizePk = await safeResolveMetadata('company_sizes', companySizeIdToResolve);

    // Resolve List fields
    const locationPks = await safeResolveMetadata('locations', data.locationPks || data.locationIds || (data.locationId ? [data.locationId] : (data.locations || (data.location ? [data.location] : []))));
    const skillPks = await safeResolveMetadata('skills', data.skillPks || data.skillIds || data.requiredSkills || data.skills);
    const benefitPks = await safeResolveMetadata('benefits', data.benefitPks || data.benefitIds || data.benefits);

    let currencyPk = await safeResolveMetadata('currencies', data.currencyId || data.currency_id);
    if (!currencyPk && (data.salaryCurrency || data.preferredCurrency || user?.preferred_currency)) {
        const codeToFind = String(data.salaryCurrency || data.preferredCurrency || user?.preferred_currency || 'INR').toUpperCase();
        const { data: curr } = await supabaseAdmin.from('currencies').select('id').eq('code', codeToFind).maybeSingle();
        if (curr) currencyPk = curr.id;
    }

    // Resolve Authenticated User UUID to BigInt ID (PK) for the Jobs table
    const userNumericPk = user.id;

    // Ensure job_id is clean and unique to prevent 23505 constraint violation
    let finalJobId: string | null = data.jobId ? String(data.jobId).trim() : null;
    if (!finalJobId || finalJobId.length === 0) {
        finalJobId = null;
    } else {
        const { data: existingJob } = await supabaseAdmin
            .from('jobs')
            .select('id')
            .eq('job_id', finalJobId)
            .maybeSingle();

        if (existingJob) {
            finalJobId = `${finalJobId}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
    }

    const jobToCreate: any = {
      title: data.title,
      job_id: finalJobId,
      description: data.description,
      // Primary fallback logic: favor form data (especially for referrals), then user profile.
      company_name: data.companyName || user.company_name || null,
      company_logo: data.companyLogo || user.company_logo || null,
      job_type_pk: jobTypePk,
      workplace_type_pk: workplaceTypePk,
      job_role: data.job_role || data.role || data.title,
      salary_min_usd_cents: typeof data.salaryMin === 'number' ? data.salaryMin : (data.salary_min ?? null),
      salary_max_usd_cents: typeof data.salaryMax === 'number' ? data.salaryMax : (data.salary_max ?? null),
      currency_id: currencyPk || null,
      visa_sponsorship: !!(data.visaSponsorship ?? data.visa_sponsorship),
      experience_min: typeof data.minExperience === 'number' ? data.minExperience : 0,
      experience_max: typeof data.maxExperience === 'number' ? data.maxExperience : 0,
      is_referral: !!data.isReferral,
      recruiter_pk: userTable === 'recruiters' ? userNumericPk : null,
      employee_pk: userTable === 'employees' ? userNumericPk : null,
      admin_pk: userTable === 'admins' ? userNumericPk : null,
      posted_at: now.toISOString(),
      expires_at: jobExpiry.toISOString(),
      app_expires_at: appExpiry.toISOString(),
      max_applies: isEmpOrReferral ? 100 : ((user.max_applies_limit && user.max_applies_limit > 0) ? user.max_applies_limit : 999999),
      plan_type_at_posting: planType,
      vacancies: data.vacancies || 1,
      sections: data.sections || [],
      status: 'active',
      company_size_id: companySizePk,
      company_linkedin_url: user.company_linkedin_url || data.companyLinkedinUrl || null,
      company_overview: user.company_overview || data.companyOverview || null,
      company_website: user.company_website || data.companyWebsite || null,
      address: user.company_address || data.address || null,
      job_link: data.jobLink || null
    };
    
    let { data: newJob, error: insertError } = await supabaseAdmin
        .from('jobs')
        .insert([jobToCreate])
        .select()
        .single();

    if (insertError && insertError.code === '23505' && insertError.details?.includes('job_id')) {
        console.warn('[API_JOBS_POST] Duplicate job_id encountered. Retrying insert with unique generated job_id...');
        jobToCreate.job_id = `JOB-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        const retryIdRes = await supabaseAdmin
            .from('jobs')
            .insert([jobToCreate])
            .select()
            .single();
        newJob = retryIdRes.data;
        insertError = retryIdRes.error;
    }

    if (insertError && (insertError.code === '42703' || insertError.code === 'PGRST204')) {
        console.warn('[API_JOBS_POST] Column missing on insert. Retrying insert without optional columns...', insertError.message);
        delete (jobToCreate as any).location_pks;
        delete (jobToCreate as any).skill_pks;
        delete (jobToCreate as any).benefit_ids;
        delete (jobToCreate as any).is_referral;
        delete (jobToCreate as any).employee_pk;
        delete (jobToCreate as any).admin_pk;
        const retryRes = await supabaseAdmin
            .from('jobs')
            .insert([jobToCreate])
            .select()
            .single();
        newJob = retryRes.data;
        insertError = retryRes.error;
    }

    if (insertError) {
        console.error('[API_JOBS_POST] Insert Error:', insertError);
        return NextResponse.json({ 
            error: 'Failed to create job', 
            details: insertError.message,
            code: insertError.code 
        }, { status: 500 });
    }

    // Insert into relational join tables: job_skills, job_benefits, job_locations
    if (newJob?.id) {
        const sPks = Array.isArray(skillPks) ? skillPks : (skillPks ? [skillPks] : []);
        const bPks = Array.isArray(benefitPks) ? benefitPks : (benefitPks ? [benefitPks] : []);
        const lPks = Array.isArray(locationPks) ? locationPks : (locationPks ? [locationPks] : []);

        if (sPks.length > 0) {
            const skillInserts = sPks.map((spk: number) => ({ job_pk: newJob.id, skill_pk: spk }));
            try { await supabaseAdmin.from('job_skills').insert(skillInserts); } catch (e) {}
        }
        if (bPks.length > 0) {
            const benefitInserts = bPks.map((bpk: number) => ({ job_pk: newJob.id, benefit_pk: bpk }));
            try { await supabaseAdmin.from('job_benefits').insert(benefitInserts); } catch (e) {}
        }
        const locList = Array.isArray(data.locations) && data.locations.length > 0
            ? data.locations
            : [{ countryId: data.countryId, stateId: data.stateId, cityId: data.cityId }];

        const locInserts = locList.map((loc: any, idx: number) => ({
            job_id: newJob.id,
            country_id: loc.countryId ? Number(loc.countryId) : (data.countryId ? Number(data.countryId) : 1),
            state_province_id: loc.stateId ? Number(loc.stateId) : null,
            city_id: loc.cityId ? Number(loc.cityId) : null,
            is_primary: idx === 0
        })).filter((loc: any) => loc.country_id || loc.city_id || loc.state_province_id);

        if (locInserts.length > 0) {
            try { await supabaseAdmin.from('job_locations').insert(locInserts); } catch (e) {}
        }
    }

    const createdJob = mapJobToFrontend(newJob);

    // ── Gamification & Quota: Update Employee and Award XP ───────────────────
    if (userTable === 'employees' && userNumericPk) {
        let jobsPostedThisMonth = user.jobs_posted_this_month ?? 0;
        let nextJobsResetAt = user.next_jobs_reset_at ?? null;
        const nextResetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));

        if (!nextJobsResetAt || now.getTime() >= new Date(nextJobsResetAt).getTime()) {
            jobsPostedThisMonth = 0;
            nextJobsResetAt = nextResetDate.toISOString();
        }

        await supabaseAdmin
            .from('employees')
            .update({
                jobs_posted_this_month: jobsPostedThisMonth + 1,
                next_jobs_reset_at: nextJobsResetAt
            })
            .eq('id', userNumericPk);

        await awardXP(userNumericPk, 'JOB_POSTED', newJob.id);
    }

    return NextResponse.json(createdJob, { status: 201 });
  } catch (e: any) {
    console.error('[API_JOBS_POST] Unexpected Error:', e);
    return NextResponse.json({ error: 'Failed to create job', details: e.message }, { status: 500 });
  }
}
