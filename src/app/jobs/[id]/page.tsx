
"use client";

import { notFound, useParams, useSearchParams } from 'next/navigation';
import type { Job, Application } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Building, Calendar, Users, FileText, BadgeDollarSign, Workflow, Clock, UserCheck, Star, Sparkles, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ApplyButton } from './apply-button';
import JobCard from '@/components/job-card';
import { ShareButton } from '@/components/share-button';
import { useUser } from '@/contexts/user-context';
import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import JobDetailsLoading from './loading';
import { useSavedJobs } from '@/hooks/use-jobs';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getJobData(id: string): Promise<{ job: Job | null; relatedJobs: Job[] }> {
    const jobRes = await fetch(`/api/jobs/${id}`, { cache: 'no-store' });
    if (!jobRes.ok) {
        if (jobRes.status === 404) return { job: null, relatedJobs: [] };
        throw new Error('Failed to fetch job data');
    }
    const job: Job = await jobRes.json();

    const relatedJobsRes = await fetch(`/api/jobs?domainId=${job.domainId}&limit=10`, { cache: 'no-store' });
    let relatedJobs: Job[] = [];
    if (relatedJobsRes.ok) {
        const allRelated = await relatedJobsRes.json();
        relatedJobs = allRelated
            .filter((j: Job) => j.id !== job.id)
            .slice(0, 3);
    }
    
    return { job, relatedJobs };
}

