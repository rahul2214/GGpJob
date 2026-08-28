"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Job } from "@/lib/types";
import JobCard from "@/components/job-card";
import { JobFilters } from "@/components/job-filters";
import { useUser } from "@/contexts/user-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobs } from "@/hooks/use-jobs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BriefcaseBusiness,
  Sparkles,
  MapPin,
  Clock,
  Zap,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { intelligentSearchJobs } from "@/lib/intelligent-search";

// ─── Tab config ────────────────────────────────────────────────────────────

type TabKey = "all" | "recommended" | "near-you" | "recent" | "skills" | "visa";

interface TabConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
  badge: string;
  title: string;
  subtitle: string;
  requiresLogin?: boolean;
}

const TAB_CONFIG: Record<TabKey, TabConfig> = {
  all: {
    label: "All Jobs",
    icon: <BriefcaseBusiness className="w-3.5 h-3.5" />,
    color: "text-indigo-600 dark:text-indigo-400",
    badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400",
    title: "Discover Global Roles",
    subtitle: "Browse all verified enterprise opportunities from top companies worldwide.",
  },
  recommended: {
    label: "Recommended",
    icon: <Sparkles className="w-3.5 h-3.5" />,
    color: "text-amber-500 dark:text-amber-400",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400",
    title: "AI Recommended Roles",
    subtitle: "Ranked for you based on your skills, experience, location, and preferences.",
    requiresLogin: true,
  },
  "near-you": {
    label: "Near You",
    icon: <MapPin className="w-3.5 h-3.5" />,
    color: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400",
    title: "Jobs Near You",
    subtitle: "Opportunities matched to your country, state, and city from your profile.",
    requiresLogin: true,
  },
  recent: {
    label: "Recently Posted",
    icon: <Clock className="w-3.5 h-3.5" />,
    color: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400",
    title: "Recently Posted",
    subtitle: "Fresh opportunities posted in the last 7 days — apply before the queue builds.",
  },
  skills: {
    label: "Skill Match",
    icon: <Zap className="w-3.5 h-3.5" />,
    color: "text-violet-600 dark:text-violet-400",
    badge: "bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400",
    title: "Matched to Your Skills",
    subtitle: "Jobs requiring the exact skills listed in your profile, ranked by overlap.",
    requiresLogin: true,
  },
  visa: {
    label: "Visa Sponsorship",
    icon: <Globe className="w-3.5 h-3.5" />,
    color: "text-rose-600 dark:text-rose-400",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400",
    title: "Visa Sponsorship Jobs",
    subtitle: "Companies offering work visa or permit sponsorship for international candidates.",
  },
};

const TABS: TabKey[] = ["all", "recommended", "near-you", "recent", "skills", "visa"];

// ─── Matching helpers ───────────────────────────────────────────────────────

function normalize(s: string = "") {
  return s.toLowerCase().trim();
}

/** Score a job for "Near You" tab: country > state > city */
function scoreNearYou(job: Job, user: any): number {
  let score = 0;
  const jCountry = normalize(job.country || job.location || "");
  const jState = normalize(job.state || "");
  const jCity = normalize(job.city || job.location || "");
  const jRemote = normalize(job.remoteType || job.workplaceType || "");

  const uCountry = normalize(user?.country || "");
  const uState = normalize(user?.state || user?.province || "");
  const uCity = normalize(user?.city || "");

  // Remote jobs match everyone
  if (jRemote === "remote") score += 20;

  // Country match
  if (uCountry && (jCountry.includes(uCountry) || uCountry.includes(jCountry))) score += 60;
  // State match
  if (uState && (jState.includes(uState) || uState.includes(jState))) score += 30;
  // City match
  if (uCity && (jCity.includes(uCity) || uCity.includes(jCity))) score += 20;

  return score;
}

