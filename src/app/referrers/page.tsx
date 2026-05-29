"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { 
  Search, ShieldCheck, Sparkles, Clock, Lock, 
  Unlock, ThumbsUp, AlertCircle, Coins, ArrowRight,
  MessageSquare, RefreshCw, Layers, MapPin, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ChatDrawer } from "@/components/chat/ChatDrawer";

interface ReferrerProfile {
  id: number;
  uuid: string;
  name: string;
  email?: string;
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  designation: string;
  department: string;
  linkedinUrl?: string;
  refers: string[];
  successRate: number;
  responseRate: number;
  avgResponseTime: string;
  successfulReferrals: number;
  trustScore: number;
  badgeIds: string[];
  xp: number;
  level: number;
  isUnlocked: boolean;
  applicationUuid: string | null;
}

const isCorporateEmail = (email?: string | null) => {
  if (!email) return false;
  const lower = email.toLowerCase();
  const publicDomains = ['@gmail.', '@yahoo.', '@outlook.', '@hotmail.', '@live.', '@icloud.', '@aol.', '@ymail.', '@rocketmail.'];
  return !publicDomains.some(d => lower.includes(d));
};

export default function ReferrerMarketplace() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [referrers, setReferrers] = useState<ReferrerProfile[]>([]);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState<string>("All");
  const [selectedCompany, setSelectedCompany] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"success" | "response" | "newest">("success");

  // Chat and Unlock Modals State
  const [activeAppUuid, setActiveAppUuid] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState<ReferrerProfile | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/referrers");
    }
  }, [user, authLoading, router]);

  // Load referrers
  const fetchReferrers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/referrers?userId=${user.uuid}`);
      if (res.ok) {
        const data = await res.json();
        setReferrers(data.referrers || []);
        setCreditBalance(data.credits || 0);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to load referrers",
          description: "Please try reloading the page.",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uuid) {
      fetchReferrers();
    }
  }, [user?.uuid]);

  // Handle direct unlock trigger
  const handleUnlockRequest = (ref: ReferrerProfile) => {
    if (user?.role !== "Job Seeker") {
      toast({
        variant: "destructive",
        title: "Access Restricted",
        description: "Only logged-in Job Seekers can unlock referrer guidance.",
      });
      return;
    }
    setUnlockTarget(ref);
  };

  // Process credit-spending unlock request
  const confirmUnlockReferrer = async () => {
    if (!unlockTarget || !user) return;
    setIsUnlocking(true);

    try {
      const res = await fetch("/api/referrers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: unlockTarget.uuid,
          userId: user.uuid,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast({
          title: "Success! Connection Unlocked 🎉",
          description: `You have unlocked direct career guidance and chat with ${unlockTarget.name}.`,
        });
        
        // Refresh referrer dataset locally and deduct credits
        setCreditBalance((prev) => Math.max(0, prev - 2));
        setReferrers((prev) =>
          prev.map((r) =>
            r.uuid === unlockTarget.uuid
              ? { ...r, isUnlocked: true, applicationUuid: data.applicationUuid }
              : r
          )
        );

        // Open chat immediately
        setActiveAppUuid(data.applicationUuid);
        setIsChatOpen(true);
        setUnlockTarget(null);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to unlock connection",
          description: data.error || "Please verify your credit holdings and try again.",
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to reach servers. Try again in a few moments.",
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  // Open existing chat
  const handleOpenChat = (appUuid: string) => {
    setActiveAppUuid(appUuid);
    setIsChatOpen(true);
  };

  // Derived filter tags
  const allExpertiseTags = ["All", ...Array.from(new Set(referrers.flatMap((r) => r.refers)))];
  const allCompanies = ["All", ...Array.from(new Set(referrers.map((r) => r.companyName)))];

  // Filtering + Sorting lists
  const filteredReferrers = referrers
    .filter((ref) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        ref.name.toLowerCase().includes(query) ||
        ref.companyName.toLowerCase().includes(query) ||
        ref.designation.toLowerCase().includes(query) ||
        ref.refers.some((tag) => tag.toLowerCase().includes(query));

      const matchesExpertise = selectedExpertise === "All" || ref.refers.includes(selectedExpertise);
      const matchesCompany = selectedCompany === "All" || ref.companyName === selectedCompany;

      return matchesSearch && matchesExpertise && matchesCompany;
    })
    .sort((a, b) => {
      if (sortBy === "success") return b.successRate - a.successRate;
      if (sortBy === "response") return b.responseRate - a.responseRate;
      return b.successfulReferrals - a.successfulReferrals; // Default to successful count
    });

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (authLoading || (loading && referrers.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-500">Loading Referrer Marketplace...</p>
        </div>
      </div>
    );
  }

  // Prevent recruiters and other roles from viewing without notice
  if (user && user.role !== "Job Seeker") {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="border-amber-200 bg-amber-50/40">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertCircle className="w-8 h-8 text-amber-600 shrink-0" />
            <div>
              <CardTitle className="text-amber-800 text-lg">Marketplace Limited to Candidates</CardTitle>
              <p className="text-xs text-amber-700 font-medium">
                The Referrer Marketplace is only available to job seekers to request guidance.
              </p>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            You are logged in as a <strong>{user.role}</strong>. Please switch accounts or log in as a Job Seeker to unlock referral chats.
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/">Return to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Banner Section */}
        <div className="mb-10 text-center md:text-left md:flex md:items-center md:justify-between gap-6 border-b border-slate-100 pb-8">
          <div>
           
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Referrer Marketplace
            </h1>
            <p className="mt-2.5 text-slate-600 max-w-2xl text-sm sm:text-base leading-relaxed">
              Skip cold DMs and verify your professional guidance. Connect directly with employees at top companies, get resume evaluations, and unlock structured referral opportunities.
            </p>
          </div>

          {/* Credit balance card */}
          <div className="mt-6 md:mt-0 bg-white border border-slate-200/80 shadow-lg rounded-2xl p-5 min-w-[280px] hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50/40 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="flex items-center gap-3 mb-2.5">
              <Coins className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Credits</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-950">{creditBalance}</span>
              <span className="text-xs text-slate-500 font-medium">Credits remaining</span>
            </div>
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
              <Link 
                href="/jobseeker/credits" 
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                Top-Up Credits
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/jobseeker/plans" className="text-xs text-slate-400 font-medium hover:underline">
                View Plans
              </Link>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white border border-slate-200/60 shadow-md rounded-2xl p-5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name, company, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 border-slate-200 focus-visible:ring-blue-500 text-xs rounded-lg"
            />
          </div>

          {/* Tag filters */}
          <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
            
            {/* Company select */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400">Company</span>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="h-9 px-3 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {allCompanies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Expertise select */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400">Expertise</span>
              <select
                value={selectedExpertise}
                onChange={(e) => setSelectedExpertise(e.target.value)}
                className="h-9 px-3 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {allExpertiseTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting select */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400">Sort By</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 px-3 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="success">Success Rate</option>
                <option value="response">Response Rate</option>
                <option value="newest">Successful Count</option>
              </select>
            </div>

          </div>
        </div>

        {/* Results count info */}
        <p className="text-xs font-semibold text-slate-500 mb-6">
          Showing {filteredReferrers.length} Referrer profiles
        </p>

        {/* Main Grid */}
        {filteredReferrers.length === 0 ? (
          <Card className="border-dashed py-14 text-center">
            <CardContent className="flex flex-col items-center gap-3">
              <AlertCircle className="w-12 h-12 text-slate-300" />
              <h3 className="text-base font-bold text-slate-800">No Referrers Found</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Try clearing your search query or broadening your company/expertise filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReferrers.map((ref) => (
              <Card 
                key={ref.uuid} 
                className="border-slate-200/80 hover:border-slate-300/80 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl flex flex-col overflow-hidden relative"
              >
                {/* Visual Accent top border */}
                <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-11 h-11 border border-slate-100 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-inner shrink-0 flex items-center justify-center">
                        <AvatarFallback>{getInitials(ref.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5 truncate">
                          {ref.name}
                          {(ref.trustScore >= 80 || isCorporateEmail(ref.email)) && (
                            <Badge variant="outline" className="p-0 border-none text-emerald-600 hover:bg-transparent" title="Verified Referrer Profile">
                              <ShieldCheck className="w-4 h-4 fill-emerald-50 text-emerald-600" />
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                          {ref.designation} at <strong>{ref.companyName}</strong>
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                          <span className="font-semibold text-slate-400">Trust Score:</span>
                          <span className={`font-extrabold px-1.5 py-0.5 rounded text-[9px] ${
                            ref.trustScore >= 80 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            ref.trustScore >= 50 ? "bg-blue-50 text-blue-700 border border-blue-100" :
                            "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>
                            {ref.trustScore}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pb-4 flex flex-col gap-4">
                  {/* Expertise Categories */}
                  <div className="flex flex-wrap gap-1.5">
                    {ref.refers.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100/50 text-[10px] font-bold rounded-md border border-blue-100/30 px-2 py-0.5"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Earned & Level Badges */}
                  {(ref.badgeIds?.length > 0 || ref.trustScore >= 90 || ref.level > 1) && (
                    <div className="flex flex-wrap gap-1.5">
                      {ref.level > 1 && (
                        <Badge 
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 text-[9px] font-extrabold rounded-md px-2 py-0.5 flex items-center gap-1 uppercase tracking-wider"
                        >
                          <Layers className="w-2.5 h-2.5 text-indigo-500" />
                          Lvl {ref.level}
                        </Badge>
                      )}
                      {ref.trustScore >= 90 && (
                        <Badge 
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 text-[9px] font-extrabold rounded-md px-2 py-0.5 flex items-center gap-1 uppercase tracking-wider"
                        >
                          <ThumbsUp className="w-2.5 h-2.5 fill-emerald-400 text-emerald-600" />
                          Top Rated
                        </Badge>
                      )}
                      {ref.badgeIds?.map((badgeId) => (
                        <Badge 
                          key={badgeId} 
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 text-[9px] font-extrabold rounded-md px-2 py-0.5 flex items-center gap-1 uppercase tracking-wider"
                        >
                          <Sparkles className="w-2.5 h-2.5 fill-amber-300 text-amber-600" />
                          {badgeId}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Referrer Statistics Panel */}
                  <div className="grid grid-cols-2 gap-3.5 bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 text-[11px] text-slate-600">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Success Rate</span>
                      <span className="text-slate-800 font-black text-xs">{ref.successRate}%</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Response Rate</span>
                      <span className="text-slate-800 font-black text-xs">{ref.responseRate}%</span>
                    </div>
                    <div className="flex flex-col gap-0.5 border-t border-slate-200/50 pt-2">
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Avg Response</span>
                      <span className="text-slate-800 font-black text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {ref.avgResponseTime}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5 border-t border-slate-200/50 pt-2">
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Successful Refs</span>
                      <span className="text-slate-800 font-black text-xs">{ref.successfulReferrals}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t border-slate-100 bg-slate-50/40 p-4">
                  {ref.isUnlocked && ref.applicationUuid ? (
                    <Button 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
                      onClick={() => handleOpenChat(ref.applicationUuid!)}
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-2" />
                      Chat Now
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full border-blue-600 text-blue-700 hover:bg-blue-50/40 font-bold text-xs"
                      onClick={() => handleUnlockRequest(ref)}
                    >
                      <Lock className="w-3.5 h-3.5 mr-2 text-blue-600" />
                      Unlock Guidance & Chat (2 Credits)
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Unlock Confirmation Dialog */}
      <Dialog open={!!unlockTarget} onOpenChange={(open) => !open && setUnlockTarget(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-indigo-600 animate-bounce" />
              Confirm Credit Spend
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-2.5 text-xs sm:text-sm leading-relaxed">
              You are unlocking direct verified guidance with <strong>{unlockTarget?.name}</strong>, a verified employee at <strong>{unlockTarget?.companyName}</strong>. 
              <br/><br/>
              This will charge <strong>2 credits</strong> from your balance and grant you:
              <ul className="list-disc pl-5 mt-2.5 space-y-1.5 text-xs text-slate-500 font-medium">
                <li>Direct chat channel to message {unlockTarget?.name}</li>
                <li>Verify referral opportunities and upload resume for review</li>
                <li>Structured professional networking space</li>
              </ul>
              <br/>
              <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-2 block font-medium">
                ⚠️ Credits are non-refundable once the connection is unlocked. Direct referrals are subject to resume match and employee review.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button 
              variant="outline" 
              onClick={() => setUnlockTarget(null)}
              disabled={isUnlocking}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmUnlockReferrer}
              disabled={isUnlocking || creditBalance < 2}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            >
              {isUnlocking ? "Unlocking..." : `Spend 2 Credits`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ChatDrawer Integration */}
      {activeAppUuid && (
        <ChatDrawer 
          applicationId={activeAppUuid} 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
        />
      )}
    </div>
  );
}
