"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
    Users, DollarSign, Zap, Rocket, Lightbulb, TrendingUp, Network, 
    UserCheck, Trophy, FileSignature, Globe, UserRound, GraduationCap, 
    Code, Search, MapPin, Briefcase, Star, ArrowRight, LayoutGrid, 
    ChevronDown, ShieldCheck, AlertCircle, Coins, Clock, Sparkles, 
    CheckCircle2, XCircle, Building2, HelpCircle, Send, Lock, Unlock, 
    ArrowUpRight, BarChart3, Award, MessageSquare, ShieldAlert
} from 'lucide-react';
import { AnimatedCounter } from '@/components/animated-counter';
import { motion, AnimatePresence, type Easing } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as Easing } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.93 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

const PIPELINE_STEPS = [
  {
    id: 1,
    title: "Applied",
    desc: "Candidate submits profile",
    detail: "Jobseeker discovers a referral listing and submits their application details. The employee is immediately notified.",
    icon: FileSignature,
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    glowColor: "shadow-blue-200/50"
  },
  {
    id: 2,
    title: "Accepted",
    desc: "Employee pre-screens CV",
    detail: "The referring employee reviews the candidate's skills and profile. If they find it suitable for internal referral, they click 'Accept'.",
    icon: UserCheck,
    color: "from-indigo-500 to-violet-500",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    glowColor: "shadow-indigo-200/50"
  },
  {
    id: 3,
    title: "Unlocked",
    desc: "Jobseeker unlocks referral",
    detail: "The jobseeker spends 2 Credits (Subscription Credits are consumed first, then Purchased). Contact details and referral link unlock.",
    icon: Unlock,
    color: "from-purple-500 to-fuchsia-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    glowColor: "shadow-purple-200/50"
  },
  {
    id: 4,
    title: "Referred",
    desc: "Employee submits proof",
    detail: "Employee uploads screenshot proof of internal submission. Admin validates proof authenticity. Application becomes 'Verified Referral'.",
    icon: ShieldCheck,
    color: "from-fuchsia-500 to-pink-500",
    bgColor: "bg-pink-50",
    textColor: "text-pink-600",
    glowColor: "shadow-pink-200/50"
  },
  {
    id: 5,
    title: "Interviewing",
    desc: "Candidate confirms contact",
    detail: "Jobseeker confirms if they received recruiter response. Employee is rewarded +30 XP and +5 Trust Score. Interview status active.",
    icon: Users,
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-rose-50",
    textColor: "text-rose-600",
    glowColor: "shadow-rose-200/50"
  },
  {
    id: 6,
    title: "Offer",
    desc: "Offer letter verification",
    detail: "Jobseeker receives the offer and uploads proof. Employee reviews it. Both parties receive significant milestone reputation boosts.",
    icon: Award,
    color: "from-rose-500 to-amber-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    glowColor: "shadow-amber-200/50"
  },
  {
    id: 7,
    title: "Joined",
    desc: "Joining proof uploaded",
    detail: "Candidate uploads joining proof (ID card/Appointment letter). Employee verifies. Gamification rewards trigger highest milestone level.",
    icon: Building2,
    color: "from-amber-500 to-emerald-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    glowColor: "shadow-emerald-200/50"
  },
  {
    id: 8,
    title: "Completed",
    desc: "Platform payout released",
    detail: "Final verification clears. Referrer unlocks cash payout from wallet. Jobseeker has successfully bypassed ATS filters.",
    icon: Trophy,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-teal-50",
    textColor: "text-teal-600",
    glowColor: "shadow-teal-200/50"
  }
];

