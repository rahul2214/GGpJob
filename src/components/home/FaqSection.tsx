"use client";

import { useState } from 'react';
import { motion, AnimatePresence, type Easing } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as Easing } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

export function FaqSection() {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    return (
        <section id="faq" aria-label="Platform Rules and Frequently Asked Questions" className="py-20 md:py-28 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
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
                            a: "Employees earn XP points for positive platform behaviors (Posting: +5 XP, Candidate Unlock: +10 XP, Referral Verified: +30 XP). Earning XP lets them level up. Cash referrals are accumulated in their internal platform wallet, which can be directly withdrawn via Razorpay integrations." 
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
    );
}
