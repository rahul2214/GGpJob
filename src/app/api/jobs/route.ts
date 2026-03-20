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

import { apiCache } from '@/lib/cache';

async function getCachedCollection(collectionName: string) {
    const cached = apiCache.get<any[]>(collectionName);
    if (cached) return cached;
    
    const snapshot = await db.collection(collectionName).get();
    const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
            ...docData,
            _docId: doc.id,
            id: docData.id !== undefined ? docData.id : doc.id
        };
    });
    apiCache.set(collectionName, data, 5 * 60 * 1000); // 5 minutes cache
    return data;
}


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobsRef = db.collection('jobs');
    
    // --- Start Dashboard-specific Logic ---
    if (searchParams.get('dashboard') === 'true') {
        const domainId = searchParams.get('domain');
        const postedDays = searchParams.get('posted');

        let recommendedQuery: adminFirestore.Query = jobsRef.where('isReferral', '==', false).limit(50);
        let referralQuery: adminFirestore.Query = jobsRef.where('isReferral', '==', true).limit(50);

        if (domainId) {
            recommendedQuery = recommendedQuery.where('domainId', '==', domainId);
            referralQuery = referralQuery.where('domainId', '==', domainId);
        }

        const [recommendedSnap, referralSnap, locationsData, jobTypesData] = await Promise.all([
            recommendedQuery.get(),
            referralQuery.get(),
            getCachedCollection('locations'),
            getCachedCollection('job_types')
        ]);
        
        const locationMap = createMap(locationsData, 'id');
        const jobTypeMap = createMap(jobTypesData, 'id');

        const processJobs = (snap: adminFirestore.QuerySnapshot) => {
            let jobs = snap.docs.map(doc => {
                const jobData = doc.data() as Job;
                const locIds = jobData.locationIds || (jobData.locationId ? [jobData.locationId] : []);
                const locNames = locIds.map(id => {
                    const stringId = typeof id === 'object' && (id as any)?.id ? (id as any).id : String(id);
                    return locationMap.get(stringId)?.name;
                }).filter(Boolean);
                const jobType = jobTypeMap.get(jobData.jobTypeId);
                const minExp = jobData.minExperience ?? 0;
                const maxExp = jobData.maxExperience ?? minExp;
                return {
                  ...jobData,
                  id: doc.id,
                  location: locNames.length > 0 ? locNames.join(', ') : (jobData.location || 'N/A'),
                  locations: locNames,
                  type: jobType ? jobType.name : (jobData.type || 'N/A'),
                  experienceLevel: minExp === maxExp ? `${minExp} Years` : `${minExp} - ${maxExp} Years`,
                }
            });

            // Filter by date posted in JS to avoid index requirements
            if (postedDays && postedDays !== 'all') {
                const days = parseInt(postedDays, 10);
                const dateLimit = new Date();
                dateLimit.setDate(dateLimit.getDate() - days);
                const limitIso = dateLimit.toISOString();
                jobs = jobs.filter(job => {
                    const postedDate = job.postedAt instanceof Date ? job.postedAt.toISOString() : String(job.postedAt);
                    return postedDate >= limitIso;
                });
            }

            return jobs
                .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
                .slice(0, 10); // Return top 10 after sorting
        }

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
    const isRecommended = searchParams.get('view') === 'recommended';
    const userId = searchParams.get('userId');

    if (searchParams.get('isReferral') !== null) {
      query = query.where('isReferral', '==', searchParams.get('isReferral') === 'true');
      hasComplexFilters = true;
    }

    // Handle Recommended View (Filter by User's Domain)
    if (isRecommended && userId) {
        try {
            const userDoc = await db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData?.domainId) {
                    query = query.where('domainId', '==', userData.domainId);
                    hasComplexFilters = true;
                }
            }
        } catch (error) {
            console.error('[API_JOBS_GET] Recommended filter error:', error);
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
        // Use array-contains-any for locationIds filter
        query = query.where('locationIds', 'array-contains-any', locationsParams);
        hasComplexFilters = true;
    } 

    const domainsParams = searchParams.getAll('domain').filter(d => d && d !== 'all');
    // For recommended view, we DON'T override with manual domain if one is already set by recommendation
    if (domainsParams.length > 0 && !isRecommended) {
        query = query.where('domainId', 'in', domainsParams);
        hasComplexFilters = true;
    }

    const jobTypesParams = searchParams.getAll('jobType').filter(jt => jt && jt !== 'all');
    if (jobTypesParams.length > 0) {
        query = query.where('jobTypeId', 'in', jobTypesParams);
        hasComplexFilters = true;
    }

    // --- End Filtering Logic ---

    // Apply ordering only if no complex filters are present
    if (!searchParams.get('search') && !hasComplexFilters) {
        query = query.orderBy('postedAt', 'desc');
    }
    
    if (hasComplexFilters || searchParams.get('search')) {
        query = query.limit(500);
    } else if (searchParams.get('limit')) {
        query = query.limit(parseInt(searchParams.get('limit') as string, 10));
    }

    const jobsSnapshot = await query.get();

    // Batch chunk fetch applications to prevent full collection scan
    let applications: Application[] = [];
    if (!jobsSnapshot.empty) {
        const jobIds = jobsSnapshot.docs.map(doc => doc.id);
        const chunkSize = 30; // Firestore 'in' query limit
        const appPromises = [];
        for (let i = 0; i < jobIds.length; i += chunkSize) {
            const chunk = jobIds.slice(i, i + chunkSize);
            appPromises.push(db.collection('applications').where('jobId', 'in', chunk).get());
        }
        const appSnapshots = await Promise.all(appPromises);
        applications = appSnapshots.flatMap(snap => snap.docs.map(doc => doc.data() as Application));
    }

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
      const locIds = jobData.locationIds || (jobData.locationId ? [jobData.locationId] : []);
      const locNames = locIds.map(id => {
          const stringId = typeof id === 'object' && (id as any)?.id ? (id as any).id : String(id);
          return locationMap.get(stringId)?.name;
      }).filter(Boolean);
      const domain = domainMap.get(jobData.domainId);
      const jobType = jobTypeMap.get(jobData.jobTypeId);
      const workplaceType = jobData.workplaceTypeId ? workplaceTypeMap.get(jobData.workplaceTypeId) : null;
      const counts = applicationCounts[doc.id] || { total: 0, selected: 0 };
      const minExp = jobData.minExperience ?? 0;
      const maxExp = jobData.maxExperience ?? minExp;

      return {
          ...jobData,
          id: doc.id,
          location: locNames.length > 0 ? locNames.join(', ') : (jobData.location || 'N/A'),
          locations: locNames,
          domain: domain?.name || 'N/A',
          type: jobType?.name || (jobData.type as any) || 'N/A',
          workplaceType: workplaceType?.name || 'N/A',
          experienceLevel: minExp === maxExp ? `${minExp} Years` : `${minExp} - ${maxExp} Years`,
          applicantCount: counts.total,
          selectedApplicantCount: counts.selected,
      }
    });

    // Handle date filtering in JS
    const postedDays = searchParams.get('posted');
    if (postedDays && postedDays !== 'all') {
        const days = parseInt(postedDays, 10);
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);
        const limitIso = dateLimit.toISOString();
        jobs = jobs.filter(job => {
            const postedDate = job.postedAt instanceof Date ? job.postedAt.toISOString() : String(job.postedAt);
            return postedDate >= limitIso;
        });
    }

    // Handle experience range filtering in JS
    const minExpFilter = searchParams.get('minExp');
    const maxExpFilter = searchParams.get('maxExp');
    if (minExpFilter || maxExpFilter) {
        const fMin = minExpFilter ? parseInt(minExpFilter, 10) : 0;
        const fMax = maxExpFilter ? parseInt(maxExpFilter, 10) : 99;
        jobs = jobs.filter(job => {
            const jMin = job.minExperience ?? 0;
            const jMax = job.maxExperience ?? 99;
            // Overlap check: job range overlaps with filter range
            return (jMin <= fMax) && (jMax >= fMin);
        });
    }

    if (searchParams.get('search')) {
        const searchTerm = searchParams.get('search')!.toLowerCase();
        jobs = jobs.filter(job => job.title.toLowerCase().includes(searchTerm));
    }
    
    jobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

    if (searchParams.get('limit')) {
        const manualLimit = parseInt(searchParams.get('limit') as string, 10);
        jobs = jobs.slice(0, manualLimit);
    }

    const response = NextResponse.json(jobs);
    
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
        // For compatibility, set first location as locationId
        locationId: (newJobData.locationIds && newJobData.locationIds.length > 0) ? newJobData.locationIds[0] : (newJobData.locationId || ''),
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
