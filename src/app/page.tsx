
"use client";

import { useUser } from '@/contexts/user-context';
import { useRouter } from 'next/navigation';
import JobSeekerDashboard from "@/components/dashboards/job-seeker-dashboard";
import RecruiterDashboard from "@/components/dashboards/recruiter-dashboard";
import EmployeeDashboard from "@/components/dashboards/employee-dashboard";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'Super Admin' || user.role === 'Admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [user, loading, router]);
  

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center p-4">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2" />
             <div className="mt-8 flex flex-wrap justify-center gap-4">
               <Skeleton className="h-12 w-32" />
               <Skeleton className="h-12 w-32" />
            </div>
          </div>
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
