import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';

// Initialize but handle missing keys gracefully later
const resend = new Resend(process.env.RESEND_API_KEY || 'missing_key');

const statusMap: { [key: number]: string } = {
    1: 'Applied',
    2: 'Profile Viewed',
    3: 'Not Suitable',
    4: 'Selected',
};

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { statusId } = await request.json();

    if (!statusId) {
      return NextResponse.json({ error: 'Status ID is required' }, { status: 400 });
    }

    // 1. Update the application status
    const { data: app, error: updateError } = await supabaseAdmin
      .from('applications')
      .update({ 
        status_id: statusId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, jobs(title), jobseekers(id, name, email)')
      .single();

    if (updateError || !app) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // 2. Extract info for notification and email
    const applicantPk = app.user_pk;
    const applicant = app.jobseekers;
    const jobTitle = app.jobs?.title || 'a job';

    let message = '';
    const sId = Number(statusId);
    switch (sId) {
      case 2: message = `Your profile was viewed for the ${jobTitle} position.`; break;
      case 3: message = `Your application for ${jobTitle} was reviewed. The company decided to move forward with other candidates at this time.`; break;
      case 4: message = `Congratulations! You have been selected for the ${jobTitle} position.`; break;
      default: message = `Your application status for ${jobTitle} has been updated.`;
    }

    // 3. Create a notification in Supabase
    await supabaseAdmin.from('notifications').insert({
      user_pk: applicantPk,
      message: message,
      type: 'application_status',
      job_pk: app.job_pk,
      created_at: new Date().toISOString(),
    });

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

    return NextResponse.json({ ...app, statusName: statusMap[statusId] || 'N/A' }, { status: 200 });
  } catch (e: any) {
    console.error('[API_APP_STATUS] Error:', e);
    return NextResponse.json({ error: 'Failed to update application status', details: e.message }, { status: 500 });
  }
}
