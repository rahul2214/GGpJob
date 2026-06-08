import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { User } from '@/lib/types';
import { resolveResumeUrl } from '@/lib/resolve-resume';

// Helper to normalize YYYY-MM to YYYY-MM-DD for PostgreSQL DATE type
function normalizeDate(dateStr: string | null | undefined): string | null | undefined {
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}$/.test(dateStr)) {
        return `${dateStr}-01`;
    }
    return dateStr;
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
        hasSummary: !!profile.summary
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
                .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
        }
    }

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
        domainId: profile.domains?.uuid || profile.domain_id,
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
        currentCity: profile.current_city,
        currentArea: profile.current_area,
        annualSalary: profile.annual_salary,
        expectedSalary: profile.expected_salary,
        salaryBreakdown: profile.salary_breakdown,
        noticePeriod: profile.notice_period,
        preferredLocations: profile.preferred_locations || [],
        isPaid: profile.is_paid,
        planType: profile.plan_type,
        planExpiresAt: profile.plan_expires_at,
        talentSearchExpiresAt: profile.talent_search_expires_at,
        location: profile.location_id || undefined,
        metadata: profile.metadata,
        companyName: profile.company_name,
        companyLogo: profile.company_logo,
        companyWebsite: profile.company_website,
        companySizeId: profile.company_sizes?.uuid || profile.company_size_id,
        companySize: profile.company_sizes?.name || profile.company_size,
        companyOverview: profile.company_overview,
        companyAddress: profile.company_address,
        companyLinkedinUrl: profile.company_linkedin_url,
        designation: profile.designation,
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
        skills: resolvedSkills,
        skillIds: profile.skill_ids || [],
        profileStats,
        
        // Credits (Job Seekers)
        credits: (profile.subscription_credits || 0) + (profile.purchased_credits || 0),
        subscriptionCredits: profile.subscription_credits || 0,
        purchasedCredits: profile.purchased_credits || 0,
        subscriptionAllowance: profile.subscription_allowance || 0,
        nextCreditResetAt: profile.next_credit_reset_at,

        // Employee & Gamification
        rewards: profile.rewards ?? 0,
        trustScore: profile.trust_score ?? 100,
        xp: profile.xp ?? 0,
        level: profile.level ?? 1,
        rewardsBalance: profile.rewards_balance ?? 0,
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
                domains!domain_id(uuid, name),
                education(*),
                experience(*),
                projects(*),
                languages(*),
                jobseeker_personal_details(*),
                jobseeker_skills(proficiency_level, years_experience, skills(id, uuid, name))
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

        // 3. Check employees
        const { data: employee } = await supabaseAdmin
            .from('employees')
            .select('*, roles(name)')
            .eq(column, idValue)
            .maybeSingle();

        if (employee) {
            return NextResponse.json(await mapProfileToUser(employee));
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

        if (table === 'recruiters' || table === 'employees') {
            let numericCompanySizeId = null;
            if (table === 'recruiters' && rest.companySizeId) {
                const isUuid = typeof rest.companySizeId === 'string' && rest.companySizeId.includes('-');
                if (isUuid) {
                    const { data: sizeData } = await supabaseAdmin
                        .from('company_sizes')
                        .select('id')
                        .eq('uuid', rest.companySizeId)
                        .single();
                    if (sizeData) numericCompanySizeId = sizeData.id;
                } else if (rest.companySizeId) {
                    // It's already numeric or a numeric string
                    numericCompanySizeId = parseInt(rest.companySizeId.toString());
                }
            }

            Object.assign(updateData, {
                company_name: rest.companyName,
                company_website: rest.companyWebsite,
                ...(table === 'recruiters' && { company_size_id: numericCompanySizeId }),
                company_overview: rest.companyOverview,
                company_address: rest.companyAddress,
                company_linkedin_url: rest.companyLinkedinUrl,
                designation: rest.designation,
            });
        }

        if (table === 'jobseekers') {
            const selectString = '*, roles(name), domains!domain_id(uuid, name)';
            
            const idResolutions = [
                { field: 'domainId', table: 'domains', target: 'domain_id' }
            ];

            for (const res of idResolutions) {
                const inputValue = rest[res.field];
                if (!inputValue) continue;

                const isUuidInput = typeof inputValue === 'string' && inputValue.includes('-');
                
                if (isUuidInput) {
                    // Resolve UUID to numeric legacy ID (BIGINT)
                    const { data: refData } = await supabaseAdmin
                        .from(res.table)
                        .select('id')
                        .eq('uuid', inputValue)
                        .maybeSingle();
                    if (refData) updateData[res.target] = refData.id;
                } else {
                    // Already a numeric ID (string or number)
                    const numericId = parseInt(inputValue.toString());
                    if (!isNaN(numericId)) {
                        updateData[res.target] = numericId;
                    }
                }
            }

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
                current_city: rest.currentCity,
                current_area: rest.currentArea,
                annual_salary: rest.annualSalary === '' ? null : rest.annualSalary,
                expected_salary: rest.expectedSalary === '' ? null : rest.expectedSalary,
                salary_breakdown: rest.salaryBreakdown,
                notice_period: rest.noticePeriod,
                preferred_locations: rest.preferredLocations
            });
        }

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
                jobseeker_skills(skills(id, uuid, name))
            `;
        } else if (table === 'recruiters') {
            selectString = '*, roles(name), company_sizes(uuid, name)';
        } else if (table === 'employees') {
            selectString = '*, roles(name)';
        }

        let finalSelect = selectString;
        if (table === 'jobseekers') {
            finalSelect = selectString.includes('jobseeker_personal_details') 
                ? selectString 
                : selectString.replace('languages(*)', 'languages(*), jobseeker_personal_details(*)');
        } else if (table === 'recruiters') {
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
                
                const skillUuids = rest.skills
                    .map((s: any) => typeof s === 'string' ? s : (s.id || s.uuid))
                    .filter(Boolean);
                    
                if (skillUuids.length > 0) {
                    const validSkillUuids = skillUuids.filter((id: string) => id.includes('-'));
                    
                    if (validSkillUuids.length > 0) {
                        const { data: dbSkills } = await supabaseAdmin
                            .from('skills')
                            .select('id')
                            .in('uuid', validSkillUuids);
                            
                        if (dbSkills && dbSkills.length > 0) {
                            const skillInserts = dbSkills.map((dbSkill: any) => ({
                                user_pk: userPk,
                                skill_pk: dbSkill.id
                            }));
                            await supabaseAdmin.from('jobseeker_skills').insert(skillInserts);
                        }
                    }
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
                    jobseeker_skills(skills(id, uuid, name))
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
                jobseeker_skills(skills(id, uuid, name))
            `;
        } else if (table === 'recruiters') {
            patchSelect = '*, roles(name), company_sizes(uuid, name)';
        } else if (table === 'employees') {
            patchSelect = '*, roles(name)';
        }


        const { data: profile, error } = await supabaseAdmin
            .from(table)
            .update(updateData)
            .eq(column, idValue)
            .select(patchSelect)
            .single();

        if (error) throw error;

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