/** Score a job for "Skill Match" tab: count overlapping skills */
function scoreSkillMatch(job: Job, user: any): number {
  const userSkills: string[] = (
    user?.skills?.map((s: any) => normalize(s?.name || s)) ||
    user?.preferredSkills?.map((s: string) => normalize(s)) ||
    []
  );
  if (!userSkills.length) return 0;

  const jobSkills = (job.requiredSkills || []).map(normalize);
  if (!jobSkills.length) return 0;

  let matches = 0;
  for (const js of jobSkills) {
    if (userSkills.some((us) => us.includes(js) || js.includes(us))) matches++;
  }
  return matches;
}

/** Score a job for "Recommended" tab: multi-factor relevance */
function scoreRecommended(job: Job, user: any): number {
  let score = scoreSkillMatch(job, user) * 15;
  score += scoreNearYou(job, user);

  // Experience match
  const userExp = user?.experienceYears ?? user?.experience ?? 0;
  if (
    userExp >= (job.minExperience ?? 0) &&
    userExp <= (job.maxExperience ?? 99)
  )
    score += 25;

  // Employment type
  const userEmpTypes: string[] = user?.employmentTypes || [];
  const jobEmpType = normalize(job.employmentType || job.type || "");
  if (
    userEmpTypes.length &&
    userEmpTypes.some((t) => jobEmpType.includes(normalize(t)))
  )
    score += 15;

  // Salary expectation
  const userSalaryMin = user?.preferredSalaryMin ?? user?.expectedSalary ?? 0;
  const userSalaryMax = user?.preferredSalaryMax ?? 0;
  if (
    userSalaryMin &&
    job.salaryMax &&
    job.salaryMax >= userSalaryMin
  )
    score += 10;
  if (userSalaryMax && job.salaryMin && job.salaryMin <= userSalaryMax) score += 5;

  // Remote preference
  const userRemote = normalize(user?.remotePreference || "");
  const jobRemote = normalize(job.remoteType || job.workplaceType || "");
  if (userRemote && jobRemote && jobRemote === userRemote) score += 20;

  // Industry
  const userIndustries: string[] = user?.preferredIndustries || [];
  const jobIndustry = normalize(job.industry || "");
  if (
    userIndustries.length &&
    userIndustries.some((ind) => jobIndustry.includes(normalize(ind)))
  )
    score += 10;

  // Visa
  const userNeedsVisa = user?.visaRequirement;
  if (userNeedsVisa && (job.visaSponsorship || (job as any).visa_sponsorship))
    score += 15;

  return score;
}

// ─── Recent: within last 7 days ────────────────────────────────────────────
function isRecent(job: Job): boolean {
  const posted = (job as any).postedAt || (job as any).posted_at || job.postedDate;
  if (!posted) return true; // show if unknown
  const diff = Date.now() - new Date(posted).getTime();
  return diff < 7 * 24 * 60 * 60 * 1000; // 7 days
}

