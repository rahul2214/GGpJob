

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
    }

    // Date filter
    if (searchParams.get('posted')) {
        const days = parseInt(searchParams.get('posted') as string, 10);
        if (!isNaN(days)) {
            const date = new Date();
            date.setDate(date.getDate() - days);
            query = query.where('postedAt', '>=', date.toISOString());
        }
    }
    
    const locationsParams = searchParams.getAll('location').filter(l => l && l !== 'all');
    const domainsParams = searchParams.getAll('domain').filter(d => d && d !== 'all');
    const jobTypesParams = searchParams.getAll('jobType').filter(jt => jt && jt !== 'all');
    
    // Firestore limitation: Cannot have inequality filters on more than one field.
    // 'in' and 'array-contains-any' are considered inequality filters.
    if (locationsParams.length > 0) {
        query = query.where('locationId', 'in', locationsParams);
    } 
    if (domainsParams.length > 0) {
        query = query.where('domainId', 'in', domainsParams);
    }
    if (jobTypesParams.length > 0) {
         query = query.where('jobTypeId', 'in', jobTypesParams);
    }
    
    const hasArrayFilters = locationsParams.length > 0 || domainsParams.length > 0 || jobTypesParams.length > 0;
    
    // Default sort order if not searching by title or complex filters that require client-side sorting
    if (!searchParams.get('search') && !hasArrayFilters) {
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
      const location = locationMap.get(jobData.locationId);
      const domain = domainMap.get(String(jobData.domainId));
      const jobType = jobTypeMap.get(jobData.jobTypeId);
      const workplaceType = jobData.workplaceTypeId ? workplaceTypeMap.get(jobData.workplaceTypeId) : null;
      const experienceLevel = jobData.experienceLevelId ? experienceLevelMap.get(jobData.experienceLevelId) : null;

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
    if (hasArrayFilters || searchParams.get('search')) {
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
