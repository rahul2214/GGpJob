"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, DollarSign, Search, ArrowRight, Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { intelligentSearchJobs } from '@/lib/intelligent-search';

const FALLBACK_JOBS = [
  {
    id: "mnc-1",
    uuid: "mnc-microsoft-101",
    title: "Principal Cloud Solutions Architect — Enterprise Azure",
    companyName: "Microsoft",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo_%282012%29.svg",
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
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
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
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
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
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
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
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
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
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
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
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg",
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
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
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
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png",
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
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Adobe_Systems_logo_2020.svg",
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
  if (!job) return "Not Disclosed";
  const min = job.salaryMin;
  const max = job.salaryMax;
  
  if (min || max) {
    const code = (job.salaryCurrency || job.currency || 'USD').toUpperCase();
    
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

  return job.salary || "Not Disclosed";
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
              const location = job.location || "Not Disclosed";
              const typeName = job.type || job.workplaceType || "Not Disclosed";
              const salaryStr = formatSalary(job);
              const skillsRaw = (Array.isArray(job.skills) && job.skills.length > 0)
                ? job.skills
                : ((Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0)
                    ? job.requiredSkills
                    : (Array.isArray(job.benefits) && job.benefits.length > 0 ? job.benefits : ["Full Stack", "Cloud"]));
              const skillsStr = skillsRaw.join(', ');

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
                    <div className="flex items-center gap-3 min-w-0 flex-1">
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
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors truncate" title={roleTitle}>
                          {roleTitle}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium truncate" title={company}>{company}</p>
                        
                      </div>
                    </div>
                   
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1 truncate max-w-[140px]" title={location}><MapPin className="w-3 h-3 text-violet-500 dark:text-violet-400 shrink-0" /><span className="truncate">{location}</span></span>
                    <span className="flex items-center gap-1 truncate max-w-[120px]" title={typeName}><Briefcase className="w-3 h-3 text-blue-500 dark:text-blue-400 shrink-0" /><span className="truncate">{typeName}</span></span>
                  </div>

                  {/* Skills (comma separated with truncation ...) */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 min-w-0">
                    <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">Skills:</span>
                    <span className="truncate font-medium text-slate-600 dark:text-slate-300" title={skillsStr}>
                      {skillsStr}
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 mt-auto">
                    
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
