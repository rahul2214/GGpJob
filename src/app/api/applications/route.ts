import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { resolveResumeUrl } from '@/lib/resolve-resume';

const statusMap: { [key: number]: string } = {
    1: 'Applied',
    2: 'Under Review',
    3: 'Accepted',
    4: 'Referral Unlocked',
    5: 'Referred',
    6: 'Interviewing',
    7: 'Offer Received',
    8: 'Pending Confirmation',
    9: 'Joined Company',
    10: 'Completed',
    11: 'Disputed',
    12: 'Rejected',
    13: 'Verified Referral'
};

// Map Supabase application to frontend structure
async function mapApplicationToFrontend(app: any, skillMap?: Map<string, string>): Promise<any> {
    const profile = app.jobseekers || {};
    const job = app.jobs || {};
    
    // Resolve skill names: Priority: jobseeker_skills (junction table) -> jobseekers.skills (JSONB) -> jobseekers.skill_ids (resolution) -> metadata fallback
    let applicantSkills = '';
    
    // 1. Check Junction Table (Preferred source of truth)
    if (profile.jobseeker_skills && Array.isArray(profile.jobseeker_skills) && profile.jobseeker_skills.length > 0) {
        applicantSkills = profile.jobseeker_skills
            .map((js: any) => js.skills?.name)
            .filter(Boolean)
            .join(', ');
    } 
    // 2. Original JSONB array fallback
    else if (profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0) {
        applicantSkills = profile.skills
            .map((s: any) => typeof s === 'string' ? s : (s.name || s.label))
            .filter(Boolean)
            .join(', ');
    } 
    // 3. skill_ids resolution fallback
    else if (skillMap && profile.skill_ids && profile.skill_ids.length > 0) {
        applicantSkills = profile.skill_ids
            .map((id: string) => skillMap.get(id))
            .filter(Boolean)
            .join(', ');
    } 
    // 4. Metadata fallback
    else {
        applicantSkills = profile.metadata?.skills?.map((s: any) => s.name || s.label).join(', ') || '';
    }

    return {
        id: app.id,           // BIGINT primary key
        uuid: app.uuid,       // Public UUID
        jobId: app.jobs?.uuid,    // Compatibility UUID shifted to JOIN
        userId: app.jobseekers?.uuid,  // Compatibility UUID shifted to JOIN
        statusId: app.status_id,
        statusName: statusMap[app.status_id] || 'Applied',
        appliedAt: app.applied_at,
        rating: app.rating,
        feedback: app.feedback,
        isUnlocked: !!app.is_unlocked,
        updatedAt: app.updated_at,
        
        // Applicant details (Conditionally masked for Referrals)
        applicantName: profile.name,
        applicantEmail: (app.is_unlocked || !job.is_referral) ? profile.email : '••••••••@••••.•••',
        applicantPhone: (app.is_unlocked || !job.is_referral) ? profile.phone : '••••••••••',
        applicantHeadline: profile.headline,
        applicantId: profile.uuid,
        applicantSkills: applicantSkills,
        applicantResumeUrl: (app.is_unlocked || !job.is_referral) ? await resolveResumeUrl(profile.resume_url) : null,
        applicantLinkedinUrl: (app.is_unlocked || !job.is_referral) ? profile.linkedin_url : null,
        applicantSummary: profile.summary,
        applicantWorkStatus: profile.work_status,
        applicantExperience: `${profile.experience_years || 0}y ${profile.experience_months || 0}m`,
        applicantLocation: profile.current_city,
        applicantPlanType: profile.plan_type,
        
        // Job details
        jobTitle: job.title,
        companyName: job.company_name,
        jobSalaryMin: job.salary_min,
        jobSalaryMax: job.salary_max,
        jobLocation: job.location,
        jobType: job.type,
        jobIsReferral: job.is_referral,
        posterName: job.employees?.name,
        posterEmail: job.employees?.email,

        // Verification details
        proofUrl: await resolveResumeUrl(app.proof_url),
        internalReferralId: app.internal_referral_id,
        verificationStatus: app.verification_status,
        verificationExpiresAt: app.verification_expires_at,
        disputeReason: app.dispute_reason,
        jobseekerFeedback: app.jobseeker_feedback,
        feedbackSubmittedAt: app.feedback_submitted_at,
    };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const jobId = searchParams.get('jobId');
    const requesterId = searchParams.get('requesterId');

    let query = supabaseAdmin
        .from('applications')
        .select(`
            *,
            jobseekers(*, jobseeker_skills(skills(id, name))),
            jobs(*, employees(name, email))
        `);

    if (userId) {
      const isNumericUser = /^\d+$/.test(userId);
      if (isNumericUser) {
        query = query.eq('user_pk', parseInt(userId));
      } else if (userId.includes('-')) {
        const { data: u } = await supabaseAdmin.from('jobseekers').select('id').eq('uuid', userId).maybeSingle();
        if(u) query = query.eq('user_pk', u.id);
        else return NextResponse.json([]);
      } else {
        return NextResponse.json([]);
      }
    }
    if (jobId) {
      const isNumericJobId = /^\d+$/.test(jobId);
      if (isNumericJobId) {
        query = query.eq('job_pk', parseInt(jobId));
      } else {
        const { data: j } = await supabaseAdmin.from('jobs').select('id').eq('uuid', jobId).single();
        if (j) query = query.eq('job_pk', j.id);
        else return NextResponse.json([]);
      }
    }

    const verificationStatus = searchParams.get('verificationStatus');
    if (verificationStatus) {
        query = query.eq('verification_status', verificationStatus);
    }

    const statusIdParam = searchParams.get('statusId');
    if (statusIdParam) {
        const statusIds = statusIdParam.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        if (statusIds.length > 0) {
            query = query.in('status_id', statusIds);
        }
    }

    const { data: appDocs, error } = await query.order('applied_at', { ascending: false });

    if (error) throw error;

    // Resolve skill names for applicants in bulk
    const allSkillIds = Array.from(new Set(appDocs.flatMap(app => app.jobseekers?.skill_ids || [])));
    const { data: skillsData } = await supabaseAdmin
        .from('skills')
        .select('id, name')
        .in('id', allSkillIds);
    
    const skillMap = new Map(skillsData?.map(s => [s.id, s.name]) || []);

    // Fetch unread chat counts if requesterId is provided
    let unreadChatCounts: Record<number, number> = {};
    if (requesterId) {
        const isNumeric = /^\d+$/.test(requesterId);
        const allPks: number[] = [];
        if (isNumeric) {
            allPks.push(parseInt(requesterId));
        } else {
            const [
                { data: js },
                { data: emp },
                { data: rec }
            ] = await Promise.all([
                supabaseAdmin.from('jobseekers').select('id').eq('uuid', requesterId).maybeSingle(),
                supabaseAdmin.from('employees').select('id').eq('uuid', requesterId).maybeSingle(),
                supabaseAdmin.from('recruiters').select('id').eq('uuid', requesterId).maybeSingle()
            ]);
            if (js) allPks.push(js.id);
            if (emp) allPks.push(emp.id);
            if (rec) allPks.push(rec.id);
        }

        if (allPks.length > 0) {
            const { data: notifs } = await supabaseAdmin
                .from('notifications')
                .select('message')
                .in('user_pk', allPks)
                .eq('type', 'chat_message')
                .eq('is_read', false);
            
            if (notifs) {
                notifs.forEach(n => {
                    const match = n.message.match(/\[APP_ID:(\d+)\]/);
                    if (match) {
                        const appId = parseInt(match[1]);
                        unreadChatCounts[appId] = (unreadChatCounts[appId] || 0) + 1;
                    }
                });
            }
        }
    }

    const now = new Date();
    const applications = (await Promise.all(appDocs.map(async app => {
        // Check if application view is expired for this recruiter view
        if (jobId && app.jobs?.app_expires_at) {
            const expiry = new Date(app.jobs.app_expires_at);
            if (expiry < now) return null;
        }
        
        const formatted = await mapApplicationToFrontend(app, skillMap);
        return {
            ...formatted,
            unreadChatCount: unreadChatCounts[app.id] || 0
        };
    }))).filter(Boolean);

    return NextResponse.json(applications);

  } catch (e: any) {
    console.error('[API_APPLICATIONS_GET] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch applications', details: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const { jobId, userId } = await request.json();
        
        if (!jobId || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Check job validity and resolve internal job_pk
        const isNumericJob = typeof jobId === 'string' ? /^\d+$/.test(jobId) : typeof jobId === 'number';
        let jobQuery = supabaseAdmin.from('jobs').select('id, uuid, app_expires_at, max_applies, employee_pk, is_referral');

        
        if (isNumericJob) {
            jobQuery = jobQuery.eq('id', parseInt(jobId as string));
        } else if (typeof jobId === 'string' && jobId.includes('-')) {
            jobQuery = jobQuery.eq('uuid', jobId);
        } else {
            return NextResponse.json({ error: 'Invalid Job ID format' }, { status: 400 });
        }

        const { data: job, error: jobError } = await jobQuery.maybeSingle();

        if (jobError || !job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        const now = new Date();
        if (job.app_expires_at && new Date(job.app_expires_at) < now) {
            return NextResponse.json({ error: 'This job is no longer accepting applications (Link expired)' }, { status: 403 });
        }

        if (job.max_applies && job.max_applies > 0) {
            const { count } = await supabaseAdmin
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .eq('job_pk', job.id);

            if (count !== null && count >= job.max_applies) {
                return NextResponse.json({ error: 'This job has reached its maximum application limit' }, { status: 403 });
            }
        }

        if (job.employee_pk) {
            const { data: emp } = await supabaseAdmin
                .from('employees')
                .select('id, max_applies_limit')
                .eq('id', job.employee_pk)
                .maybeSingle();

            if (emp && emp.max_applies_limit && emp.max_applies_limit > 0) {
                const empJobIds = await supabaseAdmin
                    .from('jobs')
                    .select('id')
                    .eq('employee_pk', emp.id);

                const jobPks = (empJobIds.data || []).map((j: any) => j.id);

                if (jobPks.length > 0) {
                    const { count: totalApps } = await supabaseAdmin
                        .from('applications')
                        .select('*', { count: 'exact', head: true })
                        .in('job_pk', jobPks);

                    if (totalApps !== null && totalApps >= emp.max_applies_limit) {
                        return NextResponse.json({
                            error: `This employer has reached their total application limit of ${emp.max_applies_limit}.`,
                        }, { status: 403 });
                    }
                }
            }
        }


        // 2. Resolve user_pk
        const isNumericUser = typeof userId === 'string' ? /^\d+$/.test(userId) : typeof userId === 'number';
        let userQuery = supabaseAdmin.from('jobseekers').select('id, plan_type');
        
        if (isNumericUser) {
            userQuery = userQuery.eq('id', parseInt(userId as string));
        } else if (typeof userId === 'string' && userId.includes('-')) {
            userQuery = userQuery.eq('uuid', userId);
        } else {
            return NextResponse.json({ error: 'Invalid User ID format' }, { status: 400 });
        }

        const { data: userProfile } = await userQuery.maybeSingle();

        if (!userProfile) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        const { data: existing, error: checkError } = await supabaseAdmin
            .from('applications')
            .select('id')
            .eq('job_pk', job.id)
            .eq('user_pk', userProfile.id)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ error: 'You have already applied for this job' }, { status: 409 });
        }

        // 2.1 Max 2 referrals per employee-jobseeker pair in 30 days
        if (job.is_referral && job.employee_pk && userProfile.id) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Fetch other applications for this user that were referred by the same employee in the last 30 days
            // (We count anyone who reached status 4 - Unlocked or further)
            const { data: pairApps } = await supabaseAdmin
                .from('applications')
                .select('id, jobs!job_pk(employee_pk)')
                .eq('user_pk', userProfile.id)
                .gte('updated_at', thirtyDaysAgo.toISOString())
                .in('status_id', [4, 5, 6, 7, 8, 9, 10]);

            const sameEmployeeCount = pairApps?.filter((a: any) => a.jobs?.employee_pk === job.employee_pk).length || 0;

            if (sameEmployeeCount >= 2) {
                return NextResponse.json({ 
                    error: 'You’ve reached the referral limit with this employee. Try other employees or apply to different jobs.' 
                }, { status: 403 });
            }
        }

        // 3. Plan Limits Enforcement for Referral Jobs
        if (job.is_referral) {
            const { getPlanLimits } = await import('@/lib/plan-limits');
            const limits = getPlanLimits(userProfile.plan_type);

            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            // Check Monthly Referral Applies
            const { data: monthApps } = await supabaseAdmin
                .from('applications')
                .select('id, jobs!inner(is_referral)')
                .eq('user_pk', userProfile.id)
                .gte('applied_at', startOfMonth.toISOString())
                .eq('jobs.is_referral', true);
            
            const monthlyAppliesCount = monthApps ? monthApps.length : 0;
            if (monthlyAppliesCount >= limits.referralAppliesPerMonth) {
                return NextResponse.json({ 
                    error: `You have reached your limit of ${limits.referralAppliesPerMonth} referral applications for this month. Upgrade your plan to apply for more referrals.` 
                }, { status: 403 });
            }

            // Check Active Pending Referrals
            const { data: pendingApps } = await supabaseAdmin
                .from('applications')
                .select('id, jobs!inner(is_referral)')
                .eq('user_pk', userProfile.id)
                .in('status_id', [1, 2, 3])
                .eq('jobs.is_referral', true);
                
            const activePendingCount = pendingApps ? pendingApps.length : 0;
            if (activePendingCount >= limits.activePendingReferrals) {
                return NextResponse.json({ 
                    error: `You have reached your limit of ${limits.activePendingReferrals} active pending referrals. Wait for some to be processed or upgrade your plan.` 
                }, { status: 403 });
            }
        }
        
        const newApplication = {
            job_pk: job.id,         // Internal BIGINT
            user_pk: userProfile.id, // Internal BIGINT
            status_id: 1,           // Default to 1 'Applied'
            applied_at: new Date().toISOString(),
            is_unlocked: false,
            proof_url: null,
            internal_referral_id: null
        };

        const { data: createdApp, error: insertError } = await supabaseAdmin
            .from('applications')
            .insert([newApplication])
            .select()
            .single();

        if (insertError) throw insertError;

        return NextResponse.json(createdApp, { status: 201 });

    } catch (e: any) {
        console.error('[API_APPLICATIONS_POST] Error:', e);
        return NextResponse.json({ error: 'Failed to submit application', details: e.message }, { status: 500 });
    }
}
