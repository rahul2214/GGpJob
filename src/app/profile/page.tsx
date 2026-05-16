"use client"

import { useUser } from "@/contexts/user-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile-form";
import { Button } from "@/components/ui/button";
import { ChangePasswordForm } from "@/components/change-password-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ProfileSections } from "@/components/profile-sections";
import { ResumeForm } from "@/components/resume-form";
import { SummaryForm } from "@/components/summary-form";
import { PersonalInfoFormCombined } from "@/components/personal-info-form-combined";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { UserCog, ShieldCheck, FileText, Briefcase, Link2, Users, HeartHandshake, Mail, Phone, LayoutDashboard, Trash2, Wallet, Award, Sparkles, Zap, ShieldCheck as TrustIcon } from "lucide-react";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { TrustScoreBadge } from "@/components/trust-score-badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const { user, loading } = useUser();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'overview' | 'professional' | 'details' | 'security' | 'edit-details'>('overview');

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

    if (loading && !user) {
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

    if (!user) return null;

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

                                {/* Wallet / Credits Section */}
                                {(user.role === 'Job Seeker' || user.role === 'Employee') && (
                                    <div className="mt-8 pt-6 border-t border-slate-100">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Wallet className="w-3.5 h-3.5" />
                                            My Wallet
                                        </h3>
                                        
                                        {user.role === 'Job Seeker' ? (
                                            <div className="relative group/wallet">
                                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur opacity-20 group-hover/wallet:opacity-30 transition-opacity" />
                                                <div className="relative bg-white border border-slate-100 rounded-2xl p-4 flex flex-col gap-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                                                <Sparkles className="w-5 h-5 text-indigo-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-400">Available Credits</p>
                                                                <p className="text-xl font-black text-slate-800 tracking-tight">{(user.subscriptionCredits || 0) + (user.purchasedCredits || 0)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Breakdown for Job Seekers */}
                                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                                                        <div className="bg-slate-50 rounded-lg p-2 text-center">
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Subscription</p>
                                                            <p className="text-sm font-black text-indigo-600">{user.subscriptionCredits || 0}</p>
                                                        </div>
                                                        <div className="bg-slate-50 rounded-lg p-2 text-center">
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Purchased</p>
                                                            <p className="text-sm font-black text-emerald-600">{user.purchasedCredits || 0}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative group/rewards">
                                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-20 group-hover/rewards:opacity-30 transition-opacity" />
                                                <div className="relative bg-white border border-slate-100 rounded-2xl p-4 flex flex-col gap-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                                                <Award className="w-5 h-5 text-emerald-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-400">Available Balance</p>
                                                                <p className="text-xl font-black text-slate-800 tracking-tight">₹{user.rewardsBalance?.toLocaleString() || 0}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {(user as any).totalRewards > 0 && (
                                                        <div className="pt-2 border-t border-slate-50">
                                                            <div className="flex justify-between items-center text-[10px]">
                                                                <span className="font-bold text-slate-400 uppercase">Lifetime Earned</span>
                                                                <span className="font-black text-emerald-600">₹{(user as any).totalRewards.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Trust Reputation Section */}
                                        <div className="mt-6 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <TrustIcon className="w-3.5 h-3.5" />
                                                    Reputation
                                                </h3>
                                                <TrustScoreBadge score={user.trustScore || 100} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                    <span>Level Status</span>
                                                    <span className={(user.trustScore || 100) >= 90 ? "text-emerald-500" : "text-amber-500"}>
                                                        {(user.trustScore || 100) >= 90 ? "Excellent" : "Trusted"}
                                                    </span>
                                                </div>
                                                <Progress value={user.trustScore || 0} className="h-1.5 bg-slate-100" />
                                            </div>
                                        </div>

                                        {/* Job Plan Section */}
                                        {user.role === 'Job Seeker' && (
                                            <div className="mt-6 pt-6 border-t border-slate-100">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                        Job Plan
                                                    </h3>
                                                    <span className={cn(
                                                        "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                                                        user.planType === 'jobseeker_pro' ? "bg-indigo-100 text-indigo-700" :
                                                        user.planType === 'jobseeker_premium' ? "bg-sky-100 text-sky-700" :
                                                        "bg-slate-100 text-slate-600"
                                                    )}>
                                                        {user.planType === 'jobseeker_pro' ? "Pro Plan" :
                                                         user.planType === 'jobseeker_premium' ? "Premium" : "Free Plan"}
                                                    </span>
                                                </div>
                                                
                                                <Button 
                                                    onClick={() => router.push('/jobseeker/plans')}
                                                    className="w-full h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all active:scale-95"
                                                >
                                                    <Zap className="w-3 h-3 mr-1.5 opacity-70" />
                                                    Upgrade Plan
                                                </Button>
                                            </div>
                                        )}

                                        <p className="text-[10px] text-slate-400 mt-3 text-center leading-relaxed">
                                            {user.role === 'Job Seeker' 
                                                ? "Apply for referral jobs to use your credits." 
                                                : "Points are awarded when your referred candidate is hired."}
                                        </p>
                                    </div>
                                )}
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
                                                <ProfileSections userId={user.uuid} isEditable={true} />
                                            </div>
                                        </motion.div>
                                    </>
                                )}

                                {activeTab === 'details' && user.role === 'Job Seeker' && (
                                    <ConfigCard index={1} title="Personal & Diversity Information" subtitle="Manage your background and diversity details." icon={Users} color="emerald">
                                        <div className="lg:block hidden">
                                            {/* Desktop: Show full form */}
                                            <PersonalInfoFormCombined user={user} />
                                        </div>
                                        <div className="lg:hidden block space-y-6">
                                            {/* Mobile: Show Summary View with Edit Button */}
                                            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5 space-y-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-slate-400 mb-1">Gender</p>
                                                        <p className="font-bold text-slate-700">{user.gender || 'Not specified'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-400 mb-1">Marital Status</p>
                                                        <p className="font-bold text-slate-700">{user.maritalStatus || 'Not specified'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-400 mb-1">Date of Birth</p>
                                                        <p className="font-bold text-slate-700">{user.dateOfBirth ? format(new Date(user.dateOfBirth), 'PPP') : 'Not specified'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-400 mb-1">Category</p>
                                                        <p className="font-bold text-slate-700">{user.category || 'Not specified'}</p>
                                                    </div>
                                                </div>
                                                <div className="pt-4 border-t border-slate-200/60">
                                                    <p className="text-slate-400 mb-2 text-xs font-bold uppercase tracking-wider">Diversity & Inclusion</p>
                                                    <div className="grid grid-cols-1 gap-3 text-sm">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-slate-500">Disability Status</span>
                                                            <span className="font-bold text-slate-700">{user.disabilityStatus || 'No'}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-slate-500">Military Experience</span>
                                                            <span className="font-bold text-slate-700">{user.militaryExperience || 'No'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <Button 
                                                onClick={() => setActiveTab('edit-details')}
                                                className="w-full py-6 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 font-bold transition-all active:scale-95"
                                            >
                                                Edit Profile Details
                                            </Button>
                                        </div>
                                    </ConfigCard>
                                )}

                                {activeTab === 'edit-details' && user.role === 'Job Seeker' && (
                                    <ConfigCard index={1} title="Edit Personal Details" subtitle="Complete the form below to update your information." icon={UserCog} color="indigo">
                                        <div className="mb-6 lg:hidden">
                                            <Button 
                                                variant="ghost" 
                                                onClick={() => setActiveTab('details')}
                                                className="text-slate-500 font-bold pl-0 hover:bg-transparent"
                                            >
                                                ← Back to Personal Info
                                            </Button>
                                        </div>
                                        <PersonalInfoFormCombined 
                                            user={user} 
                                            onSuccess={() => setActiveTab('details')} 
                                        />
                                    </ConfigCard>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-6">
                                        <ConfigCard index={1} title="Account Security" subtitle="Update your password to keep your account safe." icon={ShieldCheck} color="slate">
                                            <ChangePasswordForm />
                                        </ConfigCard>

                                        <ConfigCard index={2} title="Danger Zone" subtitle="Permanently delete your account and all your data." icon={Trash2} color="rose">
                                            <DeleteAccountButton />
                                        </ConfigCard>
                                    </div>
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
