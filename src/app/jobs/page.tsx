
"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Application } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import JobCard from "@/components/job-card";
import { JobFilters } from "@/components/job-filters";
import { useUser } from "@/contexts/user-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobs, useSavedJobs } from "@/hooks/use-jobs";
import { useToast } from "@/hooks/use-toast";

function JobSearchContent() {
    const searchParams = useSearchParams();
    const { user } = useUser();
    const [userApplications, setUserApplications] = useState<Application[]>([]);
    const { savedJobs, mutateSavedJobs } = useSavedJobs(user?.id);
    const { toast } = useToast();

    // Convert searchParams to an object for the useJobs hook
    const params = Object.fromEntries(searchParams.entries());
    const { jobs, isLoading, isError } = useJobs(params);
    
    const isRecommended = searchParams.has('domain');
    
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
    
    const appliedJobIds = useMemo(() => new Set(userApplications.map(app => app.jobId)), [userApplications]);
    const savedJobIds = useMemo(() => new Set(savedJobs || []), [savedJobs]);

    const filteredJobs = useMemo(() => {
        return user?.role === 'Job Seeker' 
            ? jobs?.filter(job => !appliedJobIds.has(job.id)) 
            : jobs;
    }, [jobs, appliedJobIds, user]);


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
                             <CardContent className="flex justify-between">
                                <Skeleton className="h-4 w-1/4" />
                            </CardContent>
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
                        <JobCard 
                            key={job.id} 
                            job={job} 
                            isApplied={appliedJobIds.has(job.id)}
                            isSaved={savedJobIds.has(job.id)}
                            onSaveToggle={handleSaveToggle}
                        />
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
