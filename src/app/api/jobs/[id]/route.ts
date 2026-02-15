
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import type { Job } from '@/lib/types';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Fetch job and all lookup tables in parallel for performance
    const [jobDoc, locationsSnap, typesSnap, workplaceTypesSnap, experienceLevelsSnap, domainsSnap] = await Promise.all([
        db.collection('jobs').doc(id).get(),
        db.collection('locations').get(),
        db.collection('job_types').get(),
        db.collection('workplace_types').get(),
        db.collection('experience_levels').get(),
        db.collection('domains').get(),
    ]);

    if (!jobDoc.exists) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const jobData = jobDoc.data() as Job;

    // Helper to create a map from a snapshot
    const createMapFromSnapshot = (snapshot: FirebaseFirestore.QuerySnapshot, keyField = 'id') => {
        const map = new Map();
        snapshot.forEach(doc => {
            const data = doc.data();
            map.set(String(data[keyField]), data);
        });
        return map;
    };
    
    const createDomainMap = (snapshot: FirebaseFirestore.QuerySnapshot) => {
        const map = new Map();
        snapshot.forEach(doc => {
            map.set(doc.id, doc.data());
        });
        return map;
    }

    // Create maps for efficient lookups in memory
    const locationMap = createMapFromSnapshot(locationsSnap);
    const typeMap = createMapFromSnapshot(typesSnap);
    const workplaceTypeMap = createMapFromSnapshot(workplaceTypesSnap);
    const experienceLevelMap = createMapFromSnapshot(experienceLevelsSnap);
    const domainMap = createDomainMap(domainsSnap);

    const job: Job = {
        id: jobDoc.id,
        ...jobData,
        location: locationMap.get(String(jobData.locationId))?.name || '',
        type: typeMap.get(String(jobData.jobTypeId))?.name || '',
        workplaceType: workplaceTypeMap.get(String(jobData.workplaceTypeId))?.name || '',
        experienceLevel: experienceLevelMap.get(String(jobData.experienceLevelId))?.name || '',
        domain: domainMap.get(String(jobData.domainId))?.name || '',
    };

    const response = NextResponse.json(job);
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
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
