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
// Helper to map Supabase snake_case profile to camelCase User type
async function mapProfileToUser(profile: any): Promise<User> {
    return {
        id: profile.id,       // BIGINT primary key
        uuid: profile.uuid,   // Public UUID
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        role: profile.roles?.name || profile.role || 'Job Seeker',
        roleId: profile.role_id,
        headline: profile.headline,
        summary: profile.summary,
        domainId: profile.domains?.uuid || profile.domain_id,
        resumeUrl: await resolveResumeUrl(profile.resume_url),
        linkedinUrl: profile.linkedin_url,
        githubUrl: profile.github_url,
        portfolioUrl: profile.portfolio_url,
        notificationLastViewedAt: profile.notification_last_viewed_at,
        gender: profile.jobseeker_personal_details?.gender || profile.gender,
        maritalStatus: profile.jobseeker_personal_details?.marital_status || profile.marital_status,
        dateOfBirth: profile.jobseeker_personal_details?.date_of_birth || profile.date_of_birth,
        category: profile.jobseeker_personal_details?.category || profile.category,
        disabilityStatus: profile.jobseeker_personal_details?.disability_status || profile.disability_status,
        militaryExperience: profile.jobseeker_personal_details?.military_experience || profile.military_experience,
        careerBreak: profile.jobseeker_personal_details?.career_break || profile.career_break,
        workStatus: profile.work_status,
        experienceYears: profile.experience_years,
        experienceMonths: profile.experience_months,
        currentCity: profile.current_city,
        currentArea: profile.current_area,
        annualSalary: profile.annual_salary,
        expectedSalary: profile.expected_salary,
        salaryBreakdown: profile.salary_breakdown,
        noticePeriod: profile.notice_period,
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
        skills: profile.skills || [],
        skillIds: profile.skill_ids || []
    } as User;
}

function calculateProfileStats(profile: any) {
    return {
        hasEducation: Array.isArray(profile.education) && profile.education.length > 0,
        hasEmployment: Array.isArray(profile.experience) && profile.experience.length > 0,
        hasSkills: (Array.isArray(profile.skill_ids) && profile.skill_ids.length > 0) || 
                  (Array.isArray(profile.jobseeker_skills) && profile.jobseeker_skills.length > 0),
        hasProjects: Array.isArray(profile.projects) && profile.projects.length > 0,
        hasLanguages: Array.isArray(profile.languages) && profile.languages.length > 0,
        hasSummary: !!profile.summary
    };
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
            // Resolve skills
            if (jobseeker.jobseeker_skills && jobseeker.jobseeker_skills.length > 0) {
                jobseeker.skills = jobseeker.jobseeker_skills.map((jsk: any) => ({
                    id: jsk.skills?.uuid || jsk.skills?.id,
                    uuid: jsk.skills?.uuid,
                    name: jsk.skills?.name || '',
                    proficiencyLevel: jsk.proficiency_level,
                    yearsExperience: jsk.years_experience
                })).filter((s:any) => s.id);
            } else if (jobseeker.skills && Array.isArray(jobseeker.skills) && jobseeker.skills.length > 0) {
                // Already have skills as JSONB
            } else if (jobseeker.skill_ids && jobseeker.skill_ids.length > 0) {
                const validUuids = jobseeker.skill_ids.filter((id: string) => typeof id === 'string' && id.includes('-'));
                if (validUuids.length > 0) {
                    const { data: skillsData } = await supabaseAdmin
                        .from('skills')
                        .select('id, uuid, name')
                        .in('uuid', validUuids);
                    jobseeker.skills = skillsData?.map(s => ({ id: s.uuid, name: s.name })) || [];
                } else {
                    jobseeker.skills = [];
                }
            } else {
                jobseeker.skills = [];
            }

            const user = await mapProfileToUser(jobseeker);
            user.profileStats = calculateProfileStats(jobseeker);
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
            .select('*, roles(name), company_sizes(uuid, name)')
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
                    // It's already numeric or a numeric string
                    numericCompanySizeId = parseInt(rest.companySizeId.toString());
                }
            }

            Object.assign(updateData, {
                company_name: rest.companyName,
                company_website: rest.companyWebsite,
                company_size_id: numericCompanySizeId, 
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
                notice_period: rest.noticePeriod
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
                languages(*)
            `;
        }

        const { data: profile, error } = await supabaseAdmin
            .from(table)
            .update(updateData)
            .eq(column, idValue)
            .select(table === 'jobseekers' ? (selectString.includes('jobseeker_personal_details') ? selectString : selectString.replace('languages(*)', 'languages(*), jobseeker_personal_details(*)')) : '*, roles(name), company_sizes(uuid, name)')
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
                            const skillInserts = dbSkills.map(dbSkill => ({
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

        return NextResponse.json(await mapProfileToUser(profile), { status: 200 });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to update user', details: e.message }, { status: 500 });
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
