
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import type { Job, Application } from '@/lib/types';
import type { firestore as adminFirestore } from 'firebase-admin';

// Helper function to create a map from an array of documents
const createMap = (docs: any[], key = 'id') => {
    const map = new Map();
    for (const doc of docs) {
        map.set(String(doc[key]), doc);
    }
    return map;
};


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobsRef = db.collection('jobs');
    
    // --- Start Dashboard-specific Logic ---
    if (searchParams.get('dashboard') === 'true') {
        const domainId = searchParams.get('domain');

        let recommendedQuery: adminFirestore.Query = jobsRef.where('isReferral', '==', false).limit(10);
        let referralQuery: adminFirestore.Query = jobsRef.where('isReferral', '==', true).limit(10);

        if (domainId) {
            recommendedQuery = recommendedQuery.where('domainId', '==', domainId);
            referralQuery = referralQuery.where('domainId', '==', domainId);
        }

        const [recommendedSnap, referralSnap, locationsSnapshot, jobTypesSnapshot] = await Promise.all([
            recommendedQuery.get(),
            referralQuery.get(),
            db.collection('locations').get(),
            db.collection('job_types').get()
        ]);
        
        const locationMap = createMap(locationsSnapshot.docs.map(doc => doc.data()), 'id');
        const jobTypeMap = createMap(jobTypesSnapshot.docs.map(doc => doc.data()), 'id');

        const processJobs = (snap: adminFirestore.QuerySnapshot) => 
            snap.docs.map(doc => {
                const jobData = doc.data() as Job;
                const location = locationMap.get(jobData.locationId);
                const jobType = jobTypeMap.get(jobData.jobTypeId);
                return {
                  id: doc.id,
                  ...jobData,
                  location: location ? location.name : 'N/A',
                  type: jobType ? jobType.name : 'N/A',
                }
            })
            .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

        const response = NextResponse.json({
            recommended: processJobs(recommendedSnap),
            referral: processJobs(referralSnap),
        });

        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        return response;
    }
    // --- End Dashboard-specific Logic ---
    
    let query: adminFirestore.Query = jobsRef;
    let hasComplexFilters = false;

    // --- Start Filtering Logic ---
    if (searchParams.get('isReferral') !== null) {
      query = query.where('isReferral', '==', searchParams.get('isReferral') === 'true');
    }
    const recruiterId = searchParams.get('recruiterId');
    if (recruiterId) {
      query = query.where('recruiterId', '==', recruiterId);
      hasComplexFilters = true; 
    }
    const employeeId = searchParams.get('employeeId');
    if (employeeId) {
      query = query.where('employeeId', '==', employeeId);
      hasComplexFilters = true;
    }
    
    const experienceId = searchParams.get('experience');
    if (experienceId && experienceId !== 'all') {
        query = query.where('experienceLevelId', '==', experienceId);
        hasComplexFilters = true;
    }

    const locationsParams = searchParams.getAll('location').filter(l => l && l !== 'all');
    if (locationsParams.length > 0) {
        query = query.where('locationId', 'in', locationsParams);
        hasComplexFilters = true;
    } 

    const domainsParams = searchParams.getAll('domain').filter(d => d && d !== 'all');
    if (domainsParams.length > 0) {
        query = query.where('domainId', 'in', domainsParams);
        hasComplexFilters = true;
    }

    const jobTypesParams = searchParams.getAll('jobType').filter(jt => jt && jt !== 'all');
    if (jobTypesParams.length > 0) {
        query = query.where('jobTypeId', 'in', jobTypesParams);
        hasComplexFilters = true;
    }

    // Filter by date posted
    const postedDays = searchParams.get('posted');
    if (postedDays && postedDays !== 'all') {
        const days = parseInt(postedDays, 10);
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);
        query = query.where('postedAt', '>=', dateLimit.toISOString());
        hasComplexFilters = true;
    }
    // --- End Filtering Logic ---

    // Apply ordering if no complex filters that prevent it or no search
    if (!searchParams.get('search') && !hasComplexFilters) {
        query = query.orderBy('postedAt', 'desc');
    }
    
    if (searchParams.get('limit')) {
        query = query.limit(parseInt(searchParams.get('limit') as string, 10));
    }

    const [
        jobsSnapshot, 
        applicationsSnapshot,
        locationsSnapshot,
        domainsSnapshot,
        jobTypesSnapshot,
        workplaceTypesSnapshot,
        experienceLevelsSnapshot,
    ] = await Promise.all([
        query.get(),
        db.collection('applications').get(),
        db.collection('locations').get(),
        db.collection('domains').get(),
        db.collection('job_types').get(),
        db.collection('workplace_types').get(),
        db.collection('experience_levels').get(),
    ]);

    const applications = applicationsSnapshot.docs.map(doc => doc.data() as Application);
    
    const locationMap = createMap(locationsSnapshot.docs.map(doc => doc.data()), 'id');
    const domainMap = createMap(domainsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    const jobTypeMap = createMap(jobTypesSnapshot.docs.map(doc => doc.data()), 'id');
    const workplaceTypeMap = createMap(workplaceTypesSnapshot.docs.map(doc => doc.data()), 'id');
    const experienceLevelMap = createMap(experienceLevelsSnapshot.docs.map(doc => doc.data()), 'id');

    const applicationCounts = applications.reduce((acc, app) => {
        if (!acc[app.jobId]) {
            acc[app.jobId] = { total: 0, selected: 0 };
        }
        acc[app.jobId].total++;
        if (app.statusId === 4) { // Status ID for 'Selected'
            acc[app.jobId].selected++;
        }
        return acc;
    }, {} as { [key: string]: { total: number; selected: number } });


    let jobs = jobsSnapshot.docs.map(doc => {
      const jobData = doc.data() as Job;
      const location = locationMap.get(jobData.locationId);
      const domain = domainMap.get(jobData.domainId);
      const jobType = jobTypeMap.get(jobData.jobTypeId);
      const workplaceType = jobData.workplaceTypeId ? workplaceTypeMap.get(jobData.workplaceTypeId) : null;
      const experienceLevel = jobData.experienceLevelId ? experienceLevelMap.get(jobData.experienceLevelId) : null;
      const counts = applicationCounts[doc.id] || { total: 0, selected: 0 };

      return {
          id: doc.id,
          ...jobData,
          location: location ? location.name : 'N/A',
          domain: domain?.name || 'N/A',
          type: jobType?.name || 'N/A',
          workplaceType: workplaceType?.name || 'N/A',
          experienceLevel: experienceLevel?.name || 'N/A',
          applicantCount: counts.total,
          selectedApplicantCount: counts.selected,
      }
    });

    // Handle case-insensitive search after fetching
    if (searchParams.get('search')) {
        const searchTerm = searchParams.get('search')!.toLowerCase();
        jobs = jobs.filter(job => job.title.toLowerCase().includes(searchTerm));
    }
    
    // Final client-side sort to ensure consistency
    jobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

    const response = NextResponse.json(jobs);
    
    // Do not cache owner-specific or admin queries to ensure recruiters/employees see accurate real-time data
    const isManagementQuery = searchParams.get('recruiterId') || searchParams.get('employeeId') || searchParams.get('admin') === 'true';
    if (!isManagementQuery) {
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    }
    
    return response;

  } catch (e: any) {
    console.error('[API_JOBS_GET] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch jobs', details: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newJobData = await request.json();

    const jobToCreate: Partial<Job> = {
        ...newJobData,
        postedAt: newJobData.postedAt || new Date().toISOString(),
    };
    
    const docRef = await db.collection('jobs').add(jobToCreate);
    const newJob = { id: docRef.id, ...jobToCreate };

    return NextResponse.json(newJob, { status: 201 });
  } catch (e: any) {
    console.error('[API_JOBS_POST] Error:', e);
    return NextResponse.json({ error: 'Failed to create job', details: e.message }, { status: 500 });
  }
}
