import { AtsChecker } from "@/components/ats-checker"
import { AtsFaq } from "@/components/ats-faq"
import { TrendingUp, AlertCircle, Sparkles, CheckCircle, FileText, ArrowRight, ShieldCheck } from "lucide-react"

export const metadata = {
  title: "Free AI ATS Resume Checker & Score Optimizer | JobsDart",
  description: "Scan your resume against any job description for free. Get an instant ATS compatibility score, identify missing keywords, and get AI-optimized bullet points to stand out to recruiters.",
  keywords: [
    "free ats checker",
    "ats resume checker",
    "resume score scanner",
    "ai resume analyzer",
    "job description match",
    "ats optimization",
    "resume keywords match",
    "cv score",
    "resume feedback",
    "jobsdart"
  ],
  alternates: {
    canonical: "https://www.jobsdart.in/ats-score",
  },
  openGraph: {
    title: "Free AI ATS Resume Checker & Score Scanner | JobsDart",
    description: "Optimize your resume for applicant tracking systems. Pasting a job description scans for missing keywords, gives a detailed score, and rewrites bullet points contextually.",
    url: "https://www.jobsdart.in/ats-score",
    siteName: "JobsDart",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI ATS Resume Checker & Score Scanner | JobsDart",
    description: "Scan your resume against any job description for free. Get an instant ATS compatibility score, identify missing keywords, and get AI-optimized bullet points.",
  }
}

