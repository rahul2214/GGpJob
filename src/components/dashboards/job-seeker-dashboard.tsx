"use client";

import { useState, useMemo, useEffect } from "react";
import type { Job, Application } from "@/lib/types";
import JobCard from "../job-card";
import { Button } from "../ui/button";
import { Search, ArrowRight, BriefcaseBusiness, Star, ThumbsUp, Bell, Zap, Loader2, ShieldCheck, CheckCircle, MessageSquare, Trophy, AlertCircle, Clock, Coins, Sparkles, Gift, Copy, Share2 } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { supabase } from "@/lib/supabase-client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { ProfileStrength } from "../profile-strength";
import { useRouter } from "next/navigation";
import { useDashboardJobs, useApplications } from "@/hooks/use-jobs";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  const [searchQuery, setSearchQuery] = useState("");
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
    user ? { domain: user.domainId, dashboard: "true", userId: user.uuid } : undefined
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

    // Status Updates
    userApplications.forEach(app => {
      if (app.statusId === 7) {
        items.push({ id: `offer-${app.id}`, priority: 1, title: "Offer Received!", description: `Offer from ${app.companyName}`, actionLabel: "View Details", href: "/applications", icon: Trophy, color: "amber", appId: app.id });
      }
      else if (app.statusId === 6) {
        items.push({ id: `interview-${app.id}`, priority: 3, title: "Interview Stage", description: `Interviewing with ${app.companyName}`, actionLabel: "View Status", href: "/applications", icon: Clock, color: "blue", appId: app.id });
      }
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
  const referralJobs = useMemo(() => jobData?.referral || [], [jobData]);
  const firstName = user?.name?.split(" ")[0] || "User";

  // Safeguard for Action Required Item
  const topActionItem = actionRequiredItems[0];
  const ActionIcon = topActionItem?.icon || AlertCircle;

  return (
    <div className="space-y-8 py-4 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 py-8 md:py-10 md:px-10 shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Welcome back, {firstName}!</h1>
            <p className="text-indigo-200 text-sm md:text-base">New jobs are waiting.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/jobs" prefetch={false} className="bg-white text-indigo-700 font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition-transform hover:scale-105 active:scale-95">Browse Jobs</Link>
            <Link href="/ats-score" prefetch={false} className="bg-indigo-500/50 hover:bg-indigo-500/70 border border-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-200 fill-indigo-200" />
              ATS Checker
            </Link>
            <Link href="/resume-builder" prefetch={false} className="bg-purple-500/50 hover:bg-purple-500/70 border border-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-purple-200 fill-purple-200" />
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
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/20 p-6 shadow-md relative overflow-hidden flex flex-col h-full min-h-[340px]">
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

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

      {/* Recommended Jobs */}
      {isLoading ? (
        user?.domainId && (
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-lg">Recommended For You</h2>
              <Skeleton className="h-4 w-14 rounded-md" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </div>
          </div>
        )
      ) : (
        user?.domainId && recommendedJobs.length > 0 && (
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-lg">Recommended For You</h2>
              <Link href="/jobs?view=recommended" prefetch={false} className="text-sm font-bold text-indigo-600 hover:underline">View All</Link>
            </div>
            <Carousel className="w-full">
              <CarouselContent className="-ml-3">
                {recommendedJobs.map((job) => (
                  <CarouselItem key={job.id} className="pl-3 basis-[90%] sm:basis-1/2 lg:basis-1/3">
                    <JobCard job={job} isApplied={false} hideDetails={false} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        )
      )}

      {/* Referral Opportunities */}
      {isLoading ? (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-800 text-lg">Referral Opportunities</h2>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] uppercase font-bold px-2 py-0.5 animate-pulse">High Success Rate</Badge>
            </div>
            <Skeleton className="h-4 w-20 rounded-md" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        </div>
      ) : (
        referralJobs.length > 0 && (
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-800 text-lg">Referral Opportunities</h2>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] uppercase font-bold px-2 py-0.5">High Success Rate</Badge>
              </div>
              <Link href="/jobs?isReferral=true" prefetch={false} className="text-sm font-bold text-indigo-600 hover:underline">Explore More</Link>
            </div>
            <Carousel className="w-full">
              <CarouselContent className="-ml-3">
                {referralJobs.map((job: any) => (
                  <CarouselItem key={job.id} className="pl-3 basis-[90%] sm:basis-1/2 lg:basis-1/3">
                    <JobCard job={job} isApplied={false} hideDetails={false} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        )
      )}
    </div>
  );
}
