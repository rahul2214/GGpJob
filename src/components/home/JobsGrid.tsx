"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, Search, ArrowRight, Clock, CheckCircle2, Bookmark } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { intelligentSearchJobs } from '@/lib/intelligent-search';
import { useUser } from '@/contexts/user-context';
import { matchesCountry } from '@/lib/recommendation-engine';
import { getJobUrl } from '@/lib/job-url';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { CompanyLogo } from '@/components/ui/company-logo';

const FALLBACK_JOBS = [
  {
    id: "mnc-1",
    uuid: "mnc-microsoft-101",
    title: "Principal Cloud Solutions Architect — Enterprise Azure",
    companyName: "Microsoft",
    companyLogo: "https://www.google.com/s2/favicons?domain=microsoft.com&sz=128",
    companyWebsite: "https://www.microsoft.com",
    companyLinkedinUrl: "https://www.linkedin.com/company/microsoft",
    location: "Redmond, WA / Remote, USA",
    country: "United States",
    remoteType: "Hybrid",
    type: "Full-time",
    employmentType: "Full-Time",
    salaryMin: 175000,
    salaryMax: 240000,
    salaryCurrency: "USD",
    minExperience: 7,
    maxExperience: 15,
    isReferral: true,
    visaSponsorship: true,
    domain: "Engineering",
    jobLink: "https://careers.microsoft.com/us/en/job/1684920/Principal-Cloud-Solutions-Architect",
    description: "Architect scalable, high-availability multi-region cloud infrastructure on Microsoft Azure for Fortune 500 enterprise customers.",
    benefits: ["Azure", "Kubernetes", "Terraform", "C#", "Cloud Architecture"]
  },
  {
    id: "mnc-2",
    uuid: "mnc-google-102",
    title: "Senior Staff AI & LLM Systems Engineer",
    companyName: "Google",
    companyLogo: "https://www.google.com/s2/favicons?domain=google.com&sz=128",
    companyWebsite: "https://about.google",
    companyLinkedinUrl: "https://www.linkedin.com/company/google",
    location: "Mountain View, CA / London, UK",
    country: "United States",
    remoteType: "Hybrid",
    type: "Full-time",
    employmentType: "Full-Time",
    salaryMin: 190000,
    salaryMax: 260000,
    salaryCurrency: "USD",
    minExperience: 6,
    maxExperience: 12,
    isReferral: true,
    visaSponsorship: true,
    domain: "Engineering",
    jobLink: "https://careers.google.com/jobs/results/148290381023019/Senior-Staff-AI-Engineer",
    description: "Design distributed TPU/GPU training infrastructure and vLLM inference frameworks powering Gemini models across Google Cloud.",
    benefits: ["PyTorch", "JAX", "C++", "Python", "LLM", "Distributed Systems"]
  },
  {
    id: "mnc-3",
    uuid: "mnc-aws-103",
    title: "Lead Full Stack Engineer — Global Payments",
    companyName: "Amazon Web Services (AWS)",
    companyLogo: "https://www.google.com/s2/favicons?domain=amazon.com&sz=128",
    companyWebsite: "https://aws.amazon.com",
    companyLinkedinUrl: "https://www.linkedin.com/company/amazon-web-services",
    location: "Bengaluru, KA, India / Hybrid",
    country: "India",
    remoteType: "Hybrid",
    type: "Full-time",
    employmentType: "Full-Time",
    salaryMin: 135000,
    salaryMax: 185000,
    salaryCurrency: "USD",
    minExperience: 5,
    maxExperience: 10,
    isReferral: true,
    visaSponsorship: true,
    domain: "Engineering",
    jobLink: "https://amazon.jobs/en/jobs/2591029/Lead-Full-Stack-Engineer",
    description: "Drive low-latency checkout systems and multi-currency processing handling 50,000+ RPS with 99.999% reliability.",
    benefits: ["React", "TypeScript", "Java", "AWS", "DynamoDB", "Node.js"]
  },
  {
    id: "mnc-4",
    uuid: "mnc-meta-104",
    title: "Staff Machine Learning Infrastructure Engineer",
    companyName: "Meta",
    companyLogo: "https://www.google.com/s2/favicons?domain=meta.com&sz=128",
    companyWebsite: "https://www.meta.com",
    companyLinkedinUrl: "https://www.linkedin.com/company/meta",
    location: "Menlo Park, CA / Remote",
    country: "United States",
    remoteType: "Remote",
    type: "Full-time",
    employmentType: "Full-Time",
    salaryMin: 180000,
    salaryMax: 250000,
    salaryCurrency: "USD",
    minExperience: 6,
    maxExperience: 14,
    isReferral: true,
    visaSponsorship: true,
    domain: "Engineering",
    jobLink: "https://www.metacareers.com/jobs/9281039581023/Staff-ML-Infrastructure-Engineer",
    description: "Optimize PyTorch compiler pipelines (TorchDynamo, Inductor) and distributed fault-tolerance for 32k+ H100 GPU clusters.",
    benefits: ["PyTorch", "C++", "Python", "MLOps", "GPU Clusters"]
  },
  {
    id: "mnc-5",
    uuid: "mnc-stripe-105",
    title: "Senior Backend Payments & Treasury Engineer",
    companyName: "Stripe",
    companyLogo: "https://www.google.com/s2/favicons?domain=stripe.com&sz=128",
    companyWebsite: "https://stripe.com",
    companyLinkedinUrl: "https://www.linkedin.com/company/stripe",
    location: "San Francisco, CA / Dublin, Ireland",
    country: "United States",
    remoteType: "Remote",
    type: "Full-time",
    employmentType: "Full-Time",
    salaryMin: 160000,
    salaryMax: 220000,
    salaryCurrency: "USD",
    minExperience: 4,
    maxExperience: 9,
    isReferral: true,
    visaSponsorship: true,
    domain: "Engineering",
    jobLink: "https://stripe.com/jobs/listing/senior-backend-payments-engineer/581092",
    description: "Design zero-downtime financial ledger systems with multi-currency reconciliation across 45+ countries.",
    benefits: ["Ruby", "Go", "Java", "PostgreSQL", "API Design"]
  },
  {
    id: "mnc-6",
    uuid: "mnc-apple-106",
    title: "Lead iOS & Systems Performance Engineer",
    companyName: "Apple",
    companyLogo: "https://www.google.com/s2/favicons?domain=apple.com&sz=128",
    companyWebsite: "https://www.apple.com",
    companyLinkedinUrl: "https://www.linkedin.com/company/apple",
    location: "Cupertino, CA / Munich, Germany",
    country: "United States",
    remoteType: "On-site",
    type: "Full-time",
    employmentType: "Full-Time",
    salaryMin: 170000,
    salaryMax: 235000,
    salaryCurrency: "USD",
    minExperience: 5,
    maxExperience: 11,
    isReferral: true,
    visaSponsorship: true,
    domain: "Engineering",
    jobLink: "https://jobs.apple.com/en-us/details/200492810/Lead-iOS-Systems-Performance-Engineer",
    description: "Lead low-level Swift & C++ performance optimization for iOS, macOS, and visionOS frameworks on Apple Silicon.",
    benefits: ["Swift", "C++", "Metal", "iOS", "visionOS", "Apple Silicon"]
  },
  {
    id: "mnc-7",
    uuid: "mnc-salesforce-107",
    title: "Principal DevOps & Kubernetes Specialist",
    companyName: "Salesforce",
    companyLogo: "https://www.google.com/s2/favicons?domain=salesforce.com&sz=128",
    companyWebsite: "https://www.salesforce.com",
    companyLinkedinUrl: "https://www.linkedin.com/company/salesforce",
    location: "Hyderabad, TS, India / Remote",
    country: "India",
    remoteType: "Remote",
    type: "Full-time",
    employmentType: "Full-Time",
    salaryMin: 130000,
    salaryMax: 175000,
    salaryCurrency: "USD",
    minExperience: 6,
    maxExperience: 12,
    isReferral: true,
    visaSponsorship: true,
    domain: "Engineering",
    jobLink: "https://salesforce.wd1.myworkdayjobs.com/External_Career_Site/job/Hyderabad/Principal-DevOps-Engineer_JR198203",
    description: "Automate Kubernetes cluster orchestration, GitOps pipelines, and mesh networking across Hyperforce AWS/GCP regions.",
    benefits: ["Kubernetes", "DevOps", "ArgoCD", "Terraform", "AWS"]
  },
  {
    id: "mnc-8",
    uuid: "mnc-netflix-108",
    title: "Senior Data Engineer — Streaming Analytics",
    companyName: "Netflix",
    companyLogo: "https://www.google.com/s2/favicons?domain=netflix.com&sz=128",
    companyWebsite: "https://www.netflix.com",
    companyLinkedinUrl: "https://www.linkedin.com/company/netflix",
    location: "Los Gatos, CA / Remote",
    country: "United States",
    remoteType: "Hybrid",
    type: "Full-time",
    employmentType: "Full-Time",
    salaryMin: 200000,
    salaryMax: 280000,
    salaryCurrency: "USD",
    minExperience: 5,
    maxExperience: 10,
    isReferral: true,
    visaSponsorship: true,
    domain: "Data",
    jobLink: "https://jobs.netflix.com/jobs/281093849/Senior-Data-Engineer",
    description: "Architect real-time streaming telemetry data pipelines processing trillions of events per day using Flink and Spark.",
    benefits: ["Apache Spark", "Apache Flink", "Python", "Scala", "AWS", "Trino"]
  },
  {
    id: "mnc-9",
    uuid: "mnc-tesla-109",
    title: "Autopilot Embedded Software & Control Engineer",
    companyName: "Tesla",
    companyLogo: "https://www.google.com/s2/favicons?domain=tesla.com&sz=128",
    companyWebsite: "https://www.tesla.com",
    companyLinkedinUrl: "https://www.linkedin.com/company/tesla-motors",
    location: "Austin, TX / Palo Alto, CA",
    country: "United States",
    remoteType: "On-site",
    type: "Full-time",
    employmentType: "Full-Time",
    salaryMin: 155000,
    salaryMax: 215000,
    salaryCurrency: "USD",
    minExperience: 4,
    maxExperience: 10,
    isReferral: true,
    visaSponsorship: true,
    domain: "Engineering",
    jobLink: "https://www.tesla.com/careers/search/job/autopilot-embedded-software-engineer-219403",
    description: "Write hard real-time C++ embedded control software for Tesla Full Self-Driving (FSD) onboard computers.",
    benefits: ["C++", "Embedded C", "RTOS", "CAN Bus", "Autonomous Driving"]
  },
  {
    id: "mnc-10",
    uuid: "mnc-adobe-110",
    title: "Senior UX Architect & Design Systems Lead",
    companyName: "Adobe",
    companyLogo: "https://www.google.com/s2/favicons?domain=adobe.com&sz=128",
    companyWebsite: "https://www.adobe.com",
    companyLinkedinUrl: "https://www.linkedin.com/company/adobe",
    location: "San Jose, CA / Singapore / Remote",
    country: "United States",
    remoteType: "Remote",
    type: "Full-time",
    employmentType: "Full-Time",
    salaryMin: 145000,
    salaryMax: 195000,
    salaryCurrency: "USD",
    minExperience: 5,
    maxExperience: 12,
    isReferral: true,
    visaSponsorship: true,
    domain: "Design",
    jobLink: "https://adobe.wd5.myworkdayjobs.com/external_experienced/job/San-Jose/Senior-UX-Architect_R139201",
    description: "Design accessible, modular Spectrum design system components and define UX guidelines for Firefly generative AI creation workflows.",
    benefits: ["Figma", "UX Architecture", "Design Systems", "User Research"]
  }
];

