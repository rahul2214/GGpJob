"use client"

import { useUser } from "@/contexts/user-context";
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
import { UserCog, ShieldCheck, FileText, Briefcase, Link2, Users, Mail, Phone, LayoutDashboard, Trash2, Wallet, Award, Sparkles, Zap, Camera, Loader2, ChevronRight, Globe } from "lucide-react";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CurrencySelector } from "@/components/currency-selector";

import { useIsMobile } from "@/hooks/use-mobile";

export default function ProfilePage() {
    const { user, loading, refreshUser } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState<'overview' | 'professional' | 'details' | 'security' | 'edit-details'>('overview');
    const [isUploading, setIsUploading] = useState(false);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        const maxFileSize = 2 * 1024 * 1024;
        if (file.size > maxFileSize) {
            toast({
                title: "Upload Failed",
                description: "File size exceeds 2MB limit. Please upload a smaller image.",
                variant: "destructive"
            });
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast({
                title: "Invalid File Type",
                description: "Only image files are allowed.",
                variant: "destructive"
            });
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`/api/users/${user.uuid}/profile-photo/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to upload photo");
            }

            await refreshUser();
            toast({
                title: "Profile Photo Updated",
                description: "Your profile photo has been successfully updated.",
            });
        } catch (error: any) {
            console.error("Upload error:", error);
            toast({
                title: "Upload Error",
                description: error.message || "An error occurred during photo upload.",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

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
        hidden: { opacity: 0, x: 20, scale: 0.98 },
        visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.35 } },
        exit: { opacity: 0, x: -20, scale: 0.98, transition: { duration: 0.2 } }
    };

    if (loading && !user) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
                    <Skeleton className="w-full md:w-80 h-[500px] rounded-3xl shrink-0" />
                    <div className="flex-1 space-y-6">
                        <Skeleton className="h-64 w-full rounded-3xl" />
                        <Skeleton className="h-64 w-full rounded-3xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, desc: 'Basic Information & Details' },
        { id: 'professional', label: 'Professional', icon: Briefcase, desc: 'Summary, Resume & Work Experience' },
        { id: 'details', label: 'Personal Info', icon: Users, desc: 'Background & Diversity Details' },
        { id: 'security', label: 'Security', icon: ShieldCheck, desc: 'Password & Account Management' },
    ] as const;

    const availableTabs = user.role === 'Job Seeker' ? tabs : tabs.filter(t => t.id === 'overview' || t.id === 'security');

    return (
        <div className="min-h-screen bg-slate-50/60 relative overflow-hidden pt-8 lg:pt-12 pb-0">
            {/* Ambient Animated Glows */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none translate-y-1/3" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* 2-Column Desktop Layout: Left Sidebar + Right Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN (Profile Card, Wallet/Reputation, Navigation Tabs) */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        {/* Profile Header Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] p-6 text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 opacity-90" />
                            
                            <div className="relative pt-6 flex flex-col items-center">
                                {/* Profile Photo Avatar */}
                                <div className="relative mb-4 group/avatar">
                                    <div className="w-24 h-24 bg-white rounded-3xl p-1 shadow-lg ring-4 ring-white relative overflow-hidden">
                                        {user.profilePhotoUrl ? (
                                            <img src={user.profilePhotoUrl} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center">
                                                <span className="text-3xl font-black text-white">
                                                    {initials}
                                                </span>
                                            </div>
                                        )}
                                        {/* Upload Overlay */}
                                        {user.role === 'Job Seeker' && (
                                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer rounded-2xl text-white">
                                                {isUploading ? (
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Camera className="w-5 h-5 mb-0.5" />
                                                        <span className="text-[10px] font-bold">Edit</span>
                                                    </>
                                                )}
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    onChange={handlePhotoUpload} 
                                                    disabled={isUploading} 
                                                    className="hidden" 
                                                />
                                            </label>
                                        )}
                                    </div>
                                    {user.role === 'Job Seeker' && (
                                        <div className="absolute -bottom-1 -right-1 bg-white border border-slate-200 shadow-md rounded-full p-1.5 text-indigo-600 pointer-events-none z-10 flex items-center justify-center">
                                            {isUploading ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Camera className="w-3.5 h-3.5" />
                                            )}
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h2>
                                <div className="space-y-1 text-xs font-medium w-full border-slate-100 mt-1">
                                    <div className="flex items-center justify-center gap-1.5 text-slate-600">
                                        <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center justify-center gap-1.5 text-slate-600 pt-0.5">
                                            <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                            <span>{user.phone}</span>
                                        </div>
                                    )}
                                    {user.country && (
                                        <div className="flex items-center justify-center gap-1.5 text-slate-600 pt-0.5">
                                            <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                            <span className="font-bold text-slate-700">{user.country}</span>
                                        </div>
                                    )}
                                    {(user.workplaceType || (user as any).workplaceTypeId) && (
                                        <div className="flex items-center justify-center gap-1.5 text-slate-600 pt-0.5">
                                            <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                            <span className="font-bold text-slate-700">{user.workplaceType}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Wallet & Reputation Cards */}
                        {user.role === 'Job Seeker' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                className="space-y-4"
                            >
                                {/* Wallet Card */}
                                <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Wallet className="w-3.5 h-3.5 text-indigo-500" />
                                        My Wallet
                                    </h3>
                                    {user.role === 'Job Seeker' ? (
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Available Credits</p>
                                                    <p className="text-xl font-black text-slate-900 tracking-tight">{(user.subscriptionCredits || 0) + (user.purchasedCredits || 0)}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                                <div className="bg-slate-50/80 rounded-xl p-2 text-center border border-slate-100">
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase leading-none mb-1">Subscription</p>
                                                    <p className="text-sm font-black text-indigo-600">{user.subscriptionCredits || 0}</p>
                                                </div>
                                                <div className="bg-slate-50/80 rounded-xl p-2 text-center border border-slate-100">
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase leading-none mb-1">Purchased</p>
                                                    <p className="text-sm font-black text-emerald-600">{user.purchasedCredits || 0}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => router.push('/jobseeker/credits')}
                                                className="w-full mt-1 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200 transition-all duration-200"
                                            >
                                                <Zap className="w-3.5 h-3.5" />
                                                Buy Credits
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                                                    <Award className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Available Credits</p>
                                                    <p className="text-xl font-black text-slate-900 tracking-tight">{(user as any).credits?.toLocaleString() || 0} Credits</p>
                                                </div>
                                            </div>
                                            {(user as any).totalRewards > 0 && (
                                                <div className="pt-2 border-t border-slate-100">
                                                    <div className="flex justify-between items-center text-[10px]">
                                                        <span className="font-bold text-slate-400 uppercase">Total Rewards</span>
                                                        <span className="font-black text-emerald-600">{(user as any).totalRewards.toLocaleString()} Credits</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>


                            </motion.div>
                        )}

                        {/* Navigation Tabs (Vertical Sidebar) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-2.5 space-y-1.5"
                        >
                            {availableTabs.map((tab) => {
                                const isActive = activeTab === tab.id || (activeTab === 'edit-details' && tab.id === 'details');
                                const handleTabClick = () => {
                                    if (isMobile) {
                                        if (tab.id === 'overview') {
                                            router.push('/profile/basic-info/edit');
                                            return;
                                        }
                                        if (tab.id === 'professional') {
                                            router.push('/profile/professional');
                                            return;
                                        }
                                        if (tab.id === 'details') {
                                            router.push('/profile/personal-details/edit');
                                            return;
                                        }
                                        if (tab.id === 'security') {
                                            router.push('/profile/security/edit');
                                            return;
                                        }
                                    }
                                    setActiveTab(tab.id as any);
                                };

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={handleTabClick}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all duration-200 group relative",
                                            isActive
                                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 font-bold"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                                                isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                                            )}>
                                                <tab.icon className="w-4.5 h-4.5" />
                                            </div>
                                            <div>
                                                <p className={cn("text-xs uppercase tracking-wider font-black", isActive ? "text-white" : "text-slate-800")}>
                                                    {tab.label}
                                                </p>
                                                <p className={cn("text-[10px] mt-0.5 line-clamp-1 font-medium", isActive ? "text-indigo-100" : "text-slate-400")}>
                                                    {tab.desc}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className={cn("w-4 h-4 transition-transform", isActive ? "text-white translate-x-0.5" : "text-slate-300 group-hover:text-slate-500")} />
                                    </button>
                                );
                            })}
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN (Data Panels & Active Tab Content - Desktop Only) */}
                    <div className="hidden lg:block lg:col-span-8 w-full">
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
                                    <div className="space-y-6">
                                        <ConfigCard index={1} title="Basic Information" subtitle="Manage your primary identity details." icon={UserCog} color="indigo">
                                            <ProfileForm user={user} />
                                        </ConfigCard>
                                    </div>
                                )}

                                {activeTab === 'professional' && user.role === 'Job Seeker' && (
                                    <>
                                        <ConfigCard index={1} title="Professional Summary" subtitle="Highlight your career path and key achievements." icon={FileText} color="blue">
                                            <SummaryForm user={user} />
                                        </ConfigCard>
                                        <ConfigCard index={2} title="My Resume" subtitle="Upload or link your resume for recruiters." icon={Link2} color="sky">
                                            <ResumeForm user={user} />
                                        </ConfigCard>
                                        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
                                            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-6 lg:p-8">
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
                                                onClick={() => {
                                                    if (isMobile) {
                                                        router.push('/profile/personal-details/edit');
                                                    } else {
                                                        setActiveTab('edit-details');
                                                    }
                                                }}
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
                                        <ConfigCard index={0} title="System Preferences" subtitle="Customize your currency, language, and regional settings." icon={Globe} color="indigo">
                                            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                                <div className="space-y-0.5">
                                                    <p className="font-bold text-slate-800 text-sm">Preferred Currency</p>
                                                    <p className="text-xs text-slate-400">Select currency for pricing & transactions.</p>
                                                </div>
                                                <CurrencySelector />
                                            </div>
                                        </ConfigCard>

                                        <ConfigCard index={1} title="Account Security" subtitle="Update your password to keep your account safe." icon={ShieldCheck} color="slate">
                                            <ChangePasswordForm />
                                        </ConfigCard>

                                        <ConfigCard index={2} title="Danger Zone" subtitle="Deactivate your account with a 30-day grace period." icon={Trash2} color="rose">
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
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_15px_35px_rgba(99,102,241,0.03)] transition-all duration-300 overflow-hidden relative">
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
