
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import type { Application, Job } from '@/lib/types';
import type { firestore as adminFirestore } from 'firebase-admin';

const statusMap: { [key: number]: string } = {
    1: 'Applied',
    2: 'Profile Viewed',
    3: 'Not Suitable',
    4: 'Selected',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Find applications where the status has been updated (not just 'Applied')
    const applicationsRef = db.collection('applications');
    // We look for statuses 2 (Viewed), 3 (Not Suitable), and 4 (Selected)
    const q = applicationsRef.where('userId', '==', userId).where('statusId', 'in', [2, 3, 4]);

    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
        return NextResponse.json([]);
    }

    let notifications = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
            const appData = doc.data() as Application & { 
                viewedAt?: adminFirestore.Timestamp; 
                updatedAt?: adminFirestore.Timestamp;
                appliedAt?: adminFirestore.Timestamp;
            };

            let jobTitle = 'a job';
            if (appData.jobId) {
                const jobDoc = await db.collection('jobs').doc(appData.jobId).get();
                if (jobDoc.exists) {
                    jobTitle = (jobDoc.data() as Job).title;
                }
            }

            // Create a specific message based on status
            let message = '';
            switch (appData.statusId) {
                case 2: message = `Your profile was viewed for the ${jobTitle} position.`; break;
                case 3: message = `Your application for ${jobTitle} was reviewed. The company decided to move forward with other candidates at this time.`; break;
                case 4: message = `Congratulations! You have been selected for the ${jobTitle} position.`; break;
                default: message = `Your application status for ${jobTitle} has been updated.`;
            }

            // Fallback for timestamp
            const ts = appData.updatedAt || appData.viewedAt || appData.appliedAt;

            return {
                id: doc.id,
                jobId: appData.jobId,
                jobTitle: jobTitle,
                message: message,
                statusName: statusMap[appData.statusId],
                timestamp: ts ? ts.toDate().toISOString() : new Date().toISOString(),
            };
        })
    );
    
    // Sort notifications by timestamp in descending order
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return NextResponse.json(notifications);

  } catch (e: any) {
    console.error('[API_NOTIFICATIONS_GET] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch notifications', details: e.message }, { status: 500 });
  }
}
