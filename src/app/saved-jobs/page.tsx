"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import type { Job } from "@/lib/types";
import JobCard from "@/components/job-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { BookmarkX, Bookmark, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function SavedJobsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSavedJobs = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${user.id}/saved-jobs?includeDetails=true`);
        if (res.ok) {
          const data = await res.json();
          setSavedJobs(Array.isArray(data) ? data : []);
        } else {
          toast({ title: "Error", description: "Failed to fetch saved jobs.", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
  }, [user, toast]);

  useEffect(() => {
    if (!userLoading && !user) router.push("/login");
    else if (user) fetchSavedJobs();
  }, [user, userLoading, router, fetchSavedJobs]);

  const handleSaveToggle = async (jobId: string, isCurrentlySaved: boolean) => {
    if (!user) return;
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
      if (isCurrentlySaved) {
        setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not update saved jobs. Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">Saved Jobs</h1>
            </div>
            <p className="text-white/80 text-sm md:text-base ml-[52px]">
              {loading ? "Loading your bookmarks..." : `${savedJobs.length} job${savedJobs.length !== 1 ? "s" : ""} saved for later`}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {(userLoading || loading) && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-1/2 rounded-lg" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
                <Skeleton className="h-4 w-full rounded-lg" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Job Grid */}
        {!loading && !userLoading && savedJobs.length > 0 && (
          <AnimatePresence>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  layout
                >
                  <JobCard job={job} isSaved={true} onSaveToggle={handleSaveToggle} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Empty State */}
        {!loading && !userLoading && savedJobs.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center max-w-lg mx-auto mt-8"
          >
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookmarkX className="w-8 h-8 text-rose-400" />
            </div>
            <h3 className="text-slate-700 font-bold text-xl mb-2">No Saved Jobs Yet</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Browse open positions and hit the bookmark icon to save jobs you're interested in.
            </p>
            <Button asChild className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-6">
              <Link href="/jobs">
                <Search className="w-4 h-4 mr-2" />
                Browse Jobs
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
