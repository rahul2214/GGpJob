"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, type Easing } from 'framer-motion';
import { Briefcase, MapPin, Star, ArrowRight, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Job } from '@/lib/types';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as Easing } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

export function JobsGrid() {
    const [latestJobs, setLatestJobs] = useState<Job[]>([]);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [jobsError, setJobsError] = useState(false);
    const [retryTrigger, setRetryTrigger] = useState(0);
    const [activeMobileIndex, setActiveMobileIndex] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        setJobsLoading(true);
        setJobsError(false);

        fetch('/api/jobs?limit=6', { signal: controller.signal })
            .then(res => {
                clearTimeout(timeoutId);
                if (!res.ok) throw new Error("Failed to fetch jobs");
                return res.json();
            })
            .then(data => {
                setLatestJobs(Array.isArray(data) ? data : []);
                setJobsError(false);
            })
            .catch(err => {
                clearTimeout(timeoutId);
                if (err.name !== 'AbortError') {
                    console.error("Jobs fetch error:", err);
                }
                setLatestJobs([]);
                setJobsError(true);
            })
            .finally(() => {
                setJobsLoading(false);
            });

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [retryTrigger]);

    const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const scrollLeft = container.scrollLeft;
        const cardWidth = 316; // 300px card width + 16px gap
        const index = Math.round(scrollLeft / cardWidth);
        const clampedIndex = Math.max(0, Math.min(index, latestJobs.length - 1));
        setActiveMobileIndex(clampedIndex);
    };

    return (
        <section id="opportunities" aria-label="Latest Job Opportunities" className="py-24 bg-white relative">
            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <motion.div 
                    initial="hidden" 
                    whileInView="visible" 
                    viewport={{ once: true, margin: "-80px" }} 
                    variants={staggerContainer} 
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                        Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Opportunities</span>
                    </h2>
                    <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto">
                        Recently posted job listings with active employee referrers or direct recruiter postings.
                    </p>
                </motion.div>

                {/* JSON-LD Schema for Job Postings */}
                {latestJobs.length > 0 && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "ItemList",
                                "itemListElement": latestJobs.map((job, idx) => ({
                                    "@type": "ListItem",
                                    "position": idx + 1,
                                    "item": {
                                        "@type": "JobPosting",
                                        "title": job.title,
                                        "hiringOrganization": {
                                            "@type": "Organization",
                                            "name": job.companyName || "Unknown Company"
                                        },
                                        "jobLocation": {
                                            "@type": "Place",
                                            "address": {
                                                "@type": "PostalAddress",
                                                "addressLocality": job.location || "Remote"
                                            }
                                        },
                                        "description": `${job.title} job position at ${job.companyName || 'our partner company'}.`,
                                        "url": `${typeof window !== 'undefined' ? window.location.origin : ''}/jobs/${job.id}`
                                    }
                                }))
                            })
                        }}
                    />
                )}

                {jobsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 animate-pulse">
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-200 shrink-0"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-200 rounded-lg w-3/4"></div>
                                        <div className="h-3 bg-slate-100 rounded-lg w-1/2"></div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mb-5">
                                    <div className="h-6 bg-slate-100 rounded-full w-20"></div>
                                    <div className="h-6 bg-slate-100 rounded-full w-16"></div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="h-5 bg-slate-200 rounded w-24"></div>
                                    <div className="h-7 bg-slate-100 rounded-full w-20"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : jobsError ? (
                    <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-100 max-w-md mx-auto">
                        <ShieldAlert className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-bounce" />
                        <p className="font-bold text-slate-800 text-lg mb-1">Opportunities are loading slowly</p>
                        <p className="text-sm text-slate-500 mb-6">Our servers took too long to respond. Please check your connection and try again.</p>
                        <Button 
                            onClick={() => setRetryTrigger(prev => prev + 1)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2 shadow-lg"
                        >
                            Retry Loading
                        </Button>
                    </div>
                ) : latestJobs.length === 0 ? (
                    <motion.div 
                        initial="hidden" 
                        whileInView="visible" 
                        viewport={{ once: true }} 
                        variants={fadeInUp} 
                        className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100"
                    >
                        <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 flex items-center justify-center mb-5">
                            <Briefcase className="w-10 h-10 text-indigo-300" />
                        </div>
                        <p className="text-xl font-bold text-slate-700 mb-2">No jobs posted yet</p>
                        <p className="text-sm text-slate-400 mb-6">Check back soon for fresh opportunities!</p>
                        <Link href="/jobs" className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-indigo-700 transition-colors">
                            Browse All Jobs <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        {/* Mobile: horizontal snap scroll */}
                        <div className="md:hidden -mx-4 px-4">
                            <div
                                onScroll={handleMobileScroll}
                                className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-5"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
                            >
                                {latestJobs.map((job, idx) => (
                                    <Link
                                        key={`mob-${job.id || idx}`}
                                        href={`/jobs/${job.id}`}
                                        className="min-w-[300px] snap-start bg-white rounded-3xl p-5 shadow-xl shadow-slate-100/60 border border-slate-100 cursor-pointer relative overflow-hidden flex-shrink-0 block"
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-indigo-200 shrink-0">
                                                    {(job.companyName || job.title || 'J')[0].toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">{job.title}</h3>
                                                    <p className="text-xs text-slate-500 mt-0.5 truncate">{job.companyName || 'Company'}</p>
                                                </div>
                                            </div>
                                            {job.isReferral ? (
                                                <span className="shrink-0 bg-indigo-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                    ✦ Referral
                                                </span>
                                            ) : (
                                                <span className="shrink-0 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                    ✦ Recruiter Post
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {job.location && (
                                                <span className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                                    <MapPin className="w-2.5 h-2.5 text-slate-400" />{job.location}
                                                </span>
                                            )}
                                            {job.type && (
                                                <span className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                                    <Briefcase className="w-2.5 h-2.5 text-slate-400" />{job.type}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                            {(job.minSalary || job.maxSalary) ? (
                                                <p className="text-xs font-bold text-indigo-600">₹{job.minSalary || ''}{job.maxSalary ? ` - ₹${job.maxSalary}` : '+'}</p>
                                            ) : (
                                                <p className="text-xs text-slate-400 italic">Not disclosed</p>
                                            )}
                                            <span className="text-[11px] font-bold text-white bg-indigo-600 px-3 py-1 rounded-full">Apply →</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <div className="flex justify-center gap-1.5 mt-3">
                                {latestJobs.slice(0, 6).map((_, i) => (
                                    <span key={i} className={`h-1.5 rounded-full transition-all ${i === activeMobileIndex ? 'w-4 bg-indigo-500' : 'w-1.5 bg-indigo-200'}`}></span>
                                ))}
                            </div>
                        </div>

                        {/* Desktop: grid */}
                        <motion.div 
                            initial="hidden" 
                            whileInView="visible" 
                            viewport={{ once: true, margin: "-80px" }} 
                            variants={staggerContainer}
                            className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {latestJobs.map((job, idx) => (
                                <Link href={`/jobs/${job.id}`} key={job.id || idx} className="block w-full h-full">
                                    <motion.div 
                                        variants={fadeInUp} 
                                        whileHover={{ y: -8, scale: 1.01 }} 
                                        className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-100/60 border border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between h-full"
                                    >
                                        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-t-3xl"></div>
                                        <div>
                                            <div className="flex items-start justify-between mb-5">
                                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-200/50 group-hover:scale-110 transition-transform duration-300 shrink-0">
                                                        {(job.companyName || job.title || 'J')[0].toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-bold text-slate-900 leading-tight text-base group-hover:text-indigo-700 transition-colors line-clamp-1">{job.title}</h3>
                                                        <p className="text-sm text-slate-500 mt-0.5 truncate">{job.companyName || 'Company'}</p>
                                                    </div>
                                                </div>
                                                {job.isReferral ? (
                                                    <span className="ml-2 shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-0.5">
                                                        ✦ Referral
                                                    </span>
                                                ) : (
                                                    <span className="ml-2 shrink-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-0.5">
                                                        ✦ Recruiter Direct
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-5">
                                                {job.location && (
                                                    <span className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 font-medium">
                                                        <MapPin className="w-3 h-3 text-slate-400" />{job.location}
                                                    </span>
                                                )}
                                                {job.type && (
                                                    <span className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 font-medium">
                                                        <Briefcase className="w-3 h-3 text-slate-400" />{job.type}
                                                    </span>
                                                )}
                                                {job.experienceLevel && job.experienceLevel !== '0 Years' && (
                                                    <span className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 font-semibold">
                                                        <Star className="w-3 h-3 text-indigo-400" />{job.experienceLevel}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-auto">
                                            {(job.minSalary || job.maxSalary) ? (
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Salary</p>
                                                    <p className="text-sm font-extrabold text-indigo-600">₹{job.minSalary || ''}{job.maxSalary ? ` – ₹${job.maxSalary}` : '+'}</p>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-slate-400 italic">Salary not disclosed</p>
                                            )}
                                            {job.isReferral ? (
                                                <motion.span 
                                                    whileHover={{ scale: 1.05 }} 
                                                    whileTap={{ scale: 0.97 }}
                                                    className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-full transition-colors shadow-md shadow-indigo-200 flex items-center gap-1"
                                                >
                                                    Unlock Referral <ArrowUpRight className="w-3 h-3" />
                                                </motion.span>
                                            ) : (
                                                <motion.span 
                                                    whileHover={{ scale: 1.05 }} 
                                                    whileTap={{ scale: 0.97 }}
                                                    className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-full transition-colors shadow-md shadow-emerald-200 flex items-center gap-1"
                                                >
                                                    Apply Direct <ArrowUpRight className="w-3 h-3" />
                                                </motion.span>
                                            )}
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </motion.div>
                    </>
                )}

                {latestJobs.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: true }} 
                        transition={{ delay: 0.3, duration: 0.5 }} 
                        className="text-center mt-12"
                    >
                        <Link href="/jobs" className="inline-flex items-center gap-3 bg-white text-indigo-700 font-bold px-8 py-4 rounded-full border-2 border-indigo-100 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-100/40 transition-all duration-300 group text-sm md:text-base">
                            <span>Browse Opportunities</span>
                            <span className="w-7 h-7 rounded-full bg-indigo-50 group-hover:bg-indigo-600 flex items-center justify-center transition-colors duration-300">
                                <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:text-white transition-colors duration-300" />
                            </span>
                        </Link>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
