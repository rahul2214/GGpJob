
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import { FieldValue } from 'firebase-admin/firestore';

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
