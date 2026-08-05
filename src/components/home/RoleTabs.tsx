"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Shield, Users, ArrowRight, Zap, Target } from 'lucide-react';
import Link from 'next/link';

const tabs = [
  { id: "seeker", label: "For Job Seekers", icon: UserCheck, color: "text-violet-400 border-violet-500/20" },
  { id: "recruiter", label: "For Recruiters", icon: Shield, color: "text-emerald-400 border-emerald-500/20" }
];

const contentMap = {
  seeker: {
    badge: "Fast Track Your Career",
    title: "Apply directly to top corporate opportunities",
    desc: "Find open roles, optimize your resume with AI ATS tools, and connect directly with enterprise recruiters and hiring managers.",
    features: [
      "AI-powered ATS Resume scoring and keyword optimization",
      "Direct application tracking with real-time status updates",
      "Instant interview preparation and skill matching tools"
    ],
    cta: "Start Applying",
    href: "/signup",
    themeColor: "violet"
  },
  recruiter: {
    badge: "Premium Talent Pool",
    title: "Post direct jobs and source vetted candidates",
    desc: "Access a vetted database of high-quality active candidates. Post Direct jobs to get corporate submissions directly and manage candidates cleanly.",
    features: [
      "Direct API integrations to view candidate ATS match reports",
      "Filter candidates by locations, skills, and experience",
      "Access pre-screened talent pipelines with instant messaging"
    ],
    cta: "Hire Vetted Talent",
    href: "/signup?role=recruiter",
    themeColor: "emerald"
  }
};

export function RoleTabs() {
  const [activeTab, setActiveTab] = useState<"seeker" | "recruiter">("seeker");
  const content = contentMap[activeTab];

  return (
    <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-[hsl(220_65%_6%)] transition-colors duration-300">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
         
          <h2 className="section-heading mt-4 mb-6">
            Designed for the <span className="text-gradient-primary">Entire Ecosystem</span>
          </h2>
          <p className="section-subheading mx-auto">
            Whether you are hunting for a global role, referring talent, or recruiting at scale, JobsDart offers specialized workflows for everyone.
          </p>
        </div>

        {/* Tabs Switcher */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-slate-200/80 dark:bg-white/5 backdrop-blur-md border border-slate-300/80 dark:border-white/10 p-1.5 rounded-2xl gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isActive ? "text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-tab-pill"
                      className="absolute inset-0 bg-gradient-accent rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : tab.color.split(' ')[0]}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" as any }}
            className="bg-white dark:bg-white/5 rounded-[2.5rem] p-8 md:p-16 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl relative"
          >
            <div className="grid md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-7 flex flex-col space-y-6">
                <span className={`inline-flex items-center w-fit text-xs font-bold px-3 py-1.5 rounded-full ${
                  activeTab === 'seeker' ? 'badge-violet' : 'badge-emerald'
                }`}>
                  {content.badge}
                </span>
                
                <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {content.title}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
                  {content.desc}
                </p>

                <div className="space-y-3 pt-2">
                  {content.features.map((feat, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                        activeTab === 'seeker' ? 'bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/30' :
                        'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      }`}>
                        ✓
                      </div>
                      <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6">
                  <Link 
                    href={content.href} 
                    className={`inline-flex items-center gap-2 font-bold rounded-xl px-8 py-3.5 text-white transition-all duration-300 transform active:scale-95 ${
                      activeTab === 'seeker' ? 'bg-gradient-accent shadow-lg shadow-violet-500/25 hover:opacity-95' :
                      'bg-gradient-emerald shadow-lg shadow-emerald-500/25 hover:opacity-95'
                    }`}
                  >
                    {content.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="md:col-span-5 relative hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent rounded-[2rem] blur-xl pointer-events-none" />
                <div className="bg-slate-900 text-white border border-slate-800 dark:border-white/5 p-8 rounded-[2rem] relative flex flex-col justify-center items-center text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md ${
                    activeTab === 'seeker' ? 'bg-violet-500/10 border border-violet-500/20 text-violet-400' :
                    'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  }`}>
                    {activeTab === 'seeker' ? <Target className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
                  </div>
                  <h4 className="font-extrabold text-white text-lg mb-2">Verified System</h4>
                  <p className="text-slate-300 text-xs leading-relaxed max-w-[240px]">
                    Every {activeTab === 'seeker' ? 'seeker profile' : 'recruiter account'} is authenticated through our verification protocol.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
