"use client";

import { motion } from "framer-motion";
import { Check, X, Shield, Users, Zap, Globe } from "lucide-react";

const TRADITIONAL = [
  { icon: X, label: "Cold email into the void", sub: "No response, no context" },
  { icon: X, label: "ATS spam filter", sub: "Résumé never seen by humans" },
  { icon: X, label: "Consistent ghosting", sub: "Zero feedback, zero closure" },
  { icon: X, label: "~3 months to offer", sub: "Average job-search duration" },
  { icon: X, label: "1% interview rate", sub: "Industry cold-apply average" },
];

const JOBSDART = [
  { icon: Users, label: "Direct recruiter chat", sub: "Direct connection to hiring team" },
  { icon: Shield, label: "AI ATS Optimization", sub: "Score & tune resume instantly" },
  { icon: Zap, label: "Verified hire milestones", sub: "Fast-track candidate placement" },
  { icon: Globe, label: "~12 days to offer", sub: "Median across all placements" },
  { icon: Check, label: "45% interview rate", sub: "For direct vetted applicants" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" as any },
  }),
};

export function ComparisonSection() {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* subtle radial bg glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
         
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Why candidates & recruiters choose{" "}
            <span className="text-violet-600 dark:text-violet-400">
              JobsDart
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 dark:text-white/50">
            Stop shouting into the ATS black hole. Connect directly with recruiters and get hired — fast.
          </p>
        </motion.div>

        {/* Card grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* ── Traditional card ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] p-8 backdrop-blur-md shadow-sm dark:shadow-none"
          >
            {/* header */}
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/30">
                <X className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30">
                  Old way
                </p>
                <h3 className="text-lg font-bold text-slate-700 dark:text-white/50">
                  Traditional Apply
                </h3>
              </div>
              <span className="ml-auto rounded-full bg-red-500/10 px-3 py-0.5 text-xs font-medium text-red-500 dark:text-red-400 border border-red-500/20">
                ATS Black Hole
              </span>
            </div>

            {/* rows */}
            <ul className="space-y-4">
              {TRADITIONAL.map(({ icon: Icon, label, sub }, i) => (
                <motion.li
                  key={label}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500/70">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-white/40 line-through decoration-red-500/40">
                      {label}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-white/25">{sub}</p>
                  </div>
                </motion.li>
              ))}
            </ul>

            {/* bottom stat */}
            <div className="mt-8 flex gap-4">
              <div className="flex-1 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 p-3 text-center">
                <p className="text-2xl font-bold text-slate-700 dark:text-white/30">3 mo</p>
                <p className="text-xs text-slate-500 dark:text-white/20">avg. time to offer</p>
              </div>
              <div className="flex-1 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 p-3 text-center">
                <p className="text-2xl font-bold text-red-500 dark:text-red-400/60">1%</p>
                <p className="text-xs text-slate-500 dark:text-white/20">interview rate</p>
              </div>
            </div>
          </motion.div>

          {/* ── JobsDart card ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl border border-violet-500/30 bg-slate-900 text-white dark:bg-violet-950/20 p-8 backdrop-blur-md glow-violet"
            style={{
              boxShadow:
                "0 0 40px -8px rgba(139,92,246,0.35), inset 0 1px 0 rgba(139,92,246,0.15)",
            }}
          >
            {/* gradient border overlay */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.06) 100%)",
              }}
            />

            {/* header */}
            <div className="relative mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
                <Zap className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-400/70">
                  Smart way
                </p>
                <h3 className="text-lg font-bold text-white">JobsDart</h3>
              </div>
              <span className="ml-auto rounded-full bg-violet-500/15 px-3 py-0.5 text-xs font-medium text-violet-300 border border-violet-500/30">
                Stitch-Verified
              </span>
            </div>

            {/* rows */}
            <ul className="relative space-y-4">
              {JOBSDART.map(({ icon: Icon, label, sub }, i) => (
                <motion.li
                  key={label}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-white/40">{sub}</p>
                  </div>
                </motion.li>
              ))}
            </ul>

            {/* bottom stat */}
            <div className="relative mt-8 flex gap-4">
              <div className="flex-1 rounded-xl bg-violet-500/10 border border-violet-500/20 p-3 text-center">
                <p className="text-2xl font-bold text-violet-300">12 days</p>
                <p className="text-xs text-white/40">avg. time to offer</p>
              </div>
              <div className="flex-1 rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-center">
                <p className="text-2xl font-bold text-blue-300">45%</p>
                <p className="text-xs text-white/40">interview rate</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* bottom CTA nudge */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-10 text-center text-sm text-slate-500 dark:text-white/30"
        >
          Join{" "}
          <span className="font-semibold text-violet-600 dark:text-violet-400">12,000+</span>{" "}
          professionals already skipping the queue.
        </motion.p>
      </div>
    </section>
  );
}
