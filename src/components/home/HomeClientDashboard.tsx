"use client";

import { useUser } from '@/contexts/user-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import JobSeekerDashboard from "@/components/dashboards/job-seeker-dashboard";
import RecruiterDashboard from "@/components/dashboards/recruiter-dashboard";

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

  if (loading || !user) {
    return <>{fallback}</>;
  }

  switch (user.role) {
    case "Job Seeker":
      return <JobSeekerDashboard />;
    case "Recruiter":
      return <RecruiterDashboard />;
    case "Admin":
    case "Super Admin":
      return (
        <div className="container mx-auto py-16 px-4 text-center">
          <p className="text-sm font-bold text-slate-500">Redirecting to Admin Dashboard...</p>
        </div>
      );
    default:
      return <>{fallback}</>;
  }
}