function JobDetailsContent() {
    const { user } = useUser();
    const { toast } = useToast();
    const [job, setJob] = useState<Job | null>(null);
    const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
    const [userApplications, setUserApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const { savedJobs, mutateSavedJobs } = useSavedJobs(user?.id);

    const isAdminView = searchParams.get('view') === 'admin';

    const appliedJobIds = useMemo(() => new Set(userApplications.map(app => app.jobId)), [userApplications]);
    const savedJobIds = useMemo(() => new Set(savedJobs || []), [savedJobs]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [jobAndRelatedData, appsRes] = await Promise.all([
                getJobData(id),
                user ? fetch(`/api/applications?userId=${user.id}`) : Promise.resolve(null)
            ]);

            const { job: jobData, relatedJobs: relatedJobsData } = jobAndRelatedData;
            
            setJob(jobData);
            
            let appsData: Application[] = [];
            if (appsRes && appsRes.ok) {
                appsData = await appsRes.json();
                setUserApplications(Array.isArray(appsData) ? appsData : []);
            }

            if (user?.role === 'Job Seeker' && Array.isArray(relatedJobsData)) {
                const currentAppliedJobIds = new Set(appsData.map(app => app.jobId));
                const filteredRelatedJobs = relatedJobsData.filter(j => !currentAppliedJobIds.has(j.id));
                setRelatedJobs(filteredRelatedJobs);
            } else {
                setRelatedJobs(relatedJobsData);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id, loadData]);

    const handleSaveToggle = async (jobId: string, isCurrentlySaved: boolean) => {
        if (!user) return;

        const originalSavedJobs = savedJobs ? [...savedJobs] : [];

        // Optimistic UI update
        const newSavedJobs = isCurrentlySaved
            ? originalSavedJobs.filter(id => id !== jobId)
            : [...originalSavedJobs, jobId];
        mutateSavedJobs(newSavedJobs, false);

        const method = isCurrentlySaved ? 'DELETE' : 'POST';
        const url = isCurrentlySaved 
            ? `/api/users/${user.id}/saved-jobs?jobId=${jobId}`
            : `/api/users/${user.id}/saved-jobs`;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: isCurrentlySaved ? undefined : JSON.stringify({ jobId }),
            });

            if (!response.ok) {
                throw new Error('Failed to update saved status');
            }
            // Revalidate to get the latest state from the server
            mutateSavedJobs();
        } catch (error) {
            // Revert UI on error
            mutateSavedJobs(originalSavedJobs, false);
            console.error("Failed to toggle save status", error);
            toast({ title: "Error", description: "Could not update saved jobs.", variant: "destructive" });
        }
    };

    if (loading) {
        return <JobDetailsLoading />;
    }

    if (!job) {
        notFound();
    }
    
    const detailItems = [
        { icon: MapPin, label: "Location", value: job.location, color: "text-primary" },
        { icon: Briefcase, label: "Job Type", value: job.type, color: "text-primary" },
        { icon: BadgeDollarSign, label: "Salary", value: job.salary || 'Not Disclosed', color: "text-primary" },
        { icon: Workflow, label: "Domain", value: job.domain, color: "text-primary" },
        { icon: UserCheck, label: "Role", value: job.role, color: "text-primary" },
        { icon: Building, label: "Workplace", value: job.workplaceType, color: "text-primary" },
        { icon: Users, label: "Experience", value: job.experienceLevel, color: "text-primary" },
        { icon: Calendar, label: "Posted On", value: format(new Date(job.postedAt), "PPP"), color: "text-primary" },
        { icon: Clock, label: "Vacancies", value: job.vacancies, color: "text-primary" },
    ];

    const shouldShowCompanyDetails = (user && (user.role === 'Recruiter' || user.role === 'Employee')) || isAdminView;


    return (
       <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-3xl font-bold">{job.title}</CardTitle>
                                    <CardDescription className="text-xl text-muted-foreground">{job.companyName}</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                     {job.isReferral && <Badge variant="secondary">Referral</Badge>}
                                     <div className="hidden md:block">
                                        <ShareButton jobId={job.id} jobTitle={job.title} />
                                     </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="flex flex-col gap-y-3 mb-6">
                                {detailItems.map(item => item.value ? (
                                    <div key={item.label} className="flex items-center gap-3">
                                        <item.icon className={`h-5 w-5 ${item.color} shrink-0`}/>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm text-muted-foreground">{item.label}:</span>
                                            <span className="font-semibold text-sm">{item.value}</span>
                                        </div>
                                    </div>
                                ) : null)}
                            </div>
                            
                            <h3 className="text-xl font-semibold mb-2 mt-6 flex items-center gap-2">
                                <FileText className="h-5 w-5"/>
                                Job Description
                            </h3>
                            <div className="prose prose-sm max-w-none text-muted-foreground">
                                {job.description.split('\\n').map((line, index) => (
                                    <p key={index}>{line}</p>
                                ))}
                            </div>

                             {job.requirements && job.requirements.length > 0 && (
                                <>
                                    <h3 className="text-xl font-semibold mb-2 mt-6 flex items-center gap-2">
                                        <Star className="h-5 w-5"/>
                                        Requirements
                                    </h3>
                                    <ul className="list-disc list-inside prose prose-sm max-w-none text-muted-foreground space-y-1">
                                        {job.requirements.map((req, index) => (
                                            <li key={index}>{req}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            
                            {job.benefits && job.benefits.length > 0 && (
                                <>
                                    <h3 className="text-xl font-semibold mb-2 mt-6 flex items-center gap-2">
                                        <Sparkles className="h-5 w-5"/>
                                        Benefits
                                    </h3>
                                    <ul className="list-disc list-inside prose prose-sm max-w-none text-muted-foreground space-y-1">
                                        {job.benefits.map((benefit, index) => (
                                            <li key={index}>{benefit}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </CardContent>
                         {!isAdminView && (
                            <CardFooter className="flex flex-col gap-4">
                                <ApplyButton job={job} />
                                {job.jobLink && (
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href={job.jobLink} target="_blank" rel="noopener noreferrer">
                                            Apply on Official Website <ExternalLink className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
                            </CardFooter>
                        )}
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                     {shouldShowCompanyDetails && (
                        <Card>
                            <CardHeader>
                                <CardTitle>About {job.companyName}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Contact for more info: <span className="font-semibold text-foreground">{job.contactEmail}</span>
                                    </p>
                                    {job.contactPhone && (
                                        <p className="text-sm text-muted-foreground">
                                            Phone: <span className="font-semibold text-foreground">{job.contactPhone}</span>
                                        </p>
                                    )}
                                </div>
                                {job.jobLink && (
                                    <div className="pt-2">
                                        <Button asChild variant="secondary" size="sm" className="w-full">
                                            <Link href={job.jobLink} target="_blank" rel="noopener noreferrer">
                                                Job Website <ExternalLink className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                     )}
                    {relatedJobs.length > 0 && !isAdminView && (
                        <div>
                            <h3 className="text-xl font-bold mb-4">Related Jobs</h3>
                            <div className="space-y-4">
                                {relatedJobs.map(relatedJob => (
                                    <JobCard 
                                        key={relatedJob.id} 
                                        job={relatedJob} 
                                        isApplied={appliedJobIds.has(relatedJob.id)} 
                                        isSaved={savedJobIds.has(relatedJob.id)}
                                        onSaveToggle={handleSaveToggle}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
       </div>
    );
}

export default function JobDetailsPage() {
    return (
        <Suspense fallback={<JobDetailsLoading />}>
            <JobDetailsContent />
        </Suspense>
    )
}