// ─── Filter criteria helper ────────────────────────────────────────────────
function applyFilterCriteria(jobs: Job[], searchParams: any): Job[] {
  let list = jobs;

  // 1. Date posted
  const posted = searchParams.get('posted');
  if (posted && posted !== 'all') {
    const days = parseInt(posted, 10);
    if (!isNaN(days) && days > 0) {
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      list = list.filter(j => {
        const p = j.postedAt || (j as any).posted_at || j.postedDate;
        return p ? new Date(p).getTime() >= cutoff : true;
      });
    }
  }

  // 2. Experience range
  const minExpParam = searchParams.get('minExp');
  const maxExpParam = searchParams.get('maxExp');
  const minExp = minExpParam ? parseInt(minExpParam, 10) : 0;
  const maxExp = maxExpParam ? parseInt(maxExpParam, 10) : 30;
  if (minExp > 0 || maxExp < 30) {
    list = list.filter(j => {
      const jMin = j.minExperience ?? (j as any).experience_min ?? 0;
      const jMax = j.maxExperience ?? (j as any).experience_max ?? 99;
      return jMin <= maxExp && jMax >= minExp;
    });
  }

  // 3. Job Type / Employment
  const jobTypes = searchParams.getAll('jobType').flatMap((jt: string) => jt.split(',')).filter((jt: string) => jt && jt !== 'all');
  if (jobTypes.length > 0) {
    list = list.filter(j => {
      const jPk = String(j.jobTypePk || (j as any).job_type_pk || "");
      const jType = normalize(j.type || j.employmentType || "");
      return jobTypes.some((jt: string) => {
        const jtStr = normalize(jt);
        return jtStr === jPk || jType.includes(jtStr);
      });
    });
  }

  // 4. Workplace / Remote Type
  const wpTypes = (searchParams.getAll('workplaceType') || []).concat(searchParams.getAll('remoteType') || []).flatMap((wt: string) => wt.split(',')).filter((wt: string) => wt && wt !== 'all');
  if (wpTypes.length > 0) {
    list = list.filter(j => {
      const jWpPk = String((j as any).workplaceTypePk || (j as any).workplace_type_pk || "");
      const jRemote = normalize(j.remoteType || j.workplaceType || "");
      return wpTypes.some((wt: string) => {
        const wtStr = normalize(wt);
        if (wtStr === '1' || wtStr === 'remote') return jWpPk === '1' || jRemote.includes('remote');
        if (wtStr === '2' || wtStr === 'on-site' || wtStr === 'onsite') return jWpPk === '2' || jRemote.includes('onsite') || jRemote.includes('on-site');
        if (wtStr === '3' || wtStr === 'hybrid') return jWpPk === '3' || jRemote.includes('hybrid');
        return wtStr === jWpPk || jRemote.includes(wtStr);
      });
    });
  }

  // 5. Location / Country
  const locs = searchParams.getAll('location').concat(searchParams.getAll('country')).flatMap((l: string) => l.split(',')).filter((l: string) => l && l !== 'all');
  if (locs.length > 0) {
    list = list.filter(j => {
      const jLoc = normalize((j.locations && j.locations.length > 0) ? j.locations.join(' ') : (j.location || ''));
      const jCountry = normalize(j.country || '');
      const jState = normalize(j.state || '');
      const jCity = normalize(j.city || '');
      return locs.some((l: string) => {
        const lNorm = normalize(l);
        return jLoc.includes(lNorm) || jCountry.includes(lNorm) || jState.includes(lNorm) || jCity.includes(lNorm);
      });
    });
  }

  return list;
}

// ─── Main component ─────────────────────────────────────────────────────────

function JobSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const [page, setPage] = useState(1);
  const [savedJobUuids, setSavedJobUuids] = useState<Set<string>>(new Set());

  const rawTab = (searchParams.get("view") || "all") as TabKey;
  const activeTab: TabKey = TABS.includes(rawTab) ? rawTab : "all";
  const config = TAB_CONFIG[activeTab];

  // Reset page on filter/tab change
  useEffect(() => { setPage(1); }, [searchParams]);

  // Fetch saved jobs
  useEffect(() => {
    if (!user?.uuid) return;
    (async () => {
      try {
        const res = await fetch(`/api/jobs/saved?userId=${user.uuid}`);
        if (res.ok) {
          const data: Job[] = await res.json();
          setSavedJobUuids(new Set(data.map((j) => j.uuid)));
        }
      } catch {}
    })();
  }, [user?.uuid]);

  const handleSaveToggle = (jobUuid: string, isSaved: boolean) => {
    setSavedJobUuids((prev) => {
      const next = new Set(prev);
      isSaved ? next.add(jobUuid) : next.delete(jobUuid);
      return next;
    });
  };

  // Build API params — for most tabs we fetch ALL jobs and filter client-side
  const params = useMemo(() => {
    const p: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      if (key === "view") return; // don't send view= to API
      if (p[key]) {
        p[key] = Array.isArray(p[key]) ? [...p[key], value] : [p[key], value];
      } else {
        p[key] = value;
      }
    });
    if (user?.uuid) p.userId = user.uuid;

    // For recent tab, restrict to last 7 days server-side too
    if (activeTab === "recent") p.posted = "7";

    // For visa tab, filter server-side
    if (activeTab === "visa") p.visa = "true";

    // Paginate only on All Jobs; for smart tabs we fetch more and filter client-side
    if (activeTab === "all") {
      p.page = String(page);
      p.limit = "25";
    } else {
      p.limit = "200"; // fetch enough to rank/filter
    }

    return p;
  }, [searchParams, user?.uuid, page, activeTab]);

  const { jobs: rawJobs, isLoading, isError } = useJobs(params);

  // ─── Client-side filtering & ranking per tab ──────────────────────────────
  const jobsToDisplay = useMemo(() => {
    const all: Job[] = rawJobs || [];
    const searchQ = searchParams.get("search") || "";

    // Apply text search if present (all tabs)
    const searched = searchQ ? intelligentSearchJobs(all, searchQ) : all;
    // Apply filters (posted, experience, jobType, workplaceType, location)
    const filtered = applyFilterCriteria(searched, searchParams);

    switch (activeTab) {
      case "all":
        return filtered;

      case "recommended": {
        if (!user) return searched;
        return [...searched]
          .map((job) => ({ job, score: scoreRecommended(job, user) }))
          .filter((r) => r.score > 0)
          .sort((a, b) => b.score - a.score)
          .map((r) => r.job);
      }

      case "near-you": {
        if (!user) return searched;
        const userCountry = normalize(user.country || "");
        const userState = normalize((user as any).state || (user as any).province || "");
        const userCity = normalize((user as any).city || "");

        // Must have at least country match, OR be remote
        return [...searched]
          .map((job) => ({ job, score: scoreNearYou(job, user) }))
          .filter((r) => r.score > 0)
          .sort((a, b) => b.score - a.score)
          .map((r) => r.job);
      }

      case "recent":
        return [...searched]
          .filter(isRecent)
          .sort((a, b) => {
            const ta = new Date((a as any).postedAt || (a as any).posted_at || 0).getTime();
            const tb = new Date((b as any).postedAt || (b as any).posted_at || 0).getTime();
            return tb - ta;
          });

      case "skills": {
        if (!user) return searched;
        return [...searched]
          .map((job) => ({ job, score: scoreSkillMatch(job, user) }))
          .filter((r) => r.score > 0)
          .sort((a, b) => b.score - a.score)
          .map((r) => r.job);
      }

      case "visa":
        return searched.filter(
          (j) => j.visaSponsorship || (j as any).visa_sponsorship
        );

      default:
        return searched;
    }
  }, [rawJobs, activeTab, user, searchParams]);

  // Pagination slice for non-all tabs (client-side)
  const ITEMS_PER_PAGE = 25;
  const paginatedJobs = useMemo(() => {
    if (activeTab === "all") return jobsToDisplay; // server-paginated
    const start = (page - 1) * ITEMS_PER_PAGE;
    return jobsToDisplay.slice(start, start + ITEMS_PER_PAGE);
  }, [jobsToDisplay, activeTab, page]);

  const totalPages = activeTab === "all"
    ? undefined
    : Math.ceil(jobsToDisplay.length / ITEMS_PER_PAGE);

  const needsLogin = config.requiresLogin && !user;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-20 dark:opacity-10 bg-indigo-500" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none translate-x-1/3 opacity-20 dark:opacity-10 bg-violet-400" />

      <div className="container max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Tab Bar */}
        <div className="max-w-5xl mb-6 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex bg-white/80 dark:bg-slate-900/70 backdrop-blur p-1.5 rounded-2xl gap-1 border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-x-auto scrollbar-none"
          >
            {TABS.map((tab) => {
              const tc = TAB_CONFIG[tab];
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setPage(1);
                    router.push(tab === "all" ? "/jobs" : `/jobs?view=${tab}`);
                  }}
                  className={`flex items-center gap-1.5 whitespace-nowrap py-2 px-3.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? "bg-white dark:bg-slate-800 shadow text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <span className={isActive ? tc.color : ""}>{tc.icon}</span>
                  <span>{tc.label}</span>
                </button>
              );
            })}
          </motion.div>

          {/* Active tab subtitle */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 pl-1"
          >
            <h2 className={`text-xl font-extrabold tracking-tight ${config.color}`}>
              {config.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{config.subtitle}</p>
          </motion.div>
        </div>

        {/* Layout Grid */}
        <div className="grid lg:grid-cols-[270px_1fr] gap-6 items-start">

          {/* Sidebar Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="hidden lg:block sticky top-24 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)]"
          >
            <JobFilters />
          </motion.div>

          {/* Results column */}
          <div className="space-y-5">

           
            {/* Login nudge for personalised tabs */}
            {needsLogin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-12 text-center"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${config.badge}`}>
                  {config.icon}
                </div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-lg mb-2">{config.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto mb-5">
                  {config.subtitle}
                  <br />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Please sign in to see personalised results.</span>
                </p>
                <Button onClick={() => router.push("/login")} className="rounded-xl font-bold">
                  Sign In
                </Button>
              </motion.div>
            )}

            {/* Loading Skeleton */}
            {isLoading && (
              <div className="space-y-5" style={{ minHeight: "600px" }}>
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
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {isError && (
              <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200/50 dark:border-rose-900/20 rounded-3xl p-10 text-center">
                <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-rose-500 dark:text-rose-400" />
                </div>
                <h4 className="text-slate-800 dark:text-slate-200 font-extrabold text-lg mb-1">Failed to retrieve listings</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto mb-4">Check your internet connection and try refreshing.</p>
                <Button variant="outline" className="rounded-xl font-bold border-rose-200 text-rose-700 hover:bg-rose-50" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            )}

            {/* Cards Grid */}
            {!isLoading && !isError && !needsLogin && paginatedJobs.length > 0 && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeTab}-${page}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                  {paginatedJobs.map((job, i) => (
                    <motion.div
                      key={job.uuid || job.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3) }}
                    >
                      <JobCard
                        job={{ ...job, isSaved: savedJobUuids.has(job.uuid) }}
                        isApplied={job.isApplied}
                        onSaveToggle={handleSaveToggle}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Pagination */}
            {!isLoading && !isError && !needsLogin && (paginatedJobs.length > 0 || page > 1) && (
              <div className="flex items-center justify-between mt-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md px-6 py-4 rounded-[1.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === 1}
                  className="font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Previous
                </Button>
                <span className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                  {totalPages ? `Page ${page} of ${totalPages}` : `Page ${page}`}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={
                    activeTab === "all"
                      ? paginatedJobs.length < 25
                      : page >= (totalPages ?? 1)
                  }
                  className="font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Next
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && !needsLogin && paginatedJobs.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border-2 border-dashed border-slate-200/60 dark:border-slate-800/60 p-16 text-center"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${config.badge}`}>
                  {config.icon}
                </div>
                <h3 className="text-slate-700 dark:text-slate-300 font-extrabold text-lg mb-2">
                  {activeTab === "near-you"
                    ? "No jobs found near your location"
                    : activeTab === "skills"
                    ? "No skill-matched jobs found"
                    : activeTab === "recommended"
                    ? "Complete your profile for better recommendations"
                    : "No Openings Found"}
                </h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mx-auto">
                  {activeTab === "near-you"
                    ? "Update your country, state, and city in your profile to see nearby jobs."
                    : activeTab === "skills"
                    ? "Add skills to your profile so we can match relevant jobs for you."
                    : "Try clearing your search keyword or adjusting sidebar filters."}
                </p>
                {(activeTab === "near-you" || activeTab === "skills" || activeTab === "recommended") && (
                  <Button
                    variant="outline"
                    className="mt-5 rounded-xl font-bold"
                    onClick={() => router.push("/profile")}
                  >
                    Update Profile
                  </Button>
                )}
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center">
          <div className="space-y-4 w-full max-w-2xl px-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-3xl" />
            ))}
          </div>
        </div>
      }
    >
      <JobSearchContent />
    </Suspense>
  );
}
