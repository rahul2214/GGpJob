import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { resolveResumeUrl } from '@/lib/resolve-resume';

const statusMap: { [key: number]: string } = {
    1: 'Applied',
    2: 'Profile Viewed',
    3: 'Not Suitable',
    4: 'Selected',
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
        
        // Applicant details (Joined from profiles)
        applicantName: profile.name,
        applicantEmail: profile.email,
        applicantHeadline: profile.headline,
        applicantId: profile.uuid,
        applicantSkills: applicantSkills,
        applicantResumeUrl: await resolveResumeUrl(profile.resume_url),
        
        // Job details (Joined from jobs)
        jobTitle: job.title,
        companyName: job.company_name,
    };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const jobId = searchParams.get('jobId');

    let query = supabaseAdmin
        .from('applications')
        .select(`
            *,
            jobseekers(*, jobseeker_skills(skills(id, name))),
            jobs(*)
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

    const { data: appDocs, error } = await query.order('applied_at', { ascending: false });

    if (error) throw error;

    // Resolve skill names for applicants in bulk
    const allSkillIds = Array.from(new Set(appDocs.flatMap(app => app.jobseekers?.skill_ids || [])));
    const { data: skillsData } = await supabaseAdmin
        .from('skills')
        .select('id, name')
        .in('id', allSkillIds);
    
    const skillMap = new Map(skillsData?.map(s => [s.id, s.name]) || []);

    const now = new Date();
    const applications = (await Promise.all(appDocs.map(async app => {
        // Check if application view is expired for this recruiter view
        if (jobId && app.jobs?.app_expires_at) {
            const expiry = new Date(app.jobs.app_expires_at);
            if (expiry < now) return null;
        }
        return await mapApplicationToFrontend(app, skillMap);
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
        let jobQuery = supabaseAdmin.from('jobs').select('id, uuid, app_expires_at, max_applies, employee_pk');

        
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

        // ── Employee total applications limit ─────────────────────────────────
        // If this job was posted by an employee, check their overall max_applies_limit
        // (total applications received across ALL their jobs this makes sure the
        //  employee doesn't exceed e.g. 100 total applications)
        if (job.employee_pk) {
            const { data: emp } = await supabaseAdmin
                .from('employees')
                .select('id, max_applies_limit')
                .eq('id', job.employee_pk)
                .maybeSingle();

            if (emp && emp.max_applies_limit && emp.max_applies_limit > 0) {
                // Count all apps across every job this employee has posted
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
        let userQuery = supabaseAdmin.from('jobseekers').select('id');
        
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

        // 3. Check for existing application
        const { data: existing, error: checkError } = await supabaseAdmin
            .from('applications')
            .select('id')
            .eq('job_pk', job.id)
            .eq('user_pk', userProfile.id)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ error: 'You have already applied for this job' }, { status: 409 });
        }
        
        const newApplication = {
            job_pk: job.id,         // Internal BIGINT
            user_pk: userProfile.id, // Internal BIGINT
            status_id: 1, // Default to 1 'Applied'
            applied_at: new Date().toISOString()
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
