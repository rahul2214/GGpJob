import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Job } from '@/lib/types';
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
        minExperience: job.experience_min,
        maxExperience: job.experience_max,
        recruiterId: job.recruiter_pk || job.recruiter_id,
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
        requiredSkills: (job.skill_names && job.skill_names.length > 0)
            ? job.skill_names
            : (job.required_skills && job.required_skills.length > 0 ? job.required_skills : (job.requiredSkills || [])),
        isBoosted: job.plan_type_at_posting === 'boosted' || (job.plan_type_at_posting && job.plan_type_at_posting.endsWith('_boosted')) || false,
    };
}

// Helper to resolve location and benefit names for a list of jobs
async function resolveJobNames(jobs: any[]): Promise<any[]> {
    if (!jobs || jobs.length === 0) return [];

    const seenPks = new Set<string>();
    const uniqueInputJobs = jobs.filter((j: any) => {
        const k = String(j.uuid || j.id);
        if (seenPks.has(k)) return false;
        seenPks.add(k);
        return true;
    });

    const jobPks = uniqueInputJobs.map(j => j.id).filter(Boolean);
    const allLocationPks = Array.from(new Set(uniqueInputJobs.flatMap(j => j.location_pks || [])));
    const allBenefitPks = Array.from(new Set(uniqueInputJobs.flatMap(j => j.benefit_ids || [])));
    const allSkillPks = Array.from(new Set(uniqueInputJobs.flatMap(j => j.skill_pks || [])));

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

    const resolved = uniqueInputJobs.map(job => {
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
        let user: any = null;

        if (userId) {
            const isUuid = userId.includes('-');
            const { data: jobseeker } = await supabaseAdmin.from('jobseekers').select('id').eq(isUuid ? 'uuid' : 'id', userId).maybeSingle();
            user = jobseeker as any;

            if (user) {
                const { data: apps } = await supabaseAdmin.from('applications').select('job_pk').eq('user_pk', user.id);
                if (apps && apps.length > 0) {
                    appliedJobPks = apps.map((ap: any) => ap.job_pk).filter(Boolean);
                }
            }
        }

        // Fetch Jobseeker skills for recommendation matching
        let userSkillPks: number[] = [];
        if (user && user.id) {
            const { data: jsSkills } = await supabaseAdmin
                .from('jobseeker_skills')
                .select('skill_pk')
                .eq('user_pk', user.id);
            if (jsSkills && jsSkills.length > 0) {
                userSkillPks = jsSkills.map((s: any) => s.skill_pk).filter(Boolean);
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
            company_sizes!company_size_id(name),
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

            let recQuery = supabaseAdmin.from('jobs').select('*, job_types!job_type_pk(uuid, name), workplace_types!workplace_type_pk(uuid, name), company_sizes!company_size_id(name)').eq('status', 'active').gt('expires_at', nowIso).order('posted_at', { ascending: false });
            let refQuery = supabaseAdmin.from('jobs').select('*, job_types!job_type_pk(uuid, name), workplace_types!workplace_type_pk(uuid, name), company_sizes!company_size_id(name)').eq('status', 'active').gt('expires_at', nowIso).limit(10).order('posted_at', { ascending: false });

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

            // Skill-based job recommendation matching
            let recommendedJobsRaw: any[] = [];
            let jobSkillMatchCounts: Record<number, number> = {};

            if (userSkillPks.length > 0) {
                const { data: matchingJobSkills } = await supabaseAdmin
                    .from('job_skills')
                    .select('job_pk, skill_pk')
                    .in('skill_pk', userSkillPks);

                if (matchingJobSkills && matchingJobSkills.length > 0) {
                    matchingJobSkills.forEach((ms: any) => {
                        if (ms.job_pk) {
                            jobSkillMatchCounts[ms.job_pk] = (jobSkillMatchCounts[ms.job_pk] || 0) + 1;
                        }
                    });
                    const matchedJobPks = Object.keys(jobSkillMatchCounts)
                        .map(Number)
                        .sort((a, b) => jobSkillMatchCounts[b] - jobSkillMatchCounts[a]);

                    let recSkillQuery = supabaseAdmin
                        .from('jobs')
                        .select('*, job_types!job_type_pk(uuid, name), workplace_types!workplace_type_pk(uuid, name), company_sizes!company_size_id(name)')
                        .eq('status', 'active')
                        .gt('expires_at', nowIso)
                        .in('id', matchedJobPks);

                    if (appliedJobPks.length > 0) {
                        recSkillQuery = recSkillQuery.not('id', 'in', `(${appliedJobPks.join(',')})`);
                    }
                    if (postedDays && postedDays !== 'all') {
                        const cutoff = new Date();
                        cutoff.setDate(cutoff.getDate() - parseInt(postedDays));
                        recSkillQuery = recSkillQuery.gte('posted_at', cutoff.toISOString());
                    }

                    const recSkillSnap = await recSkillQuery;
                    if (recSkillSnap.data && recSkillSnap.data.length > 0) {
                        recommendedJobsRaw = recSkillSnap.data;
                        recommendedJobsRaw.sort((a: any, b: any) => (jobSkillMatchCounts[b.id] || 0) - (jobSkillMatchCounts[a.id] || 0));
                    }
                }
            }

            // Fill remaining slots up to 10 with recent active jobs if needed
            if (recommendedJobsRaw.length < 10) {
                const existingIds = recommendedJobsRaw.map((j: any) => j.id);
                let fillQuery = recQuery;
                if (existingIds.length > 0) {
                    fillQuery = fillQuery.not('id', 'in', `(${existingIds.join(',')})`);
                }
                const fillSnap = await fillQuery.limit(10 - recommendedJobsRaw.length);
                if (fillSnap.data && fillSnap.data.length > 0) {
                    recommendedJobsRaw = [...recommendedJobsRaw, ...fillSnap.data];
                }
            }

            let [recSnap, refSnap] = await Promise.all([
                Promise.resolve({ data: recommendedJobsRaw, error: null }),
                refQuery
            ]);

            if ((recSnap as any).error && (recSnap as any).error.code === '42703') {
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

        if (isRecommended && userSkillPks.length > 0) {
            const { data: matchingJobSkills } = await supabaseAdmin
                .from('job_skills')
                .select('job_pk')
                .in('skill_pk', userSkillPks);

            if (matchingJobSkills && matchingJobSkills.length > 0) {
                const mPks = Array.from(new Set(matchingJobSkills.map((m: any) => m.job_pk).filter(Boolean)));
                if (mPks.length > 0) {
                    query = query.in('id', mPks);
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

        // Date Posted filter
        const postedParam = searchParams.get('posted');
        if (postedParam && postedParam !== 'all') {
            const days = parseInt(postedParam, 10);
            if (!isNaN(days) && days > 0) {
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - days);
                query = query.gte('posted_at', cutoff.toISOString());
            }
        }

        // Experience filter
        const minExpParam = searchParams.get('minExp');
        const maxExpParam = searchParams.get('maxExp');
        if (minExpParam) {
            const minE = parseInt(minExpParam, 10);
            if (!isNaN(minE) && minE > 0) {
                query = query.gte('experience_max', minE);
            }
        }
        if (maxExpParam) {
            const maxE = parseInt(maxExpParam, 10);
            if (!isNaN(maxE) && maxE < 30) {
                query = query.lte('experience_min', maxE);
            }
        }

        const locationsParams = searchParams.getAll('location').flatMap(l => l.split(',')).filter(l => l && l !== 'all');
        if (locationsParams.length > 0) {
            const lpks = await resolveToPks('locations', locationsParams);
            if (lpks.length > 0) query = query.overlaps('location_pks', lpks);
        }

        // Industry / Job Type filter
        const industryParams = searchParams.getAll('industry').flatMap(i => i.split(',')).filter(i => i && i !== 'all');
        if (industryParams.length > 0) {
            const jtPks = await resolveToPks('job_types', industryParams);
            if (jtPks.length > 0) {
                query = query.in('job_type_pk', jtPks);
            }
        }

        // Country filter
        const countryParams = searchParams.getAll('country').flatMap(c => c.split(',')).filter(c => c && c !== 'all');
        if (countryParams.length > 0) {
            const countryPks = await resolveToPks('countries', countryParams);
            if (countryPks.length > 0) {
                const { data: matchedJobLocations } = await supabaseAdmin
                    .from('job_locations')
                    .select('job_id')
                    .in('country_id', countryPks);
                const jobIds = (matchedJobLocations || []).map((jl: any) => jl.job_id);
                if (jobIds.length > 0) {
                    query = query.in('id', jobIds);
                }
            }
        }

        // Workplace / Remote type filter
        const workplaceTypeParams = (searchParams.getAll('workplaceType') || []).concat(searchParams.getAll('remoteType') || []).flatMap(wt => wt.split(',')).filter(wt => wt && wt !== 'all');
        if (workplaceTypeParams.length > 0) {
            const wtpks = await resolveToPks('workplace_types', workplaceTypeParams);
            const remoteAliases = workplaceTypeParams.flatMap((n: string) => {
                const low = n.toLowerCase();
                if (low.includes('on-site') || low.includes('onsite')) return ['onsite', 'On-site', 'on-site', 'Onsite'];
                if (low.includes('remote')) return ['remote', 'Remote'];
                if (low.includes('hybrid')) return ['hybrid', 'Hybrid'];
                return [n];
            });

            if (wtpks.length > 0) {
                query = query.or(`workplace_type_pk.in.(${wtpks.join(',')}),remote_type.in.(${remoteAliases.map((n: string) => `"${n}"`).join(',')})`);
            } else if (remoteAliases.length > 0) {
                query = query.in('remote_type', remoteAliases);
            }
        }

        // Visa sponsorship filter (supports both ?visaSponsorship=true and ?visa=true)
        const visaSponsorshipParam = searchParams.get('visaSponsorship') || searchParams.get('visa');
        if (visaSponsorshipParam === 'true') {
            query = query.eq('visa_sponsorship', true);
        }

        const jobTypesParams = searchParams.getAll('jobType').flatMap(jt => jt.split(',')).filter(jt => jt && jt !== 'all');
        if (jobTypesParams.length > 0) {
            const jtpks = await resolveToPks('job_types', jobTypesParams);
            const { data: jtNamesData } = await supabaseAdmin.from('job_types').select('id, name').in('id', jtpks);
            const names = (jtNamesData || []).map((jt: any) => jt.name);

            if (jtpks.length > 0 && names.length > 0) {
                query = query.or(`job_type_pk.in.(${jtpks.join(',')}),employment_type.in.(${names.map((n: string) => `"${n}"`).join(',')})`);
            } else if (jtpks.length > 0) {
                query = query.in('job_type_pk', jtpks);
            }
        }

        const pageParam = searchParams.get('page');
        const pageNum = pageParam ? parseInt(pageParam, 10) : 1;
        const validPage = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;

        const limitParam = searchParams.get('limit');
        const limitNum = limitParam ? parseInt(limitParam, 10) : null;
        const isValidLimit = limitNum !== null && !isNaN(limitNum) && limitNum > 0;

        query = query.order('posted_at', { ascending: false });
        if (isValidLimit) {
            const fromOffset = (validPage - 1) * limitNum;
            const toOffset = fromOffset + limitNum - 1;
            query = query.range(fromOffset, toOffset);
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

            if (postedParam && postedParam !== 'all') {
                const days = parseInt(postedParam, 10);
                if (!isNaN(days) && days > 0) {
                    const cutoff = new Date();
                    cutoff.setDate(cutoff.getDate() - days);
                    fallbackQuery = fallbackQuery.gte('posted_at', cutoff.toISOString());
                }
            }

            if (minExpParam) {
                const minE = parseInt(minExpParam, 10);
                if (!isNaN(minE) && minE > 0) {
                    fallbackQuery = fallbackQuery.gte('experience_max', minE);
                }
            }
            if (maxExpParam) {
                const maxE = parseInt(maxExpParam, 10);
                if (!isNaN(maxE) && maxE < 30) {
                    fallbackQuery = fallbackQuery.lte('experience_min', maxE);
                }
            }

            if (locationsParams.length > 0) {
                const lpks = await resolveToPks('locations', locationsParams);
                if (lpks.length > 0) fallbackQuery = fallbackQuery.overlaps('location_pks', lpks);
            }

            if (industryParams.length > 0) {
                const jtPks = await resolveToPks('job_types', industryParams);
                if (jtPks.length > 0) fallbackQuery = fallbackQuery.in('job_type_pk', jtPks);
            }

            if (countryParams.length > 0) {
                const countryPks = await resolveToPks('countries', countryParams);
                if (countryPks.length > 0) {
                    const { data: matchedJobLocations } = await supabaseAdmin
                        .from('job_locations')
                        .select('job_id')
                        .in('country_id', countryPks);
                    const jobIds = (matchedJobLocations || []).map((jl: any) => jl.job_id);
                    if (jobIds.length > 0) {
                        fallbackQuery = fallbackQuery.in('id', jobIds);
                    }
                }
            }

            if (workplaceTypeParams.length > 0) {
                const wtpks = await resolveToPks('workplace_types', workplaceTypeParams);
                if (wtpks.length > 0) fallbackQuery = fallbackQuery.in('workplace_type_pk', wtpks);
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
                const fromOffset = (validPage - 1) * limitNum;
                const toOffset = fromOffset + limitNum - 1;
                fallbackQuery = fallbackQuery.range(fromOffset, toOffset);
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
        if (!recruiterId) {
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
        const { recruiterId, adminId } = data;
        const userId = recruiterId || adminId;

        if (!userId) {
            return NextResponse.json({ error: 'Recruiter ID is required' }, { status: 400 });
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
        let userTable: 'recruiters' | 'jobseekers' | 'admins' | null = null;
        const isNumericUserId = /^\d+$/.test(userId);
        const lookupId = isNumericUserId ? parseInt(userId) : userId;

        // Ordered search: Recruiters -> Employees -> Jobseekers
        const profileTables = [
            { name: 'recruiters', roleLabel: 'Recruiter' },
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

                if (targetTable === 'recruiters') {
                    profileToCreate.company_name = meta.companyName || null;
                    profileToCreate.role_id = 2;
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
                error: 'Recruiter profile not found',
                details: `Search failed for ID: ${userId} across tables: recruiters, jobseekers, admins and Auth.`,
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
        }
        let jobsPostedThisMonth = user.jobs_posted_this_month ?? 0;
        let nextJobsResetAt = user.next_jobs_reset_at ?? null;
        const nextResetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));

        if (!nextJobsResetAt || now.getTime() >= new Date(nextJobsResetAt).getTime()) {
            jobsPostedThisMonth = 0;
            nextJobsResetAt = nextResetDate.toISOString();
        }


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

        const isReferral = !!data.isReferral;
        const jobExpiry = new Date();
        const jobValidityDays = isReferral ? 14 : (planType === 'pro' ? 90 : 30);
        jobExpiry.setDate(now.getDate() + jobValidityDays);

        const appExpiry = new Date();
        const appAccessDays = isReferral ? 14 : (planType === 'pro' ? 180 : (planType === 'premium' ? 90 : 30));
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
            salary_min_usd_cents: typeof data.salaryMin === 'number' ? data.salaryMin : (data.salary_min ?? null),
            salary_max_usd_cents: typeof data.salaryMax === 'number' ? data.salaryMax : (data.salary_max ?? null),
            currency_id: currencyPk || null,
            visa_sponsorship: !!(data.visaSponsorship ?? data.visa_sponsorship),
            experience_min: typeof data.minExperience === 'number' ? data.minExperience : 0,
            experience_max: typeof data.maxExperience === 'number' ? data.maxExperience : 0,

            recruiter_pk: userTable === 'recruiters' ? userNumericPk : null,
            admin_pk: userTable === 'admins' ? userNumericPk : null,
            posted_at: now.toISOString(),
            expires_at: jobExpiry.toISOString(),
            app_expires_at: appExpiry.toISOString(),
            max_applies: isReferral ? 100 : ((user.max_applies_limit && user.max_applies_limit > 0) ? user.max_applies_limit : 999999),
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
                try { await supabaseAdmin.from('job_skills').insert(skillInserts); } catch (e) { }
            }
            if (bPks.length > 0) {
                const benefitInserts = bPks.map((bpk: number) => ({ job_pk: newJob.id, benefit_pk: bpk }));
                try { await supabaseAdmin.from('job_benefits').insert(benefitInserts); } catch (e) { }
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
                try { await supabaseAdmin.from('job_locations').insert(locInserts); } catch (e) { }
            }
        }

        const createdJob = mapJobToFrontend(newJob);

        return NextResponse.json(createdJob, { status: 201 });
    } catch (e: any) {
        console.error('[API_JOBS_POST] Unexpected Error:', e);
        return NextResponse.json({ error: 'Failed to create job', details: e.message }, { status: 500 });
    }
}