export default function AtsScorePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "JD ATS Resume Checker & Analyzer",
    "url": "https://www.jobsdart.in/ats-score",
    "description": "Scan and optimize your resume against a job description with our free AI ATS compatibility score checker.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "INR"
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is an ATS score?",
        "acceptedAnswer": { "@type": "Answer", "text": "An ATS (Applicant Tracking System) score indicates how well your resume matches a job description. Most companies use ATS software to filter applications before a human reviews them. A score above 70% significantly increases your chances of passing the initial screen." }
      },
      {
        "@type": "Question", 
        "name": "Is this ATS checker really free?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes, your first ATS analysis on JobsDart is completely free. Subsequent analyses cost 1 credit each." }
      },
      {
        "@type": "Question",
        "name": "What file formats does the resume checker support?",
        "acceptedAnswer": { "@type": "Answer", "text": "Currently supports PDF files up to 2MB. ATS systems work best with text-based PDFs, not scanned images." }
      }
    ]
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50/50 dark:bg-[#090d16] pb-24">
      {/* Background Decorative Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-purple-500/5 to-pink-500/5 blur-[100px] pointer-events-none" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="container max-w-6xl pt-16 px-4 sm:px-6 relative z-10">
        {/* Header Hero Section */}
        <div className="mb-14 text-center space-y-5">
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent pb-1">
            Optimize Your Resume
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Scan your resume against standard ATS parsers and target job requirements. Get immediate scoring, keyword analysis, and professional bullet re-writes.
          </p>
        </div>

        {/* Core ATS Application panel */}
        <AtsChecker />

        {/* Static, crawlable results preview below the fold */}
        <div className="mt-28 border-t border-slate-200/50 dark:border-slate-800/80 pt-20 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Sample Report: What a Score of 82 Looks Like
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Review our diagnostic interface formatting, showing how we flag weak resume sections and recommend action-driven bullet enhancements.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 bg-white/60 dark:bg-slate-900/20 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl max-w-5xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            {/* Mock Score Indicator Card */}
            <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="relative w-24 h-24 rounded-full border-[8px] border-emerald-500 flex items-center justify-center bg-white dark:bg-slate-900 shadow-md shrink-0">
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">82</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-slate-850 dark:text-slate-100">Overall Match: Strong</h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">Your resume matches the core keyword checks for this domain.</p>
                  </div>
                </div>

                {/* Estimate Improvement Callout */}
                <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl flex gap-2.5 items-start">
                  <TrendingUp className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-indigo-900 dark:text-indigo-300 font-bold leading-relaxed">
                    Estimated Improvement: Implementing the bullet suggestions could raise your score to <strong className="text-indigo-600 dark:text-indigo-400">95/100</strong>.
                  </span>
                </div>

                {/* Section Scores list */}
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Section Breakdown</div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { label: "Summary / Profile", val: 85, badge: null },
                      { label: "Work Experience", val: 74, badge: "Weakest" },
                      { label: "Skills Inventory", val: 90, badge: null },
                      { label: "Education History", val: 88, badge: null },
                    ].map((s) => (
                      <div key={s.label} className={`space-y-2 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/30 ${
                        s.badge ? 'ring-1 ring-rose-200 border-rose-200' : ''
                      }`}>
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            {s.label}
                            {s.badge && <span className="text-[9px] px-1.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-600 font-extrabold uppercase rounded">{s.badge}</span>}
                          </span>
                          <span className={s.badge ? "text-rose-600 font-extrabold" : "text-emerald-600 font-extrabold"}>{s.val}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${s.badge ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${s.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-rose-50/30 border border-rose-100/50 text-rose-800 dark:border-rose-950/20 dark:bg-rose-950/5 text-xs rounded-xl flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong className="font-bold text-slate-800 dark:text-slate-300">Experience Alert:</strong> Your bullet points lack quantified impact. Using numbers like revenue growth or time saved can boost match scores by 15%.
                </span>
              </div>
            </div>

            {/* Bullet Rewrite Card */}
            <div className="lg:col-span-6 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-200/50 dark:border-slate-800/80 pt-6 lg:pt-0 lg:pl-8">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Example Bullet Optimizations</h4>
              
              <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Original Bullet Point
                  </span>
                  <p className="text-xs text-slate-500 italic bg-rose-50/10 border border-rose-100/30 rounded-xl p-3">
                    "Responsible for building features and writing database queries."
                  </p>
                </div>
                <div className="flex justify-center text-slate-300">
                  <ArrowRight className="w-4 h-4 transform rotate-90 lg:rotate-0" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    AI-Optimized Bullet Point
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium bg-emerald-50/10 border border-emerald-100/30 rounded-xl p-3">
                    "Designed and shipped 4 key product features, reducing API database retrieval latency by 28% using custom indexes."
                  </p>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <strong>Why it works:</strong> Replacing generic duties with action verbs ("designed", "shipped") and specific metrics (4 features, 28% latency reduction) improves keyword weight for modern ATS.
                </div>
              </div>
            </div>
          </div>

          {/* Long-tail Keywords copy sections */}
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 pt-12 border-t border-slate-200/50 dark:border-slate-800/80">
            
            <div className="space-y-4 p-5 rounded-2xl bg-white/40 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800/60 hover:shadow-lg transition-all duration-300">
              <div className="p-3 bg-blue-50/60 dark:bg-slate-800 rounded-xl text-blue-600 dark:text-blue-400 w-fit">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-850 dark:text-slate-100 leading-snug">
                ATS Checker for Freshers
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Entering the job market as a fresh graduate in India poses intense competition. JobsDart's advanced AI analyzer scans fresher resumes for core technical keywords, internship formatting, and project impact metrics to ensure your entry-level application bypasses initial filters and gets directly in front of hiring managers.
              </p>
            </div>

            <div className="space-y-4 p-5 rounded-2xl bg-white/40 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800/60 hover:shadow-lg transition-all duration-300">
              <div className="p-3 bg-indigo-50/60 dark:bg-slate-800 rounded-xl text-indigo-600 dark:text-indigo-400 w-fit">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-850 dark:text-slate-100 leading-snug">
                ATS Resume Score for Naukri / LinkedIn
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Recruiters on platforms like Naukri and LinkedIn use semantic search engines that penalize poorly structured resumes. JobsDart ensures your formatting, sections, and keyword density are fully compliant with corporate ATS protocols, maximizing your search visibility and click-through rates.
              </p>
            </div>

            <div className="space-y-4 p-5 rounded-2xl bg-white/40 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800/60 hover:shadow-lg transition-all duration-300">
              <div className="p-3 bg-purple-50/60 dark:bg-slate-800 rounded-xl text-purple-600 dark:text-purple-400 w-fit">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-850 dark:text-slate-100 leading-snug">
                Resume Checker for IT Jobs Bangalore
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                For competitive software and engineering roles in Bangalore's tech hubs, automated screening is standard. JobsDart lets you check your resume against modern tech-stack matrices (React, Node, PostgreSQL) and cloud delivery patterns (Docker, AWS) to ensure your skills align with Bangalore-first IT requirements.
              </p>
            </div>

          </div>
        </div>

        <AtsFaq />
      </div>
    </div>
  )
}
