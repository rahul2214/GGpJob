import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Job } from '@/lib/types';
import { awardXP } from '@/lib/gamification-logic';

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
        domainId: job.domains?.uuid || null,
        domainPk: job.domain_pk,
        jobTypeId: job.job_types?.uuid || null,
        jobTypePk: job.job_type_pk,
        workplaceTypeId: job.workplace_types?.uuid || null,
        workplaceTypePk: job.workplace_type_pk,
        locationIds: job.location_uuids || [], // Resolved UUIDs
        locationPks: job.location_pks || [],
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
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
        benefitIds: job.benefit_uuids || [], // Resolved UUIDs
        benefits: job.benefit_names || [],
        domain: job.domains?.name || 'N/A',
        type: job.job_types?.name || 'N/A',
        workplaceType: job.workplace_types?.name || 'N/A',
        companySizeId: job.company_sizes?.uuid || null, // Map to UUID
        companySize: job.company_sizes?.name || 'N/A',
        companyLinkedinUrl: job.company_linkedin_url,
        companyOverview: job.company_overview,
        companyWebsite: job.company_website,
        address: job.address,
        isConsultancy: job.is_consultancy,
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
        creditsRequired: job.credits_required || 5,
        referralStrength: job.referral_strength || 'Basic',
        referralCapacity: job.referral_capacity,
        requiredSkills: job.skill_names || [],
    };
}

