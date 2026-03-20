
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import type { Application, Job } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';
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

    // 1. Fetch on-the-fly notifications from applications
    const applicationsRef = db.collection('applications');
    const q = applicationsRef.where('userId', '==', userId).where('statusId', 'in', [2, 3, 4]);
    const querySnapshot = await q.get();

    let appNotifications: any[] = [];
    if (!querySnapshot.empty) {
        appNotifications = await Promise.all(
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

                let message = '';
                switch (appData.statusId) {
                    case 2: message = `Your profile was viewed for the ${jobTitle} position.`; break;
                    case 3: message = `Your application for ${jobTitle} was reviewed. The company decided to move forward with other candidates at this time.`; break;
                    case 4: message = `Congratulations! You have been selected for the ${jobTitle} position.`; break;
                    default: message = `Your application status for ${jobTitle} has been updated.`;
                }

                const ts = appData.updatedAt || appData.viewedAt || appData.appliedAt;

                return {
                    id: doc.id,
                    userId,
                    jobId: appData.jobId,
                    jobTitle: jobTitle,
                    message: message,
                    statusName: statusMap[appData.statusId],
                    timestamp: ts ? ts.toDate().toISOString() : new Date().toISOString(),
                    type: 'application_status'
                };
            })
        );
    }

    // 2. Fetch persistent notifications from notifications collection
    const notificationsRef = db.collection('notifications');
    const notifSnapshot = await notificationsRef.where('userId', '==', userId).get();
    
    const persistentNotifications = notifSnapshot.docs.map(doc => {
        const data = doc.data();
        const ts = data.createdAt as adminFirestore.Timestamp;
        return {
            id: doc.id,
            ...data,
            timestamp: ts ? ts.toDate().toISOString() : new Date().toISOString(),
        };
    });

    // Merge and sort
    const allNotifications = [...appNotifications, ...persistentNotifications];
    allNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return NextResponse.json(allNotifications);

  } catch (e: any) {
    console.error('[API_NOTIFICATIONS_GET] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch notifications', details: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, message, type, ...rest } = body;

        if (!userId || !message) {
            return NextResponse.json({ error: 'User ID and message are required' }, { status: 400 });
        }

        const notificationData = {
            userId,
            message,
            type: type || 'generic',
            createdAt: FieldValue.serverTimestamp(),
            ...rest
        };

        const docRef = await db.collection('notifications').add(notificationData);
        
        return NextResponse.json({ id: docRef.id, ...notificationData }, { status: 201 });
    } catch (e: any) {
        console.error('[API_NOTIFICATIONS_POST] Error:', e);
        return NextResponse.json({ error: 'Failed to create notification', details: e.message }, { status: 500 });
    }
}
