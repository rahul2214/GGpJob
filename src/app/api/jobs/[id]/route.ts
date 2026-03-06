
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import type { Job } from '@/lib/types';
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
    const locIds = jobData.locationIds || (jobData.locationId ? [jobData.locationId] : []);

    // Fetch locations
    const locationsPromises = locIds.map(locId => 
        db.collection('locations').where('id', '==', parseInt(locId)).limit(1).get()
    );

    const lookupPromises = [];
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
    if (jobData.domainId) {
        lookupPromises.push(db.collection('domains').doc(jobData.domainId).get());
    } else {
        lookupPromises.push(Promise.resolve(null));
    }
    
    const applicantsPromise = db.collection('applications').where('jobId', '==', id).count().get();

    const [locationSnaps, typeSnap, workplaceTypeSnap, domainDoc, applicantsSnap] = await Promise.all([
        Promise.all(locationsPromises),
        ...lookupPromises,
        applicantsPromise
    ]);

    const locNames = locationSnaps.map(snap => (snap && !snap.empty) ? snap.docs[0].data().name : '').filter(Boolean);
    const minExp = jobData.minExperience ?? 0;
    const maxExp = jobData.maxExperience ?? 0;

    const job: Job = {
        id: jobDoc.id,
        ...jobData,
        location: locNames.join(', ') || 'N/A',
        locations: locNames,
        type: (typeSnap && !typeSnap.empty) ? typeSnap.docs[0].data().name : '',
        workplaceType: (workplaceTypeSnap && !workplaceTypeSnap.empty) ? workplaceTypeSnap.docs[0].data().name : '',
        experienceLevel: minExp === maxExp ? `${minExp} Years` : `${minExp} - ${maxExp} Years`,
        domain: (domainDoc && domainDoc.exists) ? (domainDoc as adminFirestore.DocumentSnapshot).data()?.name : '',
        applicantCount: applicantsSnap.data().count,
    };

    const response = NextResponse.json(job);
    
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

        // Ensure compatibility
        if (updatedJobData.locationIds && updatedJobData.locationIds.length > 0) {
            updatedJobData.locationId = updatedJobData.locationIds[0];
        }

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
