"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Rocket, Globe, ArrowRight } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as any } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export function CtaSection() {
    return (
        <section id="cta" aria-label="Get Started Call to Action" className="py-24 relative overflow-hidden bg-slate-50 dark:bg-[hsl(220_65%_6%)] transition-colors duration-300">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
                <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
                <div className="dot-grid-faint opacity-50 absolute inset-0" />
            </div>

            <div className="container-xl relative z-10">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-10 md:p-20 shadow-xl dark:shadow-2xl overflow-hidden relative text-slate-900 dark:text-white"
                >
                    <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">

                        <motion.h2 
                            variants={fadeInUp}
                            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight"
                        >
                            Your Gateway to <span className="text-gradient-primary">Global Career Growth</span>
                        </motion.h2>

                        <motion.p 
                            variants={fadeInUp}
                            className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto"
                        >
                            Skip local constraints. Get matched with international enterprises hiring top remote talent and offering comprehensive relocation support.
                        </motion.p>

                        <motion.div 
                            variants={fadeInUp}
                            className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center pt-2"
                        >
                            <Link href="/signup" className="btn-primary w-full sm:w-auto px-10 py-4 text-base">
                                Get Started Free <Rocket className="w-5 h-5" />
                            </Link>
                            <Link href="/jobs" className="btn-secondary w-full sm:w-auto px-10 py-4 text-base">
                                Browse Global Jobs <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>

                        <motion.div 
                            variants={fadeInUp}
                            className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-slate-200 dark:border-white/10 w-full text-center"
                        >
                            {[
                                { value: "120+", label: "Countries Represented" },
                                { value: "85k+", label: "Remote & Relocation Roles" },
                                { value: "24 hrs", label: "Average Match Time" },
                            ].map((s, i) => (
                                <div key={i} className={i === 2 ? "col-span-2 md:col-span-1" : ""}>
                                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white block">{s.value}</span>
                                    <span className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">{s.label}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
