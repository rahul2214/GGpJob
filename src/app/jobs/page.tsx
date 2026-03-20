"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Application } from "@/lib/types";
import JobCard from "@/components/job-card";
import { JobFilters } from "@/components/job-filters";
import { useUser } from "@/contexts/user-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobs, useSavedJobs } from "@/hooks/use-jobs";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Briefcase, ThumbsUp, Star, SlidersHorizontal, BriefcaseBusiness } from "lucide-react";

const pageConfig = {
  referral: {
    title: "Referral Jobs",
    subtitle: "Get hired 5× faster through insider referrals",
    icon: ThumbsUp,
    gradient: "from-emerald-600 to-teal-600",
    badge: "bg-emerald-100 text-emerald-700",
    accent: "bg-emerald-500",
  },
  recommended: {
    title: "Recommended Jobs",
    subtitle: "Curated picks matched to your domain & skills",
    icon: Star,
    gradient: "from-amber-500 to-orange-500",
    badge: "bg-amber-100 text-amber-700",
    accent: "bg-amber-500",
  },
  all: {
    title: "All Jobs",
    subtitle: "Explore thousands of opportunities across every domain",
    icon: Search,
    gradient: "from-indigo-600 to-violet-600",
    badge: "bg-indigo-100 text-indigo-700",
    accent: "bg-indigo-500",
  },
};

function JobSearchContent() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const { savedJobs, mutateSavedJobs } = useSavedJobs(user?.id);
  const { toast } = useToast();

  const params = useMemo(() => {
    const p: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      if (p[key]) {
        if (Array.isArray(p[key])) p[key].push(value);
        else p[key] = [p[key], value];
      } else {
        p[key] = value;
      }
    });
    if (user?.id) {
        p.userId = user.id;
    }
    return p;
  }, [searchParams, user?.id]);

  const { jobs, isLoading, isError } = useJobs(params);

  const isRecommended = searchParams.get("view") === "recommended";
  const isReferral = searchParams.get("isReferral") === "true";
  const mode = isReferral ? "referral" : isRecommended ? "recommended" : "all";
  const config = pageConfig[mode];
  const Icon = config.icon;

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
    const newSavedJobs = isCurrentlySaved
      ? originalSavedJobs.filter((id) => id !== jobId)
      : [...originalSavedJobs, jobId];
    mutateSavedJobs(newSavedJobs, false);
    const method = isCurrentlySaved ? "DELETE" : "POST";
    const url = isCurrentlySaved
      ? `/api/users/${user.id}/saved-jobs?jobId=${jobId}`
      : `/api/users/${user.id}/saved-jobs`;
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: isCurrentlySaved ? undefined : JSON.stringify({ jobId }),
      });
      if (!response.ok) throw new Error("Failed to update saved status");
      mutateSavedJobs();
    } catch (error) {
      mutateSavedJobs(originalSavedJobs, false);
      toast({ title: "Error", description: "Could not update saved jobs.", variant: "destructive" });
    }
  };

  const appliedJobIds = useMemo(() => new Set(userApplications.map((app) => app.jobId)), [userApplications]);
  const savedJobIds = useMemo(() => new Set(savedJobs || []), [savedJobs]);
  const filteredJobs = useMemo(
    () => (user?.role === "Job Seeker" ? jobs?.filter((job) => !appliedJobIds.has(job.id)) : jobs),
    [jobs, appliedJobIds, user]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <div className={`bg-gradient-to-br ${config.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-black/10 rounded-full blur-2xl" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">{config.title}</h1>
            </div>
            <p className="text-white/80 text-sm md:text-base ml-[52px]">{config.subtitle}</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar Filters */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="hidden lg:block">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-20">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-slate-700 text-sm">Filters</span>
              </div>
              <div className="p-3">
                <JobFilters />
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            {/* Results header */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${config.badge}`}>
                  <Icon className="w-3 h-3" />
                  {config.title}
                </span>
                {!isLoading && (
                  <span className="text-slate-500 text-sm">
                    {filteredJobs?.length || 0} results
                  </span>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4" style={{ minHeight: "600px" }}>
                {[...Array(5)].map((_, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/5 rounded-lg" />
                        <Skeleton className="h-4 w-2/5 rounded-lg" />
                      </div>
                      <Skeleton className="h-10 w-10 rounded-xl" />
                    </div>
                    <Skeleton className="h-4 w-full rounded-lg" />
                    <Skeleton className="h-4 w-4/5 rounded-lg" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Error */}
            {isError && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-rose-500" />
                </div>
                <p className="text-rose-700 font-medium">Failed to load jobs. Please refresh and try again.</p>
              </div>
            )}

            {/* Job Cards */}
            {!isLoading && !isError && filteredJobs && filteredJobs.length > 0 && (
              <AnimatePresence>
                <div className="space-y-3">
                  {filteredJobs.map((job, i) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.35, delay: i * 0.04 }}
                    >
                      <JobCard
                        job={job}
                        isApplied={appliedJobIds.has(job.id)}
                        isSaved={savedJobIds.has(job.id)}
                        onSaveToggle={handleSaveToggle}
                      />
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}

            {/* Empty State */}
            {!isLoading && !isError && (!filteredJobs || filteredJobs.length === 0) && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-14 text-center"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BriefcaseBusiness className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-slate-700 font-bold text-lg mb-2">No Jobs Found</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">
                  Try adjusting your search or filters, or check back later for new openings.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function JobSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="space-y-3 w-full max-w-2xl px-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
      </div>
    }>
      <JobSearchContent />
    </Suspense>
  );
}
