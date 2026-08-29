"use client";

import { useUser } from '@/contexts/user-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import JobSeekerDashboard from "@/components/dashboards/job-seeker-dashboard";
import RecruiterDashboard from "@/components/dashboards/recruiter-dashboard";
import { JobsDartLoading } from "@/components/ui/jobsdart-loading";

interface HomeClientDashboardProps {
  fallback: React.ReactNode;
}

export default function HomeClientDashboard({ fallback }: HomeClientDashboardProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && (user.role === 'Admin' || user.role === 'Super Admin')) {
      router.push('/admin/dashboard');
    }
  }, [user, router]);

  // While checking auth state, show the JobsDart left-to-right animated loading state
  // to avoid flashing the public homepage to logged-in users on page refresh.
  if (loading) {
    return <JobsDartLoading message="Loading your workspace..." fullScreen={true} />;
  }

  // Not logged in -> Show Public Homepage
  if (!user) {
    return <>{fallback}</>;
  }

  // Logged in -> Show appropriate dashboard
  switch (user.role) {
    case "Job Seeker":
      return <JobSeekerDashboard />;
    case "Recruiter":
      return <RecruiterDashboard />;
    case "Admin":
    case "Super Admin":
      return (
        <div className="container max-w-4xl mx-auto py-24 px-4 text-center">
          <JobsDartLoading message="Redirecting to Admin Dashboard..." fullScreen={false} />
        </div>
      );
    default:
      return <>{fallback}</>;
  }
}
