import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';
import { requireAuth } from '@/lib/auth-server';

// Initialize but handle missing keys gracefully later
const resend = new Resend(process.env.RESEND_API_KEY || 'missing_key');

const statusMap: { [key: number]: string } = {
    1: 'Applied',
    2: 'Under Review',
    3: 'Selected',
    6: 'Interviewing',
    7: 'Offer Received',
    8: 'Pending Confirmation',
    9: 'Joined Company',
    10: 'Completed',
    12: 'Rejected'
};

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { statusId, requesterRole } = body;

    if (!statusId) {
      return NextResponse.json({ error: 'Status ID is required' }, { status: 400 });
    }

    const sId = Number(statusId);

    // 0. Resolve numeric PK if UUID provided
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
        .select('id, job_pk, status_id, user_pk')
        .eq('id', targetPk)
        .single();

    if (!appData) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Status Update Payload
    let updatePayload: any = {
        status_id: sId,
        updated_at: new Date().toISOString(),
    };

    // 1. Update application status
    let { data: app, error: updateError } = await supabaseAdmin
      .from('applications')
      .update(updatePayload)
      .eq('id', targetPk)
      .select('*, jobs(title, recruiter_pk), jobseekers(id, name, email)')
      .single();

    if (updateError && updateError.code === '42703') {
        const corePayload = {
            status_id: sId,
            updated_at: new Date().toISOString()
        };
        const fallbackRes = await supabaseAdmin
          .from('applications')
          .update(corePayload)
          .eq('id', targetPk)
          .select('*, jobs(title, recruiter_pk), jobseekers(id, name, email)')
          .single();
        app = fallbackRes.data;
        updateError = fallbackRes.error;
    }

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
      case 3: message = `Great news! You have been selected by the recruiter for ${jobTitle}.`; break;
      case 6: message = `You've been invited for an interview for ${jobTitle}. Good luck!`; break;
      case 7: message = `Congratulations! You've received an offer for ${jobTitle}!`; break;
      case 8: message = `Please confirm if you have joined the company for ${jobTitle}.`; break;
      case 9: message = `Welcome to the team! Your hire for ${jobTitle} is being processed.`; break;
      case 12: message = `Your application for ${jobTitle} decided to move forward with other candidates.`; break;
      default: message = `Your application status for ${jobTitle} has been updated to ${statusMap[sId] || 'a new stage'}.`;
    }

    // 3. Create a notification for the applicant or recruiter
    const recruiterPk = app.jobs?.recruiter_pk;
    const isJobseekerAction = requesterRole === 'Job Seeker' || requesterRole === 'jobseeker';

    if (isJobseekerAction && recruiterPk) {
        await supabaseAdmin.from('notifications').insert({
          user_pk: recruiterPk,
          message: `Candidate ${applicant?.name || 'User'} marked the application for ${jobTitle} as ${statusMap[sId] || 'updated'}.`,
          type: 'application_status',
          job_pk: app.job_pk,
          created_at: new Date().toISOString(),
        });
    } else if (!isJobseekerAction && applicantPk) {
        await supabaseAdmin.from('notifications').insert({
          user_pk: applicantPk,
          message: message,
          type: 'application_status',
          job_pk: app.job_pk,
          created_at: new Date().toISOString(),
        });
    }

    // 4. Send Resend Email (only for meaningful status changes: Selected or Rejected)
    if (applicant?.email && process.env.RESEND_API_KEY && (sId === 3 || sId === 4 || sId === 12)) {
        try {
            console.log(`[API_APP_STATUS] Sending status email via Resend to ${applicant.email} (status: ${sId})`);
            const fromEmail = process.env.RESEND_FROM_EMAIL || 'info@jobsdart.in';
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.jobsdart.in';
            
            const isSelected = sId === 3 || sId === 4;
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
                                  ${statusIcon} ${isSelected ? 'Application Selected!' : 'Application Status Update'}
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
