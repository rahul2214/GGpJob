"use client";

import Link from 'next/link';
import { motion, type Easing } from 'framer-motion';
import { Rocket } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as Easing } }
};

export function CtaSection() {
    return (
        <section id="cta" aria-label="Get Started Call to Action" className="py-20 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]" />
            </div>
            <div className="container relative z-10 px-4 md:px-6 mx-auto text-center max-w-3xl">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="space-y-6"
                >
                    <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest inline-block">
                        Ready to bypass the ATS?
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                        Land Your Dream Role Through Direct Referrals
                    </h2>
                    <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
                        Join thousands of developers, designers, and managers skipping keyword filters and securing real interviews today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <Link href="/company/signup" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transform active:scale-95 transition-all">
                            Get Started Free <Rocket className="w-5 h-5" />
                        </Link>
                        <Link href="/jobs" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold px-8 py-4 rounded-2xl transition-all">
                            Browse Active Jobs
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
