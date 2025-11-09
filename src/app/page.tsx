
"use client";

import { useUser } from '@/contexts/user-context';
import { useRouter } from 'next/navigation';
import JobSeekerDashboard from "@/components/dashboards/job-seeker-dashboard";
import RecruiterDashboard from "@/components/dashboards/recruiter-dashboard";
import EmployeeDashboard from "@/components/dashboards/employee-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { AnimatedCounter } from '@/components/animated-counter';
import { Briefcase, Users, Building } from 'lucide-react';

interface AnalyticsData {
  totalDirectJobs: number;
  totalReferralJobs: number;
  totalJobSeekers: number;
  totalRecruiters: number;
  totalEmployees: number;
}

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'Super Admin' || user.role === 'Admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        const res = await fetch(`/api/analytics`);
        const data = await res.json();
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    if (!user && !loading) {
       fetchAnalytics();
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
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
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    if (!user) {
       return (
         <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Welcome to VELTRIA Job Portal</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              Your premier destination for connecting with top talent and finding the perfect job opportunity. Explore thousands of listings today.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                  <Link href="/login">Get Started</Link>
              </Button>
               <Button asChild variant="outline" size="lg">
                  <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </div>
            
             <div className="mt-16 w-full max-w-4xl">
              {analyticsLoading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="text-center">
                        <CardHeader>
                          <Skeleton className="h-8 w-20 mx-auto mb-2" />
                          <Skeleton className="h-5 w-32 mx-auto" />
                        </CardHeader>
                      </Card>
                    ))}
                 </div>
              ) : analytics ? (
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  <Card>
                    <CardHeader className="items-center text-center">
                      <Briefcase className="h-8 w-8 text-primary mb-2" />
                      <AnimatedCounter value={analytics.totalDirectJobs + analytics.totalReferralJobs} className="text-4xl font-bold" />
                      <CardDescription>Live Jobs</CardDescription>
                    </CardHeader>
                  </Card>
                   <Card>
                    <CardHeader className="items-center text-center">
                      <Users className="h-8 w-8 text-primary mb-2" />
                      <AnimatedCounter value={analytics.totalJobSeekers} className="text-4xl font-bold" />
                      <CardDescription>Candidates</CardDescription>
                    </CardHeader>
                  </Card>
                   <Card>
                    <CardHeader className="items-center text-center">
                      <Building className="h-8 w-8 text-primary mb-2" />
                      <AnimatedCounter value={analytics.totalRecruiters + analytics.totalEmployees} className="text-4xl font-bold" />
                      <CardDescription>Companies</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              ) : null}
            </div>
         </div>
       );
    }
    
    switch(user.role) {
      case "Job Seeker":
        return <JobSeekerDashboard />;
      case "Recruiter":
        return <RecruiterDashboard />;
      case "Employee":
        return <EmployeeDashboard />;
      case "Admin":
      case "Super Admin":
        // Redirect is handled by useEffect, show a loader or null
        return (
             <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <p>Loading Admin Dashboard...</p>
             </div>
        )
      default:
         router.push('/login');
         return null;
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {renderDashboard()}
    </div>
  );
}
