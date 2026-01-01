

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
    
    // --- Start Dashboard-specific Logic ---
    if (searchParams.get('dashboard') === 'true' && searchParams.get('domain')) {
        const domainId = searchParams.get('domain');

        const recommendedQuery = jobsRef.where('domainId', '==', domainId).where('isReferral', '==', false).orderBy('postedAt', 'desc').limit(10);
        const referralQuery = jobsRef.where('domainId', '==', domainId).where('isReferral', '==', true).orderBy('postedAt', 'desc').limit(10);

        const [recommendedSnap, referralSnap] = await Promise.all([
            recommendedQuery.get(),
            referralQuery.get(),
        ]);
        
        const processJobs = (snap: adminFirestore.QuerySnapshot) => snap.docs.map(doc => ({ id: doc.id, ...doc.data() as Job }));

        return NextResponse.json({
            recommended: processJobs(recommendedSnap),
            referral: processJobs(referralSnap),
        });
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
      hasComplexFilters = true; // Sorting will be done client-side for this specific query to avoid index issues
    }
    const employeeId = searchParams.get('employeeId');
    if (employeeId) {
      query = query.where('employeeId', '==', employeeId);
      hasComplexFilters = true; // Sorting will be done client-side to avoid index issues
    }
    
    const experienceId = searchParams.get('experience');
    if (experienceId) {
        query = query.where('experienceLevelId', '==', experienceId);
        hasComplexFilters = true;
    }

    const postedDays = searchParams.get('posted');
    if (postedDays && postedDays !== 'all') {
        const days = parseInt(postedDays as string, 10);
        if (!isNaN(days)) {
            const date = new Date();
            date.setDate(date.getDate() - days);
            query = query.where('postedAt', '>=', date.toISOString());
            hasComplexFilters = true;
        }
    }
    
    const domainId = searchParams.get('domain');
    if (domainId) {
        query = query.where('domainId', '==', domainId);
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
    // --- End Filtering Logic ---

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
      const location = locationMap.get(parseInt(jobData.locationId));
      const domain = domainMap.get(String(jobData.domainId));
      const jobType = jobTypeMap.get(parseInt(jobData.jobTypeId));
      const workplaceType = jobData.workplaceTypeId ? workplaceTypeMap.get(parseInt(jobData.workplaceTypeId)) : null;
      const experienceLevel = jobData.experienceLevelId ? experienceLevelMap.get(parseInt(jobData.experienceLevelId)) : null;
      const counts = applicationCounts[doc.id] || { total: 0, selected: 0 };

      return {
          id: doc.id,
          ...jobData,
          location: location ? `${location.name}, ${location.country}` : 'N/A',
          domain: domain?.name || 'N/A',
          type: jobType?.name || 'N/A',
          workplaceType: workplaceType?.name || 'N/A',
          experienceLevel: experienceLevel?.name || 'N/A',
          applicantCount: counts.total,
          selectedApplicantCount: counts.selected,
      }
    });

    // Handle automatic job expiration
    const now = new Date();
    jobs = jobs.filter(job => {
        const postedAt = new Date(job.postedAt);
        const daysSincePosted = (now.getTime() - postedAt.getTime()) / (1000 * 3600 * 24);
        
        if (job.employeeId) { // Job posted by an employee (referral)
            return daysSincePosted <= 14;
        }
        if (job.recruiterId) { // Job posted by a recruiter
            return daysSincePosted <= 30;
        }
        // If neither is set, default to not expiring for now
        return true;
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
