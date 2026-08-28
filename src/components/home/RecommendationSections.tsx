"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/contexts/user-context';
import { calculateInternationalJobMatch } from '@/lib/recommendation-engine';
import JobCard from '../job-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import {
  Sparkles, MapPin, Laptop, Clock, Building2,
  Award, DollarSign, GraduationCap, FileCheck,
  Timer, ShieldCheck, Flame, ChevronRight
} from 'lucide-react';

interface RecommendationSectionProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  jobs: any[];
  viewAllHref?: string;
}

const JobSectionCarousel = ({ title, subtitle, icon, jobs, viewAllHref = "/jobs" }: RecommendationSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useState<HTMLDivElement | null>(null)[0];

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px' });

    const el = document.getElementById(`section-${title.replace(/\s+/g, '-').toLowerCase()}`);
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [title]);

  if (!jobs || jobs.length === 0) return null;

  return (
    <div id={`section-${title.replace(/\s+/g, '-').toLowerCase()}`} className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm mb-8 transition-all min-h-[220px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg sm:text-xl tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
        </div>
        <Link href={viewAllHref} prefetch={false} className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {isVisible ? (
        <Carousel className="w-full">
          <CarouselContent className="-ml-3">
            {jobs.slice(0, 10).map((job) => (
              <CarouselItem key={job.id || job.uuid} className="pl-3 basis-[90%] sm:basis-1/2 lg:basis-1/3">
                <JobCard job={job} isApplied={false} hideDetails={false} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-4" />
          <CarouselNext className="hidden sm:flex -right-4" />
        </Carousel>
      ) : (
        <div className="h-44 bg-slate-50 dark:bg-slate-800/30 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-400">
          Loading section content...
        </div>
      )}
    </div>
  );
};

export default function RecommendationSections() {
  const { user } = useUser();
  const router = useRouter();
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        const res = await fetch('/api/jobs?limit=50');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.jobs || data.recommended || []);
          setAllJobs(list);
        }
      } catch (err) {
        console.error("Failed to fetch recommendation jobs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  // Compute recommendation scores for logged in candidate
  const scoredJobs = useMemo(() => {
    return allJobs.map(job => {
      if (user) {
        const matchResult = calculateInternationalJobMatch(user, job);
        return { ...job, matchScore: matchResult.score, matchBreakdown: matchResult.breakdown };
      }
      return { ...job, matchScore: 75 };
    });
  }, [allJobs, user]);

  // Section 1: Recommended For You
  const recommendedForYou = useMemo(() => {
    return [...scoredJobs].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [scoredJobs]);

  // Section 2: Jobs Near You
  const jobsNearYou = useMemo(() => {
    if (!user) return scoredJobs.filter(j => j.location || j.country);
    const userLoc = `${user.currentCity || ''} ${user.state || ''} ${user.country || ''}`.toLowerCase();
    return scoredJobs.filter(j => {
      const jLoc = `${j.city || ''} ${j.state || ''} ${j.country || ''} ${j.location || ''}`.toLowerCase();
      return userLoc.split(' ').some(part => part && part.length > 2 && jLoc.includes(part));
    });
  }, [scoredJobs, user]);

  // Section 3: Remote Jobs
  const remoteJobs = useMemo(() => {
    return scoredJobs.filter(j => j.remoteType === 'remote' || j.workplaceType === 'Remote' || (j.location || '').toLowerCase().includes('remote'));
  }, [scoredJobs]);

  // Section 4: Recently Posted
  const recentlyPosted = useMemo(() => {
    return [...scoredJobs].sort((a, b) => new Date(b.postedAt || b.created_at || 0).getTime() - new Date(a.postedAt || a.created_at || 0).getTime());
  }, [scoredJobs]);

  // Section 5: Top Companies Hiring
  const topCompanies = useMemo(() => {
    const compMap = new Map<string, { companyName: string; companyLogo?: string; count: number; jobs: any[] }>();
    scoredJobs.forEach(job => {
      const name = job.companyName || job.company || 'Top Company';
      if (!compMap.has(name)) {
        compMap.set(name, { companyName: name, companyLogo: job.companyLogo, count: 0, jobs: [] });
      }
      const item = compMap.get(name)!;
      item.count += 1;
      item.jobs.push(job);
    });
    return Array.from(compMap.values()).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [scoredJobs]);

  // Section 6: Jobs Matching Your Skills
  const matchingSkills = useMemo(() => {
    if (!user || !user.skills || user.skills.length === 0) return scoredJobs.slice(0, 6);
    const userSkills = user.skills.map((s: any) => (typeof s === 'string' ? s : s.name).toLowerCase());
    return scoredJobs.filter(j => {
      const reqs = (j.requiredSkills || []).concat(j.niceToHaveSkills || []).map((s: string) => s.toLowerCase());
      return reqs.some((r: string) => userSkills.some((u: string) => r.includes(u) || u.includes(r)));
    });
  }, [scoredJobs, user]);

  // Section 8: Internship Opportunities
  const internshipJobs = useMemo(() => {
    return scoredJobs.filter(j => j.type === 'Internship' || (j.type || '').toLowerCase().includes('intern') || (j.title || '').toLowerCase().includes('intern'));
  }, [scoredJobs]);

  // Section 11: Visa Sponsorship Jobs
  const visaJobs = useMemo(() => {
    return scoredJobs.filter(j => j.visaSponsorship === true || j.visa_sponsorship === true || (j.description || '').toLowerCase().includes('visa sponsorship'));
  }, [scoredJobs]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <Skeleton className="h-6 w-48 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-44 w-full rounded-xl" />
              <Skeleton className="h-44 w-full rounded-xl" />
              <Skeleton className="h-44 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 my-8">

      {/* 1. Recommended For You — logged-in only */}
      {user && (
        <JobSectionCarousel
          title="Recommended For You"
          subtitle="AI-matched roles customized for your profile"
          icon={<Sparkles className="w-5 h-5" />}
          jobs={recommendedForYou}
        />
      )}

      {/* 6. Based on Skills — logged-in only */}
      {user && (
        <JobSectionCarousel
          title="Based on Skills"
          subtitle="Roles requesting skills listed in your profile"
          icon={<Award className="w-5 h-5 text-indigo-500" />}
          jobs={matchingSkills}
        />
      )}

      {/* 4. Recently Posted — logged-in only */}
      {user && (
        <JobSectionCarousel
          title="Recently Posted"
          subtitle="Fresh job openings published in the last few days"
          icon={<Clock className="w-5 h-5 text-amber-500" />}
          jobs={recentlyPosted}
        />
      )}

      {/* 2. Jobs Near You — logged-in only */}
      {user && jobsNearYou.length > 0 && (
        <JobSectionCarousel
          title="Jobs Near You"
          subtitle="Opportunities in your preferred country, state, and city"
          icon={<MapPin className="w-5 h-5 text-emerald-500" />}
          jobs={jobsNearYou}
        />
      )}

      {/* 3. Remote Jobs — visible to all */}
      <JobSectionCarousel
        title="Remote Jobs"
        subtitle="Work from anywhere worldwide"
        icon={<Laptop className="w-5 h-5 text-sky-500" />}
        jobs={remoteJobs}
      />

      {/* 8. Internship Opportunities — visible to all */}
      <JobSectionCarousel
        title="Internship Opportunities"
        subtitle="Early career & entry-level internship roles"
        icon={<GraduationCap className="w-5 h-5 text-purple-500" />}
        jobs={internshipJobs.length > 0 ? internshipJobs : recentlyPosted.slice(0, 5)}
      />

      {/* 11. Visa Sponsorship Jobs — logged-in only */}
      {user && visaJobs.length > 0 && (
        <JobSectionCarousel
          title="Visa Sponsorship Jobs"
          subtitle="International roles offering work visa sponsorship"
          icon={<ShieldCheck className="w-5 h-5 text-rose-500" />}
          jobs={visaJobs}
        />
      )}

    </div>
  );
}
