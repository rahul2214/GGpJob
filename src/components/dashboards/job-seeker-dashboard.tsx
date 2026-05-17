"use client";

import { useState, useMemo } from "react";
import type { Job, Application } from "@/lib/types";
import JobCard from "../job-card";
import { Button } from "../ui/button";
import { Search, ArrowRight, BriefcaseBusiness, Star, ThumbsUp, Bell, Zap, Loader2, ShieldCheck, CheckCircle, MessageSquare, Trophy, AlertCircle, Clock, Coins } from "lucide-react";
import { useUser } from "@/contexts/user-context";
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

export default function JobSeekerDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

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
            <p className="text-indigo-200 text-sm md:text-base">You have {recommendedJobs.length} new jobs waiting.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/jobs" className="bg-white text-indigo-700 font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition-transform hover:scale-105 active:scale-95">Browse Jobs</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Strength */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-100 bg-white shadow-sm p-5 h-full">
          {user && <ProfileStrength user={user} />}
        </div>

        {/* Action Required */}
        {/* {topActionItem && (
          <div className="lg:col-span-4 rounded-2xl border-2 border-indigo-100 bg-white shadow-md p-5 h-full relative overflow-hidden flex flex-col">
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-2 text-indigo-700 font-bold mb-4">
                <AlertCircle className="w-5 h-5" />
                Action Required ({actionRequiredItems.length})
              </div>
              <div className="space-y-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center", 
                  topActionItem.color === 'emerald' ? "bg-emerald-100 text-emerald-600" : 
                  topActionItem.color === 'rose' ? "bg-rose-100 text-rose-600" :
                  "bg-indigo-100 text-indigo-600"
                )}>
                   <ActionIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{topActionItem.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{topActionItem.description}</p>
                </div>
                {topActionItem.href ? (
                  <Button asChild className="w-full bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all">
                    <Link href={topActionItem.href}>{topActionItem.actionLabel}</Link>
                  </Button>
                ) : (
                  <Button onClick={topActionItem.onAction} className="w-full bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all">
                    {topActionItem.actionLabel}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )} */}
      </div>

      {/* Recommended Jobs */}
      {!isLoading && user?.domainId && recommendedJobs.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-lg">Recommended For You</h2>
            <Link href="/jobs?view=recommended" className="text-sm font-bold text-indigo-600 hover:underline">View All</Link>
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
      )}

      {/* Referral Opportunities */}
      {!isLoading && referralJobs.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-800 text-lg">Referral Opportunities</h2>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] uppercase font-bold px-2 py-0.5">High Success Rate</Badge>
            </div>
            <Link href="/jobs?isReferral=true" className="text-sm font-bold text-indigo-600 hover:underline">Explore More</Link>
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
      )}
    </div>
  );
}
