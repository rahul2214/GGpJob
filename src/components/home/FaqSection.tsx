"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as any } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

export function FaqSection() {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    return (
        <section id="faq" aria-label="Platform Rules and FAQs" className="py-20 md:py-28 relative overflow-hidden border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[hsl(220_65%_6%)] transition-colors duration-300">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/15 via-transparent to-transparent pointer-events-none" />
            <div className="container-xl relative z-10">
                <motion.div 
                    initial="hidden" 
                    whileInView="visible" 
                    viewport={{ once: true, margin: "-80px" }} 
                    variants={staggerContainer} 
                    className="text-center mb-14"
                >
                    <h2 className="section-heading mt-4 mb-6">
                        Platform <span className="text-gradient-primary">Rules & FAQs</span>
                    </h2>
                    <p className="section-subheading mx-auto">
                        Clear answers about credit refunds, verification, and platform rules.
                    </p>
                </motion.div>

                <motion.div 
                    initial="hidden" 
                    whileInView="visible" 
                    viewport={{ once: true, margin: "-50px" }} 
                    variants={staggerContainer} 
                    className="space-y-4 max-w-3xl mx-auto"
                >
                    {[
                        { 
                            q: "How do job postings work for recruiters?", 
                            a: "Recruiters can post active job openings directly on the platform. Depending on your subscription plan, you get dedicated application limits, priority placement, and direct messaging with applicants." 
                        },
                        { 
                            q: "How does the direct chat system work between candidates and recruiters?", 
                            a: "Once a candidate applies or a recruiter expresses interest, a dedicated in-app chat is unlocked. You can message in real-time, review updated resume files, and schedule screening calls." 
                        },
                        { 
                            q: "How are jobseeker credits spent?", 
                            a: "Jobseekers can use credits to access premium application features, highlight their applications, and unlock direct messaging with hiring managers." 
                        },
                        { 
                            q: "How are recruiter accounts and job postings verified?", 
                            a: "All recruiter signups and company domain profiles undergo automated verification checks to ensure high trust, authentic hiring listings, and zero spam." 
                        },
                        { 
                            q: "Can recruiters track application status and candidate pipelines?", 
                            a: "Yes! Recruiters get a dedicated dashboard with real-time candidate pipeline management, applicant filtering by skills/experience, and quick status updates." 
                        }
                    ].map((faq, idx) => (
                        <motion.div key={idx} variants={fadeInUp} className="group">
                            <button
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                className={`w-full text-left flex items-center justify-between gap-4 px-6 py-5 rounded-2xl font-bold transition-all duration-300 ${
                                    openFaq === idx
                                        ? 'bg-slate-100 dark:bg-white/10 border border-violet-500/30 shadow-sm'
                                        : 'bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/8'
                                }`}
                            >
                                <span className="text-sm md:text-base leading-snug text-slate-900 dark:text-slate-100">{faq.q}</span>
                                <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    openFaq === idx ? 'bg-violet-600 text-white rotate-180' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 group-hover:bg-slate-300 dark:group-hover:bg-white/20'
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
                                        transition={{ duration: 0.3, ease: 'easeInOut' as any }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-5 pt-4 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed border-x border-b border-slate-200 dark:border-white/10 rounded-b-2xl bg-slate-50 dark:bg-white/5 -mt-3">
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
