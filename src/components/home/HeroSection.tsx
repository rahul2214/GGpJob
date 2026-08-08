"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Globe, ShieldCheck, MapPin, Building2, ExternalLink } from 'lucide-react';
import { AnimatedCounter } from '@/components/animated-counter';
import { motion, AnimatePresence } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as any } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

export function HeroSection() {
    const router = useRouter();
    const [recentHire, setRecentHire] = useState({
        name: "Akira M.",
        company: "Stripe",
        location: "Tokyo, JP",
        role: "Sr. Engineer",
        time: "Just now"
    });

    useEffect(() => {
        const companies = ["Google", "Stripe", "Amazon", "Meta", "Netflix", "Atlassian", "Shopify"];
        const roles = ["Software Engineer", "Frontend Dev", "DevOps Engineer", "UI/UX Designer", "Product Manager", "Data Scientist"];
        const locations = ["Tokyo, JP", "London, UK", "Berlin, DE", "Toronto, CA", "Sydney, AU", "Singapore, SG", "New York, US"];
        const names = ["Akira M.", "Elena K.", "James R.", "Sophie P.", "Chen G.", "Nina T.", "Omar C."];
        
        const tickerInterval = setInterval(() => {
            const randomName = names[Math.floor(Math.random() * names.length)];
            const randomCompany = companies[Math.floor(Math.random() * companies.length)];
            const randomRole = roles[Math.floor(Math.random() * roles.length)];
            const randomLoc = locations[Math.floor(Math.random() * locations.length)];
            setRecentHire({
                name: randomName,
                company: randomCompany,
                location: randomLoc,
                role: randomRole,
                time: "Just now"
            });
        }, 6000);

        return () => clearInterval(tickerInterval);
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
        <section id="hero" className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden bg-slate-50 dark:bg-[hsl(220_65%_6%)] transition-colors duration-300">
            <div className="container-xl relative z-10">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-2xl lg:col-span-7">

                        <motion.div variants={fadeInUp}>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.08]">
                                Bypass the ATS Black Hole — <br />
                                Get Referred by <span className="text-gradient-hero">Top MNC Insiders.</span>
                            </h1>
                        </motion.div>
                        
                        <motion.p variants={fadeInUp} className="text-slate-600 dark:text-slate-300 mb-6 text-base md:text-lg leading-relaxed">
                            Bypass the ATS black hole with JobsDart. Get referred by verified top MNC insiders and senior tech employees at Google, Microsoft, Amazon, Meta, and 500+ leading companies worldwide. Land direct interviews, check ATS scores, build your resume, and find top jobs faster.
                        </motion.p>

                        <motion.form variants={fadeInUp} onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl max-w-xl">
                            <div className="flex-1 flex items-center px-4 bg-transparent rounded-xl focus-within:bg-slate-50 dark:focus-within:bg-white/5 transition-colors">
                                <Search className="w-5 h-5 text-slate-400" />
                                <input name="search" type="text" placeholder="Search companies or roles (e.g. Remote DevOps)..." className="w-full bg-transparent border-none focus:outline-none focus:ring-0 px-3 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm md:text-base" />
                            </div>
                            <Button type="submit" className="btn-primary h-12 sm:h-auto px-8 w-full sm:w-auto">
                                Search Globally
                            </Button>
                        </motion.form>

                        <motion.div variants={fadeInUp} className="mt-8 flex items-center gap-3">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <AnimatePresence mode="wait">
                                <motion.p 
                                    key={recentHire.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4 }}
                                    className="text-xs sm:text-sm text-slate-500 dark:text-slate-400"
                                >
                                    <strong className="text-slate-900 dark:text-white">{recentHire.name}</strong> ({recentHire.location}) applied for <strong className="text-violet-650 dark:text-violet-400 font-bold">{recentHire.role}</strong> at <strong className="text-slate-900 dark:text-white font-extrabold">{recentHire.company}</strong>
                                </motion.p>
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>

                    <div className="relative h-[450px] lg:h-[550px] hidden lg:block lg:col-span-5">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full animate-spin-slow pointer-events-none"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/10 rounded-full animate-spin-slow pointer-events-none" style={{ animationDirection: 'reverse', animationDuration: '30s' }}></div>
                        
                        {/* Interactive Global Card */}
                        <motion.div 
                            animate={{ y: [-8, 8, -8] }} 
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} 
                            className="absolute top-8 right-0 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl p-5 rounded-2xl w-[280px]"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-lg glow-violet">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Direct Recruiter Access</h3>
                                        <ShieldCheck className="w-4 h-4 text-emerald-450 dark:text-emerald-400" />
                                    </div>
                                    <p className="text-xs text-violet-650 dark:text-violet-400 font-semibold">Verified Recruiters</p>
                                </div>
                            </div>
                            <div className="space-y-3 border-t border-slate-100 dark:border-white/10 pt-4">
                                <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-300">
                                    <span>Global Placement Rate</span>
                                    <span className="text-emerald-600 dark:text-emerald-450 font-bold">94%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-300 h-full rounded-full" style={{ width: '94%' }}></div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Company Card */}
                        <motion.div 
                            animate={{ y: [8, -8, 8] }} 
                            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }} 
                            className="absolute bottom-16 left-4 z-30 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-xl p-6 rounded-2xl w-[260px] border-gradient-violet"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-[10px] font-bold text-violet-650 dark:text-violet-300 uppercase tracking-widest mb-1">Active Hiring</p>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2"><Building2 className="w-4 h-4" /> Amazon UK</h4>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center text-emerald-650 dark:text-emerald-400 text-xs font-bold">✓</div>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">Verified Recruiter</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-violet-500/10 dark:bg-violet-500/20 border border-violet-500/20 dark:border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400 text-xs animate-pulse">●</div>
                                    <p className="text-xs text-slate-900 dark:text-white font-medium">Direct Application</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}