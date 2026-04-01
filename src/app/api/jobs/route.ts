import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/firebase/admin-config';
import type { Job, Application } from '@/lib/types';
import type { firestore as adminFirestore } from 'firebase-admin';
import { apiCache } from '@/lib/cache';

// Helper function to create a map from an array of documents
const createMap = (docs: any[], key = 'id') => {
    const map = new Map();
    for (const doc of docs) {
        // Map by the requested key
        if (doc[key] !== undefined) {
            map.set(String(doc[key]), doc);
        }
        // Fallback: map by internal 'id'
        if (doc.id !== undefined) {
            map.set(String(doc.id), doc);
        }
        // Fallback: map by firestore document string ID
        if (doc._docId !== undefined) {
            map.set(String(doc._docId), doc);
        }
    }
    return map;
};

async function getCachedCollection(collectionName: string) {
    // Check cache first
    // const cached = apiCache.get<any[]>(collectionName);
    // if (cached) return cached;
    
    const snapshot = await db.collection(collectionName).get();
    const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
            ...docData,
            _docId: doc.id // Store Firestore document ID separately, preserve internal 'id'
        };
    });
    apiCache.set(collectionName, data, 5 * 60 * 1000); // 5 minutes cache
    return data;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const jobsRef = db.collection('jobs');
    
    // 1. Fetch all metadata collections upfront
    const [
        locationsData,
        domainsData,
        jobTypesData,
        workplaceTypesData,
    ] = await Promise.all([
        getCachedCollection('locations'),
        getCachedCollection('domains'),
        getCachedCollection('job_types'),
        getCachedCollection('workplace_types'),
    ]);
    
    const locationMap = createMap(locationsData, 'id');
    const domainMap = createMap(domainsData, 'id');
    const jobTypeMap = createMap(jobTypesData, 'id');
    const workplaceTypeMap = createMap(workplaceTypesData, 'id');

    // 2. Define a unified job processing function
    const processJobsWithLabels = (jobs: (Job & {id: string})[]) => {
        return jobs.map(jobData => {
            const locIds = jobData.locationIds || (jobData.locationId ? [jobData.locationId] : []);
            const locNames = locIds.map(id => {
                const stringId = typeof id === 'object' && (id as any)?.id ? String((id as any).id) : String(id);
                return locationMap.get(stringId)?.name;
            }).filter(Boolean);
            
            const domain = domainMap.get(String(jobData.domainId));
            const jobType = jobTypeMap.get(String(jobData.jobTypeId));
            const workplaceType = jobData.workplaceTypeId ? workplaceTypeMap.get(String(jobData.workplaceTypeId)) : null;
            
            const minExp = jobData.minExperience ?? 0;
            const maxExp = jobData.maxExperience ?? minExp;

            return {
                ...jobData,
                location: locNames.length > 0 ? locNames.join(', ') : (jobData.location || 'N/A'),
                locations: locNames,
                domain: domain?.name || 'N/A',
                type: jobType?.name || (jobData.type as any) || 'N/A',
                workplaceType: workplaceType?.name || 'N/A',
                experienceLevel: minExp === maxExp ? `${minExp} Years` : `${minExp} - ${maxExp} Years`,
            };
        });
    };

    // --- Start Dashboard-specific Logic ---
    if (searchParams.get('dashboard') === 'true') {
        const domainId = searchParams.get('domain');
        const postedDays = searchParams.get('posted');

        let recQuery: adminFirestore.Query = jobsRef.where('isReferral', '==', false).limit(50);
        let refQuery: adminFirestore.Query = jobsRef.where('isReferral', '==', true).limit(50);

        if (domainId) {
            recQuery = recQuery.where('domainId', '==', domainId);
            refQuery = refQuery.where('domainId', '==', domainId);
        }

        const [recSnap, refSnap] = await Promise.all([recQuery.get(), refQuery.get()]);
        
        const filterProcessSort = (snap: adminFirestore.QuerySnapshot) => {
            let jobs = snap.docs.map(doc => ({ ...(doc.data() as Job), id: doc.id }));
            
            if (postedDays && postedDays !== 'all') {
                const days = parseInt(postedDays, 10);
                const limitDate = new Date();
                limitDate.setDate(limitDate.getDate() - days);
                const limitIso = limitDate.toISOString();
                jobs = jobs.filter(job => String(job.postedAt) >= limitIso);
            }

            return processJobsWithLabels(jobs)
                .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
                .slice(0, 10);
        };

        return NextResponse.json({
            recommended: filterProcessSort(recSnap),
            referral: filterProcessSort(refSnap),
        });
    }

    // --- Start General Search/Listing Logic ---
    let query: adminFirestore.Query = jobsRef;
    
    // const now = new Date().toISOString();
    // query = query.where('expiresAt', '>', now); // This requires a composite index with orderBy. Moved to in-memory filter.
    
    let hasComplexFilters = false;

    const isRecommended = searchParams.get('view') === 'recommended';
    const userId = searchParams.get('userId');

    if (searchParams.get('isReferral') !== null) {
      query = query.where('isReferral', '==', searchParams.get('isReferral') === 'true');
      hasComplexFilters = true;
    }

    if (isRecommended && userId) {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists && userDoc.data()?.domainId) {
            query = query.where('domainId', '==', userDoc.data()!.domainId);
            hasComplexFilters = true;
        }
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
    
    const locationsParams = searchParams.getAll('location').filter(l => l && l !== 'all');
    if (locationsParams.length > 0) {
        query = query.where('locationIds', 'array-contains-any', locationsParams);
        hasComplexFilters = true;
    } 

    const domainsParams = searchParams.getAll('domain').flatMap(d => d.split(',')).filter(d => d && d !== 'all');
    if (domainsParams.length > 0 && !isRecommended) {
        query = query.where('domainId', 'in', domainsParams);
        hasComplexFilters = true;
    }

    const jobTypesParams = searchParams.getAll('jobType').filter(jt => jt && jt !== 'all');
    if (jobTypesParams.length > 0) {
        query = query.where('jobTypeId', 'in', jobTypesParams);
        hasComplexFilters = true;
    }

    if (!searchParams.get('search') && !hasComplexFilters) {
        query = query.orderBy('postedAt', 'desc');
    }
    
    if (hasComplexFilters || searchParams.get('search')) {
        query = query.limit(500);
    } else if (searchParams.get('limit')) {
        // Fetch slightly more than needed to account for in-memory filtering of expired jobs
        const requestedLimit = parseInt(searchParams.get('limit')!, 10);
        query = query.limit(Math.max(50, requestedLimit * 2));
    }

    const jobsSnapshot = await query.get();
    
    // Fetch applications counts separately for these jobs
    let applications: Application[] = [];
    if (!jobsSnapshot.empty) {
        const jobIds = jobsSnapshot.docs.map(doc => doc.id);
        const chunkSize = 30;
        const appPromises = [];
        for (let i = 0; i < jobIds.length; i += chunkSize) {
            appPromises.push(db.collection('applications').where('jobId', 'in', jobIds.slice(i, i + chunkSize)).get());
        }
        const appSnaps = await Promise.all(appPromises);
        applications = appSnaps.flatMap(snap => snap.docs.map(doc => doc.data() as Application));
    }

    const applicationCounts = applications.reduce((acc, app) => {
        if (!acc[app.jobId]) acc[app.jobId] = { total: 0, selected: 0 };
        acc[app.jobId].total++;
        if (app.statusId === 4) acc[app.jobId].selected++;
        return acc;
    }, {} as Record<string, { total: number; selected: number }>);

    let jobs = jobsSnapshot.docs.map(doc => ({ ...(doc.data() as Job), id: doc.id }));

    // In-memory filters
    const now = new Date().toISOString();
    jobs = jobs.filter(job => String(job.expiresAt) > now);

    const postedParam = searchParams.get('posted');
    if (postedParam && postedParam !== 'all') {
        const days = parseInt(postedParam, 10);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const cutoffIso = cutoff.toISOString();
        jobs = jobs.filter(job => String(job.postedAt) >= cutoffIso);
    }

    const searchTerm = searchParams.get('search')?.toLowerCase();
    if (searchTerm) {
        jobs = jobs.filter(job => job.title.toLowerCase().includes(searchTerm));
    }

    // Apply labels and counts
    const finalJobs = processJobsWithLabels(jobs).map(job => {
        const counts = applicationCounts[job.id] || { total: 0, selected: 0 };
        return {
            ...job,
            applicantCount: counts.total,
            selectedApplicantCount: counts.selected,
        };
    });

    finalJobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

    // Apply limit if specified
    const limit = searchParams.get('limit');
    const finalResult = limit ? finalJobs.slice(0, parseInt(limit, 10)) : finalJobs;

    const response = NextResponse.json(finalResult);
    if (!recruiterId && !employeeId) {
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
    const data = await request.json();
    const { recruiterId, employeeId } = data;
    const userId = recruiterId || employeeId;

    if (!userId) {
        return NextResponse.json({ error: 'Recruiter ID or Employee ID is required' }, { status: 400 });
    }

    // Check user plan and limits
    const userDoc = await db.collection(recruiterId ? 'recruiters' : 'employees').doc(userId).get();
    if (!userDoc.exists) {
        return NextResponse.json({ error: 'Recruiter profile not found' }, { status: 404 });
    }

    const user = userDoc.data()!;
    const planType = user.planType || 'none';
    const planExpiresAt = user.planExpiresAt ? new Date(user.planExpiresAt) : null;
    const now = new Date();

    if (planType === 'none' || (planExpiresAt && planExpiresAt < now)) {
        return NextResponse.json({ error: 'Active subscription required to post jobs' }, { status: 403 });
    }

    // Check active job count
    const activeJobsSnap = await db.collection('jobs')
        .where(recruiterId ? 'recruiterId' : 'employeeId', '==', userId)
        .where('expiresAt', '>', now.toISOString())
        .get();
    
    const maxJobs = planType === 'premium' ? 10 : 1;
    if (activeJobsSnap.size >= maxJobs) {
        return NextResponse.json({ 
            error: `Job limit reached. ${planType === 'premium' ? 'Premium' : 'Basic'} plan allows only ${maxJobs} active jobs.` 
        }, { status: 403 });
    }

    // Calculate expiry dates
    const jobExpiry = new Date();
    jobExpiry.setDate(now.getDate() + 30);
    
    const appExpiry = new Date();
    appExpiry.setDate(now.getDate() + (planType === 'premium' ? 90 : 30));

    const jobToCreate: Partial<Job> = {
        ...data,
        locationId: (data.locationIds && data.locationIds.length > 0) ? data.locationIds[0] : (data.locationId || ''),
        postedAt: now.toISOString(),
        expiresAt: jobExpiry.toISOString(),
        appExpiresAt: appExpiry.toISOString(),
        maxApplies: planType === 'premium' ? -1 : 300,
        planTypeAtPosting: planType
    };
    
    const docRef = await db.collection('jobs').add(jobToCreate);
    return NextResponse.json({ id: docRef.id, ...jobToCreate }, { status: 201 });
  } catch (e: any) {
    console.error('[API_JOBS_POST] Error:', e);
    return NextResponse.json({ error: 'Failed to create job', details: e.message }, { status: 500 });
  }
}
