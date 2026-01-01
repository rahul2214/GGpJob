
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import { FieldValue, FieldPath } from 'firebase-admin/firestore';
import type { Job } from '@/lib/types';


async function getJobDetails(jobIds: string[]): Promise<Job[]> {
    if (jobIds.length === 0) return [];
    
    // Firestore 'in' queries are limited to 30 items per query.
    // We chunk the jobIds to handle more than 30 saved jobs.
    const chunks: string[][] = [];
    for (let i = 0; i < jobIds.length; i += 30) {
        chunks.push(jobIds.slice(i, i + 30));
    }

    const jobPromises = chunks.map(chunk => 
        db.collection('jobs').where(FieldPath.documentId(), 'in', chunk).get()
    );
    
    const jobSnapshots = await Promise.all(jobPromises);
    const jobs: Job[] = [];
    jobSnapshots.forEach(snap => {
        snap.forEach(doc => {
            jobs.push({ id: doc.id, ...doc.data() } as Job);
        });
    });

    // We can further enrich job data here if needed (e.g., location names)
    // For now, we return the core job data.
    return jobs;
}


export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id: userId } = params;
        const { searchParams } = new URL(request.url);
        const includeDetails = searchParams.get('includeDetails') === 'true';

        const savedJobsRef = db.collection('users').doc(userId).collection('saved_jobs');
        const snapshot = await savedJobsRef.orderBy('savedAt', 'desc').get();

        const savedJobs = snapshot.docs.map(doc => doc.data());
        
        if (includeDetails) {
            const jobIds = savedJobs.map(job => job.jobId);
            const jobDetails = await getJobDetails(jobIds);
            
            // Create a map for quick lookup
            const jobDetailsMap = new Map(jobDetails.map(job => [job.id, job]));

            // Return full job details in the order they were saved
            const sortedJobDetails = savedJobs
                .map(savedJob => jobDetailsMap.get(savedJob.jobId))
                .filter(Boolean) as Job[];
            
            return NextResponse.json(sortedJobDetails);
        }

        return NextResponse.json(savedJobs);
    } catch (e: any) {
        console.error("GET saved-jobs error:", e);
        return NextResponse.json({ error: "Failed to fetch saved jobs" }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id: userId } = params;
        const { jobId } = await request.json();

        if (!jobId) {
            return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
        }
        
        const savedJobRef = db.collection('users').doc(userId).collection('saved_jobs').doc(jobId);
        
        await savedJobRef.set({
            jobId: jobId,
            savedAt: FieldValue.serverTimestamp()
        });

        return NextResponse.json({ success: true, message: "Job saved" }, { status: 201 });
    } catch (e: any) {
        console.error("POST saved-jobs error:", e);
        return NextResponse.json({ error: "Failed to save job" }, { status: 500 });
    }
}


export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id: userId } = params;
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');

        if (!jobId) {
            return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
        }

        const savedJobRef = db.collection('users').doc(userId).collection('saved_jobs').doc(jobId);
        await savedJobRef.delete();

        return NextResponse.json({ success: true, message: "Job unsaved" });

    } catch (e: any) {
        console.error("DELETE saved-jobs error:", e);
        return NextResponse.json({ error: "Failed to unsave job" }, { status: 500 });
    }
}
