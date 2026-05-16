import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Helper to map Supabase snake_case job to camelCase Job type
async function mapJobDetailToFrontend(job: any, isApplied: boolean = false): Promise<any> {
    // Resolve location data (names and UUIDs)
    let locNames: string[] = [];
    let locUuids: string[] = [];
    if (job.location_pks && job.location_pks.length > 0) {
        const { data: locations } = await supabaseAdmin
            .from('locations')
            .select('uuid, name')
            .in('id', job.location_pks);
        if (locations) {
            locNames = locations.map(l => l.name);
            locUuids = locations.map(l => l.uuid);
        }
    }

    // Resolve skill data (names and UUIDs)
    let skillNames: string[] = [];
    let skillUuids: string[] = [];
    if (job.skill_pks && job.skill_pks.length > 0) {
        const { data: skills } = await supabaseAdmin
            .from('skills')
            .select('uuid, name')
            .in('id', job.skill_pks);
        if (skills) {
            skillNames = skills.map(s => s.name);
            skillUuids = skills.map(s => s.uuid);
        }
    }

    // Resolve benefit data (names and UUIDs)
    let benefitNames: string[] = [];
    let benefitUuids: string[] = [];
    if (job.benefit_ids && job.benefit_ids.length > 0) {
        const { data: benefits } = await supabaseAdmin
            .from('benefits')
            .select('uuid, name')
            .in('id', job.benefit_ids);
        if (benefits) {
            benefitNames = benefits.map(b => b.name);
            benefitUuids = benefits.map(b => b.uuid);
        }
    }

    return {
        id: job.id,
        uuid: job.uuid,
        jobId: job.job_id,
        pk: job.id,
        recruiterPk: job.recruiter_pk,
        employeePk: job.employee_pk,
        title: job.title,
        companyName: job.company_name,
        companyLogo: job.company_logo,
        description: job.description,
        postedAt: job.posted_at,
        expiresAt: job.expires_at,
        appExpiresAt: job.app_expires_at,
        maxApplies: job.max_applies,
        isReferral: !!job.is_referral,
        employeeLinkedin: job.employee_linkedin,
        jobLink: job.job_link,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        minExperience: job.experience_min,
        maxExperience: job.experience_max,
        planTypeAtPosting: job.plan_type_at_posting,
        status: job.status,
        companySizeId: job.company_sizes?.uuid || null,
        companySizePk: job.company_size_id,
        companySize: job.company_sizes?.name || 'N/A',
        companyLinkedinUrl: job.company_linkedin_url,
        companyOverview: job.company_overview,
        companyWebsite: job.company_website,
        address: job.address,
        isConsultancy: !!job.is_consultancy,
        vacancies: job.vacancies,
        sections: job.sections || [],
        benefitIds: benefitUuids,
        benefits: benefitNames,
        job_role: job.job_role,
        domainId: job.domains?.uuid || null,
        domainPk: job.domain_pk,
        jobTypeId: job.job_types?.uuid || null,
        jobTypePk: job.job_type_pk,
        workplaceTypeId: job.workplace_types?.uuid || null,
        workplaceTypePk: job.workplace_type_pk,
        locationIds: locUuids,
        locationPks: job.location_pks || [],
        skillIds: skillUuids,
        skillPks: job.skill_pks || [],
        domain: job.domains?.name || 'N/A',
        type: job.job_types?.name || 'N/A',
        workplaceType: job.workplace_types?.name || 'N/A',
        location: locNames.join(', ') || 'N/A',
        locations: locNames,
        experienceLevel: `${job.experience_min} - ${job.experience_max} Years`,
        applicantCount: job.applicant_count || 0,
        selectedApplicantCount: job.selected_count || 0,
        referredApplicantCount: job.referred_count || 0,
        hiredApplicantCount: job.hired_count || 0,
        requiredSkills: skillNames,
        isApplied: isApplied,
        employeeTrustScore: (job.employees || job.employees?.[0])?.trust_score ?? 100,
        employeeEmail: (job.employees || job.employees?.[0])?.email ?? null,
    };
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);

    // Support both numeric BIGINT id (e.g. /jobs/1) and UUID string for backward compat
    const isNumericId = /^\d+$/.test(id);

    const { data: job, error } = await supabaseAdmin
        .from('jobs')
        .select(`
            *,
            domains!domain_pk(uuid, name),
            job_types!job_type_pk(uuid, name),
            workplace_types!workplace_type_pk(uuid, name),
            company_sizes!company_size_id(uuid, name),
            employees!employee_pk(trust_score, email)
        `)
        .eq(isNumericId ? 'id' : 'uuid', id)
        .single();

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Resolve Application Status if userId is provided
    let hasApplied = false;
    const userId = searchParams.get('userId');
    if (userId) {
        const isNumericUser = /^\d+$/.test(userId);
        let userPk = null;

        if (isNumericUser) {
            userPk = parseInt(userId);
        } else {
            const { data: u } = await supabaseAdmin.from('jobseekers').select('id').eq('uuid', userId).maybeSingle();
            if (u) userPk = u.id;
        }

        if (userPk) {
            const { data: existingApp } = await supabaseAdmin
                .from('applications')
                .select('id')
                .eq('job_pk', job.id)
                .eq('user_pk', userPk)
                .maybeSingle();
            hasApplied = !!existingApp;
        }
    }

    // In both cases, ensure we map the DB column correctly
    const finalJob = await mapJobDetailToFrontend({
        ...job,
        job_role: job.job_role || (job as any).role // Fallback during migration
    }, hasApplied);

    const response = NextResponse.json(finalJob);
    
    if (searchParams.get('fresh') !== 'true') {
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    }
    
    return response;

  } catch (e: any) {
    console.error('[API_JOB_ID_GET] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch job', details: e.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();
        
        // Fetch current job to get owner info (Lookup by uuid)
        const isNumericId = /^\d+$/.test(id);
        const { data: job, error: jobError } = await supabaseAdmin
            .from('jobs')
            .select('id, recruiter_pk, employee_pk')
            .eq(isNumericId ? 'id' : 'uuid', id)
            .single();
        if (jobError || !job) throw new Error('Job not found');

        // Resolve recruiter/employee for company info
        let user: any = null;
        if (job.recruiter_pk) {
            const { data: r } = await supabaseAdmin.from('recruiters').select('*').eq('id', job.recruiter_pk).maybeSingle();
            user = r;
        } else if (job.employee_pk) {
            const { data: e } = await supabaseAdmin.from('employees').select('*').eq('id', job.employee_pk).maybeSingle();
            user = e;
        }

        // Self-Healing Profile Check for the Edit API
        if (!user) {
            console.log(`[API_JOB_ID_PUT] Owner profile missing from DB. Searching Auth...`);
            const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers();
            
            // Try to find the user by their BigInt ID (stored in recruiter_pk/employee_pk) or potentially their UUID
            const authUser = authUsers.find(u => u.id === job.user_pk || u.email === (job as any).employee_email);
            
            if (authUser) {
                const userType = authUser.user_metadata?.role || (job.employee_pk ? 'employee' : 'recruiter');
                const tableName = userType === 'recruiter' ? 'recruiters' : 'employees';
                
                const { data: newProfile } = await supabaseAdmin
                    .from(tableName)
                    .upsert({
                        id: authUser.id,
                        email: authUser.email,
                        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
                        company_name: authUser.user_metadata?.company_name || 'My Company',
                        role: userType
                    })
                    .select()
                    .single();

                if (newProfile) user = newProfile;
            }
        }

        // SAFE RESOLUTION HELPER for PUT
        const safeResolveMetadata = async (table: string, idOrIds: any | any[]) => {
          if (!idOrIds) return Array.isArray(idOrIds) ? [] : null;
          const inputs = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
          if (inputs.length === 0) return Array.isArray(idOrIds) ? [] : null;

          const numericIds = inputs.map(id => Number(id)).filter(id => !isNaN(id));
          const uuidIds = inputs.filter(id => isNaN(Number(id)) && String(id).includes('-'));

          let orClauses = [];
          if (numericIds.length > 0) orClauses.push(`id.in.(${numericIds.join(',')})`);
          if (uuidIds.length > 0) orClauses.push(`uuid.in.(${uuidIds.map(u => `"${u}"`).join(',')})`);

          if (orClauses.length === 0) return Array.isArray(idOrIds) ? [] : null;

          const { data: results } = await supabaseAdmin.from(table).select('id').or(orClauses.join(','));

          if (Array.isArray(idOrIds)) {
            return results ? results.map((r: any) => r.id) : [];
          } else {
            return results && results.length > 0 ? results[0].id : null;
          }
        };

        const domainPk = await safeResolveMetadata('domains', body.domainId);
        const jobTypePk = await safeResolveMetadata('job_types', body.jobTypeId);
        const workplaceTypePk = await safeResolveMetadata('workplace_types', body.workplaceTypeId);
        
        const companySizeToResolve = body.companySizeId || (user?.company_size_id);
        const companySizePk = await safeResolveMetadata('company_sizes', companySizeToResolve);

        const locationPks = await safeResolveMetadata('locations', body.locationIds);
        const skillPks = await safeResolveMetadata('skills', body.skillIds);
        const benefitPks = await safeResolveMetadata('benefits', body.benefitIds);

        const isConsultancy = !!body.isConsultancy;
        const isReferral = !!body.isReferral;

        const dataToUpdate: any = {
            title: body.title,
            job_id: body.jobId || null,
            description: body.description,
            // Priority: form data (if consultancy/referral), then profile
            company_name: (isConsultancy || isReferral) ? body.companyName : (user?.company_name || body.companyName),
            company_logo: (isConsultancy || isReferral) ? body.companyLogo : (user?.company_logo || body.companyLogo),
            domain_pk: domainPk,
            job_type_pk: jobTypePk,
            workplace_type_pk: workplaceTypePk,
            location_pks: locationPks,
            salary_min: body.salaryMin ?? null,
            salary_max: body.salaryMax ?? null,
            job_role: body.job_role || body.role || body.title,
            experience_min: typeof body.minExperience === 'number' ? body.minExperience : 0,
            experience_max: typeof body.maxExperience === 'number' ? body.maxExperience : 0,
            is_referral: isReferral,
            vacancies: body.vacancies || 1,
            sections: body.sections || [],
            skill_pks: skillPks,
            benefit_ids: benefitPks,
            status: body.status || 'active',
            company_size_id: companySizePk,
            company_linkedin_url: (isConsultancy || isReferral) ? body.companyLinkedinUrl : user?.company_linkedin_url,
            company_overview: (isConsultancy || isReferral) ? body.companyOverview : user?.company_overview,
            company_website: (isConsultancy || isReferral) ? body.companyWebsite : user?.company_website,
            address: (isConsultancy || isReferral) ? body.address : user?.company_address,
            is_consultancy: isConsultancy,
            updated_at: new Date().toISOString()
        };

        // Remove undefined fields
        Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

        const { data: updatedJob, error } = await supabaseAdmin
            .from('jobs')
            .update(dataToUpdate)
            .eq(isNumericId ? 'id' : 'uuid', id)
            .select()
            .single();

        if (error) throw error;
        
        return NextResponse.json(await mapJobDetailToFrontend(updatedJob), { status: 200 });

    } catch (e: any) {
        console.error('[API_JOB_ID_PUT] Error:', e);
        return NextResponse.json({ error: 'Failed to update job', details: e.message }, { status: 500 });
    }
}