// Helper to resolve location and benefit names for a list of jobs
async function resolveJobNames(jobs: any[]): Promise<any[]> {
    if (!jobs || jobs.length === 0) return [];

    const allLocationPks = Array.from(new Set(jobs.flatMap(j => j.location_pks || [])));
    const allBenefitPks = Array.from(new Set(jobs.flatMap(j => j.benefit_ids || [])));
    const allSkillPks = Array.from(new Set(jobs.flatMap(j => j.skill_pks || [])));

    const [
        { data: locations },
        { data: benefits },
        { data: skills }
    ] = await Promise.all([
        allLocationPks.length > 0 ? supabaseAdmin.from('locations').select('id, uuid, name').in('id', allLocationPks) : { data: [] },
        allBenefitPks.length > 0 ? supabaseAdmin.from('benefits').select('id, uuid, name').in('id', allBenefitPks) : { data: [] },
        allSkillPks.length > 0 ? supabaseAdmin.from('skills').select('id, uuid, name').in('id', allSkillPks) : { data: [] }
    ]);

    const locationMap = new Map<string, any>(locations?.map((l: any) => [String(l.id), { name: l.name, uuid: l.uuid }]) || []);
    const benefitMap = new Map<string, any>(benefits?.map((b: any) => [String(b.id), { name: b.name, uuid: b.uuid }]) || []);
    const skillMap = new Map<string, any>(skills?.map((s: any) => [String(s.id), { name: s.name, uuid: s.uuid }]) || []);

    return jobs.map(job => {
        const mappedLocations = (job.location_pks || []).map((id: number) => locationMap.get(String(id))).filter(Boolean);
        const mappedBenefits = (job.benefit_ids || []).map((id: number) => benefitMap.get(String(id))).filter(Boolean);
        const mappedSkills = (job.skill_pks || []).map((id: number) => skillMap.get(String(id))).filter(Boolean);
        
        return mapJobToFrontend({ 
            ...job, 
            location_names: mappedLocations.map((l: any) => l.name),
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
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    const userId = searchParams.get('userId');
    let appliedJobPks: number[] = [];
    let userDomainId: any = null;

    if (userId) {
        const isUuid = userId.includes('-');
        
        // Robust lookup across tables in PARALLEL
        const [
            { data: jobseeker },
            { data: employee }
        ] = await Promise.all([
            supabaseAdmin.from('jobseekers').select('id, domain_id').eq(isUuid ? 'uuid' : 'id', userId).maybeSingle(),
            isUuid ? supabaseAdmin.from('employees').select('id, domain_id').eq('uuid', userId).maybeSingle() : Promise.resolve({ data: null })
        ]);
            
        const user = (jobseeker || employee) as any;

        if (user) {
            userDomainId = user.domain_id;
            const { data: apps } = await supabaseAdmin.from('applications').select('job_pk').eq('user_pk', user.id);
            if (apps && apps.length > 0) {
                appliedJobPks = apps.map((ap: any) => ap.job_pk).filter(Boolean);
            }
        }
    }

    // Base Select with Joins
    let query = supabaseAdmin
        .from('jobs')
        .select(`
            *,
            domains!domain_pk(uuid, name),
            job_types!job_type_pk(uuid, name),
            workplace_types!workplace_type_pk(uuid, name),
            company_sizes!company_size_id(uuid, name),
            employees!employee_pk(trust_score, email),
            applications_count:applications(count)
        `)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString());

    // Build exclusion list
    if (appliedJobPks.length > 0) {
        query = query.not('id', 'in', `(${appliedJobPks.join(',')})`);
    }

    // Dashboard View Logic
    if (searchParams.get('dashboard') === 'true') {
        
    const domainIdParam = searchParams.get('domain');
    let domainPk = null;
    if (domainIdParam) {
        if (/^\d+$/.test(domainIdParam)) {
            domainPk = parseInt(domainIdParam);
        } else {
            const { data: d } = await supabaseAdmin.from('domains').select('id').eq('uuid', domainIdParam).single();
            if (d) domainPk = d.id;
        }
    }

        const postedDays = searchParams.get('posted');

        const nowIso = new Date().toISOString();
        let recQuery = supabaseAdmin.from('jobs').select('*, domains!domain_pk(uuid, name), job_types!job_type_pk(uuid, name), workplace_types!workplace_type_pk(uuid, name), company_sizes!company_size_id(name), employees!employee_pk(trust_score, email)').eq('status', 'active').gt('expires_at', nowIso).eq('is_referral', false).limit(10).order('posted_at', { ascending: false });
        let refQuery = supabaseAdmin.from('jobs').select('*, domains!domain_pk(uuid, name), job_types!job_type_pk(uuid, name), workplace_types!workplace_type_pk(uuid, name), company_sizes!company_size_id(name), employees!employee_pk(trust_score, email)').eq('status', 'active').gt('expires_at', nowIso).eq('is_referral', true).limit(10).order('posted_at', { ascending: false });

        if (appliedJobPks.length > 0) {
            recQuery = recQuery.not('id', 'in', `(${appliedJobPks.join(',')})`);
            refQuery = refQuery.not('id', 'in', `(${appliedJobPks.join(',')})`);
        }

        // Apply Domain Filter (Targeted Dashboard View)
        let dashboardDomainPk = domainPk;
        
        // If no explicit domain param, use the user's profile domain
        if (!dashboardDomainPk && userDomainId) {
            if (/^\d+$/.test(String(userDomainId))) {
                dashboardDomainPk = parseInt(userDomainId);
            } else {
                const { data: d } = await supabaseAdmin.from('domains').select('id').eq('uuid', userDomainId).single();
                if (d) dashboardDomainPk = d.id;
            }
        }

        if (dashboardDomainPk) {
            recQuery = recQuery.eq('domain_pk', dashboardDomainPk);
            refQuery = refQuery.eq('domain_pk', dashboardDomainPk);
        }

        if (postedDays && postedDays !== 'all') {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - parseInt(postedDays));
            recQuery = recQuery.gte('posted_at', cutoff.toISOString());
            refQuery = refQuery.gte('posted_at', cutoff.toISOString());
        }

        const [recSnap, refSnap] = await Promise.all([recQuery, refQuery]);
        
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

    if ((isRecommended || isReferralParam || isSimilar) && userDomainId) {
        if (/^\d+$/.test(String(userDomainId))) {
            query = query.eq('domain_pk', parseInt(userDomainId));
        } else {
            const { data: domain } = await supabaseAdmin.from('domains').select('id').eq('uuid', userDomainId).single();
            if (domain) {
                query = query.eq('domain_pk', domain.id);
            }
        }
    }

    
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

    const domainsParams = searchParams.getAll('domain').flatMap(d => d.split(',')).filter(d => d && d !== 'all');
    if (domainsParams.length > 0 && !isRecommended) {
        const dpks = await resolveToPks('domains', domainsParams);
        if (dpks.length > 0) query = query.in('domain_pk', dpks);
    }

    const jobTypesParams = searchParams.getAll('jobType').flatMap(jt => jt.split(',')).filter(jt => jt && jt !== 'all');
    if (jobTypesParams.length > 0) {
        const jtpks = await resolveToPks('job_types', jobTypesParams);
        if (jtpks.length > 0) query = query.in('job_type_pk', jtpks);
    }

    // Search term (ILike for PostgreSQL)
    const searchTerm = searchParams.get('search');
    if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
    }

    // Timing
    const postedParam = searchParams.get('posted');
    if (postedParam && postedParam !== 'all') {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - parseInt(postedParam));
        query = query.gte('posted_at', cutoff.toISOString());
    }

    // Order and Limit / Pagination
    query = query.order('posted_at', { ascending: false });
    
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    
    if (pageParam) {
        const page = parseInt(pageParam, 10) || 1;
        const limit = parseInt(limitParam || '25', 10) || 25;
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
    } else {
        const limit = limitParam ? parseInt(limitParam, 10) : 100;
        query = query.limit(limit);
    }

    const { data: jobs, error } = await query;
    if (error) throw error;

    const finalJobs = await resolveJobNames(jobs || []);

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
    if (userTable === 'recruiters' && (planType === 'none' || (planExpiresAt && planExpiresAt < now))) {
        return NextResponse.json({ error: 'Active subscription required for Recruiter to post jobs' }, { status: 403 });
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


    // SAFE RESOLUTION HELPER
    const safeResolveMetadata = async (table: string, idOrIds: any | any[]) => {
      if (!idOrIds) return Array.isArray(idOrIds) ? [] : null;
      const inputs = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
      if (inputs.length === 0) return Array.isArray(idOrIds) ? [] : null;

      // Filter by type to avoid PostgREST cast errors
      const numericIds = inputs.map(id => Number(id)).filter(id => !isNaN(id));
      const uuidIds = inputs.filter(id => isNaN(Number(id)) && String(id).includes('-'));

      let orClauses = [];
      if (numericIds.length > 0) orClauses.push(`id.in.(${numericIds.join(',')})`);
      if (uuidIds.length > 0) orClauses.push(`uuid.in.(${uuidIds.map(u => `"${u}"`).join(',')})`);

      if (orClauses.length === 0) return Array.isArray(idOrIds) ? [] : null;

      const { data: results, error: resError } = await supabaseAdmin
        .from(table)
        .select('id')
        .or(orClauses.join(','));

      if (resError) {
        console.error(`[API_JOBS_POST] Error resolving ${table}:`, resError);
        return Array.isArray(idOrIds) ? [] : null;
      }

      if (Array.isArray(idOrIds)) {
        return results ? results.map((r: any) => r.id) : [];
      } else {
        return results && results.length > 0 ? results[0].id : null;
      }
    };

    // RESOLVE PKs using the robust helper
    const domainPk = await safeResolveMetadata('domains', data.domainId);
    const jobTypePk = await safeResolveMetadata('job_types', data.jobTypeId);
    const workplaceTypePk = await safeResolveMetadata('workplace_types', data.workplaceTypeId);
    
    // Resolve Company Size
    const companySizeIdToResolve = user.company_size_id || data.companySizeId;
    const companySizePk = await safeResolveMetadata('company_sizes', companySizeIdToResolve);

    // Resolve List fields
    const locationPks = await safeResolveMetadata('locations', data.locationIds || (data.locationId ? [data.locationId] : []));
    const skillPks = await safeResolveMetadata('skills', data.skillIds);
    const benefitPks = await safeResolveMetadata('benefits', data.benefitIds);

    // Resolve Authenticated User UUID to BigInt ID (PK) for the Jobs table
    const userNumericPk = user.id;

    const jobToCreate = {
      title: data.title,
      job_id: data.jobId || null,
      description: data.description,
      // Primary fallback logic: favor form data (especially for referrals), then user profile.
      company_name: data.companyName || user.company_name || null,
      company_logo: data.companyLogo || user.company_logo || null,
      domain_pk: domainPk,
      job_type_pk: jobTypePk,
      workplace_type_pk: workplaceTypePk,
      location_pks: locationPks,
      salary_min: data.salaryMin ?? null,
      salary_max: data.salaryMax ?? null,
      job_role: data.job_role || data.role || data.title,
      experience_min: typeof data.minExperience === 'number' ? data.minExperience : 0,
      experience_max: typeof data.maxExperience === 'number' ? data.maxExperience : 0,
      is_referral: !!data.isReferral,
      recruiter_pk: userTable === 'recruiters' ? userNumericPk : null,
      employee_pk: userTable === 'employees' ? userNumericPk : null,
      admin_pk: userTable === 'admins' ? userNumericPk : null,
      posted_at: now.toISOString(),
      expires_at: jobExpiry.toISOString(),
      app_expires_at: appExpiry.toISOString(),
      max_applies: isEmpOrReferral ? 100 : (user.max_applies_limit ?? -1),
      plan_type_at_posting: planType,
      vacancies: data.vacancies || 1,
      sections: data.sections || [],
      skill_pks: skillPks,
      benefit_ids: benefitPks,
      status: 'active',
      company_size_id: companySizePk,
      company_linkedin_url: user.company_linkedin_url || data.companyLinkedinUrl || null,
      company_overview: user.company_overview || data.companyOverview || null,
      company_website: user.company_website || data.companyWebsite || null,
      address: user.company_address || data.address || null,
      job_link: data.jobLink || null,
      is_consultancy: !!data.isConsultancy,
      credits_required: data.creditsRequired || 5,
      referral_strength: data.referralStrength || 'Basic',
      referral_capacity: data.referralCapacity || null
    };
    
    const { data: newJob, error: insertError } = await supabaseAdmin
        .from('jobs')
        .insert([jobToCreate])
        .select()
        .single();

    if (insertError) {
        console.error('[API_JOBS_POST] Insert Error:', insertError);
        return NextResponse.json({ 
            error: 'Failed to create job', 
            details: insertError.message,
            code: insertError.code 
        }, { status: 500 });
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
