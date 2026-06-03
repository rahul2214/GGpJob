"use client";

import { useState } from 'react';
import { motion, AnimatePresence, type Easing } from 'framer-motion';
import { 
    Users, Building2, UserRound, Coins, ShieldCheck, 
    UserCheck, Award, Star, DollarSign, Rocket, 
    LayoutGrid, MessageSquare
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as Easing } }
};

export function RoleTabs() {
    const [activeRoleTab, setActiveRoleTab] = useState<'jobseeker' | 'referrer' | 'recruiter'>('jobseeker');

    return (
        <section id="platform-economics" aria-label="Platform Economics" className="py-24 bg-slate-50 border-y border-slate-200/60 relative">
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
    );
}
