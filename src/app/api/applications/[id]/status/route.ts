import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';
import { awardXP } from '@/lib/gamification-logic';
import { checkForFraud } from '@/lib/fraud-detection';
import { updateTrustScore } from '@/lib/trust-logic';

// Initialize but handle missing keys gracefully later
const resend = new Resend(process.env.RESEND_API_KEY || 'missing_key');

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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { statusId, proofUrl, internalReferralId, requesterRole } = body;

    if (!statusId) {
      return NextResponse.json({ error: 'Status ID is required' }, { status: 400 });
    }

    const sId = Number(statusId);

    // 0. Resolve the numeric PK if a UUID is provided
    let targetPk = params.id;
    if (params.id.includes('-')) {
        const { data: resolvedApp } = await supabaseAdmin
            .from('applications')
            .select('id')
            .eq('uuid', params.id)
            .maybeSingle();
        if (resolvedApp) targetPk = resolvedApp.id.toString();
    }

    // 0.1 Fetch application data
    const { data: appData } = await supabaseAdmin
        .from('applications')
        .select('job_pk, status_id, is_unlocked, user_pk, unlocked_at')
        .eq('id', targetPk)
        .single();

    if (!appData) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // 0.15 Disallow rejection if unlocked
    if (sId === 12 && (appData.is_unlocked || appData.status_id >= 4)) {
        const isEmployee = requesterRole === 'Employee' || requesterRole === 'employee' || !requesterRole;
        if (isEmployee) {
            return NextResponse.json({ error: 'You cannot reject a candidate after they have unlocked the job referral.' }, { status: 403 });
        }
    }

    // 0.2 Enforce Selection/Referral Limits
    let needsCreditDeduction = false;
    if (sId === 3 || sId === 4 || sId === 5) {
        if (appData) {
            if (sId === 3) {
                // Limit for selection interest: 5
                const { count: selectedCount } = await supabaseAdmin
                  .from('applications')
                  .select('id', { count: 'exact', head: true })
                  .eq('job_pk', appData.job_pk)
                  .in('status_id', [3, 4, 5, 6, 7, 8, 9, 10]);

                if ((selectedCount || 0) >= 5) {
                  return NextResponse.json({ error: 'Selection Capacity Reached! You can only select up to 5 candidates for this role.' }, { status: 403 });
                }
            } else if (sId === 4) {
                // Limit for candidate acceptance: FIRST 3 (First come first served)
                // We count those who have already unlocked or are referred/joined
                const { count: acceptedCount } = await supabaseAdmin
                    .from('applications')
                    .select('id', { count: 'exact', head: true })
                    .eq('job_pk', appData.job_pk)
                    .in('status_id', [4, 5, 6, 7, 8, 9, 10]);

                if ((acceptedCount || 0) >= 3) {
                    return NextResponse.json({ error: 'Sorry! The referral slots for this job have already been filled by other candidates. Only the first 3 to accept are eligible.' }, { status: 403 });
                }

                // Jobseeker Monthly Unlock Limit & Credit Deductions
                const { data: jobseekerProfile } = await supabaseAdmin
                    .from('jobseekers')
                    .select('id, credits, plan_type')
                    .eq('id', appData.user_pk)
                    .single();

                if (jobseekerProfile) {
                    const { getPlanLimits } = await import('@/lib/plan-limits');
                    const limits = getPlanLimits(jobseekerProfile.plan_type);

                    const startOfMonth = new Date();
                    startOfMonth.setDate(1);
                    startOfMonth.setHours(0, 0, 0, 0);

                    const { count: monthlyUnlocks } = await supabaseAdmin
                        .from('applications')
                        .select('id', { count: 'exact', head: true })
                        .eq('user_pk', appData.user_pk)
                        .gte('unlocked_at', startOfMonth.toISOString());

                    const unlocksUsed = monthlyUnlocks || 0;
                    
                    if (unlocksUsed >= limits.referralUnlocksPerMonth) {
                        if ((jobseekerProfile.credits || 0) < 2) {
                             return NextResponse.json({ 
                                error: `You have exhausted your ${limits.referralUnlocksPerMonth} monthly free unlocks and have 0 credits. Upgrade your plan or buy credits to unlock more.` 
                             }, { status: 403 });
                        } else {
                            needsCreditDeduction = true;
                        }
                    }
                }
            } else if (sId === 5) {
                // Limit for formal referral: 3
                if (!appData.is_unlocked) {
                    return NextResponse.json({ error: 'You can only refer candidates after they have accepted/unlocked the referral.' }, { status: 403 });
                }

                const { count: referredCount } = await supabaseAdmin
                  .from('applications')
                  .select('id', { count: 'exact', head: true })
                  .eq('job_pk', appData.job_pk)
                  .in('status_id', [5, 6, 7, 8, 9, 10]);

                if ((referredCount || 0) >= 3) {
                  return NextResponse.json({ error: 'Referral Limit Reached! You can only refer up to 3 candidates for this role.' }, { status: 403 });
                }
            }
        }
    }

    // ── Status Verification & Payload ──────────────────────────────────────────
    let updatePayload: any = {
        status_id: sId,
        updated_at: new Date().toISOString(),
    };

    if (sId === 4) {
        updatePayload.is_unlocked = true;
        updatePayload.unlocked_at = new Date().toISOString();
    }

    let needsCreditRefund = false;
    if (sId === 12 && appData.is_unlocked) {
        updatePayload.is_unlocked = false;
        needsCreditRefund = true;
    }

    if (sId === 5 || sId === 9) { // 5: Referred, 9: Joined Company
        if (!proofUrl) {
            return NextResponse.json({ error: 'Proof of action (screenshot/email) is required to proceed' }, { status: 400 });
        }
        updatePayload.proof_url = proofUrl;
        
        // If Employee marks as Referred/Joined, it's pending for Jobseeker to verify
        // If Jobseeker marks (unlikely for 5/9 but handled), it's pending for Employee
        const isJobseeker = requesterRole === 'Job Seeker' || requesterRole === 'jobseeker';
        updatePayload.verification_status = isJobseeker ? 'pending_employee' : 'pending_jobseeker';
        
        updatePayload.proof_uploaded_at = new Date().toISOString();
        
        // Calculate response speed when status transitions to 5 (Referred)
        if (sId === 5 && appData?.unlocked_at) {
            const unlockedTime = new Date(appData.unlocked_at).getTime();
            const nowTime = new Date().getTime();
            updatePayload.response_time_seconds = Math.max(0, Math.floor((nowTime - unlockedTime) / 1000));
        }

        if (internalReferralId) {
            updatePayload.internal_referral_id = internalReferralId;
        }

        // Set expiry for 7 days from now for admin verification fallback
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 7);
        updatePayload.verification_expires_at = expiry.toISOString();
    }
    
    if (sId === 6 || sId === 7) {
        const isJobseeker = requesterRole === 'Job Seeker' || requesterRole === 'jobseeker';
        updatePayload.verification_status = isJobseeker ? 'pending_employee' : 'pending_jobseeker';
        
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 7);
        updatePayload.verification_expires_at = expiry.toISOString();
    }

    // 1. Update the application status
    const { data: app, error: updateError } = await supabaseAdmin
      .from('applications')
      .update(updatePayload)
      .eq('id', targetPk)
      .select('*, jobs(title, employee_pk), jobseekers(id, name, email)')
      .single();

    if (updateError) {
        console.error('[API_APP_STATUS] Update Error:', updateError);
        return NextResponse.json({ error: updateError.message || 'Failed to update application' }, { status: 400 });
    }
    
    if (!app) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // 2. Extract info for notification and email
    const applicantPk = app.user_pk;
    const applicant = app.jobseekers;
    const jobTitle = app.jobs?.title || 'a job';

    let message = '';
    switch (sId) {
      case 2: message = `Your profile is now under review for ${jobTitle}.`; break;
      case 3: message = `Great news! An employee from the company is interested in referring you for ${jobTitle}. Check your dashboard to unlock this referral.`; break;
      case 4: message = `Referral unlocked! Your contact details are now visible to the referring employee.`; break;
      case 5: message = `Your referral for ${jobTitle} has been submitted internally!`; break;
      case 6: message = `You've been invited for an interview for ${jobTitle}. Good luck!`; break;
      case 7: message = `Congratulations! You've received an offer for ${jobTitle}!`; break;
      case 8: message = `Please confirm if you have joined the company for ${jobTitle}.`; break;
      case 9: message = `Welcome to the team! Your hire for ${jobTitle} is being verified.`; break;
      case 11: message = `There is a dispute regarding your referral for ${jobTitle}. Admin is reviewing.`; break;
      case 12: message = `Your application for ${jobTitle} decided to move forward with other candidates.`; break;
      case 13: message = `Your referral for ${jobTitle} has been verified by JobsDart!`; break;
      default: message = `Your application status for ${jobTitle} has been updated to ${statusMap[sId] || 'a new stage'}.`;
    }

    // 3. Create a notification for the OTHER party
    const employeePk = app.jobs?.employee_pk;
    const isJobseekerAction = requesterRole === 'Job Seeker' || requesterRole === 'jobseeker';

    if (isJobseekerAction && employeePk) {
        // Notify Employee if Jobseeker initiated
        await supabaseAdmin.from('notifications').insert({
          user_pk: employeePk,
          message: `Candidate ${applicant?.name || 'User'} marked the application for ${jobTitle} as ${statusMap[sId] || 'updated'}. Please verify.`,
          type: 'application_status',
          job_pk: app.job_pk,
          created_at: new Date().toISOString(),
        });
    } else if (!isJobseekerAction && applicantPk) {
        // Notify Jobseeker if Employee initiated (original behavior)
        await supabaseAdmin.from('notifications').insert({
          user_pk: applicantPk,
          message: message,
          type: 'application_status',
          job_pk: app.job_pk,
          created_at: new Date().toISOString(),
        });
    }

