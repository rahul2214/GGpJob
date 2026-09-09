"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Zap, CheckCircle, Sparkles, Gift, Copy, Share2 } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import Link from "next/link";
import { ProfileStrength } from "../profile-strength";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import RecommendationSections from "../home/RecommendationSections";

export default function JobSeekerDashboard() {
  const { user, refreshUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [copied, setCopied] = useState(false);
  const referralCount = user?.referralCount || 0;
  const effectiveReferralCode = user?.referralCode || (user?.uuid ? 'JD' + user.uuid.replace(/-/g, '').substring(0, 6).toUpperCase() : '');
  const referralLink = effectiveReferralCode && typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=${effectiveReferralCode}` : '';

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Share this link with your friends to earn credits.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!referralLink) return;
    const shareData = {
      title: 'Join JobsDart',
      text: 'Sign up using my referral link to get started:',
      url: referralLink
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

  const firstName = user?.name?.split(" ")[0] || "User";
  

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
                <h3 className="font-bold text-slate-800 text-base">Get 2 Credits</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Invite your friends to join JobsDart. Both you and your friend earn <span className="font-bold text-indigo-600">2 credits</span> when they join and verify their account!
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
                    {referralLink || (typeof window !== 'undefined' ? `${window.location.origin}/signup` : '...')}
                  </div>
                  <Button 
                    onClick={handleCopyLink} 
                    disabled={!referralLink}
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
                disabled={!referralLink}
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
