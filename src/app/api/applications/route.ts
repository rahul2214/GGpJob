
import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, addDoc, serverTimestamp, DocumentData } from 'firebase/firestore';
import { db } from '@/firebase/admin-config';
import { FieldValue } from 'firebase-admin/firestore';
import type { Application, User, Job, Skill } from '@/lib/types';


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
    const jobId = searchParams.get('jobId');

    const applicationsRef = db.collection('applications');
    let q: FirebaseFirestore.Query<DocumentData> = applicationsRef;

    if (userId) {
      q = q.where('userId', '==', userId);
    }
    if (jobId) {
      q = q.where('jobId', '==', jobId);
    }

    const querySnapshot = await q.get();

    const appDocs = querySnapshot.docs.map(doc => ({ ...(doc.data() as Application), id: doc.id }));
    
    // 1. Gather distinct user and job IDs
    const uniqueUserIds = [...new Set(appDocs.map(app => app.userId).filter(Boolean))];
    const uniqueJobIds = [...new Set(appDocs.map(app => app.jobId).filter(Boolean))];

    // 2. Fetch Users and Jobs in bulk (eliminates N roundtrips)
    const usersMap = new Map<string, User>();
    const jobsMap = new Map<string, Job>();
    
    if (uniqueUserIds.length > 0) {
        const userRefs = uniqueUserIds.map(id => db.collection('users').doc(id as string));
        const userDocs = await db.getAll(...userRefs);
        userDocs.forEach(doc => {
            if (doc.exists) usersMap.set(doc.id, { id: doc.id, ...doc.data() } as User);
        });
    }

    if (uniqueJobIds.length > 0) {
        const jobRefs = uniqueJobIds.map(id => db.collection('jobs').doc(id as string));
        const jobDocs = await db.getAll(...jobRefs);
        jobDocs.forEach(doc => {
            if (doc.exists) jobsMap.set(doc.id, { id: doc.id, ...doc.data() } as Job);
        });
    }

    // 3. Fetch Skills in bulk for unique users
    const skillsPromises = uniqueUserIds.map(async (userId) => {
        const skillsSnap = await db.collection('users').doc(userId as string).collection('skills').get();
        if (!skillsSnap.empty) {
            return { userId, skills: skillsSnap.docs.map(doc => (doc.data() as Skill).name).join(', ') };
        }
        return { userId, skills: '' };
    });
    const skillsResults = await Promise.all(skillsPromises);
    const skillsMap = new Map(skillsResults.map(s => [s.userId, s.skills]));

    // 4. Construct final payload
    const applications = appDocs.map(appData => {
        const applicant = appData.userId ? usersMap.get(appData.userId) : null;
        const job = appData.jobId ? jobsMap.get(appData.jobId) : null;
        const skills = appData.userId ? skillsMap.get(appData.userId) || '' : '';
        const statusName = statusMap[appData.statusId] || 'Applied';
        
        return {
          ...appData,
          appliedAt: (appData.appliedAt as any).toDate ? (appData.appliedAt as any).toDate().toISOString() : new Date(appData.appliedAt).toISOString(),
          applicantName: applicant?.name,
          applicantEmail: applicant?.email,
          applicantHeadline: applicant?.headline,
          applicantId: applicant?.id,
          applicantSkills: skills,
          applicantResumeUrl: applicant?.resumeUrl,
          jobTitle: job?.title,
          companyName: job?.companyName,
          statusName,
        };
    });

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

        const applicationsRef = db.collection('applications');
        const q = applicationsRef.where('jobId', '==', jobId).where('userId', '==', userId);
        const existingApplication = await q.get();

        if (!existingApplication.empty) {
            return NextResponse.json({ error: 'You have already applied for this job' }, { status: 409 });
        }
        
        const applicationStatuses = await db.collection('application_statuses').where('name', '==', 'Applied').limit(1).get();
        const appliedStatus = applicationStatuses.docs[0];

        const newApplication = {
            jobId,
            userId,
            statusId: appliedStatus ? appliedStatus.data().id : 1, // Default to 1 'Applied'
            appliedAt: FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection('applications').add(newApplication);

        return NextResponse.json({ id: docRef.id, ...newApplication }, { status: 201 });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }
}
