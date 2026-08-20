import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { User } from '@/lib/types';
import { resolveResumeUrl } from '@/lib/resolve-resume';

// Helper to normalize YYYY-MM to YYYY-MM-DD for PostgreSQL DATE type
function normalizeDate(dateStr: string | null | undefined): string | null | undefined {
    if (!dateStr || (typeof dateStr === 'string' && dateStr.trim() === '')) {
        return null;
    }
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}$/.test(dateStr)) {
        return `${dateStr}-01`;
    }
    return dateStr;
}

// Helper to ensure jobseekers metadata ONLY stores UI state flags (hasSeenReferralPrompt, referralStepDismissed, etc.)
function cleanJobseekerMetadata(rawMetadata: any): Record<string, any> {
    if (!rawMetadata || typeof rawMetadata !== 'object') return {};
    const clean = { ...rawMetadata };
    
    const keysToRemove = [
        'country', 'state', 'currentCity', 'current_city', 'countryId', 'stateId', 'cityId',
        'achievements', 'certifications', 'openToRelocate', 'openToRelocation', 'openWorldwide',
        'visaRequirement', 'visaRequirementId', 'preferredJobTitles', 'preferred_job_titles',
        'preferredSalaryMin', 'preferred_salary_min', 'preferredSalaryMax', 'preferred_salary_max',
        'preferredCurrency', 'preferred_currency', 'remotePreference', 'remote_preference',
        'employmentTypes', 'employment_types', 'preferredIndustries', 'preferred_industries',
        'workAuthorization', 'work_authorization', 'preferredLanguages', 'preferred_languages',
        'preferredLocations', 'preferred_locations', 'gender', 'maritalStatus', 'dateOfBirth',
        'category', 'disabilityStatus', 'militaryExperience', 'careerBreak', 'headline', 'summary',
        'name', 'email', 'phone', 'skills', 'experience', 'education', 'projects', 'languages'
    ];

    for (const key of keysToRemove) {
        delete clean[key];
    }

    return clean;
}

// Helper to map Supabase snake_case profile to camelCase User type
function calculateProfileStats(profile: any, resolvedSkills?: any[]) {
    return {
        hasEducation: Array.isArray(profile.education) && profile.education.length > 0,
        hasEmployment: Array.isArray(profile.experience) && profile.experience.length > 0,
        hasSkills: (Array.isArray(profile.skill_ids) && profile.skill_ids.length > 0) || 
                   (Array.isArray(profile.jobseeker_skills) && profile.jobseeker_skills.length > 0) ||
                   (Array.isArray(resolvedSkills) && resolvedSkills.length > 0) ||
                   (Array.isArray(profile.skills) && profile.skills.length > 0),
        hasProjects: Array.isArray(profile.projects) && profile.projects.length > 0,
        hasLanguages: Array.isArray(profile.languages) && profile.languages.length > 0,
        hasSummary: !!profile.summary || !!profile.headline,
        hasLocationHierarchy: Boolean(profile.current_country_id || profile.countries?.name || profile.country) &&
                              Boolean(profile.current_state_province_id || profile.states_provinces?.name || profile.state) &&
                              Boolean(profile.current_city_id || profile.cities?.name || profile.current_city),
        hasAchievements: (Array.isArray(profile.jobseeker_achievements) && profile.jobseeker_achievements.length > 0) ||
                         (Array.isArray(profile.achievements) && profile.achievements.length > 0),
        hasCertifications: (Array.isArray(profile.jobseeker_certifications) && profile.jobseeker_certifications.length > 0) ||
                           (Array.isArray(profile.certifications) && profile.certifications.length > 0),
        hasPreferredLocations: (Array.isArray(profile.jobseeker_preferred_locations) && profile.jobseeker_preferred_locations.length > 0) ||
                               (Array.isArray(profile.preferred_locations) && profile.preferred_locations.length > 0) ||
                               (Array.isArray(profile.preferredLocations) && profile.preferredLocations.length > 0)
    };
}

