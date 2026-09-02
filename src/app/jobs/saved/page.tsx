"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import type { Job } from "@/lib/types";
import JobCard from "@/components/job-card";
import { useUser } from "@/contexts/user-context";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function SavedJobsContent() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Job Seeker')) {
      router.push('/');
      return;
    }
  }, [user, loading, router]);

  const loadSavedJobs = async () => {
    if (!user?.uuid) return;
    try {
      setFetching(true);
      const res = await fetch(`/api/jobs/saved?userId=${user.uuid}`);
      if (res.ok) {
        const data = await res.json();
        // Set all retrieved saved jobs as isSaved: true
        setJobs(data.map((j: Job) => ({ ...j, isSaved: true })));
      }
    } catch (err) {
      console.error("Failed to load saved jobs", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadSavedJobs();
  }, [user?.uuid]);

  const handleSaveToggle = (jobUuid: string, isSaved: boolean) => {
    if (!isSaved) {
      // If unbookmarked, filter it out from the current list immediately for fluid user feedback
      setJobs(prev => prev.filter(j => j.uuid !== jobUuid));
    }
  };

  if (loading || (!user && fetching)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20 relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-15 dark:opacity-5 bg-indigo-500" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10">

        {/* Results List */}
        <div className="max-w-5xl">
          {fetching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-6 space-y-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <Skeleton className="w-12 h-12 rounded-2xl" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-2/5 rounded-lg" />
                        <Skeleton className="h-4 w-1/5 rounded-lg" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-5/6 rounded-lg" />
                </div>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {jobs.map((job, idx) => (
                  <motion.div
                    key={job.uuid || job.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.35 }}
                  >
                    <JobCard
                      job={job}
                      isApplied={job.isApplied}
                      onSaveToggle={handleSaveToggle}
                    />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border-2 border-dashed border-slate-200/60 dark:border-slate-800/60 p-16 text-center max-w-2xl mx-auto"
            >
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200/40 dark:border-slate-800/40">
                <Bookmark className="w-8 h-8 text-slate-400 dark:text-slate-600" />
              </div>
              <h3 className="text-slate-700 dark:text-slate-300 font-extrabold text-lg mb-2">No Saved Jobs Yet</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mx-auto mb-6">
                Tap the bookmark icon on any job card to save it here for quick reference.
              </p>
              <Button
                onClick={() => router.push('/jobs')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-6 py-2.5 flex items-center gap-2 shadow-lg shadow-indigo-500/25 mx-auto"
              >
                Browse Jobs
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SavedJobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <SavedJobsContent />
    </Suspense>
  );
}