const CATEGORIES = ["All", "Engineering", "Product", "Design", "Data", "Management"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as any } }
};

function formatSalary(job: any): string {
  if (!job) return "Competitive";
  const min = job.salaryMin ?? job.salary_min;
  const max = job.salaryMax ?? job.salary_max;
  
  if (min || max) {
    const code = (job.salaryCurrency || job.salary_currency || job.currency || 'USD').toUpperCase();
    
    const formatValue = (val: number) => {
      if (code === 'INR') {
        if (val >= 100000) {
          const lakhs = val / 100000;
          return `₹${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1)}L`;
        }
        return `₹${val.toLocaleString('en-IN')}`;
      }
      
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: code,
          maximumFractionDigits: 0,
        }).format(val);
      } catch {
        return `${code} ${val.toLocaleString()}`;
      }
    };

    if (min && max) return `${formatValue(min)} – ${formatValue(max)}`;
    if (min) return `${formatValue(min)}+`;
    if (max) return `Up to ${formatValue(max)}`;
  }

  return job.salary || "Competitive Salary";
}

export function JobsGrid() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [dbJobs, setDbJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [savedJobUuids, setSavedJobUuids] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  // Sync user's bookmarked jobs
  useEffect(() => {
    if (user?.uuid && user.role === 'Job Seeker') {
      fetch(`/api/jobs/saved?userId=${user.uuid}`)
        .then(res => (res.ok ? res.json() : []))
        .then(savedList => {
          if (Array.isArray(savedList)) {
            const ids = new Set<string>(savedList.map((j: any) => String(j.uuid || j.jobId || j.id)));
            setSavedJobUuids(ids);
          }
        })
        .catch(() => {});
    }
  }, [user?.uuid, user?.role]);

  // Handle Save / Bookmark toggle
  const handleBookmarkToggle = async (e: React.MouseEvent, job: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save jobs to your bookmarks.",
        variant: "destructive"
      });
      return;
    }

    if (user.role !== 'Job Seeker') {
      toast({
        title: "Access Restricted",
        description: "Only candidates can bookmark jobs.",
        variant: "destructive"
      });
      return;
    }

    const jobUuid = String(job.uuid || job.id);
    const isCurrentlySaved = savedJobUuids.has(jobUuid);
    setSavingId(jobUuid);

    try {
      const method = isCurrentlySaved ? 'DELETE' : 'POST';
      const url = isCurrentlySaved
        ? `/api/jobs/saved?userId=${user.uuid}&jobId=${jobUuid}`
        : `/api/jobs/saved`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: isCurrentlySaved ? undefined : JSON.stringify({ userId: user.uuid, jobId: jobUuid })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update bookmark");
      }

      setSavedJobUuids(prev => {
        const next = new Set(prev);
        if (isCurrentlySaved) {
          next.delete(jobUuid);
        } else {
          next.add(jobUuid);
        }
        return next;
      });

      toast({
        title: !isCurrentlySaved ? "✓ Saved to Bookmarks" : "Removed from Bookmarks",
        description: !isCurrentlySaved ? `"${job.title}" has been saved.` : `"${job.title}" was removed.`,
      });
    } catch (err: any) {
      toast({
        title: "Bookmark Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    async function fetchRecentJobs() {
      try {
        setLoading(true);
        const url = user?.uuid ? `/api/jobs?limit=6&userId=${user.uuid}` : '/api/jobs?limit=6';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const jobsList = Array.isArray(data) ? data : (data.recommended || []);
          if (jobsList && jobsList.length > 0) {
            setDbJobs(jobsList.slice(0, 6));
          } else {
            // Fetch live active MNC job openings directly from live API feed
            const liveRes = await fetch('/api/jobs/seed-mnc');
            if (liveRes.ok) {
              const liveData = await liveRes.json();
              if (liveData?.jobs && liveData.jobs.length > 0) {
                setDbJobs(liveData.jobs.slice(0, 6));
              } else {
                setDbJobs(FALLBACK_JOBS.slice(0, 6));
              }
            } else {
              setDbJobs(FALLBACK_JOBS.slice(0, 6));
            }
          }
        } else {
          setDbJobs(FALLBACK_JOBS.slice(0, 6));
        }
      } catch (err) {
        console.error("Failed to fetch recent jobs from DB:", err);
        setDbJobs(FALLBACK_JOBS.slice(0, 6));
      } finally {
        setLoading(false);
      }
    }

    fetchRecentJobs();

    const handleJobApplied = () => {
      fetchRecentJobs();
    };
    window.addEventListener('job-applied', handleJobApplied);
    return () => window.removeEventListener('job-applied', handleJobApplied);
  }, [user?.uuid]);

  const rawDisplayJobs = dbJobs.length > 0 ? dbJobs : FALLBACK_JOBS;
  const displayJobs = (user?.openWorldwide === false && user?.country)
    ? rawDisplayJobs.filter(j => matchesCountry(j, user.country))
    : rawDisplayJobs;

  const categoryFiltered = displayJobs.filter(j => {
    const jobDomain = (j.domain || j.category || "Engineering").toLowerCase();
    return activeCategory === "All" || jobDomain.includes(activeCategory.toLowerCase());
  });

  const filtered = query ? intelligentSearchJobs(categoryFiltered, query) : categoryFiltered;

  return (
    <section id="jobs" className="py-24 relative overflow-hidden bg-white dark:bg-[hsl(220_65%_7%)] transition-colors duration-300">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container-xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" as any }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-50 dark:bg-violet-950/40 border border-violet-200/60 dark:border-violet-800/40 text-violet-700 dark:text-violet-300 text-xs font-bold mb-3 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Direct Recruiter Listings
          </div>
          <h2 className="section-heading mb-4">
            Latest <span className="text-gradient-primary">Verified Openings</span>
          </h2>
          <p className="section-subheading mx-auto text-slate-600 dark:text-slate-400">
            Explore verified career opportunities posted directly by hiring teams and multinational companies.
          </p>
        </motion.div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search live database jobs or companies..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-11 h-11 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="h-10 w-full rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-5 w-16 rounded-lg" />
                  <Skeleton className="h-5 w-16 rounded-lg" />
                  <Skeleton className="h-5 w-16 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Jobs Grid */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {filtered.map(job => {
              const jobId = job.uuid || job.id;
              const roleTitle = job.title || job.role || "Software Engineer";
              const company = job.companyName || job.company_name || job.company || "Top Tech Company";
              const location = (job.locations && job.locations.length > 0)
                ? job.locations.join(', ')
                : (job.location || job.location_names?.join(', ') || "Not Disclosed");
              const typeName = job.type || job.workplaceType || job.workplace_type || job.remoteType || "Not Disclosed";
              const salaryStr = formatSalary(job);
              const isSaved = savedJobUuids.has(String(jobId));
              const isSaving = savingId === String(jobId);
              const jobUrl = getJobUrl({ id: jobId, title: roleTitle });

              const skillsRaw = (Array.isArray(job.skills) && job.skills.length > 0)
                ? job.skills
                : ((Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0)
                    ? job.requiredSkills
                    : (Array.isArray(job.required_skills) && job.required_skills.length > 0)
                        ? job.required_skills
                        : (Array.isArray(job.benefits) && job.benefits.length > 0 ? job.benefits : ["Full Stack", "Cloud"]));

              const expStr = job.experienceLevel
                ? job.experienceLevel
                : (job.minExperience || job.experience_min)
                  ? `${job.minExperience || job.experience_min}${job.maxExperience || job.experience_max ? `–${job.maxExperience || job.experience_max}` : '+'} Yrs Exp`
                  : null;

              const timeAgo = (job.postedAt || job.posted_at)
                ? (() => {
                    try {
                      return formatDistanceToNow(new Date(job.postedAt || job.posted_at), { addSuffix: true }).replace(/^about\s+/i, '');
                    } catch {
                      return 'Recently posted';
                    }
                  })()
                : 'Active Opening';

              return (
                <motion.div
                  key={jobId}
                  variants={cardVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group relative bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/10 hover:border-violet-500/50 dark:hover:border-violet-400/50 shadow-sm hover:shadow-[0_16px_36px_rgba(124,58,237,0.09)] transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-4">
                    {/* Top Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <CompanyLogo
                          companyName={company}
                          companyLogo={job.companyLogo || job.company_logo}
                          companyWebsite={job.companyWebsite || job.company_website}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <h3
                            className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors line-clamp-1"
                            title={roleTitle}
                          >
                            <Link href={jobUrl} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded">
                              {roleTitle}
                            </Link>
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[150px]" title={company}>
                              {company}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                            </span>
                            {job.visaSponsorship && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/40 px-2 py-0.5 rounded-full">
                                ✈ Visa Sponsored
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bookmark Button */}
                      <button
                        onClick={(e) => handleBookmarkToggle(e, job)}
                        disabled={isSaving}
                        className={`p-2 rounded-xl transition-all duration-200 shrink-0 border ${
                          isSaved
                            ? 'bg-violet-50 border-violet-200 text-violet-600 dark:bg-violet-950/50 dark:border-violet-800/50 dark:text-violet-400'
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-400 hover:text-violet-600 hover:border-violet-300 dark:hover:text-violet-400'
                        }`}
                        title={isSaved ? "Remove Bookmark" : "Save Job"}
                        aria-label={isSaved ? "Remove Bookmark" : "Save Job"}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-violet-600 dark:fill-violet-400' : ''}`} />
                      </button>
                    </div>

                    {/* Location & Employment Type Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 truncate max-w-[160px]" title={location}>
                        <MapPin className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                        <span className="truncate">{location}</span>
                      </span>
                      <span className="flex items-center gap-1.5 truncate max-w-[130px]" title={typeName}>
                        <Briefcase className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">{typeName}</span>
                      </span>
                      {expStr && (
                        <span className="flex items-center gap-1.5 truncate" title={expStr}>
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{expStr}</span>
                        </span>
                      )}
                    </div>

                    {/* Salary Box */}
                    <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-black">💰</span>
                        <span className="truncate">{salaryStr}</span>
                      </div>
                      <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                        {job.employmentType || job.type || "Full-Time"}
                      </span>
                    </div>

                    {/* Skills Chips */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0 mr-1">Skills:</span>
                      {skillsRaw.slice(0, 3).map((skill: string, sIdx: number) => (
                        <span
                          key={sIdx}
                          className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10"
                        >
                          {skill}
                        </span>
                      ))}
                      {skillsRaw.length > 3 && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-white/10">
                          +{skillsRaw.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 dark:border-white/5">
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {timeAgo}
                    </span>
                    <Link
                      href={jobUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* View all */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.push('/jobs')}
            className="btn-primary px-10 py-3.5"
          >
            View All Global Jobs <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
export default JobsGrid;