// Helper to map Supabase snake_case profile to camelCase User type
async function mapProfileToUser(profile: any): Promise<User> {
    const resolvedResume = profile.resume_url ? await resolveResumeUrl(profile.resume_url) : undefined;
    const resolvedPhoto = profile.profile_photo_url ? await resolveResumeUrl(profile.profile_photo_url) : undefined;
    
    // Determine role and counts based on table/data present
    const role = profile.roles?.name || profile.role || 'Job Seeker';
    
    // Robustly resolve skills if jobseeker_skills is joined
    let resolvedSkills = profile.skills || [];
    if (profile.jobseeker_skills && Array.isArray(profile.jobseeker_skills) && profile.jobseeker_skills.length > 0) {
        resolvedSkills = profile.jobseeker_skills.map((jsk: any) => ({
            id: jsk.skills?.uuid || jsk.skills?.id,
            uuid: jsk.skills?.uuid,
            name: jsk.skills?.name || '',
            proficiencyLevel: jsk.proficiency_level,
            yearsExperience: jsk.years_experience
        })).filter((s: any) => s.id);
    }

    let profileStats: any = undefined;
    if (role === 'Job Seeker' || role === 'jobseeker') {
        profileStats = calculateProfileStats(profile, resolvedSkills);
    }
    
    let totalRewards = 0;
    let pendingRewards = 0;
    
    if (role === 'Employee') {
        // Fetch payout aggregates
        const { data: payouts } = await supabaseAdmin
            .from('payouts')
            .select('amount, status, method')
            .eq('employee_id', profile.id);
            
        if (payouts) {
            // Lifetime rewards: sum of all earnings that are not blocked or rejected
            totalRewards = payouts
                .filter((p: any) => p.method === 'system' && p.status !== 'blocked' && p.status !== 'rejected')
                .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
                
            // Pending rewards: earnings currently held for review
            pendingRewards = payouts
                .filter((p: any) => p.method === 'system' && (p.status === 'held' || p.status === 'delayed' || p.status === 'pending'))
        }
    }

    const cleanMetadata = { ...(profile.metadata || {}) };
    delete cleanMetadata.country;
    delete cleanMetadata.state;
    delete cleanMetadata.currentCity;
    delete cleanMetadata.achievements;
    delete cleanMetadata.certifications;
    delete cleanMetadata.openToRelocate;
    delete cleanMetadata.openToRelocation;
    delete cleanMetadata.openWorldwide;
    delete cleanMetadata.visaRequirement;

    const baseObj = {
        id: profile.id,       // BIGINT primary key
        uuid: profile.uuid,   // Public UUID
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        role: role as any,
        roleId: profile.role_id,
        headline: profile.headline,
        summary: profile.summary,
        resumeUrl: resolvedResume,
        profilePhotoUrl: resolvedPhoto,
        linkedinUrl: profile.linkedin_url,
        githubUrl: profile.github_url,
        portfolioUrl: profile.portfolio_url,
        notificationLastViewedAt: profile.notification_last_viewed_at,
        gender: profile.jobseeker_personal_details?.gender || (profile.jobseeker_personal_details?.[0]?.gender) || profile.gender,
        maritalStatus: profile.jobseeker_personal_details?.marital_status || (profile.jobseeker_personal_details?.[0]?.marital_status) || profile.marital_status,
        dateOfBirth: profile.jobseeker_personal_details?.date_of_birth || (profile.jobseeker_personal_details?.[0]?.date_of_birth) || profile.date_of_birth,
        category: profile.jobseeker_personal_details?.category || (profile.jobseeker_personal_details?.[0]?.category) || profile.category,
        disabilityStatus: profile.jobseeker_personal_details?.disability_status || (profile.jobseeker_personal_details?.[0]?.disability_status) || profile.disability_status,
        militaryExperience: profile.jobseeker_personal_details?.military_experience || (profile.jobseeker_personal_details?.[0]?.military_experience) || profile.military_experience,
        careerBreak: profile.jobseeker_personal_details?.career_break || (profile.jobseeker_personal_details?.[0]?.career_break) || profile.career_break,
        workStatus: profile.work_status,
        experienceYears: profile.experience_years,
        experienceMonths: profile.experience_months,
        currentArea: profile.current_area,
        annualSalary: profile.annual_salary,
        expectedSalary: profile.expected_salary,
        salaryBreakdown: profile.salary_breakdown,
        preferredLocations: (profile.jobseeker_preferred_locations && profile.jobseeker_preferred_locations.length > 0)
            ? profile.jobseeker_preferred_locations.map((pl: any) => {
                const parts = [
                    pl.cities?.name,
                    pl.states_provinces?.name,
                    pl.countries?.name
                ].filter(Boolean);
                return parts.join(', ');
              })
            : (profile.preferred_locations || profile.metadata?.preferredLocations || []),
        jobseekerPreferredLocations: (profile.jobseeker_preferred_locations || []).map((pl: any) => ({
            id: pl.id,
            countryId: pl.country_id,
            stateProvinceId: pl.state_province_id,
            cityId: pl.city_id,
            countryName: pl.countries?.name,
            stateName: pl.states_provinces?.name,
            cityName: pl.cities?.name,
            formattedLocation: [pl.cities?.name, pl.states_provinces?.name, pl.countries?.name].filter(Boolean).join(', ')
        })),
        country: profile.countries?.name || profile.country || null,
        state: profile.states_provinces?.name || profile.state || null,
        currentCity: profile.cities?.name || profile.current_city || null,
        countryId: profile.current_country_id || null,
        stateId: profile.current_state_province_id || null,
        cityId: profile.current_city_id || null,
        preferredJobTitles: profile.preferred_job_titles || profile.metadata?.preferredJobTitles || [],
        preferredSalaryMin: profile.preferred_salary_min ?? profile.metadata?.preferredSalaryMin,
        preferredSalaryMax: profile.preferred_salary_max ?? profile.metadata?.preferredSalaryMax,
        preferredCurrency: profile.preferred_currency || profile.metadata?.preferredCurrency || 'INR',
        remotePreference: profile.remote_preference || profile.metadata?.remotePreference || 'any',
        employmentTypes: profile.employment_types || profile.metadata?.employmentTypes || [],
        preferredIndustries: profile.preferred_industries || profile.metadata?.preferredIndustries || [],
        openToRelocate: profile.open_to_relocate ?? false,
        openToRelocation: profile.open_to_relocate ?? false,
        openWorldwide: profile.open_worldwide ?? false,
        workAuthorization: profile.work_authorization || profile.metadata?.workAuthorization || [],
        visaRequirementId: profile.visa_requirement_id || profile.visa_requirements?.id || undefined,
        visaRequirement: profile.visa_requirements?.name || profile.visa_requirement || profile.metadata?.visaRequirement || '',
        preferredLanguages: profile.preferred_languages || profile.metadata?.preferredLanguages || [],
        planExpiresAt: profile.plan_expires_at,
        location: profile.location_id || undefined,
        metadata: cleanMetadata,
        referralCode: profile.referral_code,
        referredBy: profile.referred_by ? Number(profile.referred_by) : undefined,
        referralCount: profile.referral_count || 0,
        companyName: profile.company_name,
        companyLogo: profile.company_logo,
        companyWebsite: profile.company_website,
        companySizeId: profile.company_sizes?.uuid || profile.company_size_id,
        companySize: profile.company_sizes?.name || profile.company_size,
        companyOverview: profile.company_overview,
        companyAddress: profile.company_address,
        companyLinkedinUrl: profile.company_linkedin_url,
        education: (profile.education || []).map((e: any) => ({
            ...e,
            startDate: e.start_date,
            endDate: e.end_date,
            fieldOfStudy: e.field_of_study,
            isCurrent: e.is_current
        })),
        experience: (profile.experience || []).map((e: any) => ({
            ...e,
            startDate: e.start_date,
            endDate: e.end_date,
            employmentType: e.employment_type,
            isCurrent: e.is_current
        })),
        projects: (profile.projects || []).map((p: any) => ({
            ...p,
            startDate: p.start_date,
            endDate: p.end_date
        })),
        languages: profile.languages || [],
        achievements: (profile.jobseeker_achievements && profile.jobseeker_achievements.length > 0)
            ? profile.jobseeker_achievements.map((a: any) => ({
                id: a.id,
                title: a.title,
                description: a.description,
                issuer: a.issuer,
                dateAchieved: a.date_achieved
              }))
            : profile.metadata?.achievements || [],
        certifications: (profile.jobseeker_certifications && profile.jobseeker_certifications.length > 0)
            ? profile.jobseeker_certifications.map((c: any) => ({
                id: c.id,
                name: c.name,
                issuingOrganization: c.issuing_organization,
                issueDate: c.issue_date,
                expirationDate: c.expiration_date,
                credentialId: c.credential_id,
                credentialUrl: c.credential_url
              }))
            : profile.metadata?.certifications || [],
        skills: resolvedSkills,
        skillIds: profile.skill_ids || [],
        profileStats,
        
        // Credits (Job Seekers & Employees)
        credits: role === 'Employee' ? (profile.credits ?? 0) : ((profile.subscription_credits || 0) + (profile.purchased_credits || 0)),
        subscriptionCredits: profile.subscription_credits || 0,
        purchasedCredits: profile.purchased_credits || 0,
        subscriptionAllowance: profile.subscription_allowance || 0,
        nextCreditResetAt: profile.next_credit_reset_at,

        // Employee & Gamification
        rewards: profile.rewards ?? 0,
        trustScore: profile.trust_score ?? 100,
        xp: profile.xp ?? 0,
        level: profile.level ?? 1,
        rewardsBalance: profile.credits ?? 0,
        totalRewards: totalRewards,
        pendingRewards: pendingRewards,
        verifiedReferralsCount: profile.verified_referrals_count ?? 0,
        interviewsCount: profile.interviews_count ?? 0,
        offersCount: profile.offers_count ?? 0,
        hiresCount: profile.hires_count ?? 0,
        jobPostLimit: profile.job_post_limit ?? (role === 'Employee' ? 5 : undefined),
    };

    let jobsPostedThisMonth = profile.jobs_posted_this_month ?? 0;
    let nextJobsResetAt = profile.next_jobs_reset_at ?? null;

    if (role === 'Employee' || role === 'employee') {
        const now = new Date();
        const nextResetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));

        if (!nextJobsResetAt || now.getTime() >= new Date(nextJobsResetAt).getTime()) {
            jobsPostedThisMonth = 0;
            nextJobsResetAt = nextResetDate.toISOString();
            supabaseAdmin.from('employees').update({
                jobs_posted_this_month: 0,
                next_jobs_reset_at: nextJobsResetAt
            }).eq('id', profile.id).then().catch((e: any) => console.error('Auto-reset error:', e));
        }
    }

    return {
        ...baseObj,
        jobsPostedThisMonth,
        nextJobsResetAt,
    } as User;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        const column = isUuid ? 'uuid' : 'id';
        const idValue = isUuid ? id : parseInt(id);

        if (!isUuid && isNaN(idValue as number)) {
            return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
        }
        
        // 1. Check jobseekers
        const { data: jobseeker, error: jobseekerError } = await supabaseAdmin
            .from('jobseekers')
            .select(`
                *, 
                roles(name),
                education(*),
                experience(*),
                projects(*),
                languages(*),
                jobseeker_personal_details(*),
                jobseeker_skills(proficiency_level, years_experience, skills(id, uuid, name)),
                countries:current_country_id(id, name, code),
                states_provinces:current_state_province_id(id, name, code),
                cities:current_city_id(id, name, is_featured),
                jobseeker_achievements:jobseeker_achievements!jobseeker_id(*),
                jobseeker_certifications:jobseeker_certifications!jobseeker_id(*),
                jobseeker_preferred_locations(id, country_id, state_province_id, city_id, countries:country_id(id, name, code), states_provinces:state_province_id(id, name, code), cities:city_id(id, name)),
                visa_requirements:visa_requirement_id(id, name)
            `)
            .eq(column, idValue)
            .maybeSingle();

        if (jobseekerError && jobseekerError.code !== 'PGRST116') {
            console.error(`Error fetching jobseeker ${id}:`, jobseekerError);
        }

        if (jobseeker) {
            const user = await mapProfileToUser(jobseeker);
            return NextResponse.json(user);
        }

        // 2. Check recruiters
        const { data: recruiter } = await supabaseAdmin
            .from('recruiters')
            .select('*, roles(name), company_sizes(uuid, name)')
            .eq(column, idValue)
            .maybeSingle();

        if (recruiter) {
            return NextResponse.json(await mapProfileToUser(recruiter));
        }



        // 4. Check admins
        const { data: admin } = await supabaseAdmin
            .from('admins')
            .select('*, roles(name)')
            .eq(column, idValue)
            .maybeSingle();

        if (admin) {
            return NextResponse.json({
                id: admin.id,
                uuid: admin.uuid,
                name: admin.name,
                email: admin.email,
                role: (admin as any).roles?.name || (admin.is_super_admin ? 'Super Admin' : 'Admin'),
                roleId: admin.role_id,
                expectedSalary: admin.expected_salary,
                isSuperAdmin: admin.is_super_admin,
            });
        }

        return NextResponse.json({ error: 'User not found' }, { status: 404 });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}


