"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Clock, ShieldCheck, Coins, MessageSquare } from 'lucide-react';
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

const mockChats = [
    { sender: "seeker", text: "Hey Rohan, thanks for accepting my interest! Just wanted to share my latest portfolio link here." },
    { sender: "employee", text: "Nice work on the React optimization metrics. Let me submit this directly to my manager via our internal portal." },
    { sender: "seeker", text: "Greatly appreciate it! Let me know if you need any other details." },
    { sender: "employee", text: "Done! Uploaded the screenshot proof. Good luck with the screening!" }
];

export function HeroSection() {
    const router = useRouter();
    const [recentReferral, setRecentReferral] = useState({
        name: "Abhishek S.",
        company: "Google",
        role: "Software Engineer",
        time: "Just now"
    });
    const [chatStep, setChatStep] = useState<number>(0);

    useEffect(() => {
        let tickerInterval: NodeJS.Timeout;
        let chatInterval: NodeJS.Timeout;

        const startIntervals = () => {
            const companies = ["Google", "Microsoft", "Amazon", "Meta", "Netflix", "Adobe", "Razorpay"];
            const roles = ["Software Engineer", "Frontend Dev", "DevOps Engineer", "UI/UX Designer", "Product Manager", "Data Analyst"];
            const names = ["Abhishek S.", "Neha K.", "Rohit M.", "Anjali P.", "Vikram G.", "Sneha T.", "Aarav C."];
            
            tickerInterval = setInterval(() => {
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

            chatInterval = setInterval(() => {
                setChatStep(prev => {
                    if (prev >= mockChats.length) {
                        clearInterval(chatInterval);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 3500);
        };

        const stopIntervals = () => {
            clearInterval(tickerInterval);
            clearInterval(chatInterval);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopIntervals();
            } else {
                startIntervals();
            }
        };

        if (!document.hidden) {
            startIntervals();
        }

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            stopIntervals();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
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
        <section id="hero" aria-label="Hero Introduction" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-b from-indigo-50/50 via-slate-50 to-white text-slate-900">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
                <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.06]" />
            </div>
            
            <div className="container relative z-10 px-4 md:px-6 mx-auto">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-2xl lg:col-span-7">

                        <motion.div variants={fadeInUp}>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                                Bypass the ATS.<br />
                                Get Referred by <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 drop-shadow-sm">Insiders.</span>
                            </h1>
                        </motion.div>
                        
                        <motion.p variants={fadeInUp} className="text-base sm:text-lg text-slate-650 mb-8 leading-relaxed max-w-xl">
                           Connect directly with verified insiders at Google, Microsoft, and 500+ MNCs. No middlemen. No black holes.
                        </motion.p>

                        <motion.form variants={fadeInUp} onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xl max-w-xl">
                            <div className="flex-1 flex items-center px-4 bg-slate-50 rounded-xl border border-slate-100 focus-within:border-indigo-500 transition-colors">
                                <Search className="w-5 h-5 text-slate-400" />
                                <input name="search" type="text" placeholder="Search target company or skills..." className="w-full bg-transparent border-none focus:outline-none focus:ring-0 px-3 py-3 text-slate-800 placeholder:text-slate-400 text-sm md:text-base" />
                            </div>
                            <Button type="submit" size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl px-8 h-12 sm:h-auto shadow-lg shadow-indigo-500/20 font-bold border border-indigo-400/20 transition-all duration-300 transform active:scale-95">
                                Browse Jobs
                            </Button>
                        </motion.form>

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
                                    className="text-xs sm:text-sm text-slate-500"
                                >
                                    <strong className="text-slate-800">{recentReferral.name}</strong> just accepted interest for <strong className="text-indigo-600 font-bold">{recentReferral.role}</strong> at <strong className="text-slate-900 font-extrabold">{recentReferral.company}</strong> ({recentReferral.time})
                                </motion.p>
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>

                    <div className="relative h-[450px] lg:h-[500px] hidden lg:block lg:col-span-5">
                        
                        {/* Card 1: Verified Employee Reputation */}
                        <motion.div 
                            animate={{ y: [-8, 8, -8] }} 
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} 
                            className="absolute top-4 left-6 z-20 bg-white/95 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-slate-200/60 max-w-[280px]"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                                    VS
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="font-bold text-slate-800 text-sm">Vikram Seth</h3>
                                        <ShieldCheck className="w-4 h-4 text-green-500 fill-green-500/20" />
                                    </div>
                                    <p className="text-xs text-indigo-600 font-semibold font-sans">Staff Architect @ Microsoft</p>
                                </div>
                            </div>
                            <div className="space-y-2 border-t border-slate-100 pt-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Trust Score</span>
                                    <span className="text-green-600 font-bold flex items-center gap-0.5">
                                        <AnimatedCounter value={98} className="inline" />/100
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-gradient-to-r from-emerald-500 to-green-400 h-full rounded-full" style={{ width: '98%' }}></div>
                                </div>
                                <div className="flex justify-between items-center text-xs pt-1">
                                    <span className="text-slate-500">Response Speed</span>
                                    <span className="text-indigo-650 font-bold flex items-center gap-0.5"><Clock className="w-3 h-3" /> ~12 mins</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 2: Interactive Application Status */}
                        <motion.div 
                            animate={{ y: [8, -8, 8] }} 
                            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }} 
                            className="absolute top-1/3 right-4 z-30 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-850 p-6 rounded-3xl shadow-2xl border border-indigo-500/30 max-w-[310px] text-white"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Referral Tracker</p>
                                    <h4 className="font-bold text-white text-base mt-0.5">Google • Senior Dev</h4>
                                </div>
                                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                    <Coins className="w-3 h-3" /> 2 Credits
                                </span>
                            </div>
                            
                            <div className="space-y-4 pt-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 text-xs">✓</div>
                                    <p className="text-xs text-slate-200 font-medium">Interest Accepted by Insider</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-indigo-800/40 border border-indigo-400/40 flex items-center justify-center text-indigo-200 text-xs animate-pulse">●</div>
                                    <div>
                                        <p className="text-xs text-white font-bold">Referral Verification Stage</p>
                                        <p className="text-[10px] text-slate-300">Proof validation pending admin</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                                <span className="text-[10px] text-slate-350 italic text-white/70">Protection active</span>
                                <span className="text-xs text-indigo-200 font-bold flex items-center gap-1">Secured Flow <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" /></span>
                            </div>
                        </motion.div>
                        
                        {/* Card 3: Floating Live Chat Preview */}
                        <motion.div 
                            animate={{ y: [-5, 5, -5] }} 
                            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} 
                            className="absolute bottom-4 left-1/4 z-10 bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-slate-200/60 w-[310px]"
                        >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Direct Inbox Chat</span>
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
                                            ? "bg-indigo-50 border border-indigo-100 text-indigo-850 self-start" 
                                            : "bg-slate-100 border border-slate-200/40 text-slate-700 ml-auto"
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
                    </div>
                </div>
            </div>
        </section>
    );
}
