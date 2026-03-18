"use client"

import { useUser } from "@/contexts/user-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile-form";
import { ChangePasswordForm } from "@/components/change-password-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileSections } from "@/components/profile-sections";
import { ResumeForm } from "@/components/resume-form";
import { SummaryForm } from "@/components/summary-form";
import { PersonalDetailsForm } from "@/components/personal-details-form";
import { DiversityInclusionForm } from "@/components/diversity-inclusion-form";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { UserCog, ShieldCheck, FileText, Briefcase, Link2, Users, HeartHandshake, Mail, Phone, LayoutDashboard } from "lucide-react";

export default function ProfilePage() {
    const { user, loading } = useUser();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'overview' | 'professional' | 'details' | 'security'>('overview');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const fadeUp = {
        hidden: { opacity: 0, y: 15 },
        visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
    };

    const tabContentVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, x: 10, transition: { duration: 0.2 } }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 md:p-8">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
                    <Skeleton className="w-full md:w-80 h-96 rounded-3xl shrink-0" />
                    <div className="flex-1 space-y-6">
                        <div className="flex gap-2 mb-6">
                            {[1,2,3,4].map(i => <Skeleton key={i} className="h-12 w-28 rounded-full" />)}
                        </div>
                        <Skeleton className="h-64 w-full rounded-2xl" />
                        <Skeleton className="h-64 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'professional', label: 'Professional', icon: Briefcase },
        { id: 'details', label: 'Personal Info', icon: Users },
        { id: 'security', label: 'Security', icon: ShieldCheck },
    ] as const;

    // Filter tabs based on role. Recruiters only need Overview and Security.
    const availableTabs = user.role === 'Job Seeker' ? tabs : tabs.filter(t => t.id === 'overview' || t.id === 'security');

    return (
        <div className="min-h-screen bg-slate-50/50 relative overflow-hidden">
            {/* Background Decorative Blobs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/2 pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
                    
                    {/* LEFT SIDEBAR: Sticky Profile Card */}
                    <div className="lg:w-[340px] shrink-0">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ duration: 0.5 }}
                            className="sticky top-24"
                        >
                            {/* Premium User Card */}
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden relative group p-6">
                                {/* Horizontal Avatar & Info */}
                                <div className="flex flex-row items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl p-0.5 shadow-md shrink-0 border border-slate-100">
                                        <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
                                            <span className="text-2xl font-black text-white">
                                                {initials}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-xl font-bold text-slate-800 leading-tight mb-1 truncate">{user.name}</h2>
                                        <BadgeRole role={user.role} />
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-2.5 text-sm text-slate-500">
                                    <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                            <Mail className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <span className="truncate flex-1 font-medium">{user.email}</span>
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                                                <Phone className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <span className="font-medium">{user.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Navigation Tabs (Desktop) */}
                            <div className="hidden lg:flex flex-col gap-2 mt-6">
                                {availableTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-left font-semibold transition-all duration-200 ${
                                            activeTab === tab.id 
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                                            : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100 hover:border-slate-200"
                                        }`}
                                    >
                                        <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-white" : "text-slate-400"}`} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT MAIN CONTENT */}
                    <div className="flex-1 min-w-0">
                        {/* Mobile Tabs Spinner (Horizontal Scroll) */}
                        <div className="lg:hidden flex overflow-x-auto gap-2 pb-4 mb-2 -mx-4 px-4 scrollbar-hide">
                            {availableTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                                        activeTab === tab.id 
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                                        : "bg-white text-slate-500 border border-slate-200"
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Animated Tab Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                variants={tabContentVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                {activeTab === 'overview' && (
                                    <ConfigCard index={1} title="Basic Information" subtitle="Manage your primary identity details." icon={UserCog} color="indigo">
                                        <ProfileForm user={user} />
                                    </ConfigCard>
                                )}

                                {activeTab === 'professional' && user.role === 'Job Seeker' && (
                                    <>
                                        <ConfigCard index={1} title="Professional Summary" subtitle="Highlight your career path and key achievements." icon={FileText} color="blue">
                                            <SummaryForm user={user} />
                                        </ConfigCard>
                                        <ConfigCard index={2} title="My Resume" subtitle="Upload or link your resume for recruiters." icon={Link2} color="sky">
                                            <ResumeForm user={user} />
                                        </ConfigCard>
                                        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
                                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
                                                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                                    <Briefcase className="w-6 h-6 text-fuchsia-500" />
                                                    Experience & Education
                                                </h3>
                                                <ProfileSections userId={user.id} isEditable={true} />
                                            </div>
                                        </motion.div>
                                    </>
                                )}

                                {activeTab === 'details' && user.role === 'Job Seeker' && (
                                    <>
                                        <ConfigCard index={1} title="Personal Details" subtitle="Additional background information." icon={Users} color="emerald">
                                            <PersonalDetailsForm user={user} />
                                        </ConfigCard>
                                        <ConfigCard index={2} title="Diversity and Inclusion" subtitle="Help us build an inclusive workplace." icon={HeartHandshake} color="rose">
                                            <DiversityInclusionForm user={user} />
                                        </ConfigCard>
                                    </>
                                )}

                                {activeTab === 'security' && (
                                    <ConfigCard index={1} title="Account Security" subtitle="Update your password to keep your account safe." icon={ShieldCheck} color="slate">
                                        <ChangePasswordForm />
                                    </ConfigCard>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Helper components
function BadgeRole({ role }: { role: string }) {
    if (role === 'Job Seeker') return <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">Job Seeker</span>;
    if (role === 'Recruiter') return <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">Recruiter</span>;
    return <span className="inline-block bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">{role}</span>;
}

const colorMaps: Record<string, string> = {
    indigo: "bg-indigo-100 text-indigo-600",
    blue: "bg-blue-100 text-blue-600",
    sky: "bg-sky-100 text-sky-600",
    emerald: "bg-emerald-100 text-emerald-600",
    rose: "bg-rose-100 text-rose-600",
    slate: "bg-slate-100 text-slate-600",
};

function ConfigCard({ children, index, title, subtitle, icon: Icon, color }: { children: React.ReactNode, index: number, title: string, subtitle: string, icon: any, color: string }) {
    const fadeUp = {
        hidden: { opacity: 0, y: 15 },
        visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
    };

    const cMap = colorMaps[color] || colorMaps.slate;

    return (
        <motion.div custom={index} initial="hidden" animate="visible" variants={fadeUp} className="w-full">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative">
                <div className="p-6 lg:p-8">
                    <div className="flex items-start gap-4 mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${cMap}`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
                            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
                        </div>
                    </div>
                    <div>
                        {children}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