const JobPortalHome = () => {
    const router = useRouter();
    const [latestJobs, setLatestJobs] = useState<any[]>([]);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    
    // Interactive features state
    const [activeStep, setActiveStep] = useState<number>(3);
    const [activeRoleTab, setActiveRoleTab] = useState<'jobseeker' | 'referrer' | 'recruiter'>('jobseeker');
    
    // Simulated dynamic feed of recent verified referrals
    const [recentReferral, setRecentReferral] = useState({
        name: "Abhishek S.",
        company: "Google",
        role: "Software Engineer",
        time: "Just now"
    });

    // Mock Chat Simulator State
    const [chatStep, setChatStep] = useState<number>(0);
    const mockChats = [
        { sender: "seeker", text: "Hey Rohan, thanks for accepting my interest! Just wanted to share my latest portfolio link here." },
        { sender: "employee", text: "Nice work on the React optimization metrics. Let me submit this directly to my manager via our internal portal." },
        { sender: "seeker", text: "Greatly appreciate it! Let me know if you need any other details." },
        { sender: "employee", text: "Done! Uploaded the screenshot proof. Good luck with the screening!" }
    ];

    useEffect(() => {
        fetch('/api/jobs?limit=6')
            .then(res => res.json())
            .then(data => { setLatestJobs(Array.isArray(data) ? data : []); })
            .catch(() => setLatestJobs([]))
            .finally(() => setJobsLoading(false));
            
        // Rotate simulation feed
        const companies = ["Google", "Microsoft", "Amazon", "Meta", "Netflix", "Adobe", "Razorpay"];
        const roles = ["Software Engineer", "Frontend Dev", "DevOps Engineer", "UI/UX Designer", "Product Manager", "Data Analyst"];
        const names = ["Abhishek S.", "Neha K.", "Rohit M.", "Anjali P.", "Vikram G.", "Sneha T.", "Aarav C."];
        
        const interval = setInterval(() => {
            const randomName = names[Math.floor(Math.random() * names.length)];
            const randomCompany = companies[Math.floor(Math.random() * companies.length)];
            const randomRole = roles[Math.floor(Math.random() * roles.length)];
            setRecentReferral({
                name: randomName,
                company: randomCompany,
                role: randomRole,
                time: "Just now"
            });
        }, 8000);

        // Chat simulator loop
        const chatInterval = setInterval(() => {
            setChatStep(prev => (prev + 1) % (mockChats.length + 1));
        }, 3500);

        return () => {
            clearInterval(interval);
            clearInterval(chatInterval);
        };
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
        <div id="job-portal-page" className="overflow-hidden font-sans bg-slate-50 min-h-screen text-slate-900 selection:bg-indigo-500 selection:text-white">
            
            {/* 1. Hero Section (Referral-First Model) */}
            <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-36 overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]" />
                </div>
                
                <div className="container relative z-10 px-4 md:px-6 mx-auto">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-2xl lg:col-span-7">

                            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
                                Bypass the ATS.<br />
                                Get Referred by <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm">Insiders.</span>
                            </motion.h1>
                            
                            <motion.p variants={fadeInUp} className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed max-w-xl">
                                Stop throwing resumes into a job-portal black hole. JobsDart connects you with verified employees at top MNCs for direct referrals, and recruiters for direct hiring, backed by our real-time messaging workspace.
                            </motion.p>

                            <motion.form variants={fadeInUp} onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl max-w-xl">
                                <div className="flex-1 flex items-center px-4 bg-white/5 rounded-xl border border-white/5 focus-within:border-indigo-500 transition-colors">
                                    <Search className="w-5 h-5 text-slate-400" />
                                    <input name="search" type="text" placeholder="Search target company or skills..." className="w-full bg-transparent border-none focus:outline-none focus:ring-0 px-3 py-3 text-white placeholder:text-slate-400 text-sm md:text-base" />
                                </div>
                                <Button type="submit" size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl px-8 h-12 sm:h-auto shadow-lg shadow-indigo-500/20 font-bold border border-indigo-400/20 transition-all duration-300 transform active:scale-95">
                                    Browse Jobs
                                </Button>
                            </motion.form>

                            {/* Recent simulation notification ticker */}
                            <motion.div variants={fadeInUp} className="mt-8 flex items-center gap-3">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                </span>
                                <AnimatePresence mode="wait">
                                    <motion.p 
                                        key={recentReferral.name}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.4 }}
                                        className="text-xs sm:text-sm text-slate-400"
                                    >
                                        <strong className="text-slate-200">{recentReferral.name}</strong> just accepted interest for <strong className="text-indigo-300">{recentReferral.role}</strong> at <strong className="text-white">{recentReferral.company}</strong> ({recentReferral.time})
                                    </motion.p>
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>

                        {/* Floating Dashboard Mockup Cards */}
                        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative h-[450px] lg:h-[500px] hidden lg:block lg:col-span-5">
                            
                            {/* Card 1: Verified Employee Reputation */}
                            <motion.div 
                                animate={{ y: [-8, 8, -8] }} 
                                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} 
                                className="absolute top-4 left-6 z-20 bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-white/10 max-w-[280px]"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                                        VS
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="font-bold text-white text-sm">Vikram Seth</h3>
                                            <ShieldCheck className="w-4 h-4 text-green-400 fill-green-400/20" />
                                        </div>
                                        <p className="text-xs text-indigo-300 font-semibold">Staff Architect @ Microsoft</p>
                                    </div>
                                </div>
                                <div className="space-y-2 border-t border-white/5 pt-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">Trust Score</span>
                                        <span className="text-green-400 font-bold">98/100</span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-gradient-to-r from-emerald-500 to-green-400 h-full rounded-full" style={{ width: '98%' }}></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs pt-1">
                                        <span className="text-slate-400">Response Speed</span>
                                        <span className="text-indigo-300 font-bold flex items-center gap-0.5"><Clock className="w-3 h-3" /> ~12 mins</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Card 2: Interactive Application Status (Credits Spent) */}
                            <motion.div 
                                animate={{ y: [8, -8, 8] }} 
                                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }} 
                                className="absolute top-1/3 right-4 z-30 bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 rounded-3xl shadow-3xl border border-indigo-500/20 max-w-[310px]"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Referral Tracker</p>
                                        <h4 className="font-bold text-white text-base mt-0.5">Google • Senior Dev</h4>
                                    </div>
                                    <span className="bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                        <Coins className="w-3 h-3" /> 2 Credits
                                    </span>
                                </div>
                                
                                <div className="space-y-4 pt-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 text-xs">✓</div>
                                        <p className="text-xs text-slate-300 font-medium">Interest Accepted by Insider</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-indigo-500/30 border border-indigo-400 flex items-center justify-center text-indigo-300 text-xs animate-pulse">●</div>
                                        <div>
                                            <p className="text-xs text-white font-bold">Referral Verification Stage</p>
                                            <p className="text-[10px] text-slate-400">Proof validation pending admin</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400 italic">Protection active</span>
                                    <span className="text-xs text-indigo-300 font-bold flex items-center gap-1">Secured Flow <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /></span>
                                </div>
                            </motion.div>
                            
                            {/* Card 3: Floating Live Chat Preview */}
                            <motion.div 
                                animate={{ y: [-5, 5, -5] }} 
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} 
                                className="absolute bottom-4 left-1/4 z-10 bg-slate-950/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/10 w-[310px]"
                            >
                                <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-indigo-400" />
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Direct Inbox Chat</span>
                                    </div>
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                    </span>
                                </div>
                                <div className="space-y-2 max-h-[140px] overflow-hidden">
                                    {mockChats.slice(0, chatStep === 0 ? 1 : chatStep).map((msg, idx) => (
                                        <div key={idx} className={`p-2 rounded-xl text-[11px] leading-relaxed max-w-[85%] ${
                                            msg.sender === "seeker" 
                                                ? "bg-indigo-600/25 border border-indigo-500/20 text-indigo-200 self-start" 
                                                : "bg-white/5 border border-white/5 text-slate-200 ml-auto"
                                        }`}>
                                            <p className="font-extrabold text-[9px] uppercase opacity-60 mb-0.5">
                                                {msg.sender === "seeker" ? "Jobseeker" : "Rohan (Employee)"}
                                            </p>
                                            {msg.text}
                                        </div>
                                    ))}
                                    {chatStep === 0 && (
                                        <div className="flex gap-1.5 items-center p-1.5 text-slate-500 text-[10px] italic">
                                            <span className="animate-bounce">.</span>
                                            <span className="animate-bounce delay-100">.</span>
                                            <span className="animate-bounce delay-200">.</span>
                                            <span>Rohan is typing</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 2. Traditional ATS vs JobsDart Comparison Grid */}
            <section className="py-24 bg-white relative">
                <div className="container px-4 md:px-6 mx-auto">
                    <motion.div 
                        initial="hidden" 
                        whileInView="visible" 
                        viewport={{ once: true, margin: "-100px" }} 
                        variants={fadeInUp} 
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                 
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-4 mb-6 tracking-tight">ATS Black Hole vs JobsDart</h2>
                        <p className="text-base sm:text-lg text-slate-600">Why applying the standard way is set up for failure, and how bypassing automated screeners direct recruiter attention.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        
                        {/* Red Traditional Route */}
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="bg-slate-50 rounded-[2rem] p-8 border-2 border-dashed border-slate-200 relative overflow-hidden group hover:bg-slate-100/50 transition-colors"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-red-100/50 rounded-bl-full flex items-center justify-center opacity-40">
                                <XCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 mb-6">
                                <span className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">A</span>
                                Traditional Application (ATS)
                            </h3>
                            <ul className="space-y-5">
                                {[
                                    { t: "Automated Rejection Filters", d: "Algorithm parsers filter out 98% of CVs based on arbitrary keywords before a human even views it." },
                                    { t: "No Response / Endless Silence", d: "Applications stay 'Under Review' for months with absolutely no feedback or status updates." },
                                    { t: "Competing with Thousands", d: "Your resume sits in a massive stack of 5,000+ candidates for a single open position." },
                                    { t: "Low Interview Conversions", d: "Studies show standard job portal submissions yield less than a 1.5% interview rate." }
                                ].map((item, idx) => (
                                    <li key={idx} className="flex gap-3.5 items-start">
                                        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">{item.t}</h4>
                                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">{item.d}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Glowing Indigo JobsDart Route */}
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="bg-gradient-to-b from-indigo-50/80 to-purple-50/40 rounded-[2rem] p-8 border-2 border-indigo-200 relative overflow-hidden group hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-bl-full flex items-center justify-center opacity-60">
                                <CheckCircle2 className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-extrabold text-indigo-950 flex items-center gap-2 mb-6">
                                <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">B</span>
                                JobsDart Insider Referral & Direct Track
                            </h3>
                            <ul className="space-y-5">
                                {[
                                    { t: "Direct Recruiter Desk Delivery", d: "Verified employees submit your resume through internal company referral portals, skipping ATS keyword blocks." },
                                    { t: "Verified Upload Proof (5-7 Days)", d: "Employees must submit screenshot proof of successful referral. No more black holes." },
                                    { t: "Reputation Trust", d: "Referrers are backed by a real Trust Score. Failure or fake submissions trigger penalties and full credit refunds." },
                                    { t: "Recruiter Direct Job Postings", d: "Apply directly to certified recruiters with 0 credit cost. Chat in-app instantly with hiring teams." }
                                ].map((item, idx) => (
                                    <li key={idx} className="flex gap-3.5 items-start">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-slate-905 text-sm sm:text-base leading-snug">{item.t}</h4>
                                            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">{item.d}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* 3. Interactive Referral Pipeline Simulator */}
            <section className="py-24 bg-slate-900 text-white relative border-y border-slate-800">
                <div className="absolute inset-0 z-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.02]" />
                <div className="container px-4 md:px-6 mx-auto relative z-10">
                    <motion.div 
                        initial="hidden" 
                        whileInView="visible" 
                        viewport={{ once: true }} 
                        variants={fadeInUp} 
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                       
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 mb-6 tracking-tight">Interactive Pipeline Simulator</h2>
                        <p className="text-base sm:text-lg text-slate-400">Click through the 8 stages of the JobsDart referral flow to see how we coordinate safety, validation proofs, and payouts.</p>
                    </motion.div>

                    <div className="grid lg:grid-cols-12 gap-10 items-stretch">
                        
                        {/* Left column: Steps vertical flow */}
                        <div className="lg:col-span-7 space-y-3">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Referral Milestones</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
                                {PIPELINE_STEPS.map((step) => {
                                    const IconComponent = step.icon;
                                    const isActive = activeStep === step.id;
                                    return (
                                        <button
                                            key={step.id}
                                            onClick={() => setActiveStep(step.id)}
                                            className={`p-4 rounded-2xl text-left border transition-all duration-300 flex items-center gap-3.5 relative group ${
                                                isActive 
                                                    ? 'bg-gradient-to-r from-indigo-950 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10' 
                                                    : 'bg-slate-950/60 border-white/5 hover:border-white/10 hover:bg-slate-900/50'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center transition-all duration-300 ${
                                                isActive 
                                                    ? `bg-gradient-to-br ${step.color} text-white shadow-md ${step.glowColor}` 
                                                    : 'bg-white/5 text-slate-400 group-hover:text-slate-200'
                                            }`}>
                                                <IconComponent className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-bold text-slate-500">0{step.id}</span>
                                                    <h4 className="font-bold text-sm sm:text-base leading-none text-white">{step.title}</h4>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{step.desc}</p>
                                            </div>
                                            {isActive && (
                                                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right column: Details panel */}
                        <div className="lg:col-span-5 flex items-stretch">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeStep}
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.97 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full bg-gradient-to-b from-slate-950 to-slate-900 rounded-[2rem] p-8 border border-white/10 flex flex-col justify-between shadow-2xl relative overflow-hidden"
                                >
                                    {/* background glow */}
                                    <div className={`absolute top-0 right-0 w-48 h-48 rounded-full bg-gradient-to-br ${PIPELINE_STEPS[activeStep - 1].color} opacity-[0.06] blur-2xl`} />

                                    <div>
                                        <div className="flex items-center justify-between mb-8">
                                            <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                                                Stage {activeStep} of 8
                                            </span>
                                            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest text-right">In-App Chat Active</span>
                                        </div>

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${PIPELINE_STEPS[activeStep - 1].color} flex items-center justify-center text-white shadow-lg`}>
                                                {(() => {
                                                    const StepIcon = PIPELINE_STEPS[activeStep - 1].icon;
                                                    return <StepIcon className="w-7 h-7" />;
                                                })()}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-extrabold text-white leading-tight">{PIPELINE_STEPS[activeStep - 1].title}</h3>
                                                <p className="text-xs font-semibold text-slate-400 mt-0.5">{PIPELINE_STEPS[activeStep - 1].desc}</p>
                                            </div>
                                        </div>

                                        <p className="text-sm sm:text-base text-slate-300 leading-relaxed pt-2">
                                            {PIPELINE_STEPS[activeStep - 1].detail}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/5">
                                        <div className="bg-white/5 rounded-2xl p-4 flex gap-3 items-center">
                                            <MessageSquare className="w-5 h-5 text-indigo-400 shrink-0" />
                                            <p className="text-xs text-slate-400 leading-normal">
                                                {activeStep === 3 
                                                    ? "Safe refund lock active. The in-app chat opens fully between jobseeker and employee once unlocked."
                                                    : "Discuss edits to your resume, mock interview feedback, or details directly in the built-in applicant chat."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Chat Showcase Section */}
            <section className="py-24 bg-white relative">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="grid lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Mock Chat Interface Visual */}
                        <div className="lg:col-span-6 bg-slate-950 rounded-[2.5rem] p-6 border border-slate-800 shadow-2xl relative order-last lg:order-first">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-[2.5rem] pointer-events-none" />
                            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                        RK
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                                            Rohan K. <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-medium">Software Engineer II @ Google</p>
                                    </div>
                                </div>
                                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                    Referral Workspace Chat
                                </span>
                            </div>

                            <div className="space-y-4 min-h-[250px] flex flex-col justify-end">
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 max-w-[85%] text-xs text-slate-200">
                                    <span className="text-[9px] font-bold text-slate-400 block mb-1">Rohan K. • 10:14 AM</span>
                                    Hey Rahul! I reviewed your resume. The project experience is great, but could you specify the cloud deployment details? That will help it stand out internally.
                                </div>
                                <div className="bg-indigo-600/20 border border-indigo-500/20 rounded-2xl p-3 max-w-[85%] ml-auto text-xs text-indigo-200">
                                    <span className="text-[9px] font-bold text-indigo-400 block mb-1">Rahul (Jobseeker) • 10:16 AM</span>
                                    Sure Rohan! I just updated my details on the onboarding page and uploaded the new resume version. Could you check it?
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 max-w-[85%] text-xs text-slate-200">
                                    <span className="text-[9px] font-bold text-slate-400 block mb-1">Rohan K. • 10:18 AM</span>
                                    Perfect, this version is excellent. I am submitting it internally right now and will upload the screenshot proof. Let's discuss details once it is verified by the admin!
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl p-2 mt-4">
                                    <input type="text" placeholder="Type a message to your referrer..." className="bg-transparent border-none text-xs focus:outline-none focus:ring-0 text-white w-full px-2" disabled />
                                    <button className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm shrink-0">
                                        <Send className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Chat explanation Copy */}
                        <div className="lg:col-span-6 max-w-xl">
                          
                            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-4 mb-6 tracking-tight leading-tight">
                                Direct In-App Chat.<br />No Middlemen.
                            </h2>
                            <p className="text-base sm:text-lg text-slate-600 mb-6 leading-relaxed">
                                Cut out recruiters' email silos and phone delays. Once an application is unlocked or direct screening starts, jobseekers, employee referrers, and recruiters can chat directly inside our dedicated messaging engine.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { t: "Resume Optimization Tips", d: "Employees can guide you to format and align your CV to match company roles before submitting the referral." },
                                    { t: "Interview Coordination", d: "Directly schedule screening calls, ask questions about company culture, or ask for guidance on target questions." },
                                    { t: "Real-Time Tracking Alerts", d: "Get notified when a message is received, keeping both parties sync'd throughout the 8 stages." }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-3.5 items-start">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-base leading-snug">{item.t}</h4>
                                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">{item.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 5. Role-Based Mechanics (3-Tabbed Interface: Job Seekers vs Referrers vs Recruiters) */}
            <section className="py-24 bg-slate-50 border-y border-slate-200/60 relative">
                <div className="container px-4 md:px-6 mx-auto">
                    <motion.div 
                        initial="hidden" 
                        whileInView="visible" 
                        viewport={{ once: true }} 
                        variants={fadeInUp} 
                        className="text-center max-w-3xl mx-auto mb-12"
                    >
                      
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-4 mb-6 tracking-tight">Platform Economics</h2>
                        <p className="text-base sm:text-lg text-slate-600">Choose your role to understand how our credit and reputation economics keep the job search completely fair.</p>
                        
                        {/* 3-Tab Switcher */}
                        <div className="inline-flex p-1.5 bg-slate-200/60 rounded-2xl mt-8 border border-slate-200">
                            <button
                                onClick={() => setActiveRoleTab('jobseeker')}
                                className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-1.5 sm:gap-2 ${
                                    activeRoleTab === 'jobseeker'
                                        ? 'bg-white text-indigo-700 shadow-md'
                                        : 'text-slate-600 hover:text-slate-950'
                                }`}
                            >
                                <UserRound className="w-4 h-4" />
                                For Job Seekers
                            </button>
                            <button
                                onClick={() => setActiveRoleTab('referrer')}
                                className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-1.5 sm:gap-2 ${
                                    activeRoleTab === 'referrer'
                                        ? 'bg-white text-indigo-700 shadow-md'
                                        : 'text-slate-600 hover:text-slate-950'
                                }`}
                            >
                                <Building2 className="w-4 h-4" />
                                For Referrers
                            </button>
                            <button
                                onClick={() => setActiveRoleTab('recruiter')}
                                className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-1.5 sm:gap-2 ${
                                    activeRoleTab === 'recruiter'
                                        ? 'bg-white text-indigo-700 shadow-md'
                                        : 'text-slate-600 hover:text-slate-950'
                                }`}
                            >
                                <Users className="w-4 h-4" />
                                For Recruiters
                            </button>
                        </div>
                    </motion.div>

                    <div className="max-w-4xl mx-auto">
                        <AnimatePresence mode="wait">
                            {activeRoleTab === 'jobseeker' ? (
                                <motion.div
                                    key="jobseeker"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid md:grid-cols-3 gap-6"
                                >
                                    {[
                                        { 
                                            icon: Coins, 
                                            title: "Dual Credit System", 
                                            desc: "Uses Subscription Credits (provided free monthly in your active plan) or top-up Purchased Credits. The platform automatically consumes free credits first." 
                                        },
                                        { 
                                            icon: ShieldCheck, 
                                            title: "Anti-Spam Refund Lock", 
                                            desc: "Unlocked contacts require a referral screenshot. If the referrer submits invalid proof, your 2 credits are immediately refunded, and their trust score drops." 
                                        },
                                        { 
                                            icon: UserCheck, 
                                            title: "Confirm Referrals Directly", 
                                            desc: "After 5–7 days, the system asks you directly: Did you get a call? Was it genuine? Your answers regulate the community trust dashboard." 
                                        }
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between">
                                            <div>
                                                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                                                    <item.icon className="w-6 h-6" />
                                                </div>
                                                <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                                                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            ) : activeRoleTab === 'referrer' ? (
                                <motion.div
                                    key="referrer"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid md:grid-cols-3 gap-6"
                                >
                                    {[
                                        { 
                                            icon: Award, 
                                            title: "Gamified XP Rewards", 
                                            desc: "Accumulate XP through positive platform behaviors: +5 for posting a job, +10 for a candidate unlock, +30 for interview validation, and +65 for successful hires." 
                                        },
                                        { 
                                            icon: Star, 
                                            title: "Level Up & Milestones", 
                                            desc: "Levels unlock larger cash bonuses. E.g. reach the 'Connector' milestone by completing 20 verified referrals to unlock exclusive payout rewards." 
                                        },
                                        { 
                                            icon: DollarSign, 
                                            title: "Verified Cash Payouts", 
                                            desc: "Earnings accumulate directly into your platform Wallet, which you can easily withdraw into your linked Indian bank account via Razorpay." 
                                        }
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between">
                                            <div>
                                                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
                                                    <item.icon className="w-6 h-6" />
                                                </div>
                                                <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                                                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="recruiter"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid md:grid-cols-3 gap-6"
                                >
                                    {[
                                        { 
                                            icon: Rocket, 
                                            title: "Direct Job Postings", 
                                            desc: "Certified recruiters post company listings directly to the board. Standard direct jobs require 0 credits for jobseekers to apply." 
                                        },
                                        { 
                                            icon: LayoutGrid, 
                                            title: "Company Dashboard", 
                                            desc: "Manage applicants, filter CVs by domain/skills, and track candidate interview pipeline stages in a simplified recruiter workspace." 
                                        },
                                        { 
                                            icon: MessageSquare, 
                                            title: "Integrated Chat Workspaces", 
                                            desc: "Initiate real-time messaging directly with promising candidates. Pre-screen applicants and align on expectations instantly." 
                                        }
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between">
                                            <div>
                                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                                                    <item.icon className="w-6 h-6" />
                                                </div>
                                                <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                                                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* 6. Speed & Trust Leaderboard Showcase */}
            <section className="py-24 bg-white relative">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="grid lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Leaderboard metadata info */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="lg:col-span-5 max-w-lg"
                        >
                          
                            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-4 mb-6 tracking-tight">Hiring at India's Top MNCs</h2>
                            <p className="text-base sm:text-lg text-slate-600 mb-6 leading-relaxed">
                                Referrers on JobsDart are ranked in real-time by their <strong className="font-bold text-slate-900">Average Response Speed</strong> and <strong className="font-bold text-slate-900">Trust Score</strong>. 
                            </p>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                                Employees who verify requests within minutes and maintain a 100% genuine referral record scale to the top, gaining elite bonuses, while fake referrers are penalized.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                    <p className="text-2xl font-black text-indigo-600 tracking-tight">~14m</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Average Response</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                    <p className="text-2xl font-black text-green-600 tracking-tight">96%</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Trust Score Avg</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Leaderboard Mock Widget */}
                        <div className="lg:col-span-7 bg-slate-950 rounded-[2.5rem] p-6 sm:p-8 border border-slate-800 shadow-2xl text-white">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-amber-400" />
                                    <h3 className="font-extrabold text-sm sm:text-base">Top Referred Insiders</h3>
                                </div>
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Live Updates</span>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { rank: 1, name: "Aditi Nair", comp: "Amazon", trust: 99, speed: "12m", level: 8, bg: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                                    { rank: 2, name: "Rahul Mehta", comp: "Microsoft", trust: 97, speed: "28m", level: 6, bg: "bg-slate-300/10 text-slate-300 border-slate-300/20" },
                                    { rank: 3, name: "Sanjay Gupta", comp: "Google", trust: 96, speed: "45m", level: 5, bg: "bg-amber-700/10 text-amber-700 border-amber-700/20" },
                                    { rank: 4, name: "Neha Patel", comp: "Meta", trust: 95, speed: "1h 10m", level: 4, bg: "bg-slate-900 border-white/5" }
                                ].map((row, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3.5">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${row.rank === 1 ? 'bg-amber-400 text-slate-900' : 'bg-white/10 text-slate-300'}`}>
                                                {row.rank}
                                            </span>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-sm sm:text-base text-white">{row.name}</span>
                                                    <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">Lv. {row.level}</span>
                                                </div>
                                                <p className="text-xs text-indigo-300 font-semibold">{row.comp} Insider</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-none border-white/5">
                                            <div>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">TRUST SCORE</p>
                                                <span className="text-xs font-bold text-green-400">{row.trust}%</span>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">RESP. SPEED</p>
                                                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {row.speed}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-white bg-indigo-600 px-3 py-1 rounded-full hidden sm:inline-block">Elite</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 7. Latest Opportunities Section */}
            <section className="py-24 bg-white relative">
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
                                    className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-5"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
                                >
                                    {latestJobs.map((job, idx) => (
                                        <div
                                            key={`mob-${job.id || idx}`}
                                            onClick={() => router.push(`/jobs/${job.id}`)}
                                            className="min-w-[300px] snap-start bg-white rounded-3xl p-5 shadow-xl shadow-slate-100/60 border border-slate-100 cursor-pointer relative overflow-hidden flex-shrink-0"
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
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-center gap-1.5 mt-3">
                                    {latestJobs.slice(0, 6).map((_, i) => (
                                        <span key={i} className={`h-1.5 rounded-full transition-all ${i === 0 ? 'w-4 bg-indigo-500' : 'w-1.5 bg-indigo-200'}`}></span>
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
                                    <motion.div 
                                        key={job.id || idx} 
                                        variants={fadeInUp} 
                                        whileHover={{ y: -8, scale: 1.01 }} 
                                        onClick={() => router.push(`/jobs/${job.id}`)}
                                        className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-100/60 border border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between"
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
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }} 
                                                    whileTap={{ scale: 0.97 }}
                                                    className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-full transition-colors shadow-md shadow-indigo-200 flex items-center gap-1"
                                                >
                                                    Unlock Referral <ArrowUpRight className="w-3 h-3" />
                                                </motion.button>
                                            ) : (
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }} 
                                                    whileTap={{ scale: 0.97 }}
                                                    className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-full transition-colors shadow-md shadow-emerald-200 flex items-center gap-1"
                                                >
                                                    Apply Direct <ArrowUpRight className="w-3 h-3" />
                                                </motion.button>
                                            )}
                                        </div>
                                    </motion.div>
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

            {/* 8. Platform Security & FAQ Section */}
            <section className="py-20 md:py-28 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
                <div className="absolute -right-60 top-20 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -left-60 bottom-20 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="container px-4 md:px-6 mx-auto max-w-3xl relative z-10">
                    <motion.div 
                        initial="hidden" 
                        whileInView="visible" 
                        viewport={{ once: true, margin: "-80px" }} 
                        variants={staggerContainer} 
                        className="text-center mb-14"
                    >
                    
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                            Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Rules & FAQs</span>
                        </h2>
                        <p className="text-base md:text-lg text-slate-400">
                            Clear and straightforward answers about credit refunds, verification, and reputation scores.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial="hidden" 
                        whileInView="visible" 
                        viewport={{ once: true, margin: "-50px" }} 
                        variants={staggerContainer} 
                        className="space-y-3"
                    >
                        {[
                            { 
                                q: "What is the difference between Direct and Referral job listings?", 
                                a: "Referral jobs are posted by verified employees working at the company who will refer you internally. Applying requires unlocking with 2 credits. Direct jobs are posted by corporate Recruiters and require 0 credits to apply standardly through our applicant workflow." 
                            },
                            { 
                                q: "How does the direct chat system work between candidates and referrers?", 
                                a: "Once you submit an application and the employee accepts your interest, a dedicated in-app chat is unlocked. You can message them in real-time, upload updated resume files, ask about company interview formats, or coordinate referral stages." 
                            },
                            { 
                                q: "How are my jobseeker credits spent and refunded?", 
                                a: "Every referral request costs 2 Credits to unlock once the insider accepts your pre-screen interest. If the employee referrer uploads an invalid screenshot or fails to submit verification proof in 5-7 days, your 2 credits are immediately refunded back to your account balance automatically." 
                            },
                            { 
                                q: "What happens if a referrer uploads a fake screenshot?", 
                                a: "Upload logs are monitored and verified by administrators. If a referrer is caught submitting fake screenshots or links, their application status is moved to 'Disputed', a flat -25 points penalty is applied to their Trust Score, and the jobseeker receives an automatic refund. Repetitive disputes trigger a permanent ban." 
                            },
                            { 
                                q: "How do employees accumulate XP and earn cash?", 
                                a: "Employees earn XP points for positive platform behaviors (Posting: +5 XP, Candidate Unlock: +10 XP, Refeeral Verified: +20 XP). Earning XP lets them level up. Cash referrals are accumulated in their internal platform wallet, which can be directly withdrawn via Razorpay integrations." 
                            }
                        ].map((faq, idx) => (
                            <motion.div key={idx} variants={fadeInUp}>
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className={`w-full text-left flex items-center justify-between gap-4 px-6 py-5 rounded-2xl font-bold transition-all duration-300 ${
                                        openFaq === idx
                                            ? 'bg-slate-800 border border-slate-700'
                                            : 'bg-slate-900 border border-white/5 hover:border-slate-800'
                                    }`}
                                >
                                    <span className="text-sm md:text-base leading-snug text-slate-200">{faq.q}</span>
                                    <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                        openFaq === idx ? 'bg-indigo-500 text-white rotate-180' : 'bg-slate-800 text-slate-400'
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
                                            <div className="px-6 pb-5 pt-2 text-slate-400 text-xs sm:text-sm leading-relaxed border-x border-b border-slate-700 rounded-b-2xl bg-slate-800/40 -mt-2">
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
        </div>
    );
};

export default JobPortalHome;
