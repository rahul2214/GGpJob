"use client";

import { motion, type Easing } from 'framer-motion';
import { Trophy, Clock } from 'lucide-react';
import { AnimatedCounter } from '@/components/animated-counter';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as Easing } }
};

export function LeaderboardSection() {
    return (
        <section id="leaderboard" aria-label="Top Insiders Leaderboard" className="py-24 bg-white relative">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Leaderboard metadata info */}
                    <motion.div 
                        initial="hidden" 
                        whileInView="visible" 
                        viewport={{ once: true }} 
                        variants={fadeInUp} 
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
                                <p className="text-2xl font-black text-indigo-600 tracking-tight flex items-center justify-center gap-0.5">
                                    ~<AnimatedCounter value={14} className="inline" />m
                                </p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Average Response</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                <p className="text-2xl font-black text-green-600 tracking-tight flex items-center justify-center gap-0.5">
                                    <AnimatedCounter value={96} className="inline" />%
                                </p>
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
                                            <span className="text-xs font-bold text-green-400 flex items-center gap-0.5">
                                                <AnimatedCounter value={row.trust} className="inline" />%
                                            </span>
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
    );
}
