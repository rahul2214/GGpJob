"use client";

import { useState, useMemo, useEffect } from "react";
import JobCard from "../job-card";
import { Button } from "../ui/button";
import { Zap, CheckCircle, MessageSquare, Trophy, Clock, Coins, Sparkles, Gift, Copy, Share2 } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { ProfileStrength } from "../profile-strength";
import { useRouter } from "next/navigation";
import { useDashboardJobs, useApplications } from "@/hooks/use-jobs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import RecommendationSections from "../home/RecommendationSections";

// Job Card loading skeleton placeholder
const JobCardSkeleton = () => (
  <div className="border border-slate-100 rounded-xl p-5 bg-white space-y-4 shadow-sm animate-pulse">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-4/5 rounded-md" />
        <Skeleton className="h-4 w-1/3 rounded-md" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
      </div>
      <Skeleton className="h-4 w-1/2 rounded-md" />
    </div>
    <div className="border-t border-slate-50 pt-4 flex justify-between items-center">
      <Skeleton className="h-4 w-24 rounded-md" />
      <Skeleton className="h-6 w-16 rounded-md" />
    </div>
  </div>
);

export default function JobSeekerDashboard() {
  const { user, refreshUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [copied, setCopied] = useState(false);
  const referralCount = user?.referralCount || 0;

  const handleCopyLink = () => {
    if (!user?.referralCode) return;
    const shareUrl = `${window.location.origin}/signup?ref=${user.referralCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Share this link with your friends to earn credits.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!user?.referralCode) return;
    const shareUrl = `${window.location.origin}/signup?ref=${user.referralCode}`;
    const shareData = {
      title: 'Join JobsDart',
      text: 'Get direct employee referrals at top MNCs! Sign up using my referral link to get started:',
      url: shareUrl
    };

    if (typeof window !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const { applications: userApplications, mutateApplications } = useApplications(
    user ? { userId: user.uuid, requesterId: user.uuid } : undefined
  );

  const { data: jobData, isLoading, isError } = useDashboardJobs(
    user ? { dashboard: "true", userId: user.uuid } : undefined
  );

  const handleVerifyAction = async (appId: string, action: 'confirm' | 'dispute') => {
    try {
        const response = await fetch(`/api/applications/${appId}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
        if (!response.ok) throw new Error('Failed to update verification status');
        toast({ title: action === 'confirm' ? "Hiring Confirmed!" : "Dispute Submitted" });
        mutateApplications();
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const actionRequiredItems = useMemo(() => {
    if (!userApplications) return [];
    const items: any[] = [];
    
    // Verifications
    userApplications.filter(app => app.verificationStatus === 'pending' || app.verificationStatus === 'pending_jobseeker').forEach(app => {
      items.push({
        id: `verify-${app.id}`,
        priority: 1,
        title: "Verify Your Hiring",
        description: `Confirm hiring at ${app.companyName}`,
        actionLabel: "Confirm Hire",
        icon: CheckCircle,
        color: "emerald",
        onAction: () => handleVerifyAction(app.id.toString(), 'confirm'),
        appId: app.id
      });
    });

    // Chat
    userApplications.filter(app => app.unreadChatCount > 0).forEach(app => {
      items.push({
        id: `chat-${app.id}`,
        priority: 2,
        title: "New Message",
        description: `Unread messages for ${app.jobTitle}`,
        actionLabel: "Open Chat",
        href: `/applications?chat=${app.id}`,
        icon: MessageSquare,
        color: "indigo",
        appId: app.id
      });
    });

 

    // Credits
    const totalCredits = ((user as any).subscriptionCredits || 0) + ((user as any).purchasedCredits || 0);
    if (user && totalCredits < 2) {
      items.push({
        id: "low-credits",
        priority: 0,
        title: totalCredits === 0 ? "Out of Credits" : "Low Credit Balance",
        description: totalCredits === 0 
          ? "You need credits to unlock referrals and continue conversations." 
          : "Your credit balance is low. Upgrade your plan to avoid interruptions.",
        actionLabel: "Top Up Now",
        href: "/jobseeker/credits",
        icon: Coins,
        color: "rose"
      });
    }

    return items.sort((a, b) => a.priority - b.priority);
  }, [userApplications, user]);

  const recommendedJobs = useMemo(() => jobData?.recommended?.slice(0, 5) || [], [jobData]);
  const firstName = user?.name?.split(" ")[0] || "User";

  // Safeguard for Action Required Item
  const topActionItem = actionRequiredItems[0];
  

  return (
    <div className="space-y-8 py-4 pb-12 px-4 md:px-6 lg:px-8">
      {/* Welcome Banner - Hidden on mobile, clean solid styling */}
      <div className="hidden md:block rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {firstName}!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              New jobs are waiting. Explore fresh opportunities and optimize your profile.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/jobs" 
              prefetch={false} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              Browse Jobs
            </Link>
            <Link 
              href="/ats-score" 
              prefetch={false} 
              className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              ATS Checker
            </Link>
            <Link 
              href="/resume-builder" 
              prefetch={false} 
              className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors inline-flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              Resume Builder
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Strength */}
        <div className="lg:col-span-8 h-full">
          {user && <ProfileStrength user={user} />}
        </div>

        {/* Refer & Earn Widget */}
        <div className="lg:col-span-4 h-full">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm relative overflow-hidden flex flex-col h-full min-h-[340px]">
            <div className="relative z-10 flex-grow flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <Gift className="w-5 h-5 text-indigo-600 animate-bounce" />
                <span className="text-base font-extrabold tracking-tight">Refer & Earn</span>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-base">Get 2 Credits per Friend</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Invite your friends to join JobsDart. You earn <span className="font-bold text-indigo-600">2 credits</span> for every friend who registers using your referral link!
                </p>
              </div>

              {/* Referrals Count Box */}
              <div className="space-y-2 bg-white/70 backdrop-blur-sm rounded-xl p-3.5 border border-indigo-50/50 flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Total Friends Referred</span>
                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-xs font-black">{referralCount !== null ? referralCount : '...'}</span>
              </div>

              {/* Referral Code Box */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Referral Link</span>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-200/50 rounded-xl px-3 py-2 flex items-center justify-between font-mono text-xs text-slate-600 font-bold select-all overflow-hidden text-ellipsis whitespace-nowrap">
                    {user?.referralCode ? `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${user.referralCode}` : 'Generating link...'}
                  </div>
                  <Button 
                    onClick={handleCopyLink} 
                    disabled={!user?.referralCode}
                    variant="outline"
                    className={cn(
                      "rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 transition-all active:scale-95 shrink-0",
                      copied && "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    )}
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Share Button */}
              <Button
                onClick={handleShare}
                disabled={!user?.referralCode}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all py-5 flex items-center justify-center gap-2 group active:scale-98"
              >
                <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Invite Friends
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* All 12 Job Recommendation Sections */}
      <RecommendationSections />
    </div>
  );
}
