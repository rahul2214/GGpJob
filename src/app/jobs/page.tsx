
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Application } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import JobCard from "@/components/job-card";
import { JobFilters } from "@/components/job-filters";
import { useUser } from "@/contexts/user-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobs } from "@/hooks/use-jobs";

function JobSearchContent() {
    const searchParams = useSearchParams();
    const { user } = useUser();
    const [userApplications, setUserApplications] = useState<Application[]>([]);
    const isRecommended = searchParams.has('domain') && searchParams.get('domain') !== 'all';

    // Convert searchParams to an object for the useJobs hook
    const params = Object.fromEntries(searchParams.entries());
    const { jobs, isLoading, isError } = useJobs(params);
    
    useEffect(() => {
        const fetchApplications = async () => {
            if (user) {
                try {
                    const res = await fetch(`/api/applications?userId=${user.id}`);
                    if (res.ok) {
                        const appsData = await res.json();
                        setUserApplications(Array.isArray(appsData) ? appsData : []);
                    }
                } catch (error) {
                    console.error("Failed to fetch applications", error);
                }
            }
        };
        fetchApplications();
    }, [user]);
    
    const appliedJobIds = new Set(userApplications.map(app => app.jobId));
    
    const filteredJobs = user?.role === 'Job Seeker' 
        ? jobs?.filter(job => !appliedJobIds.has(job.id)) 
        : jobs;


    const renderJobCards = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-8 w-1/3" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )
        }
        if (isError) {
            return <p className="text-destructive text-center">Failed to load jobs.</p>
        }
        if (filteredJobs && filteredJobs.length > 0) {
            return (
                <div className="space-y-4">
                    {filteredJobs.map((job) => (
                        <JobCard key={job.id} job={job} isApplied={appliedJobIds.has(job.id)} />
                    ))}
                </div>
            )
        }
        return (
            <div className="text-center p-8">
                <p className="text-lg font-semibold">No jobs found</p>
                <p className="text-muted-foreground">Try adjusting your search or filters, or check back later for new openings.</p>
            </div>
        )
    }
    
    return (
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            <div className="hidden lg:block">
                <JobFilters />
            </div>
            <div>
                 <Card>
                    <CardHeader>
                        <div>
                            <CardTitle>{isRecommended ? 'Recommended Jobs' : 'Job Openings'}</CardTitle>
                            <CardDescription>
                                {isLoading ? 'Searching for jobs...' : `Found ${filteredJobs?.length || 0} job openings.`}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {renderJobCards()}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


export default function JobSearchPage() {
    return (
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
                <JobSearchContent />
            </Suspense>
        </div>
    );
}
