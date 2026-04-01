"use client";

import { useUser } from '@/contexts/user-context';
import { useRouter } from 'next/navigation';
import JobSeekerDashboard from "@/components/dashboards/job-seeker-dashboard";
import RecruiterDashboard from "@/components/dashboards/recruiter-dashboard";
import EmployeeDashboard from "@/components/dashboards/employee-dashboard";
import { Skeleton } from '@/components/ui/skeleton';
import JobPortalHome from '@/components/home/JobPortalHome';

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12">
            <div className="w-full md:w-1/2 space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-12 w-full rounded-full" />
            </div>
            <div className="w-full md:w-1/2">
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
          <div className="space-y-4 pt-12">
            <Skeleton className="h-10 w-1/3 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    if (!user) {
       return <JobPortalHome />;
    }
    
    let dashboardComponent;
    switch(user.role) {
      case "Job Seeker":
        if (!user.planType) {
            router.push('/jobseeker/plans');
            return null;
        }
        dashboardComponent = <JobSeekerDashboard />;
        break;
      case "Recruiter":
        if (!user.isPaid) {
            router.push('/company/payment');
            return null;
        }
        dashboardComponent = <RecruiterDashboard />;
        break;
      case "Employee":
        if (!user.isPaid) {
            router.push('/company/payment');
            return null;
        }
        dashboardComponent = <EmployeeDashboard />;
        break;
      case "Admin":
      case "Super Admin":
        router.push('/admin/dashboard');
        return (
             <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <p>Redirecting to Admin Dashboard...</p>
             </div>
        )
      default:
         router.push('/login');
         return null;
    }
    return (
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
            {dashboardComponent}
        </div>
    )
  }

  return (
    <div>
      {renderDashboard()}
    </div>
  );
}
