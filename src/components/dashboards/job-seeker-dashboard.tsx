"use client";

import { useUser } from "@/contexts/user-context";
import Link from "next/link";
import { ProfileStrength } from "../profile-strength";
import RecommendationSections from "../home/RecommendationSections";

export default function JobSeekerDashboard() {
  const { user } = useUser();
  const firstName = user?.name?.split(" ")[0] || "User";

  return (
    <div className="space-y-8 py-4 pb-12 px-4 md:px-6 lg:px-8">
      {/* Welcome Banner - Hidden on mobile, clean solid styling */}
      <div className="hidden md:block rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {firstName}!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              New jobs are waiting. Explore fresh opportunities and optimize your profile.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/jobs" 
              prefetch={false} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              Browse Jobs
            </Link>
            <Link 
              href="/ats-score" 
              prefetch={false} 
              className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors inline-flex items-center gap-1.5"
            >
              ATS Checker
            </Link>
            <Link 
              href="/resume-builder" 
              prefetch={false} 
              className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors inline-flex items-center gap-1.5"
            >
              Resume Builder
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Strength */}
      {user && (
        <div className="w-full">
          <ProfileStrength user={user} />
        </div>
      )}

      {/* All 12 Job Recommendation Sections */}
      <RecommendationSections />
    </div>
  );
}
