"use client";

import { useState } from 'react';
import { motion, AnimatePresence, type Easing } from 'framer-motion';
import { 
    Users, Trophy, FileSignature, Building2, HelpCircle, 
    UserCheck, ShieldCheck, Unlock, MessageSquare, Award
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as Easing } }
};

const PIPELINE_STEPS = [
  {
    id: 1,
    title: "Applied",
    desc: "Candidate submits profile",
    detail: "Jobseeker discovers a referral listing and submits their application details. The employee is immediately notified.",
    icon: FileSignature,
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    glowColor: "shadow-blue-200/50"
  },
  {
    id: 2,
    title: "Accepted",
    desc: "Employee pre-screens CV",
    detail: "The referring employee reviews the candidate's skills and profile. If they find it suitable for internal referral, they click 'Accept'.",
    icon: UserCheck,
    color: "from-indigo-500 to-violet-500",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    glowColor: "shadow-indigo-200/50"
  },
  {
    id: 3,
    title: "Unlocked",
    desc: "Jobseeker unlocks referral",
    detail: "The jobseeker spends 2 Credits (Subscription Credits are consumed first, then Purchased). Contact details and referral link unlock.",
    icon: Unlock,
    color: "from-purple-500 to-fuchsia-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    glowColor: "shadow-purple-200/50"
  },
  {
    id: 4,
    title: "Referred",
    desc: "Employee submits proof",
    detail: "Employee uploads screenshot proof of internal submission. Admin validates proof authenticity. Application becomes 'Verified Referral'.",
    icon: ShieldCheck,
    color: "from-fuchsia-500 to-pink-500",
    bgColor: "bg-pink-50",
    textColor: "text-pink-600",
    glowColor: "shadow-pink-200/50"
  },
  {
    id: 5,
    title: "Interviewing",
    desc: "Candidate confirms contact",
    detail: "Jobseeker confirms if they received recruiter response. Employee is rewarded +30 XP and +5 Trust Score. Interview status active.",
    icon: Users,
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-rose-50",
    textColor: "text-rose-600",
    glowColor: "shadow-rose-200/50"
  },
  {
    id: 6,
    title: "Offer",
    desc: "Offer letter verification",
    detail: "Jobseeker receives the offer and uploads proof. Employee reviews it. Both parties receive significant milestone reputation boosts.",
    icon: Award,
    color: "from-rose-500 to-amber-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    glowColor: "shadow-amber-200/50"
  },
  {
    id: 7,
    title: "Joined",
    desc: "Joining proof uploaded",
    detail: "Candidate uploads joining proof (ID card/Appointment letter). Employee verifies. Gamification rewards trigger highest milestone level.",
    icon: Building2,
    color: "from-amber-500 to-emerald-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    glowColor: "shadow-emerald-200/50"
  },
  {
    id: 8,
    title: "Completed",
    desc: "Platform payout released",
    detail: "Final verification clears. Referrer unlocks cash payout from wallet. Jobseeker has successfully bypassed ATS filters.",
    icon: Trophy,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-teal-50",
    textColor: "text-teal-600",
    glowColor: "shadow-teal-200/50"
  }
];

export function PipelineSimulator() {
    const [activeStep, setActiveStep] = useState<number>(3);

    return (
        <section id="simulator" aria-label="Interactive Pipeline Simulator" className="py-24 bg-slate-900 text-white relative border-y border-slate-800">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.02]" />
            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <motion.div 
                    initial="hidden" 
                    whileInView="visible" 
                    viewport={{ once: true }} 
                    variants={fadeInUp} 
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 mb-6 tracking-tight">Interactive Pipeline Simulator</h2>
                    <p className="text-base sm:text-lg text-slate-400">Click through the 8 stages of the JobsDart referral flow to see how we coordinate safety, validation proofs, and payouts.</p>
                </motion.div>

                <div className="grid lg:grid-cols-12 gap-10 items-stretch">
                    
                    {/* Left column: Steps vertical flow */}
                    <div className="lg:col-span-7 space-y-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Referral Milestones</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
                            {PIPELINE_STEPS.map((step) => {
                                const IconComponent = step.icon;
                                const isActive = activeStep === step.id;
                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => setActiveStep(step.id)}
                                        className={`p-4 rounded-2xl text-left border transition-all duration-300 flex items-center gap-3.5 relative group ${
                                            isActive 
                                                ? 'bg-gradient-to-r from-indigo-950 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10' 
                                                : 'bg-slate-950/60 border-white/5 hover:border-white/10 hover:bg-slate-900/50'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center transition-all duration-300 ${
                                            isActive 
                                                ? `bg-gradient-to-br ${step.color} text-white shadow-md ${step.glowColor}` 
                                                : 'bg-white/5 text-slate-400 group-hover:text-slate-200'
                                        }`}>
                                            <IconComponent className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-bold text-slate-500">0{step.id}</span>
                                                <h4 className="font-bold text-sm sm:text-base leading-none text-white">{step.title}</h4>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{step.desc}</p>
                                        </div>
                                        {isActive && (
                                            <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right column: Details panel */}
                    <div className="lg:col-span-5 flex items-stretch">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.3 }}
                                className="w-full bg-gradient-to-b from-slate-950 to-slate-900 rounded-[2rem] p-8 border border-white/10 flex flex-col justify-between shadow-2xl relative overflow-hidden"
                            >
                                {/* background glow */}
                                <div className={`absolute top-0 right-0 w-48 h-48 rounded-full bg-gradient-to-br ${PIPELINE_STEPS[activeStep - 1].color} opacity-[0.06] blur-2xl`} />

                                <div>
                                    <div className="flex items-center justify-between mb-8">
                                        <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                                            Stage {activeStep} of 8
                                        </span>
                                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest text-right">In-App Chat Active</span>
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${PIPELINE_STEPS[activeStep - 1].color} flex items-center justify-center text-white shadow-lg`}>
                                            {(() => {
                                                const StepIcon = PIPELINE_STEPS[activeStep - 1].icon;
                                                return <StepIcon className="w-7 h-7" />;
                                            })()}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-extrabold text-white leading-tight">{PIPELINE_STEPS[activeStep - 1].title}</h3>
                                            <p className="text-xs font-semibold text-slate-400 mt-0.5">{PIPELINE_STEPS[activeStep - 1].desc}</p>
                                        </div>
                                    </div>

                                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed pt-2">
                                        {PIPELINE_STEPS[activeStep - 1].detail}
                                    </p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5">
                                    <div className="bg-white/5 rounded-2xl p-4 flex gap-3 items-center">
                                        <MessageSquare className="w-5 h-5 text-indigo-400 shrink-0" />
                                        <p className="text-xs text-slate-400 leading-normal">
                                            {activeStep === 3 
                                                ? "Safe refund lock active. The in-app chat opens fully between jobseeker and employee once unlocked."
                                                : "Discuss edits to your resume, mock interview feedback, or details directly in the built-in applicant chat."
                                            }
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}