export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        
        // 1. Resolve the internal numeric PK (BIGINT) first.
        // We need this because foreign keys in target tables (notifications, applications) usually use the BIGINT 'id'.
        const isNumericId = /^\d+$/.test(id);
        let jobPk = isNumericId ? parseInt(id) : null;

        if (!isNumericId) {
            const { data: jobData } = await supabaseAdmin
                .from('jobs')
                .select('id')
                .eq('uuid', id)
                .single();
            if (jobData) jobPk = jobData.id;
        }

        // 1.1 Prevent deletion if applications exist
        if (jobPk) {
            const { count: appCount, error: countError } = await supabaseAdmin
                .from('applications')
                .select('id', { count: 'exact', head: true })
                .eq('job_pk', jobPk);

            if (countError) throw countError;

            if (appCount && appCount > 0) {
                return NextResponse.json({ 
                    error: 'Cannot delete job posting with active applications. Please mark it as inactive instead to preserve history.' 
                }, { status: 403 });
            }
        }

        if (jobPk) {
            console.log(`[API_JOB_ID_DELETE] Cleaning dependencies for Job PK: ${jobPk}`);
            
            // 2. Manually delete notifications linked to this job
            // This prevents: "violates foreign key constraint notifications_job_pk_fkey"
            const { error: notifError } = await supabaseAdmin
                .from('notifications')
                .delete()
                .eq('job_pk', jobPk);
            
            if (notifError) console.warn('[API_JOB_ID_DELETE] Non-fatal notification cleanup error:', notifError);

            // 3. Manually delete applications (Safety step)
            // Even if CASCADE is enabled, explicit deletion ensures no constraints are missed.
            const { error: appError } = await supabaseAdmin
                .from('applications')
                .delete()
                .eq('job_pk', jobPk);

            if (appError) console.warn('[API_JOB_ID_DELETE] Non-fatal application cleanup error:', appError);
        }

        // 4. Finally delete the job itself
        const { error } = await supabaseAdmin
            .from('jobs')
            .delete()
            .eq(jobPk ? 'id' : 'uuid', jobPk || id);

        if (error) throw error;

        return NextResponse.json({ message: 'Job and related records deleted successfully' }, { status: 200 });
    } catch (e: any) {
        console.error('[API_JOB_ID_DELETE] Error:', e);
        return NextResponse.json({ error: 'Failed to delete job', details: e.message }, { status: 500 });
    }
}
