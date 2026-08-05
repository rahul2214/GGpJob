"use client";

import { motion } from 'framer-motion';
import { Trophy, Clock, Globe, Star, TrendingUp } from 'lucide-react';
import { AnimatedCounter } from '@/components/animated-counter';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as any } }
};

const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const leaderboardData = [
    { rank: 1, name: "Vikram S.", company: "Microsoft", role: "Staff Architect", location: "Seattle, US", referrals: 47, speed: "~8 min", trust: 99, badge: "🏆" },
    { rank: 2, name: "Elena K.", company: "Google", role: "Tech Lead", location: "Zürich, CH", referrals: 42, speed: "~12 min", trust: 97, badge: "🥈" },
    { rank: 3, name: "Chen W.", company: "Amazon", role: "Principal SDE", location: "Vancouver, CA", referrals: 38, speed: "~15 min", trust: 96, badge: "🥉" },
    { rank: 4, name: "Priya M.", company: "Stripe", role: "Sr. Engineer", location: "London, UK", referrals: 31, speed: "~18 min", trust: 94 },
    { rank: 5, name: "James R.", company: "Meta", role: "Engineering Mgr", location: "New York, US", referrals: 28, speed: "~20 min", trust: 92 },
];

export function LeaderboardSection() {
    return (
        <section id="leaderboard" aria-label="Top Insiders Leaderboard" className="py-24 relative overflow-hidden bg-slate-50 dark:bg-[hsl(228_55%_10%)] transition-colors duration-300">
            {/* Background decoration */}
            <div className="absolute inset-0 dot-grid-faint opacity-40" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

            <div className="container-xl relative z-10">
                <div className="grid lg:grid-cols-12 gap-12 items-start">
                    
                    {/* Left: Metadata */}
                    <motion.div 
                        initial="hidden" 
                        whileInView="visible" 
                        viewport={{ once: true }} 
                        variants={fadeInUp} 
                        className="lg:col-span-5 max-w-lg lg:sticky lg:top-32"
                    >
                        <span className="section-label mb-4">
                            <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                            <span className="text-amber-600 dark:text-amber-400">Global Leaderboard</span>
                        </span>
                        <h2 className="section-heading mt-4 mb-6">
                            Top Insiders <span className="text-gradient-gold">Worldwide</span>
                        </h2>
                        <p className="section-subheading mb-8">
                            Our highest-rated verified insiders across 50+ countries. 
                            These elite referrers consistently deliver fast, high-quality referrals at top tech companies.
                        </p>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { value: 500, suffix: "+", label: "Active Insiders", icon: Globe },
                                { value: 12, suffix: "min", label: "Avg Response", icon: Clock },
                                { value: 95, suffix: "%", label: "Success Rate", icon: TrendingUp },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-center shadow-sm">
                                    <stat.icon className="w-4 h-4 text-violet-500 dark:text-violet-400 mx-auto mb-2" />
                                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                        <AnimatedCounter value={stat.value} className="inline" />{stat.suffix}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right: Leaderboard cards */}
                    <motion.div 
                        initial="hidden" 
                        whileInView="visible" 
                        viewport={{ once: true }} 
                        variants={stagger} 
                        className="lg:col-span-7 space-y-3"
                    >
                        {leaderboardData.map((row) => (
                            <motion.div
                                key={row.rank}
                                variants={fadeInUp}
                                className={`bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex items-center gap-4 hover-lift group shadow-sm ${
                                    row.rank <= 3 ? 'border-amber-500/30' : ''
                                }`}
                            >
                                {/* Rank */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shrink-0 ${
                                    row.rank === 1 ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-glow-amber' :
                                    row.rank === 2 ? 'bg-slate-100 dark:bg-slate-300/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-500/30' :
                                    row.rank === 3 ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-600 border border-amber-300 dark:border-amber-600/30' :
                                    'bg-slate-100 dark:bg-slate-800/50 text-slate-500 border border-slate-200 dark:border-slate-700/30'
                                }`}>
                                    {row.badge || row.rank}
                                </div>

                                {/* Avatar */}
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md">
                                    {row.name.split(' ').map(n => n[0]).join('')}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{row.name}</h3>
                                        {row.rank <= 3 && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                                    </div>
                                    <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold truncate">{row.role} @ {row.company}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">{row.location}</p>
                                </div>

                                {/* Stats */}
                                <div className="hidden sm:flex items-center gap-6 text-xs shrink-0">
                                    <div className="text-center">
                                        <p className="font-extrabold text-slate-900 dark:text-white">{row.referrals}</p>
                                        <p className="text-slate-500 text-[10px]">Referrals</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-emerald-600 dark:text-emerald-400">{row.trust}/100</p>
                                        <p className="text-slate-500 text-[10px]">Trust</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                        <Clock className="w-3 h-3" />
                                        <span className="font-bold">{row.speed}</span>
                                    </div>
                                </div>

                                {/* Elite badge */}
                                {row.rank <= 3 && (
                                    <span className="badge-amber hidden md:inline-flex">Elite</span>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
