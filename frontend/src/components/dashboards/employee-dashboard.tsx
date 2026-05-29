"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Job } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import {
  PlusCircle, Briefcase, Trophy, Star, Zap, Award, Wallet, ChevronRight, CheckCircle, Info, MessageSquareQuote,
  Clock, ShieldCheck, AlertTriangle, CalendarDays, Search, MessageSquare, FileText, MapPin
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { useUser } from "@/contexts/user-context";
import { motion } from "framer-motion";
import { EmployeeLeaderboard } from "./employee-leaderboard";
import { RedemptionHub } from "../rewards/redemption-hub";
import { useRouter } from "next/navigation";

// ── Gamification Constants ───────────────────────────────────────────────────
const LEVELS = [
  { level: 1, name: "New Referrer", min: 0, max: 200, color: "from-slate-400 to-slate-500", badge: "🥉", benefits: ["1 Active Job Slot"] },
  { level: 2, name: "Junior Referrer", min: 0, max: 500, color: "from-blue-400 to-blue-500", badge: "🥈", benefits: ["+2 Referral Slots", "Profile Boost"] },
  { level: 3, name: "Active Referrer", min: 0, max: 1000, color: "from-indigo-400 to-indigo-500", badge: "🥇", benefits: ["Featured Profile", "Priority Support"] },
  { level: 4, name: "Skilled Referrer", min: 0, max: 1500, color: "from-violet-500 to-violet-600", badge: "🎖️", benefits: ["Analytics Access", "₹500 Bonus"] },
  { level: 5, name: "Trusted Referrer", min: 0, max: 3000, color: "from-purple-600 to-purple-700", badge: "🌟", benefits: ["Boosted Visibility", "₹1000 Bonus"] },
  { level: 6, name: "Senior Referrer", min: 0, max: 5000, color: "from-fuchsia-600 to-pink-600", badge: "👔", benefits: ["Homepage Visibility", "Exclusive Jobs"] },
  { level: 7, name: "Expert Referrer", min: 0, max: 8000, color: "from-orange-500 to-red-500", badge: "🔥", benefits: ["Premium Matching", "₹3000 Bonus"] },
  { level: 8, name: "Elite Referrer", min: 0, max: 12000, color: "from-red-600 to-rose-700", badge: "💎", benefits: ["Top Search Rank", "₹5000 Bonus"] },
  { level: 9, name: "Referral Master", min: 0, max: 20000, color: "from-slate-800 to-black", badge: "🔴", benefits: ["Invite-only Programs", "₹10000 Bonus"] },
  { level: 10, name: "Legend Referrer", min: 0, max: 100000, color: "from-amber-400 via-yellow-500 to-amber-600", badge: "👑", benefits: ["Annual Bonus Pool", "Featured Permanently"] }
];

const MILESTONE_CATEGORIES = [
  {
    id: 'referrals',
    label: 'Verified Referrals',
    icon: CheckCircle,
    key: 'verifiedReferralsCount',
    tiers: [
      { target: 20, reward: 'Connector Badge' },
      { target: 50, reward: '50 Referrals (+400 XP)' },
      { target: 100, reward: '100 Referrals (+1000 XP)' },
    ]
  }
];

