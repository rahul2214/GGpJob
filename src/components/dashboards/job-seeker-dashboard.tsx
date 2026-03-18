"use client";

import { useState, useEffect, useMemo } from "react";
import type { Job, Application } from "@/lib/types";
import JobCard from "../job-card";
import { Button } from "../ui/button";
import { Search, ArrowRight, BriefcaseBusiness, Star, ThumbsUp, BookmarkCheck, Bell, TrendingUp, Zap } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { ProfileStrength } from "../profile-strength";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useDashboardJobs, useSavedJobs } from "@/hooks/use-jobs";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } }),
};

const quickSearchTerms = ["Software Engineer", "Remote", "Marketing", "Finance", "Design", "Data Science"];

export default function JobSeekerDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { toast } = useToast();

  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const { savedJobs, mutateSavedJobs } = useSavedJobs(user?.id);

  const { data: jobData, isLoading, isError } = useDashboardJobs(
    user?.domainId ? { domain: user.domainId, dashboard: "true" } : { dashboard: "true" }
  );

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

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (debouncedSearchQuery) router.push(`/jobs?search=${debouncedSearchQuery}`);
  };

  const handleQuickSearch = (term: string) => router.push(`/jobs?search=${term}`);

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
  const recommendedJobs = useMemo(() => jobData?.recommended?.filter((job) => !appliedJobIds.has(job.id)).slice(0, 5) || [], [jobData, appliedJobIds]);
  const referralJobs = useMemo(() => jobData?.referral?.filter((job) => !appliedJobIds.has(job.id)).slice(0, 5) || [], [jobData, appliedJobIds]);

  const firstName = user?.name?.split(" ")[0] || "there";

  const stats = [
    { label: "Applications", value: userApplications.length, icon: BriefcaseBusiness, color: "from-indigo-500 to-violet-600", bg: "bg-indigo-50", text: "text-indigo-600", href: "/applications" },
    { label: "Saved Jobs", value: savedJobs?.length || 0, icon: BookmarkCheck, color: "from-rose-500 to-pink-600", bg: "bg-rose-50", text: "text-rose-600", href: "/saved-jobs" },
    { label: "Referrals Available", value: referralJobs.length, icon: ThumbsUp, color: "from-amber-500 to-orange-500", bg: "bg-amber-50", text: "text-amber-600", href: user?.domainId ? `/jobs?domain=${user.domainId}&isReferral=true` : "/jobs?isReferral=true" },
    { label: "Recommended", value: recommendedJobs.length, icon: Star, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50", text: "text-emerald-600", href: user?.domainId ? `/jobs?domain=${user.domainId}` : "/jobs" },
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
            <Link href="/jobs">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-white text-indigo-700 font-bold px-4 py-2.5 rounded-xl text-sm shadow-md hover:bg-indigo-50 transition-colors">
                <Search className="w-4 h-4" /> Browse Jobs
              </motion.button>
            </Link>
            <Link href="/notifications">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-white/15 border border-white/30 text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-white/25 transition-colors">
                <Bell className="w-4 h-4" /> Alerts
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
            <Link href={stat.href}>
              <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 p-5 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-500 text-xs font-medium mb-1">{stat.label}</p>
                    <p className="text-3xl font-extrabold text-slate-800">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.text}`} />
                  </div>
                </div>
                <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${stat.color} opacity-70`} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Profile Strength */}
      <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5">
          {user && <ProfileStrength user={user} />}
        </div>
      </motion.div>

      {/* Search Section */}
      <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-8 shadow-lg"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h2 className="text-white font-bold text-lg">Find Your Next Opportunity</h2>
          </div>
          <p className="text-slate-400 text-sm mb-5">Search by title, company, skills, or location</p>

          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex items-center bg-white rounded-xl overflow-hidden shadow-md">
              <div className="pl-4 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <Input
                name="search"
                placeholder="e.g. React Developer, Google, Remote..."
                className="flex-grow border-0 focus-visible:ring-0 shadow-none text-slate-800 text-base bg-transparent pl-3 h-12"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" className="m-1 h-10 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-none">
                Search
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap gap-2">
            {quickSearchTerms.map((term) => (
              <motion.button
                key={term}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickSearch(term)}
                className="bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 hover:text-white text-xs font-medium px-3 py-1.5 rounded-full transition-all"
              >
                {term}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

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
              <Link href={`/jobs?domain=${user.domainId}`} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm font-semibold transition-colors">
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
                      <JobCard job={job} isApplied={appliedJobIds.has(job.id)} isSaved={savedJobIds.has(job.id)} onSaveToggle={handleSaveToggle} hideDetails={true} />
                    </div>
                  </CarouselItem>
                ))}
                {recommendedJobs.length === 5 && (
                  <CarouselItem className="pl-2 basis-[85%] sm:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <Link href={`/jobs?domain=${user?.domainId}`} className="block h-full">
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
              <Link href={`/jobs?domain=${user.domainId}&isReferral=true`} className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-semibold transition-colors">
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
                      <JobCard job={job} isApplied={appliedJobIds.has(job.id)} isSaved={savedJobIds.has(job.id)} onSaveToggle={handleSaveToggle} hideDetails={true} />
                    </div>
                  </CarouselItem>
                ))}
                {referralJobs.length === 5 && (
                  <CarouselItem className="pl-2 basis-[85%] sm:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <Link href={user?.domainId ? `/jobs?domain=${user.domainId}&isReferral=true` : `/jobs?isReferral=true`} className="block h-full">
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
