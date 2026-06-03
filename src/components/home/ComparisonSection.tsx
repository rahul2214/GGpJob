"use client";

import { motion, type Easing } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as Easing } }
};

export function ComparisonSection() {
    return (
        <section id="comparison" aria-label="ATS vs JobsDart Comparison" className="py-24 bg-white relative">
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
                                        <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">{item.t}</h4>
                                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">{item.d}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
