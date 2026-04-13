import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { User } from '@/lib/types';
import { resolveResumeUrl } from '@/lib/resolve-resume';

// GET all users OR a specific user by UID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (uid) {
        // Search all role tables in sequence until a match is found
        
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
            .eq('uuid', uid)
            .maybeSingle();

        if (jobseekerError && jobseekerError.code !== 'PGRST116') {
            console.error(`Error fetching jobseeker ${uid}:`, jobseekerError);
        }
        if (jobseeker) {
            // Resolve skills from junction table
            let resolvedSkills: any[] = [];
            if (jobseeker.jobseeker_skills && jobseeker.jobseeker_skills.length > 0) {
                resolvedSkills = jobseeker.jobseeker_skills.map((jsk: any) => ({
                    id: jsk.skills?.uuid || jsk.skills?.id,
                    uuid: jsk.skills?.uuid,
                    name: jsk.skills?.name || '',
                    proficiencyLevel: jsk.proficiency_level,
                    yearsExperience: jsk.years_experience
                })).filter((s:any) => s.id);
            } else if (jobseeker.skills && Array.isArray(jobseeker.skills) && jobseeker.skills.length > 0) {
                resolvedSkills = jobseeker.skills;
            }

            const user: any = {
                id: jobseeker.id,
                uuid: jobseeker.uuid,
                name: jobseeker.name,
                email: jobseeker.email,
                phone: jobseeker.phone,
                role: (jobseeker as any).roles?.name || jobseeker.role || 'Job Seeker',
                roleId: jobseeker.role_id,
                headline: jobseeker.headline,
                summary: jobseeker.summary,
                domainId: jobseeker.domains?.uuid || jobseeker.domain_id,
                resumeUrl: await resolveResumeUrl(jobseeker.resume_url),
                linkedinUrl: jobseeker.linkedin_url,
                githubUrl: jobseeker.github_url,
                portfolioUrl: jobseeker.portfolio_url,
                notificationLastViewedAt: jobseeker.notification_last_viewed_at,
                gender: (jobseeker.jobseeker_personal_details?.[0] || jobseeker.jobseeker_personal_details)?.gender || jobseeker.gender,
                maritalStatus: (jobseeker.jobseeker_personal_details?.[0] || jobseeker.jobseeker_personal_details)?.marital_status || jobseeker.marital_status,
                dateOfBirth: (jobseeker.jobseeker_personal_details?.[0] || jobseeker.jobseeker_personal_details)?.date_of_birth || jobseeker.date_of_birth,
                category: (jobseeker.jobseeker_personal_details?.[0] || jobseeker.jobseeker_personal_details)?.category || jobseeker.category,
                disabilityStatus: (jobseeker.jobseeker_personal_details?.[0] || jobseeker.jobseeker_personal_details)?.disability_status || jobseeker.disability_status,
                militaryExperience: (jobseeker.jobseeker_personal_details?.[0] || jobseeker.jobseeker_personal_details)?.military_experience || jobseeker.military_experience,
                careerBreak: (jobseeker.jobseeker_personal_details?.[0] || jobseeker.jobseeker_personal_details)?.career_break || jobseeker.career_break,
                workStatus: jobseeker.work_status,
                experienceYears: jobseeker.experience_years,
                experienceMonths: jobseeker.experience_months,
                currentCity: jobseeker.current_city,
                currentArea: jobseeker.current_area,
                annualSalary: jobseeker.annual_salary,
                expectedSalary: jobseeker.expected_salary,
                salaryBreakdown: jobseeker.salary_breakdown,
                noticePeriod: jobseeker.notice_period,
                isPaid: jobseeker.is_paid,
                planType: jobseeker.plan_type,
                planExpiresAt: jobseeker.plan_expires_at,
                talentSearchExpiresAt: jobseeker.talent_search_expires_at,
                metadata: jobseeker.metadata,
                education: (jobseeker.education || []).map((e: any) => ({
                    ...e,
                    startDate: e.start_date,
                    endDate: e.end_date,
                    fieldOfStudy: e.field_of_study,
                    isCurrent: e.is_current
                })),
                experience: (jobseeker.experience || []).map((e: any) => ({
                    ...e,
                    startDate: e.start_date,
                    endDate: e.end_date,
                    employmentType: e.employment_type,
                    isCurrent: e.is_current
                })),
                projects: (jobseeker.projects || []).map((p: any) => ({
                    ...p,
                    startDate: p.start_date,
                    endDate: p.end_date
                })),
                languages: jobseeker.languages || [],
                skills: resolvedSkills,
                skillIds: jobseeker.skill_ids || [],
                profileStats: {
                    hasEducation: Array.isArray(jobseeker.education) && jobseeker.education.length > 0,
                    hasEmployment: Array.isArray(jobseeker.experience) && jobseeker.experience.length > 0,
                    hasSkills: (jobseeker.skill_ids && jobseeker.skill_ids.length > 0) || resolvedSkills.length > 0,
                    hasProjects: Array.isArray(jobseeker.projects) && jobseeker.projects.length > 0,
                    hasLanguages: Array.isArray(jobseeker.languages) && jobseeker.languages.length > 0,
                    hasSummary: !!jobseeker.summary,
                },
            };
            return NextResponse.json(user);
        }

        // 2. Check recruiters
        const { data: recruiter, error: recruiterError } = await supabaseAdmin
            .from('recruiters')
            .select('*, roles(name)')
            .eq('uuid', uid)
            .maybeSingle();

        if (recruiterError) {
            console.log(`Recruiter fetch error for ${uid}:`, recruiterError.message);
        }

        if (recruiter) {
            // Robustly resolve UUIDs for relational fields
            let companySizeUuid = recruiter.company_size_id;
            if (recruiter.company_size_id) {
                const { data: cs } = await supabaseAdmin.from('company_sizes').select('uuid').eq('id', recruiter.company_size_id).single();
                if (cs) companySizeUuid = cs.uuid;
            }

            let domainUuid = recruiter.company_domain_id;
            if (recruiter.company_domain_id) {
                const { data: dom } = await supabaseAdmin.from('domains').select('uuid').eq('id', recruiter.company_domain_id).single();
                if (dom) domainUuid = dom.uuid;
            }

            return NextResponse.json({
                id: recruiter.id,
                uuid: recruiter.uuid,
                name: recruiter.name,
                email: recruiter.email,
                phone: recruiter.phone,
                role: (recruiter as any).roles?.name || 'Recruiter',
                roleId: recruiter.role_id,
                companyName: recruiter.company_name,
                companyLogo: recruiter.company_logo,
                companyWebsite: recruiter.company_website,
                companySizeId: companySizeUuid, // Now resolved to UUID if available
                companySize: recruiter.company_sizes?.name || recruiter.company_size,
                companyDomainId: domainUuid,    // Now resolved to UUID if available
                companyOverview: recruiter.company_overview,
                companyAddress: recruiter.company_address,
                companyLinkedinUrl: recruiter.company_linkedin_url,
                designation: recruiter.designation,
                linkedinUrl: recruiter.linkedin_url,
                portfolioUrl: recruiter.portfolio_url,
                isPaid: recruiter.is_paid,
                planType: recruiter.plan_type,
                planExpiresAt: recruiter.plan_expires_at,
                jobPostLimit: recruiter.job_post_limit,
                jobPostValidity: recruiter.job_post_validity,
                appAccessDays: recruiter.app_access_days,
                notificationLastViewedAt: recruiter.notification_last_viewed_at,
            });
        }

        // 3. Check employees
        const { data: employee, error: employeeError } = await supabaseAdmin
            .from('employees')
            .select('*, roles(name)')
            .eq('uuid', uid)
            .maybeSingle();

        if (employeeError && employeeError.code !== 'PGRST116') {
            console.error(`Error fetching employee ${uid}:`, employeeError);
        }

        if (employee) {
            // Robustly resolve UUIDs for relational fields
            let companySizeUuid = employee.company_size_id;
            if (employee.company_size_id) {
                const { data: cs } = await supabaseAdmin.from('company_sizes').select('uuid').eq('id', employee.company_size_id).single();
                if (cs) companySizeUuid = cs.uuid;
            }

            let domainUuid = (employee as any).company_domain_id;
            if (domainUuid && typeof domainUuid === 'number') {
                const { data: dom } = await supabaseAdmin.from('domains').select('uuid').eq('id', domainUuid).single();
                if (dom) domainUuid = dom.uuid;
            }

            return NextResponse.json({
                id: employee.id,
                uuid: employee.uuid,
                name: employee.name,
                email: employee.email,
                phone: employee.phone,
                role: (employee as any).roles?.name || 'Employee',
                roleId: employee.role_id,
                companyName: employee.company_name,
                companyLogo: employee.company_logo,
                companyWebsite: employee.company_website,
                companyOverview: employee.company_overview,
                companyAddress: employee.company_address,
                companySizeId: companySizeUuid,
                companyDomainId: domainUuid,
                designation: employee.designation,
                department: employee.department,
                linkedinUrl: employee.linkedin_url,
                portfolioUrl: (employee as any).portfolio_url,
                referralCount: employee.referral_count,
                notificationLastViewedAt: employee.notification_last_viewed_at,
                isPaid: employee.is_paid,
                planType: employee.plan_type,
                planExpiresAt: employee.plan_expires_at,
                maxAppliesLimit: employee.max_applies_limit,
                jobPostLimit: employee.job_post_limit ?? 5,

            });
        }

        // 4. Check admins
        const { data: admin, error: adminError } = await supabaseAdmin
            .from('admins')
            .select('*, roles(name)')
            .eq('uuid', uid)
            .maybeSingle();

        if (adminError && adminError.code !== 'PGRST116') {
            console.error(`Error fetching admin ${uid}:`, adminError);
        }

        if (admin) {
            return NextResponse.json({
                id: admin.id,
                uuid: admin.uuid,
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                role: (admin as any).roles?.name || (admin.is_super_admin ? 'Super Admin' : 'Admin'),
                roleId: admin.role_id,
                designation: admin.designation,
                department: admin.department,
                isSuperAdmin: admin.is_super_admin,
                canManageJobs: admin.can_manage_jobs,
                canManageUsers: admin.can_manage_users,
                canManageCoupons: admin.can_manage_coupons,
                canViewAnalytics: admin.can_view_analytics,
                canManageAdmins: admin.can_manage_admins,
                lastLoginAt: admin.last_login_at,
                notificationLastViewedAt: admin.notification_last_viewed_at,
            });
        }


        // 5. SELF-HEALING: If not found in any table, check Supabase Auth
        const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.admin.getUserById(uid);
        
        if (!authError && authUser) {
            console.log(`[API_USERS_GET] Self-healing profile for ${authUser.email}`);
            const metadata = authUser.user_metadata;
            const role = metadata?.role || 'Job Seeker';
            const name = metadata?.full_name || metadata?.name || authUser.email?.split('@')[0] || 'New User';
            
            let targetTable = 'jobseekers';
            let roleId = 1;

            if (role === 'Recruiter') {
                targetTable = 'recruiters';
                roleId = 2;
            } else if (role === 'Employee') {
                targetTable = 'employees';
                roleId = 3;
            } else if (role === 'Admin') {
                targetTable = 'admins';
                roleId = 4;
            }

            const { data: newProfile, error: createError } = await supabaseAdmin
                .from(targetTable)
                .insert({
                    uuid: authUser.id,
                    name: name,
                    email: authUser.email,
                    role_id: roleId,
                    phone: metadata?.phone || '',
                    ...(targetTable === 'admins' ? { is_super_admin: false } : {})
                })
                .select()
                .single();
            
            if (!createError && newProfile) {
                // Return success immediately
                return NextResponse.json({
                    id: newProfile.id,
                    uuid: newProfile.uuid,
                    name: newProfile.name,
                    email: newProfile.email,
                    role: role,
                    roleId: roleId,
                    phone: newProfile.phone
                });
            } else {
                console.error(`[API_USERS_GET] Failed to self-heal ${targetTable} profile:`, createError);
            }
        }

        // Not found in any table (and self-healing failed/wasn't applicable)
        return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    // Admin view: get all users
    const { data: profiles, error: listErr } = await supabaseAdmin
        .from('jobseekers')
        .select('*');
    
    if (listErr) throw listErr;

    const resolvedProfiles = await Promise.all((profiles || []).map(async p => ({
        ...p,
        resume_url: await resolveResumeUrl(p.resume_url)
    })));

    return NextResponse.json(resolvedProfiles);
  } catch (e: any) {
    console.error("[API_USERS_GET] Error:", e.message);
    return NextResponse.json({ error: 'Failed to fetch users', details: e.message }, { status: 500 });
  }
}

