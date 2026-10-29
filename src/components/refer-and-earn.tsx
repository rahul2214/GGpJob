"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/user-context";
import { Button } from "./ui/button";
import { Gift, Copy, Check, Share2, Users, Coins, Mail, Linkedin, MessageCircle, Send, UserPlus, BadgeCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReferAndEarnCardProps {
  className?: string;
  creditsPerReferral?: number;
}

const STEPS = [
  { icon: Send, title: "Share your link", body: "Send your invite link or code to friends who are job hunting." },
  { icon: UserPlus, title: "Friend signs up", body: "They create a JobsDart account and enter your code during setup." },
  { icon: BadgeCheck, title: "You both earn", body: "Credits land in both wallets once they verify their email." },
]

export function ReferAndEarnCard({ className, creditsPerReferral }: ReferAndEarnCardProps) {
  const { user } = useUser();
  const [copied, setCopied] = useState<"link" | "code" | null>(null);
  const [dynamicCredits, setDynamicCredits] = useState<number | null>(null);
  const [origin, setOrigin] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    // Read browser-only values after mount so server and client markup match.
    setOrigin(window.location.origin);
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

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
  // Same fallback the profile API persists when a user has no code yet.
  const referralCode =
    user?.referralCode ||
    (user?.uuid ? "JD" + user.uuid.replace(/-/g, "").substring(0, 6).toUpperCase() : "");
  const referralLink = referralCode && origin ? `${origin}/signup?ref=${referralCode}` : "";
  const shareText = `I'm using JobsDart to find jobs. Sign up with my link and we both get ${perReferral} free credits:`;

  const copy = async (value: string, kind: "link" | "code") => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied(cur => (cur === kind ? null : cur)), 2000);
    } catch {
      setCopied(null);
    }
  };

  const handleNativeShare = async () => {
    if (!referralLink) return;
    try {
      await navigator.share({ title: "Join JobsDart", text: shareText, url: referralLink });
    } catch {
      // Dismissing the share sheet is not an error worth surfacing.
    }
  };

  const shareTargets = referralLink
    ? [
        { label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${referralLink}`)}` },
        { label: "LinkedIn", icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}` },
        { label: "Email", icon: Mail, href: `mailto:?subject=${encodeURIComponent("Join me on JobsDart")}&body=${encodeURIComponent(`${shareText}\n\n${referralLink}`)}` },
      ]
    : [];

  const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900";

  return (
    <section
      aria-labelledby="refer-heading"
      className={cn(
        "rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="grid lg:grid-cols-5">
        {/* Invite */}
        <div className="lg:col-span-3 p-5 sm:p-7 space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
              <Gift className="h-3.5 w-3.5" aria-hidden="true" />
              +{perReferral} credits each
            </span>
            <h2 id="refer-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Invite friends, you both earn {perReferral} credits
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg">
              Credits work for job applications and AI tools like the ATS checker. There&apos;s no limit on how many friends you can invite.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="referral-link" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Your invite link
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="referral-link"
                readOnly
                value={referralLink}
                placeholder="Loading your link…"
                onFocus={(e) => e.currentTarget.select()}
                className={cn("h-11 w-full min-w-0 shrink-0 sm:flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs sm:text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200", focusRing)}
              />
              <Button
                type="button"
                onClick={() => copy(referralLink, "link")}
                disabled={!referralLink}
                className="h-11 rounded-xl bg-indigo-600 px-5 font-semibold text-white hover:bg-indigo-700 shrink-0"
              >
                {copied === "link" ? <Check className="mr-2 h-4 w-4" aria-hidden="true" /> : <Copy className="mr-2 h-4 w-4" aria-hidden="true" />}
                {copied === "link" ? "Copied" : "Copy link"}
              </Button>
            </div>
            <p className="sr-only" aria-live="polite">{copied ? `${copied === "link" ? "Link" : "Code"} copied to clipboard` : ""}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600 dark:text-slate-400">Code</span>
              <button
                type="button"
                onClick={() => copy(referralCode, "code")}
                disabled={!referralCode}
                aria-label={`Copy referral code ${referralCode}`}
                className={cn("inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-2.5 py-1 font-mono text-sm font-semibold tracking-wider text-slate-900 hover:border-indigo-400 dark:border-slate-600 dark:bg-slate-950/40 dark:text-white", focusRing)}
              >
                {referralCode || "—"}
                {copied === "code"
                  ? <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  : <Copy className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2" aria-label="Share your link">
              {shareTargets.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target={label === "Email" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className={cn("inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800", focusRing)}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {label}
                </a>
              ))}
              {canNativeShare && referralLink && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className={cn("inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800", focusRing)}
                >
                  <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                  More
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/30 p-5 sm:p-7 flex flex-col justify-center gap-4">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Your referrals</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <Users className="h-4 w-4 text-indigo-500" aria-hidden="true" />
              <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{referralCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{referralCount === 1 ? "Friend joined" : "Friends joined"}</p>
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <Coins className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{creditsEarned}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Credits earned</p>
            </div>
          </div>
          {referralCount === 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No referrals yet. Your first friend who joins earns you {perReferral} credits.
            </p>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="border-t border-slate-200/70 dark:border-slate-800 px-5 py-5 sm:px-7">
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">How it works</h3>
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, idx) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                {idx + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{step.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Rewards apply to new accounts that enter your code during setup and verify their email. Each friend can only be referred once, and you can&apos;t use your own code.
        </p>
      </div>
    </section>
  );
}
