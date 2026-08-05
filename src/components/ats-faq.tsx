"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence, type Easing } from "framer-motion";

export function AtsFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is an ATS score?",
      a: "An ATS (Applicant Tracking System) score indicates how well your resume matches a job description. Most companies use ATS software to filter applications before a human reviews them. A score above 70% significantly increases your chances of passing the initial screen."
    },
    {
      q: "Is this ATS checker really free?",
      a: "Yes, your first ATS analysis on JobsDart is completely free. Subsequent analyses cost 1 credit each."
    },
    {
      q: "What file formats does the resume checker support?",
      a: "Currently supports PDF files up to 2MB. ATS systems work best with text-based PDFs, not scanned images."
    }
  ];

  return (
    <div className="mt-24 border-t border-slate-200/50 dark:border-slate-800/80 pt-16 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2.5">
          <HelpCircle className="w-7 h-7 text-indigo-500 animate-pulse" />
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Everything you need to know about ATS checks, file formats, and credits
        </p>
      </div>

      <div className="grid gap-4 max-w-3xl mx-auto">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div 
              key={idx} 
              className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                isOpen 
                  ? "bg-white dark:bg-slate-900/50 border-indigo-500/30 shadow-lg shadow-indigo-500/5" 
                  : "bg-white/40 dark:bg-slate-900/10 border-slate-200/50 dark:border-slate-800/60 hover:border-slate-350 dark:hover:border-slate-750"
              }`}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full text-left flex items-center justify-between gap-4 px-6 py-4.5 font-bold text-slate-800 dark:text-slate-200 transition-colors"
              >
                <span className="text-sm sm:text-base leading-snug">{faq.q}</span>
                <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isOpen 
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 rotate-180" 
                    : "bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400"
                }`}>
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
                    <div className="px-6 pb-5 pt-1.5 text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed border-t border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/10">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
