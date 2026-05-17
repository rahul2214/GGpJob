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
        // 1-4. Search all role tables in PARALLEL to avoid sequential timeout
        const [
            { data: jobseeker, error: jobseekerError },
            { data: recruiter, error: recruiterError },
            { data: employee, error: employeeError },
            { data: admin, error: adminError }
        ] = await Promise.all([
            // Jobseekers (heavy query) - Proactively check and reset credits if needed
            (async () => {
                await supabaseAdmin.rpc('check_and_reset_credits_by_uuid', { p_uuid: uid });
                return supabaseAdmin.from('jobseekers').select('*, roles(name), domains!domain_id(uuid, name), education(*), experience(*), projects(*), languages(*), jobseeker_personal_details(*), jobseeker_skills(proficiency_level, years_experience, skills(id, uuid, name))').eq('uuid', uid).maybeSingle();
            })(),
            // Recruiters
            supabaseAdmin.from('recruiters').select('*, roles(name)').eq('uuid', uid).maybeSingle(),
            // Employees
            supabaseAdmin.from('employees').select('*, roles(name)').eq('uuid', uid).maybeSingle(),
            // Admins
            supabaseAdmin.from('admins').select('*, roles(name)').eq('uuid', uid).maybeSingle()
        ]);

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
                credits: (jobseeker.subscription_credits || 0) + (jobseeker.purchased_credits || 0),
                subscriptionCredits: jobseeker.subscription_credits || 0,
                purchasedCredits: jobseeker.purchased_credits || 0,
                subscriptionAllowance: jobseeker.subscription_allowance || 0,
                nextCreditResetAt: jobseeker.next_credit_reset_at,
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
                trustScore: jobseeker.trust_score ?? 100,
            };
            return NextResponse.json(user);
        }

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

        if (employee) {
            // Fetch pending rewards from payouts table
            const { data: allPayouts } = await supabaseAdmin
                .from('payouts')
                .select('amount, status, method')
                .eq('employee_id', employee.id);
            
            const pendingRewards = (allPayouts || [])
                .filter(p => p.method === 'system' && (p.status === 'held' || p.status === 'delayed' || p.status === 'pending'))
                .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
                
            const totalRewards = (allPayouts || [])
                .filter(p => p.method === 'system' && p.status !== 'blocked' && p.status !== 'rejected')
                .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

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

            let jobsPostedThisMonth = employee.jobs_posted_this_month ?? 0;
            let nextJobsResetAt = employee.next_jobs_reset_at ?? null;

            const now = new Date();
            const nextResetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));

            if (!nextJobsResetAt || now.getTime() >= new Date(nextJobsResetAt).getTime()) {
                jobsPostedThisMonth = 0;
                nextJobsResetAt = nextResetDate.toISOString();
                supabaseAdmin.from('employees').update({
                    jobs_posted_this_month: 0,
                    next_jobs_reset_at: nextJobsResetAt
                }).eq('id', employee.id).then().catch(e => console.error('Auto-reset error:', e));
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
                jobsPostedThisMonth,
                nextJobsResetAt,
                trustScore: employee.trust_score ?? 100,
                // Gamification Fields
                xp: employee.xp ?? 0,
                level: employee.level ?? 1,
                rewardsBalance: employee.rewards_balance ?? 0,
                pendingRewards: pendingRewards,
                totalRewards: totalRewards,
                verifiedReferralsCount: employee.verified_referrals_count ?? 0,
                interviewsCount: employee.interviews_count ?? 0,
                offersCount: employee.offers_count ?? 0,
                hiresCount: employee.hires_count ?? 0,
                milestonesAchieved: employee.milestones_achieved ?? [],
                badgeIds: employee.badge_ids ?? [],
            });
        }

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

            // AVOID DUPLICATE KEY: Use UPSERT with 'email' context to handle existing emails gracefully
            const { data: newProfile, error: createError } = await supabaseAdmin
                .from(targetTable)
                .upsert({
                    uuid: authUser.id,
                    name: name,
                    email: authUser.email,
                    role_id: roleId,
                    phone: metadata?.phone || '',
                    ...(targetTable === 'admins' ? { is_super_admin: false } : {})
                }, { onConflict: 'email' })
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
    // Admin view: get all users across ALL role tables in parallel
    const [
        { data: seekers, error: seekersErr },
        { data: recruiters, error: recruitersErr },
        { data: employees, error: employeesErr },
        { data: admins, error: adminsErr }
    ] = await Promise.all([
        supabaseAdmin.from('jobseekers').select('*, roles(name)').order('created_at', { ascending: false }),
        supabaseAdmin.from('recruiters').select('*, roles(name)').order('created_at', { ascending: false }),
        supabaseAdmin.from('employees').select('*, roles(name)').order('created_at', { ascending: false }),
        supabaseAdmin.from('admins').select('*, roles(name)').order('created_at', { ascending: false })
    ]);
    
    if (seekersErr) console.error("Error fetching seekers:", seekersErr);
    if (recruitersErr) console.error("Error fetching recruiters:", recruitersErr);
    if (employeesErr) console.error("Error fetching employees:", employeesErr);
    if (adminsErr) console.error("Error fetching admins:", adminsErr);

    // Combine and map to a unified format
    const allUsers = [
        ...(seekers || []).map(u => ({ ...u, role: (u as any).roles?.name || u.role || 'Job Seeker', table: 'jobseekers' })),
        ...(recruiters || []).map(u => ({ ...u, role: (u as any).roles?.name || 'Recruiter', table: 'recruiters' })),
        ...(employees || []).map(u => ({ ...u, role: (u as any).roles?.name || 'Employee', table: 'employees' })),
        ...(admins || []).map(u => ({ ...u, role: (u as any).roles?.name || (u.is_super_admin ? 'Super Admin' : 'Admin'), table: 'admins' }))
    ];

    // Sort by created_at desc
    allUsers.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
    });

    const resolvedUsers = await Promise.all(allUsers.map(async u => {
        return {
            ...u,
            createdAt: u.created_at,
            resumeUrl: u.resume_url ? await resolveResumeUrl(u.resume_url) : undefined,
            companyName: u.company_name,
            companyWebsite: u.company_website,
            designation: u.designation,
            department: u.department,
            trustScore: u.trust_score ?? 100,
            jobsPostedThisMonth: u.jobs_posted_this_month ?? 0,
            jobPostLimit: u.job_post_limit ?? 5,
            isPaid: u.is_paid ?? false,
            planType: u.plan_type ?? 'none',
            credits: (u.subscription_credits || 0) + (u.purchased_credits || 0),
            isSuperAdmin: u.is_super_admin ?? false,
        };
    }));

    return NextResponse.json(resolvedUsers);
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
