"use client";

import { useState, useEffect, useMemo } from "react";
import type { Job, Application } from "@/lib/types";
import JobCard from "../job-card";
import { Button } from "../ui/button";
import { Search, ArrowRight, BriefcaseBusiness, Star, ThumbsUp, Bell, TrendingUp, Zap, Bot, Loader2 } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { ProfileStrength } from "../profile-strength";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useDashboardJobs, useApplications } from "@/hooks/use-jobs";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

// Removed quickSearchTerms as the search section is removed from the dashboard

export default function JobSeekerDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { toast } = useToast();
  const [isAutoApplying, setIsAutoApplying] = useState(false);

  const { applications: userApplications } = useApplications(user ? { userId: user.id } : undefined);

  const { data: jobData, isLoading, isError } = useDashboardJobs(
    user?.domainId ? { domain: user.domainId, dashboard: "true" } : { dashboard: "true" }
  );

  // Search functions removed to declutter dashboard as per user request

  const handleAutoApply = async () => {
    if (!user) return;
    setIsAutoApplying(true);
    try {
      const response = await fetch('/api/linkedin/auto-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to start automation');

      toast({ title: 'Automation Started', description: data.message });
    } catch (error: any) {
      toast({ title: 'Automation Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsAutoApplying(false);
    }
  };


  const appliedJobIds = useMemo(() => new Set(userApplications.map((app) => app.jobId)), [userApplications]);
  const recommendedJobs = useMemo(() => jobData?.recommended?.filter((job) => !appliedJobIds.has(job.id)).slice(0, 5) || [], [jobData, appliedJobIds]);
  const referralJobs = useMemo(() => jobData?.referral?.filter((job) => !appliedJobIds.has(job.id)).slice(0, 5) || [], [jobData, appliedJobIds]);

  const firstName = user?.name?.split(" ")[0] || "there";

  const stats = [
    { label: "Applications", value: userApplications.length, icon: BriefcaseBusiness, color: "from-indigo-500 to-violet-600", bg: "bg-indigo-50", text: "text-indigo-600", href: "/applications" },
    { label: "Referrals Available", value: referralJobs.length, icon: ThumbsUp, color: "from-amber-500 to-orange-500", bg: "bg-amber-50", text: "text-amber-600", href: user?.domainId ? `/jobs?domain=${user.domainId}&isReferral=true` : "/jobs?isReferral=true" },
    { label: "Recommended", value: recommendedJobs.length, icon: Star, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50", text: "text-emerald-600", href: user?.domainId ? `/jobs?domain=${user.domainId}&view=recommended` : "/jobs?view=recommended" },
  ];

  return (
    <div className="space-y-8 py-4 pb-12">

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 py-8 md:py-10 md:px-10 shadow-lg"
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
              <Zap className="w-3 h-3" /> Your Dashboard
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-indigo-200 text-sm md:text-base">
              You have <span className="text-white font-bold">{recommendedJobs.length} new jobs</span> waiting for you today.
            </p>
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-3">
            <Link href="/jobs" className="hidden md:block">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-white text-indigo-700 font-bold px-4 py-2.5 rounded-xl text-sm shadow-md hover:bg-indigo-50 transition-colors w-full md:w-auto">
                <Search className="w-4 h-4" /> Browse Jobs
              </motion.button>
            </Link>
            <Link href="/notifications" className="hidden md:block">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-white/15 border border-white/30 text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-white/25 transition-colors w-full md:w-auto">
                <Bell className="w-4 h-4" /> Alerts
              </motion.button>
            </Link>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={handleAutoApply}
              disabled={isAutoApplying}
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed border border-emerald-300/50">
              {isAutoApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
              {isAutoApplying ? "Starting Bot..." : "LinkedIn Auto Apply"}
            </motion.button>
          </div>
        </div>
      </motion.div>



      {/* Profile Strength */}
      <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5">
          {user && <ProfileStrength user={user} />}
        </div>
      </motion.div>

      {/* Search Section Removed */}

      {/* Domain prompt */}
      {user && !user.domainId && (
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp}
          className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="w-10 h-10 shrink-0 bg-amber-100 rounded-xl flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-800 text-sm">Get Personalized Recommendations</p>
            <p className="text-slate-500 text-xs mt-0.5">Select your preferred job domain in your profile to see jobs tailored just for you.</p>
          </div>
          <Button asChild size="sm" className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
            <Link href="/profile">Update Profile</Link>
          </Button>
        </motion.div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-100 p-5 space-y-4">
            <Skeleton className="h-7 w-48" />
            <div className="flex gap-4">
              <Skeleton className="h-48 flex-1 rounded-xl" />
              <Skeleton className="h-48 flex-1 rounded-xl" />
              <Skeleton className="h-48 flex-1 hidden md:block rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {isError && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 text-rose-700 text-sm font-medium">
          Failed to load jobs. Please refresh the page.
        </div>
      )}

      {/* Recommended Jobs */}
      {!isLoading && user?.domainId && recommendedJobs.length > 0 && (
        <motion.div custom={7} initial="hidden" animate="visible" variants={fadeUp} className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div>
              <h2 className="font-bold text-slate-800 text-lg">Recommended For You</h2>
              <p className="text-slate-400 text-xs">Curated based on your domain and profile</p>
            </div>
            {user?.domainId && (
              <Link href="/jobs?view=recommended" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm font-semibold transition-colors">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
          <div className="px-4 pb-5">
            <Carousel opts={{ align: "start", loop: false }} className="w-full">
              <CarouselContent className="-ml-2">
                {recommendedJobs.map((job) => (
                  <CarouselItem key={job.id} className="pl-2 basis-[85%] sm:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <JobCard job={job} isApplied={appliedJobIds.has(job.id)} hideDetails={false} />
                    </div>
                  </CarouselItem>
                ))}
                {recommendedJobs.length === 5 && (
                  <CarouselItem className="pl-2 basis-[85%] sm:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <Link href="/jobs?view=recommended" className="block h-full">
                        <div className="h-full min-h-[180px] flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group py-10">
                          <div className="w-12 h-12 bg-indigo-100 group-hover:bg-indigo-200 rounded-full flex items-center justify-center mb-3 transition-colors">
                            <ArrowRight className="w-6 h-6 text-indigo-600" />
                          </div>
                          <span className="font-bold text-slate-700 text-sm">View All Recommended</span>
                        </div>
                      </Link>
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        </motion.div>
      )}

      {/* Referral Jobs */}
      {!isLoading && referralJobs.length > 0 && (
        <motion.div custom={8} initial="hidden" animate="visible" variants={fadeUp} className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div>
              <h2 className="font-bold text-slate-800 text-lg">Referrals For You</h2>
              <p className="text-slate-400 text-xs">Get hired 5x faster through employee referrals</p>
            </div>
            {user?.domainId && (
              <Link href="/jobs?isReferral=true" className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-semibold transition-colors">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
          <div className="px-4 pb-5">
            <Carousel opts={{ align: "start", loop: false }} className="w-full">
              <CarouselContent className="-ml-2">
                {referralJobs.map((job) => (
                  <CarouselItem key={job.id} className="pl-2 basis-[85%] sm:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <JobCard job={job} isApplied={appliedJobIds.has(job.id)} hideDetails={false} />
                    </div>
                  </CarouselItem>
                ))}
                {referralJobs.length === 5 && (
                  <CarouselItem className="pl-2 basis-[85%] sm:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <Link href="/jobs?isReferral=true" className="block h-full">
                        <div className="h-full min-h-[180px] flex flex-col items-center justify-center border-2 border-dashed border-emerald-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group py-10">
                          <div className="w-12 h-12 bg-emerald-100 group-hover:bg-emerald-200 rounded-full flex items-center justify-center mb-3 transition-colors">
                            <ArrowRight className="w-6 h-6 text-emerald-600" />
                          </div>
                          <span className="font-bold text-slate-700 text-sm">View All Referrals</span>
                        </div>
                      </Link>
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && recommendedJobs.length === 0 && referralJobs.length === 0 && (
        <motion.div custom={7} initial="hidden" animate="visible" variants={fadeUp}
          className="rounded-2xl bg-white border-2 border-dashed border-slate-200 p-12 text-center"
        >
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BriefcaseBusiness className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-slate-700 font-bold text-lg mb-2">No Jobs Found Yet</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto mb-6">
            Complete your profile and set your domain to get personalized job recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
              <Link href="/profile">Complete Profile</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/jobs">Browse All Jobs</Link>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
