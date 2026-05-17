
"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Job } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import {
  PlusCircle, MoreHorizontal, Edit, Trash2, Share2, Users,
  CalendarDays, TrendingUp, AlertTriangle, Briefcase, CheckCircle2,
  Trophy, Star, Zap, Award, Wallet, ChevronRight, CheckCircle, Info, MessageSquareQuote,
  Clock
} from "lucide-react";

import { format, startOfMonth } from "date-fns";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { useUser } from "@/contexts/user-context";
import { ShareButton } from "../share-button";
import { motion } from "framer-motion";
import { EmployeeLeaderboard } from "./employee-leaderboard";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { RedemptionHub } from "../rewards/redemption-hub";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  used,
  limit,
  color,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  used: number;
  limit: number;
  color: string;
  delay?: number;
}) {
  const isUnlimited = limit === -1;
  const showLimit = limit > 0;
  const pct = showLimit ? Math.min((used / limit) * 100, 100) : 0;
  const isWarning = showLimit && pct >= 80;
  const isFull = showLimit && pct >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="h-full"
    >
      <Card className="h-full relative overflow-hidden border border-slate-100/60 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <div className={`absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5 ${color}`} />
        <CardContent className="pt-7 pb-6 h-full flex flex-col justify-between relative z-10">
          <div>
            <div className="flex items-start justify-between mb-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} bg-opacity-10 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative`}>
                <div className={`absolute inset-0 ${color} opacity-20 blur-md rounded-full group-hover:opacity-40 transition-opacity`} />
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')} relative z-10`} />
              </div>
              {showLimit && isWarning && (
                <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm ${isFull ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {isFull ? 'Maxed' : 'Low'}
                </div>
              )}
            </div>

            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900 tracking-tighter transition-all group-hover:scale-105 origin-left">
                {used}
              </span>
              {showLimit ? (
                <span className="text-slate-400 text-lg font-bold">/ {limit}</span>
              ) : isUnlimited ? (
                <span className="text-emerald-500 text-xs font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md ml-2">Unlimited</span>
              ) : null}
            </div>
          </div>

          {showLimit && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{Math.round(pct)}% Used</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: delay + 0.2, ease: "circOut" }}
                  className={`h-full rounded-full ${isFull ? 'bg-red-500' : isWarning ? 'bg-amber-400' : color}`}
                />
              </div>
            </div>
          )}
          
          {!showLimit && (
            <div className="mt-6 pt-3 border-t border-slate-50 flex items-center gap-2">
               <div className="relative flex h-2.5 w-2.5">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Updates</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

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
  },
  {
    id: 'interviews',
    label: 'Verified Interviews',
    icon: Zap,
    key: 'interviewsCount',
    tiers: [
      { target: 10, reward: 'Talent Spotter Badge' },
      { target: 25, reward: '25 Interviews (+700 XP)' },
      { target: 50, reward: '50 Interviews (+1500 XP)' },
    ]
  },
  {
    id: 'hires',
    label: 'Successful Hires',
    icon: Trophy,
    key: 'hiresCount',
    tiers: [
      { target: 5, reward: 'Trusted Referrer Badge' },
      { target: 15, reward: '15 Hires (+1500 XP)' },
      { target: 30, reward: '30 Hires (+4000 XP)' },
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────

export default function EmployeeDashboard() {
  const { user } = useUser();
  const [latestNotifId, setLatestNotifId] = useState<number | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const { toast } = useToast();
  const { refreshUser } = useUser();

  // Limits from employee profile (come through user context)
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
        
        // Setup notification polling
        const pollNotifications = async () => {
            try {
                const res = await fetch(`/api/notifications?userId=${user.uuid}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        const newest = data[0];
                        
                        // If this is a new notification we haven't seen this session
                        if (latestNotifId && newest.id > latestNotifId) {
                            // ... toast logic ...
                        }
                        
                        setLatestNotifId(newest.id);
                        setRecentActivity(data.slice(0, 5)); // Keep last 5 for activity feed
                    }
                }
            } catch (err) {
                console.error("Notif poll error:", err);
            }
        };

        const interval = setInterval(pollNotifications, 30000); // 30s polling
        pollNotifications(); // Initial check

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



  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading && referralJobs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border border-slate-100">
              <CardContent className="pt-6 pb-5">
                <Skeleton className="h-10 w-10 rounded-xl mb-4" />
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-1.5 w-full mt-3 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border border-slate-100">
          <CardHeader><Skeleton className="h-7 w-40" /></CardHeader>
          <CardContent>
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2 rounded-lg" />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Derived Stats & Gamification ──────────────────────────────────────────
  const emp = user as any;
  const currentXp = emp?.xp || 0;
  const currentLevel = emp?.level || 1;
  const levelInfo = LEVELS.find(l => l.level === currentLevel) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === currentLevel + 1);
  const xpNeededForNext = levelInfo.max;
  const xpInCurrentLevel = currentXp - (levelInfo.min || 0);
  const xpNeededForLevel = levelInfo.max - (levelInfo.min || 0);
  const xpProgress = Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100);

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-6">
        {/* ── Gamification Header ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Level Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-2"
          >
                <Card className="overflow-hidden border-none shadow-2xl shadow-indigo-100/50 bg-white relative group h-full">
                  {/* Dynamic glow effect based on level color */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${levelInfo.color} opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-700`} />
                  
                  <CardContent className="p-8 relative z-10 h-full flex flex-col justify-center">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`w-24 h-24 rounded-[2rem] bg-gradient-to-br ${levelInfo.color} flex items-center justify-center text-5xl shadow-xl shadow-indigo-200/50 relative overflow-hidden shrink-0`}
                        >
                          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <span className="relative z-10">{levelInfo.badge}</span>
                        </motion.div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                             <Badge className="text-[10px] uppercase font-black tracking-widest py-1 px-3 bg-slate-900 text-white border-none shadow-md shadow-slate-200 hover:bg-slate-800 transition-colors">
                               Level {currentLevel}
                             </Badge>
                             {nextLevel && (
                               <span className="text-[10px] text-slate-500 font-bold bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                 {xpNeededForNext - xpInCurrentLevel} XP to Level {currentLevel + 1}
                               </span>
                             )}
                          </div>
                          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2.5">{levelInfo.name}</h2>
                          
                          {/* Badges Section */}
                          {emp?.badges && emp.badges.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {emp.badges.map((badge: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="bg-amber-50 text-amber-700 border border-amber-100 font-bold px-2 py-1 flex items-center gap-1">
                                  <Award className="w-3.5 h-3.5" />
                                  {badge}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                             {levelInfo.benefits.map((b, i) => (
                               <span key={i} className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1.5">
                                 <CheckCircle className="w-3.5 h-3.5 text-indigo-500" /> {b}
                               </span>
                             ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 max-w-md w-full bg-slate-50 p-5 rounded-3xl border border-slate-100/60 shadow-inner">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-500" /> Progression
                          </span>
                          <span className="text-sm font-black text-indigo-700 bg-indigo-100/50 px-2.5 py-0.5 rounded-md">{xpInCurrentLevel} / {xpNeededForNext} XP</span>
                        </div>
                        <div className="h-4 bg-slate-200/50 rounded-full overflow-hidden p-0.5 border border-white/50 backdrop-blur-md">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${xpProgress}%` }}
                             transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
                             className={`h-full rounded-full bg-gradient-to-r ${levelInfo.color} shadow-[0_0_15px_rgba(0,0,0,0.2)] relative overflow-hidden`}
                          >
                             <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Reward Wallet */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                className="h-full"
              >
                <Card className="h-full border border-slate-800/60 shadow-2xl shadow-emerald-900/20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden group">
                  {/* Decorative modern mesh/orb effect */}
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] group-hover:bg-emerald-400/30 transition-colors duration-700" />
                  <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px]" />
                  
                  <div className="absolute right-4 top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110 group-hover:rotate-12">
                    <Wallet className="w-32 h-32" />
                  </div>

                  <CardContent className="p-8 h-full flex flex-col justify-between relative z-10">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-inner">
                          <Wallet className="w-6 h-6 text-emerald-400" />
                        </div>
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-3 py-1 font-bold">Wallet</Badge>
                      </div>

                      <div className="flex flex-col mb-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Available Balance</span>
                      </div>
                      
                      <div className="flex items-start gap-1">
                        <span className="text-2xl font-bold text-slate-400 mt-2">₹</span>
                        <span className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400 drop-shadow-sm">
                          {emp?.rewardsBalance?.toLocaleString() || 0}
                        </span>
                      </div>

                      {/* Pending Rewards Indication */}
                      {emp?.pendingRewards > 0 && (
                        <div className="mt-4 flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm group/pending">
                          <div className="flex items-center gap-2">
                             <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Pending Review</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">₹{emp.pendingRewards.toLocaleString()}</span>
                            <Dialog>
                                <DialogTrigger>
                                    <Info className="w-3.5 h-3.5 text-slate-500 hover:text-white transition-colors cursor-help" />
                                </DialogTrigger>
                                <DialogContent className="bg-slate-900 text-white border-slate-800">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-amber-400" />
                                            Rewards Under Review
                                        </DialogTitle>
                                        <DialogDescription className="text-slate-400 pt-2">
                                            To prevent fraud, some rewards are held for manual review if your Trust Score is below 60.
                                            <br /><br />
                                            <span className="text-white font-bold">Your Current Trust Score: {emp.trustScore || 50}</span>
                                            <br /><br />
                                            Improve your score by referring genuine candidates who successfully complete interviews and join companies.
                                        </DialogDescription>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-8">
                        {/* Redemption Hub - Responsive behavior */}
                        {isMobile ? (
                            <Button 
                                onClick={() => router.push('/rewards/redeem')}
                                className="group/btn relative w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-2xl font-black text-sm transition-all shadow-xl shadow-emerald-200 overflow-hidden active:scale-[0.98]"
                            >
                                <span className="relative z-10 flex items-center justify-center uppercase tracking-wider">
                                    Redeem Rewards 
                                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </motion.div>
                                </span>
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] translate-x-[-100%] group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                            </Button>
                        ) : (
                            <Dialog open={isRedeemOpen} onOpenChange={setIsRedeemOpen}>
                                <DialogTrigger asChild>
                                    <Button className="group/btn relative w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-2xl font-black text-sm transition-all shadow-xl shadow-emerald-200 overflow-hidden">
                                        <span className="relative z-10 flex items-center justify-center uppercase tracking-wider">
                                            Redeem Rewards 
                                            <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </motion.div>
                                        </span>
                                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] translate-x-[-100%] group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-[2rem] p-0 flex flex-col max-h-[90vh] overflow-hidden">
                                    <RedemptionHub user={emp} refreshUser={refreshUser} />
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

        {/* ── Milestone Progress ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
               <motion.div
                 key={m.id}
                 initial={{ opacity: 0, scale: 0.95, y: 10 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 transition={{ delay: 0.2 + (i * 0.1), ease: "easeOut", duration: 0.4 }}
               >
                 <Card className="border border-slate-100/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group bg-white">
                    <CardContent className="p-5 relative z-10">
                       <div className="flex items-center gap-4 mb-4">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${isCurrentAchieved ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                           <m.icon className="w-5 h-5" />
                         </div>
                         <div className="flex-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{m.label}</p>
                           <div className="flex items-center justify-between mt-0.5">
                             <span className="text-lg font-black text-slate-900 tracking-tight">{current} <span className="text-xs text-slate-300 font-bold">/ {target}</span></span>
                             <Badge variant="outline" className={`text-[9px] uppercase font-black px-2 py-0.5 border-none shadow-sm ${isAllCompleted ? 'bg-emerald-50 text-emerald-600 font-black' : (activeTierIndex > 0 ? 'bg-blue-50 text-blue-600 font-bold' : 'bg-indigo-50 text-indigo-600 font-bold')}`}>
                                {isAllCompleted ? 'All Unlocked 👑' : (activeTierIndex > 0 ? `Tier ${activeTierIndex} Unlocked` : reward)}
                             </Badge>
                           </div>
                         </div>
                       </div>
                       <div className="h-2 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100/50">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${progress}%` }}
                           transition={{ duration: 1.2, ease: "circOut", delay: 0.4 + (i * 0.1) }}
                           className={`h-full rounded-full relative overflow-hidden ${isAllCompleted ? 'bg-emerald-500' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]'}`}
                         >
                            {isCurrentAchieved && <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />}
                         </motion.div>
                       </div>
                    </CardContent>
                 </Card>
               </motion.div>
             )
           })}
        </div>

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        {(() => {
          const totalSelected = referralJobs.reduce((s, j) => s + (j.selectedApplicantCount || 0), 0);
          const totalReferred = referralJobs.reduce((s, j) => s + (j.referredApplicantCount || 0), 0);
          const totalApplicants = referralJobs.reduce((s, j) => s + (j.applicantCount || 0), 0);
          
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Briefcase}
                label="Jobs Posted"
                used={jobsThisMonth}
                limit={jobPostLimit}
                color="bg-indigo-500"
                delay={0}
              />
              <StatCard
                icon={Users}
                label="Total Applications"
                used={totalApplicants}
                limit={0}
                color="bg-blue-500"
                delay={0.1}
              />
              <StatCard
                icon={CheckCircle2}
                label="Referred"
                used={totalReferred}
                limit={0}
                color="bg-violet-500"
                delay={0.2}
              />
              <StatCard
                icon={Star}
                label="Trust Score"
                used={(user as any)?.trustScore || 100}
                limit={0}
                color="bg-amber-500"
                delay={0.3}
              />
            </div>
          );
        })()}

        {/* ── Monthly limit notice ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="flex items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 via-white to-white border border-indigo-100 rounded-2xl px-6 py-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100/50 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-slate-900 font-bold text-sm tracking-tight">Monthly Job Limit</span>
                {(user as any)?.nextJobsResetAt && (
                  <Badge variant="outline" className="text-[10px] bg-white border-slate-200 text-slate-600 font-bold">
                    Resets {format(new Date((user as any).nextJobsResetAt), 'MMM d, yyyy')}
                  </Badge>
                )}
              </div>
              <span className="text-slate-500 text-xs font-medium mt-0.5">
                You have used <strong className="text-indigo-600 font-black">{jobsThisMonth}</strong> out of <strong className="text-slate-800 font-black">{jobPostLimit}</strong> posts.
              </span>
            </div>
          </div>
          <div className="text-right">
            <Badge className={`px-3 py-1 font-black text-[10px] tracking-widest uppercase ${jobsThisMonth < jobPostLimit ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none' : 'bg-red-50 text-red-600 hover:bg-red-100 border-none'}`}>
              {jobsThisMonth < jobPostLimit ? `${jobPostLimit - jobsThisMonth} Remaining` : 'Limit Reached'}
            </Badge>
          </div>
        </motion.div>

        {/* ── Jobs & Leaderboard ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <motion.div 
            className="xl:col-span-3 space-y-6"
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.35, ease: "easeOut", duration: 0.4 }}
          >
            <Card className="border border-slate-100/60 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-5 px-7 pt-7">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Referral Management</CardTitle>
                  <CardDescription className="text-slate-400 text-sm font-semibold mt-1">
                    Quickly access your active jobs and track your referral success.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/referrals/active" className="group/nav flex items-center gap-4 p-6 rounded-2xl bg-indigo-50 hover:bg-indigo-600 transition-all duration-300">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm group-hover/nav:scale-110 transition-transform">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-base font-black text-slate-900 group-hover/nav:text-white transition-colors">Manage Active Jobs</p>
                            <p className="text-xs font-bold text-slate-500 group-hover/nav:text-indigo-100 transition-colors">View and edit your {referralJobs.length} active postings</p>
                        </div>
                        <ChevronRight className="w-5 h-5 ml-auto text-indigo-300 group-hover/nav:text-white group-hover/nav:translate-x-1 transition-all" />
                    </Link>
                    
                    <Link href="/referrals/post" className="group/nav flex items-center gap-4 p-6 rounded-2xl bg-emerald-50 hover:bg-emerald-600 transition-all duration-300">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm group-hover/nav:scale-110 transition-transform">
                            <PlusCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-base font-black text-slate-900 group-hover/nav:text-white transition-colors">Post New Referral</p>
                            <p className="text-xs font-bold text-slate-500 group-hover/nav:text-emerald-100 transition-colors">Add a new job opportunity</p>
                        </div>
                        <ChevronRight className="w-5 h-5 ml-auto text-emerald-300 group-hover/nav:text-white group-hover/nav:translate-x-1 transition-all" />
                    </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            className="xl:col-span-1 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, ease: "easeOut", duration: 0.4 }}
          >
            <EmployeeLeaderboard />

            {/* Recent Activity Feed */}
            <Card className="border border-slate-100/60 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
              <CardHeader className="border-b border-slate-50 pb-4 px-6 pt-6">
                 <CardTitle className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                    Recent Activity
                 </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-2">
                 <div className="divide-y divide-slate-50">
                    {(() => {
                        const cleanMessage = (msg: string) => msg.replace(/\[APP_ID:[^\]]+\]\s*/, '');
                        return recentActivity.map((act, i) => (
                        <div key={act.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                            <div className="flex gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                    act.type === 'xp_award' ? "bg-amber-50 text-amber-600 border border-amber-100/50" : 
                                    act.type === 'verification_success' ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50" : 
                                    act.message.includes('[APP_ID:') ? "bg-indigo-50 text-indigo-600 border border-indigo-100/50" :
                                    "bg-slate-50 text-slate-400 border border-slate-100/50"
                                )}>
                                    {act.type === 'xp_award' ? <Zap className="w-5 h-5" /> : 
                                     act.type === 'milestone_reward' ? <Trophy className="w-5 h-5" /> : 
                                     act.message.includes('[APP_ID:') ? <MessageSquareQuote className="w-5 h-5" /> :
                                     <Info className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-slate-900 leading-snug mb-1 group-hover:text-indigo-600 transition-colors">{cleanMessage(act.message)}</p>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                                        {format(new Date(act.timestamp), 'MMM d, h:mm a')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))})()}
                    {recentActivity.length === 0 && (
                        <div className="p-8 text-center bg-slate-50/30 m-4 rounded-xl border border-dashed border-slate-200">
                            <p className="text-sm font-semibold text-slate-400">No recent activity.</p>
                        </div>
                    )}
                 </div>
              </CardContent>
            </Card>
            
            <Card className="border-none bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-200 overflow-hidden relative group">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
              <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-700" />
              <CardContent className="p-7 relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-black text-lg tracking-tight">Next Milestone</h4>
                </div>
                <p className="text-indigo-100 text-sm mb-6 leading-relaxed font-medium">Keep up the great work! Your next reward is just around the corner. Post jobs and refer friends to earn more coins.</p>
                <Link href="/jobs">
                  <Button className="w-full bg-white text-indigo-700 hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all font-black border-none rounded-xl text-xs h-11 tracking-wide shadow-lg shadow-black/10">
                     Find Matching Jobs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
