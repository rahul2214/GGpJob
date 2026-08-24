import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getSubscriptionInfo, expiredResponse } from '@/lib/subscription';

// Helper to map Supabase snake_case job to camelCase Job type
async function mapJobDetailToFrontend(job: any, isApplied: boolean = false): Promise<any> {
    // Resolve location data (names and UUIDs)
    let locNames: string[] = [];
    let locUuids: string[] = [];

    const { data: jobLocs } = await supabaseAdmin
        .from('job_locations')
        .select('countries:country_id(name), states_provinces:state_province_id(name), cities:city_id(id, name)')
        .eq('job_id', job.id);

    if (jobLocs && jobLocs.length > 0) {
        jobLocs.forEach((jl: any) => {
            const parts = [jl.cities?.name, jl.states_provinces?.name, jl.countries?.name].filter(Boolean);
            if (parts.length > 0) {
                locNames.push(parts.join(', '));
                if (jl.cities?.id) locUuids.push(String(jl.cities.id));
            }
        });
    } else if (job.location_pks && job.location_pks.length > 0) {
        const { data: cities } = await supabaseAdmin
            .from('cities')
            .select('id, name')
            .in('id', job.location_pks);
        if (cities) {
            locNames = cities.map((c: any) => c.name);
            locUuids = cities.map((c: any) => String(c.id));
        }
    }

    // Resolve skill data (names and UUIDs)
    let skillNames: string[] = [];
    let skillUuids: string[] = [];

    const { data: jobSks } = await supabaseAdmin
        .from('job_skills')
        .select('skills:skill_pk(id, uuid, name)')
        .eq('job_pk', job.id);

    if (jobSks && jobSks.length > 0) {
        jobSks.forEach((js: any) => {
            if (js.skills?.name) {
                skillNames.push(js.skills.name);
                if (js.skills?.uuid) skillUuids.push(js.skills.uuid);
            }
        });
    } else if (job.skill_pks && job.skill_pks.length > 0) {
        const { data: skills } = await supabaseAdmin
            .from('skills')
            .select('uuid, name')
            .in('id', job.skill_pks);
        if (skills) {
            skillNames = skills.map((s: any) => s.name);
            skillUuids = skills.map((s: any) => s.uuid);
        }
    }

    // Resolve benefit data (names and UUIDs)
    let benefitNames: string[] = [];
    let benefitUuids: string[] = [];

    const { data: jobBens } = await supabaseAdmin
        .from('job_benefits')
        .select('benefits:benefit_pk(id, uuid, name)')
        .eq('job_pk', job.id);

    if (jobBens && jobBens.length > 0) {
        jobBens.forEach((jb: any) => {
            if (jb.benefits?.name) {
                benefitNames.push(jb.benefits.name);
                if (jb.benefits?.uuid) benefitUuids.push(jb.benefits.uuid);
            }
        });
    } else if (job.benefit_ids && job.benefit_ids.length > 0) {
        const { data: benefits } = await supabaseAdmin
            .from('benefits')
            .select('uuid, name')
            .in('id', job.benefit_ids);
        if (benefits) {
            benefitNames = benefits.map((b: any) => b.name);
            benefitUuids = benefits.map((b: any) => b.uuid);
        }
    }

    return {
        id: job.id,
        uuid: job.uuid,
        jobId: job.job_id,
        pk: job.id,
        recruiterPk: job.recruiter_pk,
       
        title: job.title,
        companyName: job.company_name,
        companyLogo: job.company_logo,
        description: job.description,
        postedAt: job.posted_at,
        expiresAt: job.expires_at,
        appExpiresAt: job.app_expires_at,
        maxApplies: job.max_applies,
       
        jobLink: job.job_link,
        salaryMin: job.salary_min ?? job.salary_min_usd_cents ?? null,
        salaryMax: job.salary_max ?? job.salary_max_usd_cents ?? null,
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
        vacancies: job.vacancies,
        sections: job.sections || [],
        benefitIds: benefitUuids,
        benefits: benefitNames,
        job_role: job.job_role,
        jobTypeId: job.job_types?.uuid || null,
        jobTypePk: job.job_type_pk,
        workplaceTypeId: job.workplace_types?.uuid || null,
        workplaceTypePk: job.workplace_type_pk,
        locationIds: locUuids,
        locationPks: job.location_pks || [],
        skillIds: skillUuids,
        skills: skillNames,
        requiredSkills: skillNames,
        locations: locNames,
        skillPks: job.skill_pks || [],
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
        type: job.job_types?.name || 'N/A',
        workplaceType: job.workplace_types?.name || 'N/A',
        location: locNames.join(', ') || 'N/A',
        experienceLevel: `${job.experience_min} - ${job.experience_max} Years`,
        applicantCount: job.applicant_count || 0,
        selectedApplicantCount: job.selected_count || 0,
        referredApplicantCount: job.referred_count || 0,
        hiredApplicantCount: job.hired_count || 0,
        isApplied: isApplied,
       
        isBoosted: job.plan_type_at_posting === 'boosted' || (job.plan_type_at_posting && job.plan_type_at_posting.endsWith('_boosted')) || false,
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
            job_types!job_type_pk(uuid, name),
            workplace_types!workplace_type_pk(uuid, name),
            company_sizes!company_size_id(uuid, name),
            currencies!currency_id(id, code, symbol, name)
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
            .select('id, recruiter_pk')
            .eq(isNumericId ? 'id' : 'uuid', id)
            .single();
        if (jobError || !job) throw new Error('Job not found');

        // Resolve recruiter/employee for company info
        let user: any = null;
        if (job.recruiter_pk) {
            const { data: r } = await supabaseAdmin.from('recruiters').select('*').eq('id', job.recruiter_pk).maybeSingle();
            user = r;
        }

        // Block job edits when recruiter subscription is expired
        if (job.recruiter_pk && user) {
            const subInfo = getSubscriptionInfo(user);
            if (subInfo.isExpired) {
                return NextResponse.json(expiredResponse(), { status: 403 });
            }
        }

        // Self-Healing Profile Check for the Edit API
        if (!user) {
            console.log(`[API_JOB_ID_PUT] Owner profile missing from DB. Searching Auth...`);
            const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers();
            
            // Try to find the user by their BigInt ID (stored in recruiter_pk/employee_pk) or potentially their UUID
            const authUser = authUsers.find((u: any) => u.id === job.user_pk);
            
            if (authUser) {
                const userType = authUser.user_metadata?.role ||  'recruiter';
                const tableName = 'recruiters';
                
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

        const jobTypePk = await safeResolveMetadata('job_types', body.jobTypeId);
        const workplaceTypePk = await safeResolveMetadata('workplace_types', body.workplaceTypeId);
        
        const companySizeToResolve = body.companySizeId || (user?.company_size_id);
        const companySizePk = await safeResolveMetadata('company_sizes', companySizeToResolve);

        const locationPks = await safeResolveMetadata('locations', body.locationIds);
        const skillPks = await safeResolveMetadata('skills', body.skillIds);
        const benefitPks = await safeResolveMetadata('benefits', body.benefitIds);

        let currencyPk = await safeResolveMetadata('currencies', body.currencyId || body.currency_id);
        if (!currencyPk && (body.salaryCurrency || body.salary_currency)) {
            const codeToFind = String(body.salaryCurrency || body.salary_currency).toUpperCase();
            const { data: curr } = await supabaseAdmin.from('currencies').select('id').eq('code', codeToFind).maybeSingle();
            if (curr) currencyPk = curr.id;
        }

        const dataToUpdate: any = {
            title: body.title,
            job_id: body.jobId || null,
            description: body.description,
            company_name: body.companyName || user?.company_name || null,
            company_logo: body.companyLogo || user?.company_logo || null,
            job_type_pk: jobTypePk,
            workplace_type_pk: workplaceTypePk,
            salary_min_usd_cents: body.salaryMin ?? body.salary_min ?? null,
            salary_max_usd_cents: body.salaryMax ?? body.salary_max ?? null,
            currency_id: currencyPk || undefined,
            visa_sponsorship: body.visaSponsorship !== undefined ? !!body.visaSponsorship : (body.visa_sponsorship !== undefined ? !!body.visa_sponsorship : undefined),
            job_role: body.job_role || body.role || body.title,
            experience_min: typeof body.minExperience === 'number' ? body.minExperience : 0,
            experience_max: typeof body.maxExperience === 'number' ? body.maxExperience : 0,
            vacancies: body.vacancies || 1,
            sections: body.sections || [],
            status: body.status || 'active',
            company_size_id: companySizePk,
            company_linkedin_url: body.companyLinkedinUrl || user?.company_linkedin_url || null,
            company_overview: body.companyOverview || user?.company_overview || null,
            company_website: body.companyWebsite || user?.company_website || null,
            address: body.address || user?.company_address || null,
            updated_at: new Date().toISOString()
        };

        // Remove undefined fields
        Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

        let { data: updatedJob, error } = await supabaseAdmin
            .from('jobs')
            .update(dataToUpdate)
            .eq(isNumericId ? 'id' : 'uuid', id)
            .select()
            .single();

        if (error && (error.code === '42703' || error.code === 'PGRST204')) {
            console.warn('[API_JOB_ID_PUT] Column missing on update. Retrying update without optional columns...', error.message);
            delete dataToUpdate.location_pks;
            delete dataToUpdate.skill_pks;
            delete dataToUpdate.benefit_ids;
            delete dataToUpdate.is_referral;
            delete dataToUpdate.employee_pk;
            delete dataToUpdate.admin_pk;
            const retryRes = await supabaseAdmin
                .from('jobs')
                .update(dataToUpdate)
                .eq(isNumericId ? 'id' : 'uuid', id)
                .select()
                .single();
            updatedJob = retryRes.data;
            error = retryRes.error;
        }

        if (error) throw error;

        // Update relational join tables: job_skills, job_benefits, job_locations
        if (updatedJob?.id) {
            const numericJobId = updatedJob.id;
            const sPks = Array.isArray(skillPks) ? skillPks : (skillPks ? [skillPks] : []);
            const bPks = Array.isArray(benefitPks) ? benefitPks : (benefitPks ? [benefitPks] : []);
            const lPks = Array.isArray(locationPks) ? locationPks : (locationPks ? [locationPks] : []);

            if (sPks.length > 0) {
                try {
                    await supabaseAdmin.from('job_skills').delete().eq('job_pk', numericJobId);
                    const skillInserts = sPks.map((spk: number) => ({ job_pk: numericJobId, skill_pk: spk }));
                    await supabaseAdmin.from('job_skills').insert(skillInserts);
                } catch (e) {}
            }
            if (bPks.length > 0) {
                try {
                    await supabaseAdmin.from('job_benefits').delete().eq('job_pk', numericJobId);
                    const benefitInserts = bPks.map((bpk: number) => ({ job_pk: numericJobId, benefit_pk: bpk }));
                    await supabaseAdmin.from('job_benefits').insert(benefitInserts);
                } catch (e) {}
            }
            if (lPks.length > 0) {
                try {
                    await supabaseAdmin.from('job_locations').delete().eq('job_id', numericJobId);
                    const locInserts = lPks.map((lpk: number, idx: number) => ({
                        job_id: numericJobId,
                        country_id: 1,
                        city_id: lpk,
                        is_primary: idx === 0
                    }));
                    await supabaseAdmin.from('job_locations').insert(locInserts);
                } catch (e) {}
            }
        }
        
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
            
            // 2. Manually delete relational junction table rows
            await supabaseAdmin.from('job_skills').delete().eq('job_pk', jobPk);
            await supabaseAdmin.from('job_benefits').delete().eq('job_pk', jobPk);
            await supabaseAdmin.from('job_locations').delete().or(`job_id.eq.${jobPk}`);

            // 3. Manually delete notifications linked to this job
            // This prevents: "violates foreign key constraint notifications_job_pk_fkey"
            const { error: notifError } = await supabaseAdmin
                .from('notifications')
                .delete()
                .eq('job_pk', jobPk);
            
            if (notifError) console.warn('[API_JOB_ID_DELETE] Non-fatal notification cleanup error:', notifError);

            // 4. Manually delete applications (Safety step)
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
