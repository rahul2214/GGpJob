"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, DollarSign, Zap, Rocket, Lightbulb, TrendingUp, Network, UserCheck, Trophy, FileSignature, Globe, UserRound, GraduationCap, Code, Search, MapPin, Briefcase, Star, ArrowRight, LayoutGrid, ChevronDown } from 'lucide-react';
import { AnimatedCounter } from '@/components/animated-counter';
import { motion, AnimatePresence, type Easing } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as Easing } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

const JobPortalHome = () => {
    const router = useRouter();
    const [latestJobs, setLatestJobs] = useState<any[]>([]);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    useEffect(() => {
        fetch('/api/jobs?limit=6')
            .then(res => res.json())
            .then(data => { setLatestJobs(Array.isArray(data) ? data : []); })
            .catch(() => setLatestJobs([]))
            .finally(() => setJobsLoading(false));
    }, []);

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const searchQuery = formData.get('search') as string;
        const newParams = new URLSearchParams();
        if (searchQuery) newParams.set('search', searchQuery);
        router.push(`/jobs?${newParams.toString()}`);
    };

    return (
        <div id="job-portal-page" className="overflow-hidden font-sans bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
                </div>
                
                <div className="container relative z-10 px-4 md:px-6 mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-2xl">
                            <motion.div variants={fadeInUp} className="inline-flex items-center rounded-full px-4 py-1.5 bg-indigo-100 text-indigo-700 font-medium text-sm mb-6 border border-indigo-200 shadow-sm">
                                <Star className="w-4 h-4 mr-2" />
                                <span>#1 Job Platform in 2026</span>
                            </motion.div>
                            <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                                Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Dream Job</span> or Top Talent
                            </motion.h1>
                            <motion.p variants={fadeInUp} className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
                                Your premier destination for connecting with top talent and finding the perfect job opportunity. Explore thousands of listings today with curated matches just for you.
                            </motion.p>

                            <motion.form variants={fadeInUp} onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-100">
                                <div className="flex-1 flex items-center px-4 bg-slate-50 rounded-xl">
                                    <Search className="w-5 h-5 text-slate-400" />
                                    <input name="search" type="text" placeholder="Job title, keywords..." className="w-full bg-transparent border-none focus:outline-none focus:ring-0 px-3 py-3 text-slate-700 placeholder:text-slate-400" />
                                </div>
                                <div className="flex-1 items-center px-4 bg-slate-50 rounded-xl hidden md:flex">
                                    <MapPin className="w-5 h-5 text-slate-400" />
                                    <input type="text" placeholder="Location, state..." className="w-full bg-transparent border-none focus:outline-none focus:ring-0 px-3 py-3 text-slate-700 placeholder:text-slate-400" disabled />
                                </div>
                                <Button type="submit" size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 h-12 sm:h-auto shadow-md">
                                    Search
                                </Button>
                            </motion.form>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative h-[400px] lg:h-[500px] hidden md:block">
                            <motion.div animate={{ y: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="absolute top-10 left-10 z-20 bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-2xl border border-white max-w-[280px]">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                                        <Code className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 leading-tight">Senior Developer</h3>
                                        <p className="text-sm text-slate-500">Tech Co • Remote</p>
                                    </div>
                                </div>
                                <p className="text-sm font-semibold text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded">₹90k - ₹120k / yr</p>
                            </motion.div>

                            <motion.div animate={{ y: [15, -15, 15] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="absolute top-1/2 right-0 z-30 bg-gradient-to-br from-purple-600 to-indigo-700 p-5 rounded-2xl shadow-xl shadow-purple-200/50 border border-purple-500/50 max-w-[280px] text-white">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold leading-tight">Marketing Lead</h3>
                                        <p className="text-sm text-purple-200">Creative Agency</p>
                                    </div>
                                </div>
                                <p className="text-sm font-semibold text-purple-100 bg-black/20 inline-block px-2 py-1 rounded">₹75k - ₹95k / yr</p>
                            </motion.div>
                            
                            <motion.div animate={{ y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }} className="absolute bottom-10 left-1/4 z-10 bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-2xl border border-white max-w-[280px]">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 shadow-inner">
                                        <LayoutGrid className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 leading-tight">UX Designer</h3>
                                        <p className="text-sm text-slate-500">Startup • Hybrid</p>
                                    </div>
                                </div>
                                <p className="text-sm font-semibold text-pink-600 bg-pink-50 inline-block px-2 py-1 rounded">₹80k - ₹110k / yr</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Latest Opportunities Section */}
            <section className="py-20 md:py-28 bg-white relative" style={{ overflowX: 'clip' }}>
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>
                <div className="absolute -right-40 top-20 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -left-40 bottom-20 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>
                <div className="container px-4 md:px-6 mx-auto relative z-10">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={staggerContainer} className="text-center mb-12 md:mb-16">
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
                            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span></span>
                            Live Listings
                        </motion.div>
                        <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                            Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Opportunities</span>
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-base md:text-lg text-slate-500 max-w-xl mx-auto">
                            Recently posted jobs from top tier companies — apply before they&apos;re gone.
                        </motion.p>
                    </motion.div>

                    {jobsLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 animate-pulse">
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-200 shrink-0"></div>
                                        <div className="flex-1 space-y-2"><div className="h-4 bg-slate-200 rounded-lg w-3/4"></div><div className="h-3 bg-slate-100 rounded-lg w-1/2"></div></div>
                                    </div>
                                    <div className="flex gap-2 mb-5"><div className="h-6 bg-slate-100 rounded-full w-20"></div><div className="h-6 bg-slate-100 rounded-full w-16"></div></div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100"><div className="h-5 bg-slate-200 rounded w-24"></div><div className="h-7 bg-slate-100 rounded-full w-20"></div></div>
                                </div>
                            ))}
                        </div>
                    ) : latestJobs.length === 0 ? (
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 flex items-center justify-center mb-5"><Briefcase className="w-10 h-10 text-indigo-300" /></div>
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
                                {/* Plain div (not motion.div) so framer-motion doesn't intercept touch events */}
                                <div
                                    className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-5"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
                                >
                                    {latestJobs.map((job, idx) => (
                                        <motion.div
                                            key={`mob-${job.id || idx}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.08, duration: 0.4 }}
                                            onClick={() => router.push(`/jobs/${job.id}`)}
                                            className="min-w-[300px] snap-start bg-white rounded-3xl p-5 shadow-xl shadow-slate-100/60 border border-slate-100 cursor-pointer group relative overflow-hidden flex-shrink-0"
                                        >
                                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-indigo-200">
                                                        {(job.companyName || job.title || 'J')[0].toUpperCase()}
                                                    </div>
                                                    <div><h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">{job.title}</h3><p className="text-xs text-slate-500 mt-0.5">{job.companyName || 'Company'}</p></div>
                                                </div>
                                                {job.isReferral && <span className="shrink-0 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Referral</span>}
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {job.location && <span className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100"><MapPin className="w-2.5 h-2.5" />{job.location}</span>}
                                                {job.type && job.type !== 'N/A' && <span className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100"><Briefcase className="w-2.5 h-2.5" />{job.type}</span>}
                                                {job.experienceLevel && job.experienceLevel !== '0 Years' && <span className="flex items-center gap-1 text-[11px] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100"><Star className="w-2.5 h-2.5" />{job.experienceLevel}</span>}
                                            </div>
                                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                                {(job.minSalary || job.maxSalary) ? <p className="text-xs font-bold text-indigo-600">&#8377;{job.minSalary || ''}{job.maxSalary ? ` - &#8377;${job.maxSalary}` : '+'}</p> : <p className="text-xs text-slate-400 italic">Not disclosed</p>}
                                                <span className="text-[11px] font-bold text-white bg-indigo-600 px-3 py-1 rounded-full">Apply →</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="flex justify-center gap-1.5 mt-3">
                                    {latestJobs.slice(0, 6).map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i === 0 ? 'w-4 bg-indigo-500' : 'w-1.5 bg-indigo-200'}`}></span>)}
                                </div>
                            </div>

                            {/* Desktop: grid */}
                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={staggerContainer}
                                className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {latestJobs.map((job, idx) => (
                                    <motion.div key={job.id || idx} variants={fadeInUp} whileHover={{ y: -8, scale: 1.01 }} onClick={() => router.push(`/jobs/${job.id}`)}
                                        className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-100/60 border border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col">
                                        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-t-3xl"></div>
                                        <div className="flex items-start justify-between mb-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-200/50 group-hover:scale-110 transition-transform duration-300">
                                                    {(job.companyName || job.title || 'J')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 leading-tight text-base group-hover:text-indigo-700 transition-colors line-clamp-1">{job.title}</h3>
                                                    <p className="text-sm text-slate-500 mt-0.5">{job.companyName || 'Company'}</p>
                                                </div>
                                            </div>
                                            {job.isReferral && <span className="ml-2 shrink-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">✦ Referral</span>}
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-5 flex-1">
                                            {job.location && <span className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 font-medium"><MapPin className="w-3 h-3 text-slate-400" />{job.location}</span>}
                                            {job.type && job.type !== 'N/A' && <span className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 font-medium"><Briefcase className="w-3 h-3 text-slate-400" />{job.type}</span>}
                                            {job.experienceLevel && job.experienceLevel !== '0 Years' && <span className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 font-semibold"><Star className="w-3 h-3 text-indigo-400" />{job.experienceLevel}</span>}
                                        </div>
                                        <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                                            {(job.minSalary || job.maxSalary) ? (
                                                <div><p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">Salary</p><p className="text-sm font-extrabold text-indigo-600">&#8377;{job.minSalary || ''}{job.maxSalary ? ` – &#8377;${job.maxSalary}` : '+'}</p></div>
                                            ) : <p className="text-xs text-slate-400 italic">Salary not disclosed</p>}
                                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                                                className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-full transition-colors shadow-md shadow-indigo-200 flex items-center gap-1">
                                                Apply Now <ArrowRight className="w-3 h-3" />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </>
                    )}

                    {latestJobs.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.5 }} className="text-center mt-12">
                            <Link href="/jobs" className="inline-flex items-center gap-3 bg-white text-indigo-700 font-bold px-8 py-4 rounded-full border-2 border-indigo-100 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-100/40 transition-all duration-300 group text-sm md:text-base">
                                <span>View All Jobs</span>
                                <span className="w-7 h-7 rounded-full bg-indigo-50 group-hover:bg-indigo-600 flex items-center justify-center transition-colors duration-300">
                                    <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:text-white transition-colors duration-300" />
                                </span>
                            </Link>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white relative z-20">
                <div className="container px-4 md:px-6 mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Why Choose Job Portal?</h2>
                        <p className="text-lg text-slate-600">Our platform is designed to make job hunting and hiring simple, effective, and accessible to everyone.</p>
                    </motion.div>
                    
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Users, title: "Inclusive Platform", desc: "We believe everyone deserves equal opportunities. Accessible to job seekers and employers from all backgrounds.", bg: "bg-blue-50", text: "text-blue-600" },
                            { icon: DollarSign, title: "Completely Free", desc: "Post jobs, apply for positions, and connect without fees. We have removed the financial barriers.", bg: "bg-emerald-50", text: "text-emerald-600" },
                            { icon: Zap, title: "Quick & Easy", desc: "Our streamlined process makes job posting and application submission fast and straightforward. Save time.", bg: "bg-amber-50", text: "text-amber-600" }
                        ].map((feature, idx) => (
                            <motion.div key={idx} variants={fadeInUp} whileHover={{ y: -10 }} className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-100/50 border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100/40 group">
                                <div className={`w-16 h-16 rounded-2xl ${feature.bg} ${feature.text} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                    <feature.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-slate-50 border-y border-slate-100">
                <div className="container px-4 md:px-6 mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">How It Works</h2>
                        <p className="text-lg text-slate-600">Getting started with Job Portal is simple for both job seekers and employers.</p>
                    </motion.div>

                    <div className="relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 -translate-y-1/2 hidden md:block rounded-full opacity-50" />
                        
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-3 gap-12 relative z-10">
                            {[
                                { step: 1, title: "Create Your Profile", desc: "Sign up and build your professional profile in minutes. Highlight your skills and experience." },
                                { step: 2, title: "Post or Search", desc: "Employers can post jobs for free. Job seekers can browse thousands of opportunities." },
                                { step: 3, title: "Connect & Succeed", desc: "Apply for jobs or review applications. Direct communication between employers and candidates." }
                            ].map((item, idx) => (
                                <motion.div key={idx} variants={scaleIn} className="text-center relative group">
                                    <div className="w-20 h-20 mx-auto bg-white rounded-full shadow-xl shadow-indigo-100/50 flex items-center justify-center text-2xl font-bold text-indigo-600 border-4 border-indigo-50 mb-6 relative group-hover:scale-110 transition-transform duration-300">
                                        {item.step}
                                        <div className="absolute -inset-2 bg-indigo-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                    <p className="text-slate-600">{item.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gradient-to-br from-indigo-700 to-purple-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container px-4 md:px-6 mx-auto relative z-10">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
                        {[
                            { value: 50, label: "Jobs Posted", suffix: "K+" },
                            { value: 200, label: "Active Users", suffix: "K+" },
                            { value: 85, label: "Success Rate", suffix: "%" },
                            { value: 150, label: "Countries", suffix: "+" }
                        ].map((stat, idx) => (
                            <motion.div key={idx} variants={scaleIn} className="p-4 rounded-2xl hover:bg-white/5 transition-colors">
                                <h3 className="text-4xl md:text-5xl font-extrabold mb-2 flex items-center justify-center tracking-tight">
                                    <AnimatedCounter value={stat.value} />{stat.suffix}
                                </h3>
                                <p className="text-indigo-200 font-medium text-lg">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Top MNCs Section */}
            <section className="py-24 bg-white relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                <div className="container px-4 md:px-6 mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Hiring in Top MNCs</h2>
                        <p className="text-lg text-slate-600">Join the world's leading companies. Explore opportunities at these industry giants.</p>
                    </motion.div>
                    
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {[
                            { logo: "https://cdn.simpleicons.org/google/4285F4", name: "Google", roles: "120+", bg: "bg-blue-50" },
                            { logo: "https://cdn.simpleicons.org/microsoft/00A4EF", name: "Microsoft", roles: "95+", bg: "bg-sky-50" },
                            { logo: "https://cdn.simpleicons.org/amazon/FF9900", name: "Amazon", roles: "150+", bg: "bg-orange-50" },
                            { logo: "https://cdn.simpleicons.org/meta/0866FF", name: "Meta", roles: "80+", bg: "bg-blue-50" },
                            { logo: "https://cdn.simpleicons.org/apple/1d1d1f", name: "Apple", roles: "65+", bg: "bg-slate-100" },
                            { logo: "https://cdn.simpleicons.org/netflix/E50914", name: "Netflix", roles: "45+", bg: "bg-red-50" },
                        ].map((company, idx) => (
                            <motion.div key={idx} variants={fadeInUp} whileHover={{ y: -8, scale: 1.03 }} className="bg-white border border-slate-100 rounded-3xl p-6 text-center shadow-lg hover:shadow-2xl hover:border-indigo-100 transition-all duration-300 relative overflow-hidden group">
                                <div className="absolute top-3 right-3 hidden group-hover:flex">
                                    <span className="relative flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                    </span>
                                </div>
                                <div className={`w-16 h-16 mx-auto rounded-2xl ${company.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300 shadow-sm p-3`}>
                                    <img
                                        src={company.logo}
                                        alt={`${company.name} logo`}
                                        className="w-full h-full object-contain"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1">{company.name}</h3>
                                <p className="text-xs font-semibold text-indigo-600 bg-indigo-50 py-1 px-2 rounded-full inline-block">{company.roles} Roles</p>
                            </motion.div>
                        ))}

                    </motion.div>
                </div>
            </section>




             <section className="py-24 bg-gradient-to-br from-slate-50 to-indigo-50/50 overflow-hidden border-t border-slate-100">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="relative z-10">
                            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
                                Unlock Your Career with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Referrals</span>
                            </motion.h2>
                            <motion.p variants={fadeInUp} className="text-lg text-slate-600 mb-10">
                                Get an edge in your job search. Employee referrals are one of the most effective ways to land your dream job with verified professionals.
                            </motion.p>
                            
                            <div className="space-y-8">
                                {[
                                    { icon: Rocket, title: "Stand Out from the Crowd", desc: "Referred candidates are often fast-tracked through the application process.", color: "text-emerald-500", bg: "bg-emerald-50" },
                                    { icon: Lightbulb, title: "Gain Insider Information", desc: "Connect with employees to learn about company culture and the role.", color: "text-amber-500", bg: "bg-amber-50" },
                                    { icon: TrendingUp, title: "Increase Your Chances", desc: "Studies show referrals have a significantly higher chance of getting hired.", color: "text-purple-500", bg: "bg-purple-50" }
                                ].map((benefit, idx) => (
                                    <motion.div key={idx} variants={fadeInUp} className="flex gap-5 items-start group">
                                        <div className={`mt-1 p-4 rounded-2xl ${benefit.bg} ${benefit.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                            <benefit.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-xl mb-1">{benefit.title}</h4>
                                            <p className="text-slate-600 leading-relaxed">{benefit.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                        
                        <div className="relative h-[600px] hidden lg:block">
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} viewport={{ once: true }} className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"></motion.div>
                            
                            {[
                                { icon: Network, label: "Stronger Network", top: "15%", left: "10%", delay: 0 },
                                { icon: UserCheck, label: "Priority Review", top: "35%", right: "5%", delay: 1 },
                                { icon: Trophy, label: "Higher Success", bottom: "35%", left: "15%", delay: 2 },
                                { icon: FileSignature, label: "Get Hired Faster", bottom: "15%", right: "15%", delay: 3 }
                            ].map((item, idx) => (
                                <motion.div 
                                    key={idx}
                                    animate={{ y: [-15, 15, -15] }} 
                                    transition={{ repeat: Infinity, duration: 6 + idx, ease: "easeInOut", delay: item.delay }}
                                    className="absolute bg-white/90 backdrop-blur px-6 py-4 rounded-2xl shadow-xl border border-white flex items-center gap-4 hover:scale-105 transition-transform cursor-default"
                                    style={{ top: item.top, left: item.left, right: item.right, bottom: item.bottom }}
                                >
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <span className="font-bold text-slate-800 text-lg">{item.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Referrals Showcase Section */}
            <section className="py-24 bg-white relative">
                <div className="container px-4 md:px-6 mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Find Your Perfect Fit</h2>
                        <p className="text-lg text-slate-600">Get an edge in your job search. Employee referrals are one of the most effective ways to land your dream job.</p>
                    </motion.div>
                    
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Globe, title: "Diverse Job Domains", desc: "From tech and finance to creative arts, explore opportunities across a wide spectrum of industries.", stats: [{v: "50+", l: "Industries"}, {v: "10K+", l: "Companies"}] },
                            { icon: UserRound, title: "Exclusive Referrals", desc: "Get a competitive edge with jobs posted by company insiders. Referrals increase your chances of getting hired.", stats: [{v: "5x", l: "More Interviews"}, {v: "40%", l: "Hire Rate"}] },
                            { icon: GraduationCap, title: "Internship Opportunities", desc: "Kickstart your career. Find paid internships and entry-level positions at top companies to gain valuable experience.", stats: [{v: "5K+", l: "Internships"}, {v: "70%", l: "Convert to FT"}] }
                        ].map((card, idx) => (
                            <motion.div key={idx} variants={fadeInUp} whileHover={{ y: -10 }} className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-200 hover:border-indigo-300 transition-all duration-300 group">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform">
                                    <card.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">{card.title}</h3>
                                <p className="text-slate-600 mb-8 leading-relaxed h-20">{card.desc}</p>
                                <div className="flex justify-between border-t border-slate-100 pt-6">
                                    {card.stats.map((s, i) => (
                                        <div key={i} className="text-center">
                                            <div className="text-3xl font-black text-indigo-600 tracking-tight">{s.v}</div>
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{s.l}</div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 md:py-28 bg-slate-50 border-t border-slate-100 relative overflow-hidden">
                <div className="absolute -right-60 top-20 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -left-60 bottom-20 w-[500px] h-[500px] bg-purple-100/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="container px-4 md:px-6 mx-auto max-w-3xl relative z-10">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={staggerContainer} className="text-center mb-14">
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
                            Got Questions?
                        </motion.div>
                        <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Questions</span>
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-base md:text-lg text-slate-500">
                            Everything you need to know about our job portal.
                        </motion.p>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="space-y-3">
                        {[
                            { q: "Is Job Portal completely free to use?", a: "Yes! Job Portal is 100% free for both job seekers and employers. You can post jobs, apply for positions, and connect with candidates without any fees or hidden charges." },
                            { q: "How do I apply for a job on this platform?", a: "Simply create a profile, browse the job listings, and click 'Apply Now' on any job that interests you. You can track your applications from your dashboard." },
                            { q: "What is a referral job listing?", a: "Referral jobs are posted by verified company employees who can refer you internally. Referred candidates are typically fast-tracked and have a significantly higher chance of getting hired." },
                            { q: "How do I post a job as an employer?", a: "Sign up as a company, complete your company profile, and click 'Post a Job'. Your listing will be live instantly and visible to thousands of qualified candidates." },
                            { q: "Can I apply to multiple jobs at once?", a: "Absolutely. There's no limit to the number of jobs you can apply for. We recommend tailoring your application for each role for better results." },
                            { q: "How are candidates matched to jobs?", a: "Our smart matching system analyses your profile, skills, and experience to surface the most relevant job opportunities — making your job search faster and more effective." },
                            { q: "Is my personal information safe?", a: "Yes. We take data privacy seriously. Your information is securely stored and never shared with third parties without your consent. You control your visibility settings." },
                            { q: "How can I contact support if I have an issue?", a: "You can reach our support team through the 'Contact Us' page or email us directly. We typically respond within 24 hours on business days." },
                        ].map((faq, idx) => (
                            <motion.div key={idx} variants={fadeInUp}>
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className={`w-full text-left flex items-center justify-between gap-4 px-6 py-5 rounded-2xl font-semibold text-slate-900 transition-all duration-300 ${
                                        openFaq === idx
                                            ? 'bg-white shadow-lg shadow-indigo-100/40 border border-indigo-100'
                                            : 'bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-md shadow-sm'
                                    }`}
                                >
                                    <span className="text-sm md:text-base leading-snug">{faq.q}</span>
                                    <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                        openFaq === idx ? 'bg-indigo-600 text-white rotate-180' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        <ChevronDown className="w-4 h-4" />
                                    </span>
                                </button>
                                <AnimatePresence initial={false}>
                                    {openFaq === idx && (
                                        <motion.div
                                            key="content"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-5 pt-2 text-slate-600 text-sm md:text-base leading-relaxed border-x border-b border-indigo-100 rounded-b-2xl bg-white -mt-2">
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 relative overflow-hidden bg-slate-900 text-white">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 to-slate-900"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl aspect-square bg-indigo-500/20 rounded-full blur-[100px]"></div>
                
                <div className="container px-4 md:px-6 mx-auto relative z-10 text-center max-w-4xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
                        <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Ready to Find Your Next Opportunity?</motion.h2>
                        <motion.p variants={fadeInUp} className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto font-medium">
                            Join thousands of employers and job seekers who have already found success with Job Portal.
                        </motion.p>
                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button asChild size="lg" className="bg-white hover:bg-indigo-50 text-indigo-900 rounded-full px-8 h-14 text-lg border-0 shadow-xl shadow-white/10 font-bold transition-transform hover:scale-105">
                                <Link href="/company/signup">Post a Job for Free <ArrowRight className="ml-2 w-5 h-5"/></Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="bg-transparent border-2 border-indigo-400/30 hover:border-white hover:bg-white/10 text-white rounded-full px-8 h-14 text-lg font-bold backdrop-blur-sm transition-transform hover:scale-105">
                                <Link href="/jobs">Browse Jobs</Link>
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default JobPortalHome;