async function deductCredits(jobseekerId: string, amount: number, jobPk?: number) {
    if (!jobseekerId) {
        console.error('[API_APP_STATUS] Cannot deduct credits: jobseekerId is undefined');
        return;
    }
    
    // Use the RPC for consistent dual-credit handling
    const { data: consumeResult, error: deductError } = await supabaseAdmin.rpc('consume_credits', {
        p_user_id: jobseekerId,
        p_amount: amount
    });

    if (deductError || !consumeResult?.success) {
        console.error('[API_APP_STATUS] Credit deduction error:', deductError || consumeResult?.error);
        return;
    }
            
    await supabaseAdmin.from('notifications').insert({
        user_pk: jobseekerId,
        message: `Spent ${amount} credit(s) to unlock your referral for this job.`,
        type: 'credit_deduction',
        job_pk: jobPk,
        created_at: new Date().toISOString()
    });
}

async function refundCredits(jobseekerId: string | number, amount: number, jobPk?: number) {
    if (!jobseekerId) {
        console.error('[API_APP_STATUS] Cannot refund credits: jobseekerId is undefined');
        return;
    }
    
    console.log(`[API_APP_STATUS] Refunding ${amount} credits to jobseeker ${jobseekerId}`);
    const { error: rpcError } = await supabaseAdmin.rpc('add_purchased_credits', {
        p_user_id: Number(jobseekerId),
        p_amount: amount
    });

    if (rpcError) {
        console.error('[API_APP_STATUS] RPC add_purchased_credits failed during refund, falling back to manual update:', rpcError);
        const { data: currentData } = await supabaseAdmin
            .from('jobseekers')
            .select('purchased_credits')
            .eq('id', jobseekerId)
            .single();

        await supabaseAdmin
            .from('jobseekers')
            .update({
                purchased_credits: (currentData?.purchased_credits || 0) + amount,
                updated_at: new Date().toISOString()
            })
            .eq('id', jobseekerId);
    }
            
    await supabaseAdmin.from('notifications').insert({
        user_pk: jobseekerId,
        message: `Refunded ${amount} credit(s) because your unlocked application was not shortlisted by the referrer.`,
        type: 'credit_refund',
        job_pk: jobPk,
        created_at: new Date().toISOString()
    });
}

    // ── Employee Rewards & Penalties ─────────────────────────────────────
    if (app.jobs?.employee_pk) {
        const empId = app.jobs.employee_pk;
        const jobPk = app.job_pk;
        
        try {
            if (sId === 4) { // Referral Unlocked (Candidate accepted selection)
                await checkForFraud(empId, applicantPk, jobPk);
                await awardXP(empId, 'CANDIDATE_ACCEPTED', jobPk);
                if (needsCreditDeduction) {
                    await deductCredits(applicantPk, 2, jobPk);
                }
            } else if (sId === 13 || sId === 10) { // 13: Verified Referral, 10: Completed
                await awardXP(empId, 'REFERRAL_VERIFIED', jobPk);
            } else if (sId === 11) { // Disputed (Penalty)
                // Penalties: Use Trust System
                await updateTrustScore(empId, 'FAKE_ACTIVITY', 'Submission disputed by Admin');
                
                await supabaseAdmin.from('notifications').insert({
                    user_pk: empId,
                    message: `Verification Failed. Submission disputed by Admin. Trust score reduced.`,
                    type: 'penalty',
                    job_pk: jobPk,
                    created_at: new Date().toISOString(),
                });
            }
        } catch (gamifyErr) {
            console.error('[API_APP_STATUS] Gamification Error:', gamifyErr);
        }
    }

    if (needsCreditRefund && applicantPk) {
        await refundCredits(applicantPk, 2, app.job_pk);
    }

    // 4. Send Resend Email (only for meaningful status changes: Selected or Not Suitable)
    if (applicant?.email && process.env.RESEND_API_KEY && (sId === 3 || sId === 4)) {
        try {
            console.log(`[API_APP_STATUS] Sending status email via Resend to ${applicant.email} (status: ${sId})`);
            const fromEmail = process.env.RESEND_FROM_EMAIL || 'info@jobsdart.in';
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.jobsdart.in';
            
            const isSelected = sId === 4;
            const statusColor = isSelected ? '#10b981' : '#ef4444';
            const statusBg = isSelected ? '#ecfdf5' : '#fef2f2';
            const statusBorder = isSelected ? '#6ee7b7' : '#fca5a5';
            const statusIcon = isSelected ? '🎉' : '📋';
            const emailSubject = isSelected
              ? `Congratulations! You've been selected for ${jobTitle}`
              : `Update on your application for ${jobTitle}`;

            await resend.emails.send({
                from: `JobsDart <${fromEmail}>`,
                to: [applicant.email],
                subject: emailSubject,
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </head>
                <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
                    <tr>
                      <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
                          
                          <!-- Header -->
                          <tr>
                            <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:32px 40px;text-align:center;">
                              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;">JobsDart</h1>
                              <p style="color:#c7d2fe;margin:6px 0 0;font-size:13px;">Your career, accelerated.</p>
                            </td>
                          </tr>

                          <!-- Status Badge -->
                          <tr>
                            <td style="padding:32px 40px 0;">
                              <div style="background:${statusBg};border:1px solid ${statusBorder};border-radius:12px;padding:16px 20px;display:inline-block;width:100%;box-sizing:border-box;">
                                <p style="margin:0;font-size:16px;font-weight:700;color:${statusColor};">
                                  ${statusIcon} ${isSelected ? 'Application Accepted — Selected!' : 'Application Status Update'}
                                </p>
                              </div>
                            </td>
                          </tr>

                          <!-- Body -->
                          <tr>
                            <td style="padding:24px 40px 32px;">
                              <h2 style="color:#1e293b;font-size:20px;font-weight:700;margin:0 0 12px;">
                                Hi ${applicant.name || 'there'} 👋
                              </h2>
                              <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
                                ${message}
                              </p>

                              <!-- Job Card -->
                              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin-bottom:28px;">
                                <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Position</p>
                                <p style="margin:0;font-size:16px;font-weight:700;color:#1e293b;">${jobTitle}</p>
                              </div>

                              ${isSelected ? `
                              <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
                                The recruiter will reach out to you soon with next steps. In the meantime, log in to your dashboard to review your application details.
                              </p>` : `
                              <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
                                Don't be discouraged — there are many more opportunities waiting for you. Keep your profile updated and apply to more matching roles.
                              </p>`}

                              <div style="text-align:center;margin:8px 0 0;">
                                <a href="${appUrl}/profile" 
                                   style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:13px 32px;border-radius:10px;">
                                  View My Dashboard →
                                </a>
                              </div>
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                            <td style="background:#f1f5f9;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                              <p style="color:#94a3b8;font-size:12px;margin:0;">
                                © ${new Date().getFullYear()} JobsDart. All rights reserved.<br/>
                                <a href="${appUrl}" style="color:#6366f1;text-decoration:none;">jobsdart.in</a>
                              </p>
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                `,
            });
            console.log(`[API_APP_STATUS] Email sent successfully to ${applicant.email}`);
        } catch (err) {
            console.error('[API_APP_STATUS] Resend Email error:', err);
        }
    }

    return NextResponse.json({ 
        ...app, 
        statusId: sId,
        statusName: statusMap[sId] || 'N/A',
        isUnlocked: app.is_unlocked,
        verificationStatus: app.verification_status
    }, { status: 200 });
  } catch (e: any) {
    console.error('[API_APP_STATUS] Error:', e);
    return NextResponse.json({ error: 'Failed to update application status', details: e.message }, { status: 500 });
  }
}
