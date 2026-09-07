"use client";

import { useState } from "react";
import { useUser } from "@/contexts/user-context";
import { ChevronDown, HelpCircle, FileText, Sparkles, Download, LayoutTemplate } from "lucide-react";
import { motion, AnimatePresence, type Easing } from "framer-motion";
import { RESUME_BUILDER_FAQS, RESUME_BUILDER_STEPS } from "@/lib/seo-content";

const HIGHLIGHTS = [
  {
    icon: LayoutTemplate,
    title: "ATS-friendly resume templates",
    body: "Choose from professional, single-column resume templates built to be parsed cleanly by applicant tracking systems. No tables, no text boxes and no graphics that break keyword extraction, just a clean structure recruiters and screening software both read correctly."
  },
  {
    icon: Sparkles,
    title: "AI resume writer for freshers and professionals",
    body: "Turn rough notes into quantified, action-driven bullet points. The AI resume writer suggests strong verbs, adds measurable impact and aligns your wording with the skills employers search for, whether you are a fresher writing a first CV or an experienced hire rewriting a decade of work history."
  },
  {
    icon: FileText,
    title: "Resume formats for IT, engineering and non-tech roles",
    body: "Build a software developer resume with a tech-stack skills matrix, an engineering CV with project impact metrics, or a business and marketing resume that leads with outcomes. Each layout keeps the section headings ATS parsers expect while highlighting what your target role actually screens for."
  },
  {
    icon: Download,
    title: "Free online resume maker with PDF download",
    body: "Preview your resume live as you type, save multiple versions for different job applications, and export a high-quality PDF that usually stays under 1MB, small enough for the upload limits on Naukri, LinkedIn and company career portals."
  }
];

interface ResumeBuilderSeoProps {
  /**
   * Server-rendered guess at whether this block should show, derived from the
   * session cookie. Crawlers (no cookie) get the copy in the initial HTML.
   */
  initialShow?: boolean;
}

export function ResumeBuilderSeo({ initialShow = true }: ResumeBuilderSeoProps) {
  const { user, loading } = useUser();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const show = user ? false : loading ? initialShow : true;
  if (!show) return null;

  return (
    <div className="container max-w-6xl px-4 sm:px-6 pb-24 print:hidden">
      {/* Feature copy */}
      <section className="mt-24 border-t border-slate-200/50 dark:border-slate-800/80 pt-16 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            A free AI resume builder made for ATS screening
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Most applications are filtered by software before a recruiter opens them. JobsDart builds your
            resume around that reality: parse-safe formatting, the keywords your target job description asks
            for, and a PDF export that keeps its text layer intact.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {HIGHLIGHTS.map(item => (
            <div
              key={item.title}
              className="space-y-4 p-6 rounded-2xl bg-white/40 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800/60 hover:shadow-lg transition-all duration-300"
            >
              <div className="p-3 bg-indigo-50/60 dark:bg-slate-800 rounded-xl text-indigo-600 dark:text-indigo-400 w-fit">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 leading-snug">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works - backs the HowTo structured data */}
      <section className="mt-24 border-t border-slate-200/50 dark:border-slate-800/80 pt-16 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How to build an ATS-friendly resume in 4 steps
          </h2>
        </div>

        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 list-none">
          {RESUME_BUILDER_STEPS.map((step, idx) => (
            <li
              key={step.name}
              className="space-y-3 p-6 rounded-2xl bg-white/40 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800/60"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-sm">
                {idx + 1}
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 leading-snug">
                {step.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ - backs the FAQPage structured data */}
      <section className="mt-24 border-t border-slate-200/50 dark:border-slate-800/80 pt-16 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2.5">
            <HelpCircle className="w-7 h-7 text-indigo-500" />
            Resume Builder FAQs
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Templates, ATS formatting, PDF downloads and credits, answered
          </p>
        </div>

        <div className="grid gap-4 max-w-3xl mx-auto">
          {RESUME_BUILDER_FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? "bg-white dark:bg-slate-900/50 border-indigo-500/30 shadow-lg shadow-indigo-500/5"
                    : "bg-white/40 dark:bg-slate-900/10 border-slate-200/50 dark:border-slate-800/60 hover:border-slate-350 dark:hover:border-slate-750"
                }`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full text-left flex items-center justify-between gap-4 px-6 py-4 font-bold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <span className="text-sm sm:text-base leading-snug">{faq.q}</span>
                  <span
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 rotate-180"
                        : "bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" as Easing }}
                    >
                      <div className="px-6 pb-5 pt-1.5 text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
export default ResumeBuilderSeo;