export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        const column = isUuid ? 'uuid' : 'id';
        const idValue = isUuid ? id : parseInt(id);

        if (!isUuid && isNaN(idValue as number)) {
            return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
        }
        const body = await request.json();
        const { 
            name, 
            email, 
            phone,
            role, // Important to know which table to update
            ...rest
        } = body;
        
        if (!name || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let table = 'jobseekers';
        if (role === 'Recruiter') table = 'recruiters';
        else if (role === 'Employee') table = 'employees';
        else if (['Admin', 'Super Admin'].includes(role)) table = 'admins';
        
        // This is a simplified update, focusing on core fields.
        // For jobseekers, we update more complex fields.
        const updateData: any = {
            name,
            email,
            phone,
            updated_at: new Date().toISOString()
        };

        if (rest.preferredCurrency !== undefined) {
            updateData.preferred_currency = rest.preferredCurrency;
        }

        if (table === 'recruiters' || table === 'employees') {
            if (rest.country !== undefined) {
                updateData.country = rest.country;
            }
            let numericCompanySizeId = null;
            if (rest.companySizeId) {
                const isUuid = typeof rest.companySizeId === 'string' && rest.companySizeId.includes('-');
                if (isUuid) {
                    const { data: sizeData } = await supabaseAdmin
                        .from('company_sizes')
                        .select('id')
                        .eq('uuid', rest.companySizeId)
                        .single();
                    if (sizeData) numericCompanySizeId = sizeData.id;
                } else if (rest.companySizeId) {
                    numericCompanySizeId = parseInt(rest.companySizeId.toString());
                }
            }

            Object.assign(updateData, {
                company_name: rest.companyName,
                company_website: rest.companyWebsite,
                ...(rest.companySizeId !== undefined && { company_size_id: numericCompanySizeId }),
                company_overview: rest.companyOverview,
                company_address: rest.companyAddress,
                company_linkedin_url: rest.companyLinkedinUrl,
            });
        }

        if (table === 'jobseekers') {
            // Resolve foreign keys for location hierarchy
            let cId = rest.countryId ? Number(rest.countryId) : null;
            let sId = rest.stateId ? Number(rest.stateId) : null;
            let ciId = rest.cityId ? Number(rest.cityId) : null;

            const cleanCountryName = rest.country ? rest.country.split('(')[0].trim() : '';
            const cleanStateName = rest.state ? rest.state.trim() : '';
            const cleanCityName = rest.currentCity ? rest.currentCity.split('★')[0].trim() : '';

            // 1. Resolve Country
            if (cleanCountryName) {
                const { data: cObj } = await supabaseAdmin
                    .from('countries')
                    .select('id')
                    .or(`name.ilike.${cleanCountryName},code.ilike.${cleanCountryName}`)
                    .maybeSingle();
                if (cObj) cId = cObj.id;
            }

            // 2. Resolve State (prefer cleanStateName over stale rest.stateId)
            if (cleanStateName && cId) {
                const { data: sObj } = await supabaseAdmin
                    .from('states_provinces')
                    .select('id')
                    .eq('country_id', cId)
                    .ilike('name', cleanStateName)
                    .maybeSingle();
                if (sObj) sId = sObj.id;
            } else if (!cleanStateName) {
                sId = null;
            }

            // 3. Resolve City (prefer cleanCityName over stale rest.cityId)
            if (cleanCityName && sId) {
                const { data: ciObj } = await supabaseAdmin
                    .from('cities')
                    .select('id')
                    .eq('state_province_id', sId)
                    .ilike('name', cleanCityName)
                    .maybeSingle();
                if (ciObj) ciId = ciObj.id;
            } else if (!cleanCityName) {
                ciId = null;
            }

            // 4. Resolve Visa Requirement ID
            let vReqId = rest.visaRequirementId ? Number(rest.visaRequirementId) : null;
            const cleanVisaName = rest.visaRequirement ? rest.visaRequirement.trim() : '';

            if (!vReqId && cleanVisaName) {
                try {
                    const { data: vObj } = await supabaseAdmin
                        .from('visa_requirements')
                        .select('id, name')
                        .or(`name.ilike.${cleanVisaName},name.ilike.%${cleanVisaName}%`)
                        .maybeSingle();

                    if (vObj) {
                        vReqId = vObj.id;
                    } else {
                        const lower = cleanVisaName.toLowerCase();
                        let fallbackQuery = '';
                        if (lower.includes('no sponsorship') || lower.includes('citizen') || lower.includes('pr')) {
                            fallbackQuery = 'No Visa Sponsorship Required';
                        } else if (lower.includes('h1b')) {
                            fallbackQuery = 'Requires H1B Sponsorship';
                        } else if (lower.includes('green card')) {
                            fallbackQuery = 'Requires Green Card / PR';
                        } else if (lower.includes('student') || lower.includes('opt') || lower.includes('cpt')) {
                            fallbackQuery = 'Student Visa (OPT / CPT)';
                        } else if (lower.includes('permit') || lower.includes('visa sponsorship') || lower.includes('sponsorship')) {
                            fallbackQuery = 'Need Work Permit / Visa Sponsorship';
                        }

                        if (fallbackQuery) {
                            const { data: fbObj } = await supabaseAdmin
                                .from('visa_requirements')
                                .select('id')
                                .eq('name', fallbackQuery)
                                .maybeSingle();
                            if (fbObj) vReqId = fbObj.id;
                        }
                    }
                } catch (e) {
                    // Ignore lookup error if visa_requirements table is pending schema sync
                }
            }

            // Ensure metadata ONLY contains UI state flags (hasSeenReferralPrompt, referralStepDismissed, etc.)
            const mergedMetadata = cleanJobseekerMetadata(rest.metadata || {});

            Object.assign(updateData, {
                headline: rest.headline,
                summary: rest.summary,
                linkedin_url: rest.linkedinUrl,
                github_url: rest.githubUrl,
                portfolio_url: rest.portfolioUrl,
                notification_last_viewed_at: rest.notificationLastViewedAt,
                work_status: rest.workStatus,
                experience_years: rest.experienceYears === '' ? null : rest.experienceYears,
                experience_months: rest.experienceMonths === '' ? null : rest.experienceMonths,
                current_area: rest.currentArea,
                annual_salary: rest.annualSalary === '' ? null : rest.annualSalary,
                expected_salary: rest.expectedSalary === '' ? null : rest.expectedSalary,
                salary_breakdown: rest.salaryBreakdown,
                notice_period: rest.noticePeriod,
                metadata: mergedMetadata,
                referral_code: rest.referralCode,
                referral_count: rest.referralCount,
                ...(vReqId !== null ? { visa_requirement_id: vReqId } : {}),
                ...(rest.openToRelocate !== undefined && { open_to_relocate: rest.openToRelocate }),
                ...(rest.openToRelocation !== undefined && { open_to_relocate: rest.openToRelocation }),
                ...(rest.openWorldwide !== undefined && { open_worldwide: rest.openWorldwide }),
                ...(rest.country !== undefined || rest.countryId !== undefined ? { current_country_id: cId } : {}),
                ...(rest.state !== undefined || rest.stateId !== undefined ? { current_state_province_id: sId } : {}),
                ...(rest.currentCity !== undefined || rest.cityId !== undefined ? { current_city_id: ciId } : {}),
            });

            if (rest.referredBy !== undefined) {
                updateData.referred_by = rest.referredBy ? Number(rest.referredBy) : null;
            }

            // Remove non-existent column fields for jobseekers table
            delete updateData.country;
            delete updateData.state;
            delete updateData.current_city;
            delete updateData.currentCity;
            delete updateData.preferred_locations;
            delete updateData.preferredLocations;
            delete updateData.visa_requirement;
            delete updateData.visaRequirement;
        }

        // Clean undefined values from updateData to prevent database update errors/clearing
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        let selectString = '*, roles(name)';
        if (table === 'jobseekers') {
            selectString = `
                *, 
                roles(name),
                education(*),
                experience(*),
                projects(*),
                languages(*),
                jobseeker_personal_details(*),
                jobseeker_skills(skills(id, uuid, name)),
                countries:current_country_id(id, name, code),
                states_provinces:current_state_province_id(id, name, code),
                cities:current_city_id(id, name, is_featured),
                jobseeker_achievements:jobseeker_achievements!jobseeker_id(*),
                jobseeker_certifications:jobseeker_certifications!jobseeker_id(*),
                jobseeker_preferred_locations(id, country_id, state_province_id, city_id, countries:country_id(id, name, code), states_provinces:state_province_id(id, name, code), cities:city_id(id, name))
            `;
        } else if (table === 'recruiters') {
            selectString = '*, roles(name), company_sizes(uuid, name)';
        } else if (table === 'employees') {
            selectString = '*, roles(name), company_sizes(uuid, name)';
        }

        let finalSelect = selectString;
        if (table === 'jobseekers') {
            finalSelect = selectString.includes('jobseeker_personal_details') 
                ? selectString 
                : selectString.replace('languages(*)', 'languages(*), jobseeker_personal_details(*)');
        } else if (table === 'recruiters') {
            finalSelect = '*, roles(name), company_sizes(uuid, name)';
        } else if (table === 'employees') {
            finalSelect = '*, roles(name), company_sizes(uuid, name)';
        }

        const { data: profile, error } = await supabaseAdmin
            .from(table)
            .update(updateData)
            .eq(column, idValue)
            .select(finalSelect)
            .single();

        if (error) throw error;

        // Update personal details in the new table if provided
        if (table === 'jobseekers' && (rest.gender || rest.maritalStatus || rest.dateOfBirth || rest.category || rest.disabilityStatus || rest.militaryExperience || rest.careerBreak)) {
            const userPk = (profile as any).id;
            const personalData = {
                user_pk: userPk,
                gender: rest.gender,
                marital_status: rest.maritalStatus,
                date_of_birth: rest.dateOfBirth,
                category: rest.category,
                disability_status: rest.disabilityStatus,
                military_experience: rest.militaryExperience,
                career_break: rest.careerBreak,
                updated_at: new Date().toISOString()
            };
            
            // Clean undefined values
            Object.keys(personalData).forEach(key => (personalData as any)[key] === undefined && delete (personalData as any)[key]);

            const { error: personalError } = await supabaseAdmin
                .from('jobseeker_personal_details')
                .upsert(personalData, { onConflict: 'user_pk' });
                
            if (personalError) console.error("Error updating personal details:", personalError);
        }

        // --- RELATIONAL UPDATES FOR JOB SEEKERS ---
        if (table === 'jobseekers') {
            const userPk = (profile as any).id;

            // 1. Education
            if (Array.isArray(rest.education)) {
                await supabaseAdmin.from('education').delete().eq('user_pk', userPk);
                if (rest.education.length > 0) {
                    await supabaseAdmin.from('education').insert(
                        rest.education.map((e: any) => ({
                            user_pk: userPk,
                            institution: e.institution,
                            degree: e.degree,
                            field_of_study: e.fieldOfStudy,
                            start_date: normalizeDate(e.startDate),
                            end_date: e.isCurrent ? null : normalizeDate(e.endDate), // Handle isCurrent logic while we're here
                            grade: e.grade,
                            description: e.description,
                            is_current: e.isCurrent
                        }))
                    );
                }
            }

            // 2. Experience (Employment)
            if (Array.isArray(rest.experience)) {
                await supabaseAdmin.from('experience').delete().eq('user_pk', userPk);
                if (rest.experience.length > 0) {
                    await supabaseAdmin.from('experience').insert(
                        rest.experience.map((e: any) => ({
                            user_pk: userPk,
                            company: e.company,
                            title: e.title,
                            location: e.location,
                            employment_type: e.employmentType,
                            start_date: normalizeDate(e.startDate),
                            end_date: e.isCurrent ? null : normalizeDate(e.endDate),
                            is_current: e.isCurrent,
                            description: e.description
                        }))
                    );
                }
            }

            // 3. Projects
            if (Array.isArray(rest.projects)) {
                await supabaseAdmin.from('projects').delete().eq('user_pk', userPk);
                if (rest.projects.length > 0) {
                    await supabaseAdmin.from('projects').insert(
                        rest.projects.map((p: any) => ({
                            user_pk: userPk,
                            name: p.name,
                            description: p.description,
                            url: p.url,
                             start_date: normalizeDate(p.startDate),
                             end_date: normalizeDate(p.endDate)
                        }))
                    );
                }
            }

            // 4. Languages
            if (Array.isArray(rest.languages)) {
                await supabaseAdmin.from('languages').delete().eq('user_pk', userPk);
                if (rest.languages.length > 0) {
                    await supabaseAdmin.from('languages').insert(
                        rest.languages.map((l: any) => ({
                            user_pk: userPk,
                            language: l.language,
                            proficiency: l.proficiency
                        }))
                    );
                }
            }

            // 5. Skills (Relational Sync)
            if (Array.isArray(rest.skills)) {
                await supabaseAdmin.from('jobseeker_skills').delete().eq('user_pk', userPk);
                
                if (rest.skills.length > 0) {
                    const skillIdsOrNames = rest.skills
                        .map((s: any) => typeof s === 'string' ? s.trim() : (s.id || s.uuid || s.name || '').trim())
                        .filter(Boolean);

                    if (skillIdsOrNames.length > 0) {
                        const uuids: string[] = [];
                        const names: string[] = [];
                        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                        
                        for (const item of skillIdsOrNames) {
                            if (uuidRegex.test(item)) {
                                uuids.push(item);
                            } else {
                                names.push(item);
                            }
                        }

                        const resolvedSkillIds: number[] = [];

                        if (uuids.length > 0) {
                            const { data: byUuid } = await supabaseAdmin
                                .from('skills')
                                .select('id')
                                .in('uuid', uuids);
                            if (byUuid) {
                                resolvedSkillIds.push(...byUuid.map((s: any) => s.id));
                            }
                        }

                        if (names.length > 0) {
                            // Find existing skills by name
                            const { data: existingByName } = await supabaseAdmin
                                .from('skills')
                                .select('id, name')
                                .in('name', names);
                            
                            const foundNames = new Set((existingByName || []).map((s: any) => s.name.toLowerCase()));
                            if (existingByName) {
                                resolvedSkillIds.push(...existingByName.map((s: any) => s.id));
                            }

                            // Auto-create missing skills
                            const missingNames = names.filter(n => !foundNames.has(n.toLowerCase()));
                            if (missingNames.length > 0) {
                                const inserts = missingNames.map(name => ({ name }));
                                const { data: insertedSkills } = await supabaseAdmin
                                    .from('skills')
                                    .insert(inserts)
                                    .select('id');
                                if (insertedSkills) {
                                    resolvedSkillIds.push(...insertedSkills.map((s: any) => s.id));
                                }
                            }
                        }

                        const uniqueIds = Array.from(new Set(resolvedSkillIds));
                        if (uniqueIds.length > 0) {
                            const skillInserts = uniqueIds.map((skillId: number) => ({
                                user_pk: userPk,
                                skill_pk: skillId
                            }));
                            await supabaseAdmin.from('jobseeker_skills').insert(skillInserts);
                        }
                    }
                }
            }

            // 6. Achievements (Relational Sync)
            if (Array.isArray(rest.achievements)) {
                try {
                    await supabaseAdmin.from('jobseeker_achievements').delete().or(`jobseeker_id.eq.${userPk},jobseeker_uuid.eq.${profile.uuid}`);
                    if (rest.achievements.length > 0) {
                        const achievementRows = rest.achievements.map((a: any) => {
                            if (typeof a === 'string') {
                                return {
                                    jobseeker_id: userPk,
                                    jobseeker_uuid: profile.uuid,
                                    title: a.trim(),
                                    description: null,
                                    issuer: null,
                                    date_achieved: null
                                };
                            }
                            return {
                                jobseeker_id: userPk,
                                jobseeker_uuid: profile.uuid,
                                title: (a.title || a.name || '').trim(),
                                description: a.description || null,
                                issuer: a.issuer || a.issuingOrganization || null,
                                date_achieved: normalizeDate(a.dateAchieved || a.issueDate)
                            };
                        }).filter((row: any) => row.title);

                        if (achievementRows.length > 0) {
                            await supabaseAdmin.from('jobseeker_achievements').insert(achievementRows);
                        }
                    }
                } catch (err) {
                    console.warn("Could not sync jobseeker_achievements table:", err);
                }
            }

            // 7. Certifications (Relational Sync)
            if (Array.isArray(rest.certifications)) {
                try {
                    await supabaseAdmin.from('jobseeker_certifications').delete().or(`jobseeker_id.eq.${userPk},jobseeker_uuid.eq.${profile.uuid}`);
                    if (rest.certifications.length > 0) {
                        const certificationRows = rest.certifications.map((c: any) => {
                            if (typeof c === 'string') {
                                return {
                                    jobseeker_id: userPk,
                                    jobseeker_uuid: profile.uuid,
                                    name: c.trim(),
                                    issuing_organization: null,
                                    issue_date: null,
                                    expiration_date: null,
                                    credential_id: null,
                                    credential_url: null
                                };
                            }
                            return {
                                jobseeker_id: userPk,
                                jobseeker_uuid: profile.uuid,
                                name: (c.name || c.title || '').trim(),
                                issuing_organization: c.issuingOrganization || c.issuer || null,
                                issue_date: normalizeDate(c.issueDate || c.dateAchieved),
                                expiration_date: normalizeDate(c.expirationDate),
                                credential_id: c.credentialId || null,
                                credential_url: c.credentialUrl || null
                            };
                        }).filter((row: any) => row.name);

                        if (certificationRows.length > 0) {
                            await supabaseAdmin.from('jobseeker_certifications').insert(certificationRows);
                        }
                    }
                } catch (err) {
                    console.warn("Could not sync jobseeker_certifications table:", err);
                }
            }

            // 8. Preferred Locations (Relational Sync)
            if (Array.isArray(rest.preferredLocations)) {
                try {
                    await supabaseAdmin.from('jobseeker_preferred_locations').delete().eq('jobseeker_id', userPk);
                    if (rest.preferredLocations.length > 0) {
                        const locationRows: any[] = [];
                        for (const loc of rest.preferredLocations) {
                            if (typeof loc === 'object' && loc !== null) {
                                const cId = loc.countryId || loc.country_id;
                                const sId = loc.stateProvinceId || loc.stateId || loc.state_province_id;
                                const ciId = loc.cityId || loc.city_id;
                                if (cId) {
                                    locationRows.push({
                                        jobseeker_id: userPk,
                                        country_id: Number(cId),
                                        state_province_id: sId ? Number(sId) : null,
                                        city_id: ciId ? Number(ciId) : null
                                    });
                                }
                            }
                        }
                        if (locationRows.length > 0) {
                            await supabaseAdmin.from('jobseeker_preferred_locations').insert(locationRows);
                        }
                    }
                } catch (err) {
                    console.warn("Could not sync jobseeker_preferred_locations table:", err);
                }
            }

            // Final re-fetch to get everything joined and mapped correctly after relational sync
            const { data: finalProfile } = await supabaseAdmin
                .from('jobseekers')
                .select(`
                    *, 
                    roles(name),
                    education(*),
                    experience(*),
                    projects(*),
                    languages(*),
                    jobseeker_personal_details(*),
                    jobseeker_skills(skills(id, uuid, name)),
                    countries:current_country_id(id, name, code),
                    states_provinces:current_state_province_id(id, name, code),
                    cities:current_city_id(id, name, is_featured),
                    jobseeker_achievements:jobseeker_achievements!jobseeker_id(*),
                    jobseeker_certifications:jobseeker_certifications!jobseeker_id(*),
                    jobseeker_preferred_locations(id, country_id, state_province_id, city_id, countries:country_id(id, name, code), states_provinces:state_province_id(id, name, code), cities:city_id(id, name))
                `)
                .eq(column, idValue)
                .single();
            
            if (finalProfile) {
                // Resolve skill names from skill_ids array for re-fetch
                if (finalProfile.jobseeker_skills && finalProfile.jobseeker_skills.length > 0) {
                    finalProfile.skills = finalProfile.jobseeker_skills.map((jsk: any) => ({
                        id: jsk.skills?.uuid || jsk.skills?.id,
                        name: jsk.skills?.name || ''
                    })).filter((s:any) => s.id);
                } else if (!finalProfile.skills) {
                    finalProfile.skills = [];
                }
            }
            
            return NextResponse.json(await mapProfileToUser(finalProfile), { status: 200 });
        }

        // Handle profile mapping for non-jobseekers
        const resolvedProfile = await mapProfileToUser(profile);
        return NextResponse.json(resolvedProfile, { status: 200 });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to update user', details: e.message }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        const column = isUuid ? 'uuid' : 'id';
        const idValue = isUuid ? id : parseInt(id);

        if (!isUuid && isNaN(idValue as number)) {
            return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
        }

        // Determine table based on role or by trying tables sequentially (more robust for patch)
        let table = '';
        if (body.role === 'Recruiter') table = 'recruiters';
        else if (body.role === 'Employee') table = 'employees';
        else if (body.role === 'Job Seeker') table = 'jobseekers';
        else {
            // Fallback: try to find the user in any table
            const tables = ['jobseekers', 'recruiters', 'employees', 'admins'];
            for (const t of tables) {
                const { data } = await supabaseAdmin.from(t).select('id').eq(column, idValue).maybeSingle();
                if (data) {
                    table = t;
                    break;
                }
            }
        }

        if (!table) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Normalize keys (snake_case)
        const updateData: any = {};
        if (body.notificationLastViewedAt) updateData.notification_last_viewed_at = body.notificationLastViewedAt;
        if (body.name) updateData.name = body.name;
        if (body.email) updateData.email = body.email;
        if (body.phone) updateData.phone = body.phone;
        if (body.metadata && table === 'jobseekers') updateData.metadata = cleanJobseekerMetadata(body.metadata);
        if (body.referralCode && table === 'jobseekers') updateData.referral_code = body.referralCode;
        if (body.referredBy && table === 'jobseekers') updateData.referred_by = Number(body.referredBy);
        if (body.referralCount !== undefined && table === 'jobseekers') updateData.referral_count = body.referralCount;
        
        updateData.updated_at = new Date().toISOString();

        let patchSelect = '*, roles(name)';
        if (table === 'jobseekers') {
            patchSelect = `
                *, 
                roles(name),
                education(*),
                experience(*),
                projects(*),
                languages(*),
                jobseeker_personal_details(*),
                jobseeker_skills(skills(id, uuid, name)),
                jobseeker_achievements:jobseeker_achievements!jobseeker_id(*),
                jobseeker_certifications:jobseeker_certifications!jobseeker_id(*)
            `;
        } else if (table === 'recruiters') {
            patchSelect = '*, roles(name), company_sizes(uuid, name)';
        } else if (table === 'employees') {
            patchSelect = '*, roles(name), company_sizes(uuid, name)';
        }


        const { data: profile, error } = await supabaseAdmin
            .from(table)
            .update(updateData)
            .eq(column, idValue)
            .select(patchSelect)
            .single();

        if (error) throw error;

        if (table === 'jobseekers' && profile) {
            const userPk = profile.id;
            if (Array.isArray(body.achievements)) {
                try {
                    await supabaseAdmin.from('jobseeker_achievements').delete().or(`jobseeker_id.eq.${userPk},jobseeker_uuid.eq.${profile.uuid}`);
                    if (body.achievements.length > 0) {
                        const achievementRows = body.achievements.map((a: any) => {
                            if (typeof a === 'string') {
                                return {
                                    jobseeker_id: userPk,
                                    jobseeker_uuid: profile.uuid,
                                    title: a.trim(),
                                    description: null,
                                    issuer: null,
                                    date_achieved: null
                                };
                            }
                            return {
                                jobseeker_id: userPk,
                                jobseeker_uuid: profile.uuid,
                                title: (a.title || a.name || '').trim(),
                                description: a.description || null,
                                issuer: a.issuer || a.issuingOrganization || null,
                                date_achieved: normalizeDate(a.dateAchieved || a.issueDate)
                            };
                        }).filter((row: any) => row.title);

                        if (achievementRows.length > 0) {
                            await supabaseAdmin.from('jobseeker_achievements').insert(achievementRows);
                        }
                    }
                } catch (err) {
                    console.warn("Could not sync jobseeker_achievements table in PATCH:", err);
                }
            }

            if (Array.isArray(body.certifications)) {
                try {
                    await supabaseAdmin.from('jobseeker_certifications').delete().or(`jobseeker_id.eq.${userPk},jobseeker_uuid.eq.${profile.uuid}`);
                    if (body.certifications.length > 0) {
                        const certificationRows = body.certifications.map((c: any) => {
                            if (typeof c === 'string') {
                                return {
                                    jobseeker_id: userPk,
                                    jobseeker_uuid: profile.uuid,
                                    name: c.trim(),
                                    issuing_organization: null,
                                    issue_date: null,
                                    expiration_date: null,
                                    credential_id: null,
                                    credential_url: null
                                };
                            }
                            return {
                                jobseeker_id: userPk,
                                jobseeker_uuid: profile.uuid,
                                name: (c.name || c.title || '').trim(),
                                issuing_organization: c.issuingOrganization || c.issuer || null,
                                issue_date: normalizeDate(c.issueDate || c.dateAchieved),
                                expiration_date: normalizeDate(c.expirationDate),
                                credential_id: c.credentialId || null,
                                credential_url: c.credentialUrl || null
                            };
                        }).filter((row: any) => row.name);

                        if (certificationRows.length > 0) {
                            await supabaseAdmin.from('jobseeker_certifications').insert(certificationRows);
                        }
                    }
                } catch (err) {
                    console.warn("Could not sync jobseeker_certifications table in PATCH:", err);
                }
            }
        }

        return NextResponse.json(await mapProfileToUser(profile), { status: 200 });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to patch user', details: e.message }, { status: 500 });
    }
}


export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        
        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // We use the admin API to delete the user from auth.users.
        // This triggers the ON DELETE CASCADE in the database to remove profile and related data.
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (error) {
            console.error(`Error deleting user ${id}:`, error);
            return NextResponse.json({ 
                error: 'Failed to delete user account', 
                details: error.message,
                code: (error as any).code || 'SUPABASE_ERROR'
            }, { status: 500 });
        }

        return NextResponse.json({ message: 'Account and associated data deleted successfully' }, { status: 200 });
    } catch (e: any) {
        console.error('Delete User Error:', e);
        // Extract a clean message if this is a Supabase error
        const errorMessage = e.message || 'Unknown database error';
        return NextResponse.json({ 
            error: 'Failed to delete user account', 
            details: errorMessage,
            code: e.code // Postgres error codes are helpful (e.g. 23503 for FK violations)
        }, { status: 500 });
    }
}
