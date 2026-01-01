
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

    // Find applications where the profile has been viewed
    const applicationsRef = db.collection('applications');
    // Removed .orderBy('viewedAt', 'desc') to prevent missing index error.
    // Sorting will be handled in the code after fetching.
    const q = applicationsRef.where('userId', '==', userId).where('statusId', '==', 2);

    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
        return NextResponse.json([]);
    }

    let notifications = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
            const appData = doc.data() as Application & { viewedAt: adminFirestore.Timestamp };

            let jobTitle = 'a job';
            if (appData.jobId) {
                const jobDoc = await db.collection('jobs').doc(appData.jobId).get();
                if (jobDoc.exists) {
                    jobTitle = (jobDoc.data() as Job).title;
                }
            }

            return {
                id: doc.id,
                jobId: appData.jobId,
                jobTitle: jobTitle,
                statusName: statusMap[appData.statusId],
                timestamp: appData.viewedAt.toDate().toISOString(),
            };
        })
    );
    
    // Sort notifications by timestamp in descending order here
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return NextResponse.json(notifications);

  } catch (e: any) {
    console.error('[API_NOTIFICATIONS_GET] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch notifications', details: e.message }, { status: 500 });
  }
}
