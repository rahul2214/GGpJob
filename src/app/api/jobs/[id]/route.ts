
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import type { Job, Domain } from '@/lib/types';
import type { firestore as adminFirestore } from 'firebase-admin';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    
    const jobDoc = await db.collection('jobs').doc(id).get();

    if (!jobDoc.exists) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const jobData = jobDoc.data() as Job;

    // Efficiently fetch only the specific lookup documents needed.
    const lookupPromises = [];

    if (jobData.locationId) {
        lookupPromises.push(db.collection('locations').where('id', '==', parseInt(jobData.locationId)).limit(1).get());
    } else {
        lookupPromises.push(Promise.resolve(null));
    }
    if (jobData.jobTypeId) {
        lookupPromises.push(db.collection('job_types').where('id', '==', parseInt(jobData.jobTypeId)).limit(1).get());
    } else {
        lookupPromises.push(Promise.resolve(null));
    }
    if (jobData.workplaceTypeId) {
        lookupPromises.push(db.collection('workplace_types').where('id', '==', parseInt(jobData.workplaceTypeId)).limit(1).get());
    } else {
        lookupPromises.push(Promise.resolve(null));
    }
    if (jobData.experienceLevelId) {
        lookupPromises.push(db.collection('experience_levels').where('id', '==', parseInt(jobData.experienceLevelId)).limit(1).get());
    } else {
        lookupPromises.push(Promise.resolve(null));
    }
    if (jobData.domainId) {
        lookupPromises.push(db.collection('domains').doc(jobData.domainId).get());
    } else {
        lookupPromises.push(Promise.resolve(null));
    }
    
    const [locationSnap, typeSnap, workplaceTypeSnap, experienceLevelSnap, domainDoc] = await Promise.all(lookupPromises);

    const job: Job = {
        id: jobDoc.id,
        ...jobData,
        location: (locationSnap && !locationSnap.empty) ? locationSnap.docs[0].data().name : '',
        type: (typeSnap && !typeSnap.empty) ? typeSnap.docs[0].data().name : '',
        workplaceType: (workplaceTypeSnap && !workplaceTypeSnap.empty) ? workplaceTypeSnap.docs[0].data().name : '',
        experienceLevel: (experienceLevelSnap && !experienceLevelSnap.empty) ? experienceLevelSnap.docs[0].data().name : '',
        domain: (domainDoc && domainDoc.exists) ? (domainDoc as adminFirestore.DocumentSnapshot).data()?.name : '',
    };

    const response = NextResponse.json(job);
    
    // Don't cache if we're in admin or edit mode
    if (searchParams.get('fresh') !== 'true') {
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    }
    
    return response;

  } catch (e: any) {
    console.error('[API_JOB_ID_GET] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch job', details: e.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const updatedJobData = await request.json();
        const jobDocRef = db.collection('jobs').doc(id);

        // Ensure we don't try to overwrite the id
        delete updatedJobData.id;

        await jobDocRef.update(updatedJobData);

        const updatedDoc = await jobDocRef.get();
        const updatedJob = { id: updatedDoc.id, ...updatedDoc.data() };
        
        return NextResponse.json(updatedJob, { status: 200 });

    } catch (e: any) {
        console.error('[API_JOB_ID_PUT] Error:', e);
        return NextResponse.json({ error: 'Failed to update job', details: e.message }, { status: 500 });
    }
}


export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        
        // Before deleting the job, we might need to delete related applications.
        // For simplicity now, we just delete the job. A production app would handle this more robustly.
        const applicationsSnapshot = await db.collection('applications').where('jobId', '==', id).get();
        const batch = db.batch();
        applicationsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        await db.collection('jobs').doc(id).delete();

        return NextResponse.json({ message: 'Job and related applications deleted successfully' }, { status: 200 });
    } catch (e: any) {
        console.error('[API_JOB_ID_DELETE] Error:', e);
        return NextResponse.json({ error: 'Failed to delete job', details: e.message }, { status: 500 });
    }
}
