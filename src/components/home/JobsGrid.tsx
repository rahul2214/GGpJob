"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, DollarSign, Search, ArrowRight, ShieldCheck, Building2, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { intelligentSearchJobs } from '@/lib/intelligent-search';

const FALLBACK_JOBS = [
  { id: "1", title: "Senior Full Stack Engineer", companyName: "Stripe", companyLogo: "🦓", location: "Remote, USA", type: "Full-time", salaryMin: 140000, salaryMax: 190000, isReferral: false, domain: "Engineering", benefits: ["React", "Node.js", "Postgres"] },
  { id: "2", title: "Staff Machine Learning Engineer", companyName: "DeepMind", companyLogo: "🧠", location: "London / Remote", type: "Full-time", salaryMin: 150000, salaryMax: 210000, isReferral: false, domain: "Engineering", benefits: ["Python", "PyTorch", "MLOps"] },
  { id: "3", title: "Product Manager — Growth", companyName: "Notion", companyLogo: "📐", location: "San Francisco, CA", type: "Hybrid", salaryMin: 130000, salaryMax: 170000, isReferral: false, domain: "Product", benefits: ["PLG", "Analytics", "B2B SaaS"] },
  { id: "4", title: "Senior iOS Engineer", companyName: "Spotify", location: "Stockholm / Remote", type: "Remote", salaryMin: 110000, salaryMax: 145000, isReferral: false, domain: "Engineering", benefits: ["Swift", "SwiftUI", "XCTest"] },
  { id: "5", title: "UX Design Lead", companyName: "Figma", companyLogo: "🎨", location: "New York, NY", type: "Hybrid", salaryMin: 150000, salaryMax: 200000, isReferral: false, domain: "Design", benefits: ["Figma", "Design Systems", "Research"] },
  { id: "6", title: "DevOps / Platform Engineer", companyName: "HashiCorp", location: "Remote, Global", type: "Remote", salaryMin: 125000, salaryMax: 165000, isReferral: false, domain: "Engineering", benefits: ["Terraform", "Kubernetes", "GCP"] },
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
  if (job.salaryMin || job.salaryMax) {
    const min = job.salaryMin ? `$${Math.round(job.salaryMin / 1000)}k` : '';
    const max = job.salaryMax ? `$${Math.round(job.salaryMax / 1000)}k` : '';
    if (min && max) return `${min}–${max}`;
    if (min) return `${min}+`;
    if (max) return `Up to ${max}`;
  }
  return job.salary || "$120k–$160k";
}

export function JobsGrid() {
  const router = useRouter();
  const [dbJobs, setDbJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    async function fetchRecentJobs() {
      try {
        setLoading(true);
        const res = await fetch('/api/jobs?limit=6');
        if (res.ok) {
          const data = await res.json();
          const jobsList = Array.isArray(data) ? data : (data.recommended || []);
          if (jobsList && jobsList.length > 0) {
            setDbJobs(jobsList.slice(0, 6));
          } else {
            setDbJobs(FALLBACK_JOBS);
          }
        } else {
          setDbJobs(FALLBACK_JOBS);
        }
      } catch (err) {
        console.error("Failed to fetch recent jobs from DB:", err);
        setDbJobs(FALLBACK_JOBS);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentJobs();
  }, []);

  const displayJobs = dbJobs.length > 0 ? dbJobs : FALLBACK_JOBS;

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
          
          <h2 className="section-heading mt-4 mb-4">
            Latest <span className="text-gradient-primary">Verified Openings</span>
          </h2>
          <p className="section-subheading mx-auto">
            Explore the latest 6 verified job openings posted directly by hiring teams.
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
                    ? 'bg-violet-600 border-violet-600 text-white'
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
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex gap-2 pt-2">
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
              const company = job.companyName || job.company || "Top Tech Company";
              const location = job.location || "Remote / Global";
              const typeName = job.type || job.workplaceType || "Full-time";
              const isRef = Boolean(job.isReferral || job.referral);
              const salaryStr = formatSalary(job);
              const tagsList = Array.isArray(job.benefits) && job.benefits.length > 0
                ? job.benefits.slice(0, 3)
                : (job.tags || ["Full Stack", "High Growth"]);

              return (
                <motion.div
                  key={jobId}
                  variants={cardVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white dark:bg-white/5 rounded-2xl p-6 flex flex-col gap-4 cursor-pointer group border border-slate-200 dark:border-white/[0.07] hover:border-violet-500/50 shadow-sm transition-all duration-200"
                  onClick={() => router.push(`/jobs/${jobId}`)}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-xl shrink-0 overflow-hidden p-1.5">
                        {job.companyLogo ? (
                          typeof job.companyLogo === 'string' && job.companyLogo.startsWith('http') ? (
                            <img
                              src={job.companyLogo}
                              alt={company}
                              className="w-full h-full object-contain"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <span>{job.companyLogo}</span>
                          )
                        ) : (
                          <Building2 className="w-5 h-5 text-violet-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                          {roleTitle}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{company}</p>
                      </div>
                    </div>
                    {isRef && (
                      <span className="badge-violet shrink-0 flex items-center gap-1 text-[10px]">
                        <ShieldCheck className="w-3 h-3" /> Referral
                      </span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-violet-500 dark:text-violet-400" />{location}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3 text-blue-500 dark:text-blue-400" />{typeName}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />{salaryStr}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {tagsList.map((tag: string, idx: number) => (
                      <span key={idx} className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 mt-auto">
                    <span className="text-xs text-slate-500">
                      {isRef ? "2 credits to apply" : "Free to apply"}
                    </span>
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      View Role <ArrowRight className="w-3 h-3" />
                    </span>
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
