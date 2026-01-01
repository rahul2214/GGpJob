
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import type { Job } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import JobCard from "@/components/job-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { BookmarkX } from "lucide-react";

export default function SavedJobsPage() {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const [savedJobs, setSavedJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchSavedJobs = useCallback(async () => {
        if (user) {
            setLoading(true);
            try {
                const res = await fetch(`/api/users/${user.id}/saved-jobs?includeDetails=true`);
                if (res.ok) {
                    const data = await res.json();
                    setSavedJobs(Array.isArray(data) ? data : []);
                } else {
                    toast({ title: "Error", description: "Failed to fetch saved jobs.", variant: "destructive" });
                }
            } catch (error) {
                console.error("Error fetching saved jobs:", error);
                toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        }
    }, [user, toast]);

    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchSavedJobs();
        }
    }, [user, userLoading, router, fetchSavedJobs]);

    const handleSaveToggle = async (jobId: string, isCurrentlySaved: boolean) => {
        if (!user) return;

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
            // As we are on the saved jobs page, removing a job should update the UI instantly
            if (isCurrentlySaved) {
                setSavedJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
            }
        } catch (error) {
            console.error("Failed to toggle save status", error);
            toast({ title: "Error", description: "Could not update saved jobs. Please try again.", variant: "destructive" });
        }
    };


    if (userLoading || loading) {
        return (
            <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Saved Jobs</CardTitle>
                        <CardDescription>Your bookmarked jobs for future reference.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
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
                                </CardFooter>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!user) {
        return null; // Redirect is handled in useEffect
    }

    return (
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <Card>
                <CardHeader>
                    <CardTitle>Saved Jobs</CardTitle>
                    <CardDescription>Your bookmarked jobs for future reference.</CardDescription>
                </CardHeader>
                <CardContent>
                    {savedJobs.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {savedJobs.map((job) => (
                                <JobCard 
                                    key={job.id} 
                                    job={job} 
                                    isSaved={true} 
                                    onSaveToggle={handleSaveToggle}
                                />
                            ))}
                        </div>
                    ) : (
                       <div className="text-center py-16">
                            <BookmarkX className="mx-auto h-16 w-16 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">No Saved Jobs</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                You haven't saved any jobs yet. Start browsing and save jobs to view them here.
                            </p>
                       </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