const DISALLOWED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 
  'icloud.com', 'mail.com', 'aol.com', 'zoho.com', 'yandex.com',
  'protonmail.com', 'gmx.com', 'lycos.com'
];

// POST a new user (create/update profile after signup)
export async function POST(request: Request) {
  try {
    const { id, name, email, role, phone, domainId } = await request.json();

    if (!id || !name || !email || !role) {
        return NextResponse.json({ error: 'Missing required fields for profile creation' }, { status: 400 });
    }

    // Identify the correct table and role_id
    let table = 'jobseekers';
    let roleId = 1; // Default to Job Seeker
    
    if (role === 'Recruiter') {
        table = 'recruiters';
        roleId = 2;
        const domain = email.split('@')[1]?.toLowerCase();
        if (DISALLOWED_DOMAINS.includes(domain)) {
            return NextResponse.json({ 
                error: 'Recruiters must use a corporate email address (Personal domains like Gmail/Yahoo are not allowed).' 
            }, { status: 400 });
        }
    } else if (role === 'Employee') {
        table = 'employees';
        roleId = 3;
    } else if (role === 'Admin') {
        table = 'admins';
        roleId = 4;
    } else if (role === 'Super Admin') {
        table = 'admins';
        roleId = 5;
    }
    
    const dataToSave: any = {
        name,
        email,
        phone: phone || '',
        role_id: roleId,
        uuid: id, // Every table (seekers, recruiters, employees, admins) has a uuid column for Auth UID
    };

    let conflictField = 'uuid';

    // Table-specific compatibility/metadata
    if (table === 'jobseekers') {
        dataToSave.role = role; // Compatibility until role column is fully dropped
        if (domainId) {
            dataToSave.metadata = { domainId };
        }
    } else if (table === 'admins') {
        dataToSave.is_super_admin = (role === 'Super Admin');
    }

    const { error: upsertErr } = await supabaseAdmin
        .from(table)
        .upsert(dataToSave, { onConflict: conflictField });

    if (upsertErr) throw upsertErr;
    
    return NextResponse.json({ id, role, roleId, ...dataToSave }, { status: 201 });
  } catch (e: any) {
    console.error("[API_USERS_POST] Error:", e);
    return NextResponse.json({ error: 'Failed to manage user profile in Supabase', details: e.message }, { status: 500 });
  }
}
