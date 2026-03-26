import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import { FieldValue } from 'firebase-admin/firestore';
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

    const applicationRef = db.collection('applications').doc(id);

    // Check if the application exists
    const docSnap = await applicationRef.get();
    if (!docSnap.exists) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    await applicationRef.update({ 
      statusId,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create a notification for the job seeker
    const appDoc = await applicationRef.get();
    const appData = appDoc.data();
    
    if (appData) {
      const applicantId = appData.userId;
      console.log(`[API_APP_STATUS] Creating notification for user: ${applicantId}, statusId: ${statusId}`);
      
      let jobTitle = 'a job';
      if (appData.jobId) {
        const jobDoc = await db.collection('jobs').doc(appData.jobId).get();
        if (jobDoc.exists) {
          jobTitle = jobDoc.data()?.title || 'a job';
        }
      }

      let message = '';
      const sId = Number(statusId);
      switch (sId) {
        case 2: message = `Your profile was viewed for the ${jobTitle} position.`; break;
        case 3: message = `Your application for ${jobTitle} was reviewed. The company decided to move forward with other candidates at this time.`; break;
        case 4: message = `Congratulations! You have been selected for the ${jobTitle} position.`; break;
        default: message = `Your application status for ${jobTitle} has been updated.`;
      }

      console.log(`[API_APP_STATUS] Final message: "${message}"`);

      await db.collection('notifications').add({
        userId: applicantId,
        message: message,
        type: 'application_status',
        jobId: appData.jobId,
        createdAt: FieldValue.serverTimestamp(),
      });

      // --- SEND RESEND EMAIL ---
      try {
         const userDoc = await db.collection('users').doc(applicantId).get();
         if (userDoc.exists) {
            const userData = userDoc.data();
            if (userData && userData.email && process.env.RESEND_API_KEY) {
               console.log(`[API_APP_STATUS] Sending email via Resend to ${userData.email}`);
               
               // Use the verified domain email from env or default to Resend's testing sandbox if not set
               const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
               const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jobsdart.in/';
               
               const emailResponse = await resend.emails.send({
                 from: `Job Portal <${fromEmail}>`,
                 to: [userData.email],
                 subject: `Update on your application: ${jobTitle}`,
                 html: `
                   <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                      <h2 style="color: #4f46e5; margin-top: 0;">Application Status Update</h2>
                      <p style="font-size: 16px; line-height: 1.5;">Hi ${userData.name || 'Job Seeker'},</p>
                      <p style="font-size: 16px; line-height: 1.5; padding: 12px; background: #f8fafc; border-radius: 4px; border-left: 4px solid #4f46e5;">
                        ${message}
                      </p>
                      <p style="font-size: 14px; color: #64748b; margin-top: 24px;">Log in to your dashboard to view more details and track all your applications.</p>
                      <div style="margin: 32px 0; text-align: center;">
                        <a href="${appUrl}/login" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In to Dashboard</a>
                      </div>
                      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                      <p style="font-size: 12px; color: #94a3b8; margin: 0;">Best regards,<br/><strong>The Jobs Dart Team</strong></p>
                   </div>
                 `
               });
               
               if (emailResponse.error) {
                 console.error('[API_APP_STATUS] Resend API Error:', emailResponse.error);
               } else {
                 console.log('[API_APP_STATUS] Email sent successfully:', emailResponse.data);
               }
            } else {
               console.log('[API_APP_STATUS] Skipping email: Missing user email or RESEND_API_KEY not configured in environment.');
            }
         }
      } catch (err) {
         console.error('[API_APP_STATUS] Exception while trying to send email:', err);
      }
      // ------------------------

    }

    // Fetch the updated application along with the status name
    const updatedDoc = await applicationRef.get();
    const updatedData = updatedDoc.data();
    
    // Use the map to get the status name
    const statusName = statusMap[statusId] || 'N/A';

    return NextResponse.json({ ...updatedData, id: updatedDoc.id, statusName }, { status: 200 });
  } catch (e: any) {
    console.error('[API_APP_STATUS] Error:', e);
    return NextResponse.json({ error: 'Failed to update application status', details: e.message }, { status: 500 });
  }
}
