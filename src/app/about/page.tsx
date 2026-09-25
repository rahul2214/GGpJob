import Link from "next/link";
import {
  Building,
  Globe,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Mail,
  FileText,
  Briefcase,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | JobsDart - A Sub-Product of Veltria",
  description:
    "Learn about JobsDart, an AI-powered career growth and recruitment platform developed as a dedicated sub-product of Veltria.",
};

export default function AboutPage() {
  const features = [
    {
      icon: Sparkles,
      title: "ATS Resume Scorer",
      desc: "Instant AI auditing for keyword density, formatting compliance, and industry standard readability to help candidates pass Applicant Tracking Systems.",
    },
    {
      icon: FileText,
      title: "Interactive CV Templates",
      desc: "Full-fidelity, production-grade resume templates pre-loaded with realistic content across multiple modern engineering and business disciplines.",
    },
    {
      icon: Briefcase,
      title: "Verified Job Discovery",
      desc: "Curated opportunities across top tech companies, verified employer openings, and high-growth global teams with zero spam listings.",
    },
    {
      icon: ShieldCheck,
      title: "Recruiter Hiring Suite",
      desc: "Streamlined candidate pipeline management, instant job publishing, and talent matchmaking tools built for modern hiring teams.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Banner */}
      <div className="bg-slate-950 text-white border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Building className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1.5">
                A Sub-Product of Veltria
              </div>
              <h1 className="text-3xl font-extrabold text-white">About JobsDart</h1>
            </div>
          </div>
          <p className="text-slate-400 mt-2 leading-relaxed max-w-2xl text-base">
            JobsDart is an AI-powered career growth and recruitment platform developed as a dedicated sub-product of{" "}
            <strong className="text-white font-semibold">Veltria</strong>. Built to streamline modern hiring, JobsDart
            connects ambitious job seekers with top recruiters through advanced ATS resume intelligence and seamless matchmaking.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* Parent Company Spotlight */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 shadow-sm p-6 sm:p-8 bg-gradient-to-r from-indigo-50/70 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <Building className="w-4 h-4" />
                <span>Parent Company</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Veltria
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                JobsDart is proud to operate as a specialized sub-product under Veltria, focused on empowering career
                paths, optimizing resumes for global ATS standards, and delivering high-efficiency recruitment workflows.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="https://veltria.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm group"
              >
                <Globe className="w-4 h-4" />
                <span>Visit veltria.in</span>
                <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="https://www.linkedin.com/company/veltria"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
              >
                <span>LinkedIn</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Platform Capabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {feat.title}
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Values / Mission */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Our Mission
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            At JobsDart, we believe finding the right job or candidate should be straightforward, transparent, and fair.
            By combining modern AI tools like ATS scoring, smart templates, and direct recruiter connections,
            we help eliminate hiring bottlenecks for candidates and employers alike.
          </p>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Zero Placement Fees</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>ATS Compliant Resumes</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Direct Recruiter Connections</span>
            </div>
          </div>
        </div>

        {/* Quick Links Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Related Links & Support
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/contact"
              className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Contact Us</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Support & inquiries</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </Link>

            <Link
              href="/privacy"
              className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Privacy Policy</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Data protection</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </Link>

            <Link
              href="/terms"
              className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Terms of Service</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Platform guidelines</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
