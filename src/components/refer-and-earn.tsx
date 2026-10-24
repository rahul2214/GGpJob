"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/user-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Gift, Copy, CheckCircle, Share2, Users, Coins, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReferAndEarnCardProps {
  className?: string;
  creditsPerReferral?: number;
}

export function ReferAndEarnCard({ className, creditsPerReferral }: ReferAndEarnCardProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [dynamicCredits, setDynamicCredits] = useState<number | null>(null);

  useEffect(() => {
    if (creditsPerReferral !== undefined) return;
    fetch('/api/payments/prices')
      .then(res => res.json())
      .then(data => {
        if (data?.referralCredits && typeof data.referralCredits === 'number') {
          setDynamicCredits(data.referralCredits);
        }
      })
      .catch(() => {});
  }, [creditsPerReferral]);

  const perReferral = creditsPerReferral ?? dynamicCredits ?? 2;
  const referralCount = user?.referralCount || 0;
  const creditsEarned = referralCount * perReferral;
  const effectiveReferralCode =
    user?.referralCode ||
    (user?.uuid ? "JD" + user.uuid.replace(/-/g, "").substring(0, 6).toUpperCase() : "");
  const referralLink =
    effectiveReferralCode && typeof window !== "undefined"
      ? `${window.location.origin}/signup?ref=${effectiveReferralCode}`
      : "";

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: `Share this link with your friends to earn ${perReferral} credits.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!referralLink) return;
    const shareData = {
      title: "Join JobsDart",
      text: `Sign up using my referral link to get ${perReferral} free credits on JobsDart:`,
      url: referralLink,
    };

    if (typeof window !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between",
        className
      )}
    >
      {/* Decorative accent glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100/30 via-purple-100/10 to-transparent dark:from-indigo-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              Refer & Earn Free Credits
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Both get +{perReferral} credits when a friend joins
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50 rounded-full text-[11px] font-bold shrink-0">
         
          <span>+{perReferral} Credits / Friend</span>
        </div>
      </div>

      <div className="relative z-10 space-y-4 flex-grow flex flex-col justify-between">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100/80 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Friends</p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-slate-800 dark:text-white">{referralCount}</span>
                <span className="text-[10px] text-slate-400">joined</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50/80 to-violet-50/50 dark:from-indigo-950/40 dark:to-violet-950/30 rounded-xl p-3 border border-indigo-100/70 dark:border-indigo-900/50 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Earned</p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">+{creditsEarned}</span>
                <span className="text-[10px] font-bold text-indigo-500/80">Credits</span>
              </div>
            </div>
          </div>
        </div>

        {/* Link Box & Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl px-3 py-2 flex items-center font-mono text-xs text-slate-700 dark:text-slate-300 font-semibold select-all overflow-hidden text-ellipsis whitespace-nowrap shadow-xs">
              {referralLink || (typeof window !== "undefined" ? `${window.location.origin}/signup` : "...")}
            </div>
            <Button
              onClick={handleCopyLink}
              disabled={!referralLink}
              variant="outline"
              size="sm"
              className={cn(
                "rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 h-9 transition-all active:scale-95 shrink-0 font-bold text-xs gap-1.5",
                copied && "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50"
              )}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
            <Button
              onClick={handleShare}
              disabled={!referralLink}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-all h-9 px-3.5 flex items-center gap-1.5 shrink-0"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Invite</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
