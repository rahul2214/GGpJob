"use client";

import { useMemo } from 'react';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Lightbulb, CheckCircle2, Plus, ArrowRight, Sparkles, Trophy, Crown, Check, MapPin, FileText, Briefcase, GraduationCap, Code2, Award, BookmarkCheck, Globe } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';

interface ProfileStrengthProps {
    user: User;
}

export function ProfileStrength({ user }: ProfileStrengthProps) {
    const router = useRouter();

    const { completion, missingSections } = useMemo(() => {
        let score = 0;
        const missing: string[] = [];

        // 1. Location Hierarchy (15%)
        const hasLocation = Boolean(
            (user.country || user.countryId) &&
            (user.state || user.stateId) &&
            (user.currentCity || user.cityId)
        );
        if (hasLocation) {
            score += 15;
        } else {
            missing.push('location hierarchy');
        }

        // 2. Resume Upload (15%)
        if (user.resumeUrl) {
            score += 15;
        } else {
            missing.push('resume');
        }

        // 3. Key Skills (15%)
        const hasSkills = Boolean(
            (user.skills && user.skills.length > 0) ||
            user.profileStats?.hasSkills
        );
        if (hasSkills) {
            score += 15;
        } else {
            missing.push('skills');
        }

        // 4. Work Experience (15%)
        const hasExperience = Boolean(
            (user.experience && user.experience.length > 0) ||
            user.profileStats?.hasEmployment
        );
        if (hasExperience) {
            score += 15;
        } else {
            missing.push('work experience');
        }

        // 5. Education Details (10%)
        const hasEducation = Boolean(
            (user.education && user.education.length > 0) ||
            user.profileStats?.hasEducation
        );
        if (hasEducation) {
            score += 10;
        } else {
            missing.push('education');
        }

        // 6. Projects Portfolio (10%)
        const hasProjects = Boolean(
            (user.projects && user.projects.length > 0) ||
            user.profileStats?.hasProjects
        );
        if (hasProjects) {
            score += 10;
        } else {
            missing.push('projects');
        }

        // 7. Headline & Summary (5%)
        if (user.headline || user.summary) {
            score += 5;
        } else {
            missing.push('headline & summary');
        }

        // 8. Job & Location Preferences (5%)
        const hasPreferences = Boolean(
            (user.preferredLocations && user.preferredLocations.length > 0) ||
            (user.jobseekerPreferredLocations && user.jobseekerPreferredLocations.length > 0) ||
            (user.preferredJobTitles && user.preferredJobTitles.length > 0)
        );
        if (hasPreferences) {
            score += 5;
        } else {
            missing.push('location & job preferences');
        }

        // 9. Certifications (5%)
        const hasCertifications = Boolean(
            (user.certifications && user.certifications.length > 0) ||
            user.profileStats?.hasCertifications
        );
        if (hasCertifications) {
            score += 5;
        } else {
            missing.push('certifications');
        }

        // 10. Achievements (5%)
        const hasAchievements = Boolean(
            (user.achievements && user.achievements.length > 0) ||
            user.profileStats?.hasAchievements
        );
        if (hasAchievements) {
            score += 5;
        } else {
            missing.push('achievements');
        }

        return {
            completion: Math.min(100, score),
            missingSections: missing
        };
    }, [user]);

    const getStrengthInfo = (percentage: number) => {
        if (percentage < 50) {
            return {
                text: "Beginner",
                description: "Complete your profile to stand out to verified employers & recruiters.",
                color: "bg-rose-50 text-rose-600 border-rose-200/60 dark:bg-rose-950/20 dark:text-rose-400",
                gradient: "from-rose-500 to-orange-500",
                shadow: "shadow-rose-500/10",
                bgGlow: "bg-rose-500/5",
                percentageColor: "text-rose-600",
            };
        }
        if (percentage < 80) {
            return {
                text: "Intermediate",
                description: "Great progress! Complete remaining boosters to double your referral odds.",
                color: "bg-amber-50 text-amber-600 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-400",
                gradient: "from-amber-500 to-indigo-500",
                shadow: "shadow-amber-500/10",
                bgGlow: "bg-amber-500/5",
                percentageColor: "text-amber-600",
            };
        }
        return {
            text: "Profile All-Star",
            description: "Elite profile strength. Max visibility for referrals & top hiring managers.",
            color: "bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-400",
            gradient: "from-indigo-600 via-purple-600 to-pink-500",
            shadow: "shadow-indigo-500/10",
            bgGlow: "bg-indigo-500/5",
            percentageColor: "text-indigo-600",
        };
    };

    const info = getStrengthInfo(completion);

    const sectionMeta: Record<string, { label: string; boost: number; icon: any }> = {
        'location hierarchy': { label: "Location Hierarchy (Country, State, City)", boost: 15, icon: MapPin },
        resume: { label: "Upload Resume / CV", boost: 15, icon: FileText },
        skills: { label: "Key Skills & Proficiencies", boost: 15, icon: Code2 },
        'work experience': { label: "Work Experience History", boost: 15, icon: Briefcase },
        education: { label: "Education & Degrees", boost: 10, icon: GraduationCap },
        projects: { label: "Projects & Portfolio", boost: 10, icon: Code2 },
        'headline & summary': { label: "Headline & About Summary", boost: 5, icon: FileText },
        'location & job preferences': { label: "Preferred Locations & Job Titles", boost: 5, icon: Globe },
        certifications: { label: "Certifications & Licenses", boost: 5, icon: Award },
        achievements: { label: "Achievements & Honors", boost: 5, icon: BookmarkCheck },
    };

    // Calculate circular progress parameters
    const radius = 32;
    const strokeWidth = 6;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (completion / 100) * circumference;

    return (
        <Card className="border border-slate-200/80 bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
            {/* Background glowing lights */}
            <div className={cn("absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl opacity-30 transition-all duration-500 pointer-events-none", info.bgGlow)} />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-slate-100/50 rounded-full blur-2xl pointer-events-none" />

            <CardContent className="p-6 relative z-10 space-y-6">
                
                {/* Header Section */}
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">Profile Strength</h3>
                            {completion >= 80 && (
                                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                            )}
                        </div>
                        <p className="text-xs text-slate-500 leading-normal max-w-[220px]">
                            {info.description}
                        </p>
                    </div>

                    {/* Circular gauge */}
                    <div className="relative flex items-center justify-center shrink-0">
                        <svg className="w-20 h-20 transform -rotate-90">
                            <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#4f46e5" />
                                    <stop offset="50%" stopColor="#7c3aed" />
                                    <stop offset="100%" stopColor="#db2777" />
                                </linearGradient>
                            </defs>
                            {/* Track Circle */}
                            <circle
                                cx="40"
                                cy="40"
                                r={radius}
                                className="stroke-slate-100 dark:stroke-slate-800"
                                strokeWidth={strokeWidth}
                                fill="transparent"
                            />
                            {/* Animated progress circle */}
                            <circle
                                cx="40"
                                cy="40"
                                r={radius}
                                stroke="url(#progressGradient)"
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                fill="transparent"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-lg font-black text-slate-800 tracking-tight leading-none">
                                {completion}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Checklist Action Items */}
                {completion < 100 ? (
                    <div className="space-y-3.5">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <Trophy className="w-3.5 h-3.5 text-indigo-500" />
                                Profile Boosters
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">Next milestones</span>
                        </div>

                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                            {missingSections.map((sect) => {
                                const meta = sectionMeta[sect] || { label: sect, boost: 5, icon: Plus };
                                const IconComponent = meta.icon || Plus;

                                return (
                                    <button
                                        key={sect}
                                        onClick={() => router.push('/profile')}
                                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-150 hover:border-indigo-300 hover:bg-indigo-50/10 transition-all duration-200 group text-left shadow-sm"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 transition-colors">
                                                <IconComponent className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors truncate">
                                                Add {meta.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                                +{meta.boost}%
                                            </span>
                                            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* 100% Celebration Mode */
                    <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-3xl p-5 border border-indigo-500/20 text-center relative overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-500">
                        {/* Golden radial glow */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
                        <div className="w-12 h-12 bg-amber-400/10 border border-amber-400/20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                            <Crown className="w-6 h-6 text-amber-400 animate-bounce" />
                        </div>
                        <h4 className="text-sm font-black text-white tracking-wide">Elite Profile Rating</h4>
                        <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
                            Your profile is 100% complete! Recruiter matches and referral requests are fully boosted.
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-1 bg-white/5 border border-white/5 py-2 px-3 rounded-xl inline-flex">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Verified Premium Seeker</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
