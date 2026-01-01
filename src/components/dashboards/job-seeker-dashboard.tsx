
"use client";

import { useState, useEffect, useCallback } from "react";
import type { Job, Application } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import JobCard from "../job-card";
import { Button } from "../ui/button";
import { ArrowRight, Search } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { ProfileStrength } from "../profile-strength";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function JobSeekerDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [referralJobs, setReferralJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
        const [jobsRes, appsRes] = await Promise.all([
             user.domainId ? fetch(`/api/jobs?domain=${user.domainId}&dashboard=true`) : Promise.resolve(null),
             fetch(`/api/applications?userId=${user.id}`)
        ]);
        
        let recommendedData: Job[] = [];
        let referralData: Job[] = [];
        let appsData: Application[] = [];

        if (jobsRes && jobsRes.ok) {
            const { recommended, referral } = await jobsRes.json();
            recommendedData = recommended || [];
            referralData = referral || [];
        }
        
        if (appsRes && appsRes.ok) {
             appsData = await appsRes.json() || [];
        }
        
        const appliedJobIds = new Set(Array.isArray(appsData) ? appsData.map(app => app.jobId) : []);
        
        setRecommendedJobs(recommendedData.filter(job => !appliedJobIds.has(job.id)).slice(0, 6));
        setReferralJobs(referralData.filter(job => !appliedJobIds.has(job.id)).slice(0, 6));

    } catch(error) {
        console.error("Failed to fetch dashboard data", error);
        setRecommendedJobs([]);
        setReferralJobs([]);
    } finally {
        setLoading(false);
    }
  }, [user]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get('search') as string;
    router.push(`/jobs?search=${searchQuery}`);
  };

  const handleQuickSearch = (term: string) => {
    router.push(`/jobs?search=${term}`);
  };
  
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

      {loading && user?.domainId && (
        <Card>
          <CardHeader>
             <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
                <Skeleton className="h-48 w-3/4" />
                <Skeleton className="h-48 w-1/4" />
              </div>
          </CardContent>
        </Card>
      )}

      {!loading && recommendedJobs.length > 0 && (
         <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        Recommended For You
                    </CardTitle>
                    
                </div>
                 {user?.domainId && (
                    <Button asChild variant="link" className="text-[#f72585]">
                        <Link href={`/jobs?domain=${user.domainId}`}>
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
                               <JobCard job={job} isApplied={false} hideDetails={true} />
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

      {!loading && referralJobs.length > 0 && (
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
                               <JobCard job={job} isApplied={false} hideDetails={true} />
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

    