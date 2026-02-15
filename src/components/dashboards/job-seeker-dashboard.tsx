

"use client";

import { useState, useEffect, useMemo } from "react";
import type { Job, Application } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import JobCard from "../job-card";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { ProfileStrength } from "../profile-strength";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useDashboardJobs, useSavedJobs } from "@/hooks/use-jobs";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";

export default function JobSeekerDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { toast } = useToast();

  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const { savedJobs, mutateSavedJobs } = useSavedJobs(user?.id);

  const { data: jobData, isLoading, isError } = useDashboardJobs(user?.domainId ? { domain: user.domainId, dashboard: 'true' } : { dashboard: 'true' });

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

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (debouncedSearchQuery) {
        router.push(`/jobs?search=${debouncedSearchQuery}`);
    }
  };

  const handleQuickSearch = (term: string) => {
    router.push(`/jobs?search=${term}`);
  };

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

  const recommendedJobs = useMemo(() => jobData?.recommended?.filter(job => !appliedJobIds.has(job.id)).slice(0, 6) || [], [jobData, appliedJobIds]);
  const referralJobs = useMemo(() => jobData?.referral?.filter(job => !appliedJobIds.has(job.id)).slice(0, 6) || [], [jobData, appliedJobIds]);
  
  return (
    <div className="space-y-8 py-4">
        
       <div className="rounded-lg">
        {user && <ProfileStrength user={user} />}
       </div>

       <Card className="border-0 border-t-4 border-emerald-500 shadow-md">
        <CardHeader>
          <CardTitle>Find Your Next Job</CardTitle>
          <CardDescription>Search by title, company, or keywords to find your perfect match.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex w-full items-center space-x-2 rounded-full border bg-background shadow-sm overflow-hidden p-1">
                  <Input 
                      name="search" 
                      placeholder="Job title, company, or keyword" 
                      className="flex-grow border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-base bg-transparent pl-4"
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" size="icon" className="rounded-full h-10 w-10 bg-emerald-500 hover:bg-emerald-600 shrink-0">
                    <Search className="h-5 w-5" />
                    <span className="sr-only">Search</span>
                  </Button>
              </div>
            </form>
            <div className="flex flex-wrap gap-2">
                {['Software Engineer', 'Remote', 'Marketing', 'Finance', 'Design'].map(term => (
                    <Button key={term} variant="outline" size="sm" className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200" onClick={() => handleQuickSearch(term)}>
                        {term}
                    </Button>
                ))}
            </div>
        </CardContent>
      </Card>
      
      {user && !user.domainId && (
         <Card className="bg-primary-foreground border-primary/20">
            <CardHeader>
                <CardTitle>Get Personalized Job Recommendations!</CardTitle>
                <CardDescription>Select your preferred job domain in your profile to see jobs tailored just for you.</CardDescription>
            </CardHeader>
             <CardContent>
                <Button asChild>
                    <Link href="/profile">Go to Profile</Link>
                </Button>
            </CardContent>
         </Card>
      )}

      {isLoading && (
        <Card>
          <CardHeader>
             <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
                <Skeleton className="h-48 w-1/3" />
                <Skeleton className="h-48 w-1/3" />
                <Skeleton className="h-48 w-1/3" />
              </div>
          </CardContent>
        </Card>
      )}
      
      {isError && <p>Failed to load jobs.</p>}

      {!isLoading && user?.domainId && recommendedJobs.length > 0 && (
         <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        Recommended For You
                    </CardTitle>
                    
                </div>
                 {user?.domainId && (
                    <Button asChild variant="link" className="text-[#f72585]">
                        <Link href={{ pathname: '/jobs', query: { domain: user.domainId } }}>
                            View All
                        </Link>
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-1">
                        {recommendedJobs.map((job) => (
                        <CarouselItem key={job.id} className="pl-1 basis-3/4 md:basis-1/2 lg:basis-1/3">
                            <div className="p-1 h-full">
                               <JobCard 
                                  job={job} 
                                  isApplied={appliedJobIds.has(job.id)} 
                                  isSaved={savedJobIds.has(job.id)}
                                  onSaveToggle={handleSaveToggle}
                                  hideDetails={true}
                                />
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex" />
                    <CarouselNext className="hidden md:flex" />
                </Carousel>
            </CardContent>
         </Card>
      )}

      {!isLoading && referralJobs.length > 0 && (
         <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>
                        Referrals for You
                    </CardTitle>
                    
                </div>
                 {user?.domainId && (
                    <Button asChild variant="link" className="text-[#f72585]">
                        <Link href={`/jobs?domain=${user.domainId}&isReferral=true`}>
                            View All
                        </Link>
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-1">
                        {referralJobs.map((job) => (
                        <CarouselItem key={job.id} className="pl-1 basis-3/4 md:basis-1/2 lg:basis-1/3">
                            <div className="p-1 h-full">
                               <JobCard 
                                  job={job} 
                                  isApplied={appliedJobIds.has(job.id)}
                                  isSaved={savedJobIds.has(job.id)}
                                  onSaveToggle={handleSaveToggle}
                                  hideDetails={true} 
                                />
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex" />
                    <CarouselNext className="hidden md:flex" />
                </Carousel>
            </CardContent>
         </Card>
      )}
    </div>
  );
}
