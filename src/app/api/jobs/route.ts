

import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import type { Job, Location, Application, Domain, JobType, WorkplaceType, ExperienceLevel } from '@/lib/types';
import type { firestore as adminFirestore } from 'firebase-admin';

// Helper function to create a map from an array of documents
const createMap = (docs: any[], key = 'id') => {
    const map = new Map();
    for (const doc of docs) {
        map.set(doc[key], doc);
    }
    return map;
};


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobsRef = db.collection('jobs');
    let query: adminFirestore.Query = jobsRef;

    // --- Start Filtering Logic ---
    let hasComplexFilters = false;

    // String-based filters
    if (searchParams.get('isReferral') !== null) {
      query = query.where('isReferral', '==', searchParams.get('isReferral') === 'true');
    }
    const recruiterId = searchParams.get('recruiterId');
    if (recruiterId) {
      query = query.where('recruiterId', '==', recruiterId);
    }
    const employeeId = searchParams.get('employeeId');
    if (employeeId) {
      query = query.where('employeeId', '==', employeeId);
    }
    
    if (searchParams.get('experience')) {
        query = query.where('experienceLevel', '==', searchParams.get('experience'));
        hasComplexFilters = true;
    }

    // Date filter
    if (searchParams.get('posted')) {
        const days = parseInt(searchParams.get('posted') as string, 10);
        if (!isNaN(days)) {
            const date = new Date();
            date.setDate(date.getDate() - days);
            query = query.where('postedAt', '>=', date.toISOString());
            hasComplexFilters = true;
        }
    }
    
    // Array-based filters
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
    
    // --- End Filtering Logic ---

    // Only apply orderBy at the DB level if there are no complex filters
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
    const locations = locationsSnapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }) as Location);
    const domains = domainsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Domain);
    const jobTypes = jobTypesSnapshot.docs.map(doc => doc.data() as JobType);
    const workplaceTypes = workplaceTypesSnapshot.docs.map(doc => doc.data() as WorkplaceType);
    const experienceLevels = experienceLevelsSnapshot.docs.map(doc => doc.data() as ExperienceLevel);
    
    const locationMap = createMap(locations, 'id');
    const domainMap = createMap(domains);
    const jobTypeMap = createMap(jobTypes, 'id');
    const workplaceTypeMap = createMap(workplaceTypes, 'id');
    const experienceLevelMap = createMap(experienceLevels, 'id');


    const applicationCounts = applications.reduce((acc, app) => {
        acc[app.jobId] = (acc[app.jobId] || 0) + 1;
        return acc;
    }, {} as { [key: string]: number });


    let jobs = jobsSnapshot.docs.map(doc => {
      const jobData = doc.data() as Job;
      const location = locationMap.get(parseInt(jobData.locationId));
      const domain = domainMap.get(String(jobData.domainId));
      const jobType = jobTypeMap.get(parseInt(jobData.jobTypeId));
      const workplaceType = jobData.workplaceTypeId ? workplaceTypeMap.get(parseInt(jobData.workplaceTypeId)) : null;
      const experienceLevel = jobData.experienceLevelId ? experienceLevelMap.get(parseInt(jobData.experienceLevelId)) : null;

      return {
          id: doc.id,
          ...jobData,
          location: location ? `${location.name}, ${location.country}` : 'N/A',
          domain: domain?.name || 'N/A',
          type: jobType?.name || 'N/A',
          workplaceType: workplaceType?.name || 'N/A',
          experienceLevel: experienceLevel?.name || 'N/A',
          applicantCount: applicationCounts[doc.id] || 0,
      }
    });

    // Handle case-insensitive search after fetching
    if (searchParams.get('search')) {
        const searchTerm = searchParams.get('search')!.toLowerCase();
        jobs = jobs.filter(job => job.title.toLowerCase().includes(searchTerm));
    }
    
    // If we have filters that prevented DB sorting, sort client-side
    if (hasComplexFilters || searchParams.get('search')) {
        jobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    }


    return NextResponse.json(jobs);
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