export default function EmployeeDashboard() {
  const { user, refreshUser } = useUser();
  const [latestNotifId, setLatestNotifId] = useState<number | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const { toast } = useToast();

  const jobPostLimit = (user as any)?.jobPostLimit ?? 5;
  const [referralJobs, setReferralJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);


  const fetchJobs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs?isReferral=true&employeeId=${user.uuid}&fresh=true`, { cache: 'no-store' });
      const data = await res.json();
      setReferralJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch referral jobs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchJobs();
        const pollNotifications = async () => {
            try {
                const res = await fetch(`/api/notifications?userId=${user.uuid}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        const newest = data[0];
                        setLatestNotifId(newest.id);
                        setRecentActivity(data.slice(0, 5));
                    }
                }
            } catch (err) {
                console.error("Notif poll error:", err);
            }
        };

        const interval = setInterval(pollNotifications, 30000);
        pollNotifications();
        return () => clearInterval(interval);
    }
  }, [user]);

  const jobsThisMonth = (user as any)?.jobsPostedThisMonth ?? 0;
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
      const check = () => setIsMobile(window.innerWidth < 768);
      check();
      window.addEventListener('resize', check);
      return () => window.removeEventListener('resize', check);
  }, []);

  const [isRedeemOpen, setIsRedeemOpen] = useState(false);

  if (loading && referralJobs.length === 0) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-80 lg:col-span-2 rounded-3xl" />
          <Skeleton className="h-80 lg:col-span-1 rounded-3xl" />
        </div>
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <Skeleton className="h-96 xl:col-span-2 rounded-3xl" />
          <Skeleton className="h-96 xl:col-span-1 rounded-3xl" />
        </div>
      </div>
    );
  }

  const emp = user as any;
  const currentXp = emp?.xp || 0;
  const currentLevel = emp?.level || 1;
  const levelInfo = LEVELS.find(l => l.level === currentLevel) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === currentLevel + 1);
  const xpNeededForNext = levelInfo.max;
  const xpInCurrentLevel = currentXp - (levelInfo.min || 0);
  const xpNeededForLevel = levelInfo.max - (levelInfo.min || 0);
  const xpProgress = Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100);


  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Dashboard Header with Tab Switcher ── */}
          {/* ── ROW 1: Hero Overview (Level + Stats + Wallet) ──────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Level Card with Embedded Core Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:col-span-2 flex flex-col h-full"
            >
              <Card className="flex-1 overflow-hidden border border-white/60 shadow-[0_12px_35px_-12px_rgba(79,70,229,0.2)] bg-gradient-to-br from-white via-indigo-50/30 to-white backdrop-blur-2xl relative group rounded-[2.5rem] flex flex-col justify-between p-8 sm:p-10">
                <div className={`absolute -inset-1 bg-gradient-to-r ${levelInfo.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-700 pointer-events-none`} />
                
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                      <motion.div 
                        whileHover={{ scale: 1.08, rotate: 6 }}
                        className={`w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br ${levelInfo.color} flex items-center justify-center text-4xl sm:text-6xl shadow-2xl shadow-indigo-300/50 shrink-0 border-2 border-white/80`}
                      >
                        <span className="relative z-10 drop-shadow-md">{levelInfo.badge}</span>
                      </motion.div>
                      <div className="w-full">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                           <Badge className="text-[10px] sm:text-xs uppercase font-black tracking-widest py-1 px-3 bg-slate-900 text-white border-none shadow-md shadow-slate-300">
                             Level {currentLevel}
                           </Badge>
                           {nextLevel && (
                             <span className="text-[10px] sm:text-xs text-slate-600 font-extrabold bg-white/90 px-3 py-1 rounded-full border border-slate-200/80 shadow-sm inline-block">
                               {xpNeededForNext - xpInCurrentLevel} XP to Level {currentLevel + 1}
                             </span>
                           )}
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
                          {levelInfo.name}
                        </h2>
                        
                        {emp?.badges && emp.badges.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {emp.badges.map((badge: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="bg-amber-100 text-amber-800 border border-amber-200 font-black tracking-wide text-[10px] sm:text-xs px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                                <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Embedded Metrics (Jobs Posted & Trust Score) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/80 border border-slate-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-slate-400">Jobs Posted</p>
                          <p className="text-2xl font-black text-slate-900 tracking-tight">{jobsThisMonth} <span className="text-sm font-bold text-slate-400">/ {jobPostLimit}</span></p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-indigo-50/50 text-indigo-700 border-indigo-200 text-xs font-black">
                        {Math.round((jobsThisMonth / jobPostLimit) * 100)}% Used
                      </Badge>
                    </div>

                    <div className="bg-white/80 border border-slate-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                          <Star className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-slate-400">Trust Score</p>
                          <p className="text-2xl font-black text-slate-900 tracking-tight">{emp?.trustScore} <span className="text-sm font-bold text-slate-400">/ 100</span></p>
                        </div>
                      </div>
                     
                    </div>
                  </div>
                </div>

                {/* Level Progress Track */}
                <div className="bg-slate-900/5 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-white/60 shadow-inner">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                    <span className="text-[10px] sm:text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500 animate-pulse shrink-0" /> XP Level Progression
                    </span>
                    <span className="text-[10px] sm:text-xs font-black text-indigo-800 bg-indigo-100 px-3 py-1 rounded-xl shadow-sm inline-block">
                      {xpInCurrentLevel} / {xpNeededForNext} XP
                    </span>
                  </div>
                  <div className="h-4 bg-white rounded-full overflow-hidden p-1 border border-slate-200/60 shadow-inner">
                    <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${xpProgress}%` }}
                       transition={{ duration: 1.5, ease: "circOut" }}
                       className={`h-full rounded-full bg-gradient-to-r ${levelInfo.color} shadow-md relative overflow-hidden`}
                    >
                       <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Reward Wallet Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              className="flex flex-col h-full"
            >
              <Card className="flex-1 border border-slate-800 shadow-[0_12px_40px_-12px_rgba(16,185,129,0.25)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden group rounded-[2.5rem] flex flex-col justify-between p-8 sm:p-10">
                <div className="absolute -right-20 -top-20 w-72 h-72 bg-emerald-500/15 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/15 rounded-full blur-[70px] pointer-events-none" />
                
                <div className="absolute right-6 top-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-125 group-hover:rotate-12 pointer-events-none">
                  <Wallet className="w-36 h-36 text-emerald-400" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center shadow-inner">
                      <Wallet className="w-7 h-7 text-emerald-400" />
                    </div>
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/15 px-3 py-1 font-extrabold uppercase text-xs rounded-xl shadow-sm">
                      Rewards Wallet
                    </Badge>
                  </div>

                  <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-3">Available Balance</p>
                  
                  <div className="flex items-start gap-1.5 mb-6">
                    <span className="text-3xl font-bold text-slate-500 mt-2">₹</span>
                    <span className="text-6xl sm:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-100 to-slate-400 drop-shadow-md">
                      {emp?.rewardsBalance?.toLocaleString() || 0}
                    </span>
                  </div>

                  {emp?.pendingRewards > 0 && (
                    <div className="mt-4 flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-inner">
                      <div className="flex items-center gap-2.5">
                         <Clock className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
                         <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Pending Review</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white">₹{emp.pendingRewards.toLocaleString()}</span>
                        <Dialog>
                            <DialogTrigger>
                                <Info className="w-4 h-4 text-slate-400 hover:text-white transition-colors cursor-help" />
                            </DialogTrigger>
                            <DialogContent className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-8 shadow-2xl">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-3 text-2xl font-black text-white">
                                        <Clock className="w-7 h-7 text-amber-400 animate-pulse" />
                                        Rewards Under Review
                                    </DialogTitle>
                                    <DialogDescription className="text-slate-400 text-sm leading-relaxed pt-4">
                                        To guarantee platform integrity, high-value wallet payouts are held for manual verification if your Trust Score is below 60.
                                        <br /><br />
                                        <span className="text-white font-black bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/80 inline-block">
                                          Your Current Trust Score: {emp.trustScore || 50} / 100
                                        </span>
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-8 pt-4">
                    {isMobile ? (
                        <Button 
                            onClick={() => router.push('/rewards/redeem')}
                            className="group/btn relative w-full h-16 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-2xl font-black text-base transition-all shadow-xl shadow-emerald-500/20 overflow-hidden active:scale-[0.98]"
                        >
                            <span className="relative z-10 flex items-center justify-center uppercase tracking-wider">
                                Redeem Rewards 
                                <ChevronRight className="w-5 h-5 ml-1.5" />
                            </span>
                        </Button>
                    ) : (
                        <Dialog open={isRedeemOpen} onOpenChange={setIsRedeemOpen}>
                            <DialogTrigger asChild>
                                <Button className="group/btn relative w-full h-16 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-2xl font-black text-base transition-all shadow-xl shadow-emerald-500/20 overflow-hidden hover:-translate-y-0.5">
                                    <span className="relative z-10 flex items-center justify-center uppercase tracking-wider">
                                        Redeem Rewards 
                                        <ChevronRight className="w-5 h-5 ml-1.5" />
                                    </span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl bg-white border-none shadow-2xl rounded-[2.5rem] p-0 flex flex-col max-h-[90vh] overflow-hidden">
                                <RedemptionHub user={emp} refreshUser={refreshUser} />
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* ── ROW 2: Monthly Quota Notice & Quick Action Buttons ────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Monthly Quota Banner */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="lg:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-gradient-to-r from-indigo-50 via-white to-white border border-indigo-100 rounded-3xl p-6 sm:p-7 shadow-sm backdrop-blur-md h-full w-full"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 w-full sm:w-auto">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-100/60 flex items-center justify-center shrink-0 border border-indigo-200/50 shadow-inner">
                  <CalendarDays className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 animate-pulse" />
                </div>
                <div className="flex flex-col w-full">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                    <span className="text-slate-900 font-black text-base sm:text-lg tracking-tight">Monthly Quota Tracker</span>
                    {(user as any)?.nextJobsResetAt && (
                      <Badge variant="outline" className="text-[10px] sm:text-xs px-2.5 py-1 bg-white border-slate-200 text-slate-700 font-extrabold shadow-sm">
                        Resets {format(new Date((user as any).nextJobsResetAt), 'MMM d, yyyy')}
                      </Badge>
                    )}
                  </div>
                  <span className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
                    You have published <strong className="text-indigo-600 font-black">{jobsThisMonth}</strong> out of <strong className="text-slate-900 font-black">{jobPostLimit}</strong> available job referral postings this month.
                  </span>
                </div>
              </div>
              <div className="w-full sm:w-auto sm:self-center mt-2 sm:mt-0 text-left sm:text-right">
                <Badge className={`px-4 py-2 font-black text-xs tracking-widest uppercase rounded-xl shadow-sm inline-block text-center w-full sm:w-auto ${jobsThisMonth < jobPostLimit ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100' : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'}`}>
                  {jobsThisMonth < jobPostLimit ? `${jobPostLimit - jobsThisMonth} Slots Left` : 'Limit Reached'}
                </Badge>
              </div>
            </motion.div>

            {/* Quick Referral Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="lg:col-span-1 flex flex-col sm:flex-row lg:flex-col gap-4 h-full justify-center"
            >
              <Link href="/referrals/post" className="flex-1">
                <Button className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm tracking-wide shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  <PlusCircle className="w-5 h-5" /> Post New Referral Opportunity
                </Button>
              </Link>
              <Link href="/referrals/active" className="flex-1">
                <Button variant="outline" className="w-full h-14 bg-white hover:bg-slate-50 text-slate-800 border-slate-200 rounded-2xl font-black text-sm tracking-wide shadow-sm transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" /> Manage {referralJobs.length} Active Postings
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* ── ROW 3: Balanced Split Content (Milestones & Activity vs Leaderboard) ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            {/* Left Column: Milestones + Recent Activity */}
            <motion.div 
              className="xl:col-span-2 space-y-8"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {/* Milestone Cards Header */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Milestone Achievement Tracker</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">Unlock XP bonuses and exclusive badges as candidates progress through recruitment.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {MILESTONE_CATEGORIES.map((m, i) => {
                  const emp = user as any;
                  const current = emp?.[m.key] || 0;
                  const activeTierIndex = m.tiers.findIndex(t => current < t.target);
                  const isAllCompleted = activeTierIndex === -1;
                  const activeTier = isAllCompleted ? m.tiers[m.tiers.length - 1] : m.tiers[activeTierIndex];
                  const target = activeTier.target;
                  const reward = activeTier.reward;
                  const progress = Math.min((current / target) * 100, 100);
                  const isCurrentAchieved = current >= target;

                  return (
                    <Card key={m.id} className="border border-slate-100/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group bg-white rounded-3xl p-6 flex flex-col justify-between">
                       <div>
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isCurrentAchieved ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                              <m.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1 truncate">{m.label}</p>
                              <span className="text-2xl font-black text-slate-900 tracking-tight">{current} <span className="text-sm text-slate-400 font-extrabold">/ {target}</span></span>
                            </div>
                          </div>
                          <Badge variant="outline" className={`text-[10px] uppercase font-black px-2.5 py-1 border-none shadow-sm mb-4 inline-block ${isAllCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-700'}`}>
                             {isAllCompleted ? 'All Unlocked 👑' : reward}
                          </Badge>
                       </div>
                       <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50 shadow-inner mt-auto">
                         <div className={`h-full rounded-full relative overflow-hidden ${isAllCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-violet-600'}`} style={{ width: `${progress}%` }} />
                       </div>
                    </Card>
                  )
                })}
              </div>

              {/* Recent Activity Feed */}
              <Card className="border border-slate-100/80 shadow-md rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md">
                <CardHeader className="border-b border-slate-100/60 pb-5 px-8 pt-8 bg-slate-50/50">
                   <CardTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                      <Zap className="w-5.5 h-5.5 text-amber-500 fill-amber-500/20 animate-pulse" />
                      Recent Activity Stream
                   </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-3 pt-2">
                   <div className="divide-y divide-slate-100/80">
                      {(() => {
                          const cleanMessage = (msg: string) => msg.replace(/\[APP_ID:[^\]]+\]\s*/, '');
                          return recentActivity.map((act) => (
                          <div key={act.id} className="px-8 py-5 hover:bg-slate-50/80 transition-colors group">
                              <div className="flex items-start gap-4">
                                  <div className={cn(
                                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110",
                                      act.type === 'xp_award' ? "bg-amber-50 text-amber-600 border border-amber-200/80" : 
                                      act.type === 'verification_success' ? "bg-emerald-50 text-emerald-600 border border-emerald-200/80" : 
                                      act.message.includes('[APP_ID:') ? "bg-indigo-50 text-indigo-600 border border-indigo-200/80" :
                                      "bg-slate-50 text-slate-500 border border-slate-200/80"
                                  )}>
                                      {act.type === 'xp_award' ? <Zap className="w-6 h-6" /> : 
                                       act.type === 'milestone_reward' ? <Trophy className="w-6 h-6" /> : 
                                       act.message.includes('[APP_ID:') ? <MessageSquareQuote className="w-6 h-6" /> :
                                       <Info className="w-6 h-6" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <p className="text-sm font-extrabold text-slate-900 leading-relaxed mb-1 group-hover:text-indigo-600 transition-colors">{cleanMessage(act.message)}</p>
                                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block">
                                          {format(new Date(act.timestamp), 'MMM d, h:mm a')}
                                      </span>
                                  </div>
                              </div>
                          </div>
                      ))})()}
                      {recentActivity.length === 0 && (
                          <div className="p-10 text-center bg-slate-50/50 m-6 rounded-2xl border border-dashed border-slate-200">
                              <p className="text-sm font-bold text-slate-400">No recent activity recorded.</p>
                          </div>
                      )}
                   </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column: Leaderboard + Trophy Banner */}
            <motion.div 
              className="xl:col-span-1 space-y-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <EmployeeLeaderboard />
              
              <Card className="border-none bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-2xl shadow-indigo-500/30 overflow-hidden relative group rounded-3xl">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500 pointer-events-none" />
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700 pointer-events-none" />
                <CardContent className="p-8 sm:p-9 relative z-10">
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-inner">
                      <Trophy className="w-7 h-7 text-white animate-bounce" />
                    </div>
                    <h4 className="font-black text-2xl tracking-tight">Unlock Your Potential</h4>
                  </div>
                  <p className="text-indigo-100 text-sm mb-8 leading-relaxed font-semibold">
                    Accelerate recruitment while earning guaranteed incentives. Post genuine employee referral jobs and climb the global leaderboards today.
                  </p>
                  <Link href="/referrals/post">
                    <Button className="w-full bg-white text-indigo-700 hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all font-black border-none rounded-2xl text-sm h-14 tracking-wide shadow-xl shadow-indigo-950/20">
                       Post New Referral Opportunity
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
    </div>
  );
}
