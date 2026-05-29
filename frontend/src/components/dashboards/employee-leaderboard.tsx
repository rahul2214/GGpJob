
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Crown, Star, TrendingUp, Users, Zap, CheckCircle, ShieldCheck, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  uuid: string;
  name: string;
  company_name: string;
  xp: number;
  level: number;
  designation?: string;
  company_logo?: string;
  rank: number;
  trust_score: number;
  success_rate: number;
  verified_referrals_count: number;
  avg_response_time?: number | null;
}

type SortMode = 'xp' | 'success' | 'trust' | 'speed';
type PeriodMode = 'all' | 'monthly';

export function EmployeeLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('xp');
  const [periodMode, setPeriodMode] = useState<PeriodMode>('all');

  const fetchLeaderboard = async (sort: SortMode, period: PeriodMode) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/leaderboard?sortBy=${sort}&period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(sortMode, periodMode);
  }, [sortMode, periodMode]);

const formatResponseTime = (seconds: number | null | undefined) => {
  if (seconds === null || seconds === undefined) return "N/A";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    const remSeconds = seconds % 60;
    return remSeconds > 0 ? `${minutes}m ${remSeconds}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (hours < 24) {
    return remMinutes > 0 ? `${hours}h ${remMinutes}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
};

  const getMetricDisplay = (entry: LeaderboardEntry) => {
    switch (sortMode) {
      case 'xp':
        return (
          <div className="text-right">
            <div className="flex items-center justify-end gap-1">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="text-sm font-black text-slate-900">{entry.xp}</span>
            </div>
            <Badge variant="secondary" className="text-[9px] uppercase font-bold bg-slate-100 text-slate-600 px-1.5 h-4">
                Lvl {entry.level}
            </Badge>
          </div>
        );
      case 'success':
        return (
          <div className="text-right">
            <div className="text-sm font-black text-emerald-600">{entry.success_rate}%</div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                {entry.verified_referrals_count} verified
            </div>
          </div>
        );
      case 'trust':
        return (
          <div className="text-right">
            <div className="text-sm font-black text-indigo-600">{entry.trust_score}</div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Trust Score</div>
          </div>
        );
      case 'speed':
        return (
          <div className="text-right">
            <div className="text-sm font-black text-indigo-600">{formatResponseTime(entry.avg_response_time)}</div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Avg Speed</div>
          </div>
        );
    }
  };

  if (loading && entries.length === 0) {
    return (
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-md overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-2 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-500" />
              Leaderboard
            </CardTitle>
            <CardDescription className="font-medium text-slate-500">Compete with the best</CardDescription>
          </div>
          <div className="flex items-center">
            <Badge variant="outline" className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-black bg-indigo-50 text-indigo-600 border-none">
               <TrendingUp className="w-3 h-3 mr-1.5" /> All-Time Legends
            </Badge>
          </div>
        </div>

        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl w-full">
            {[
                { id: 'xp', label: 'Top XP', icon: Zap },
                { id: 'success', label: 'High Success', icon: CheckCircle },
                { id: 'trust', label: 'Most Trusted', icon: ShieldCheck },
                { id: 'speed', label: 'Fastest Response', icon: Clock }
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setSortMode(tab.id as SortMode)}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black transition-all",
                        sortMode === tab.id 
                            ? "bg-white text-indigo-600 shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <tab.icon className={cn("w-3.5 h-3.5", sortMode === tab.id ? "text-indigo-600" : "text-slate-400")} />
                    {tab.label}
                </button>
            ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className={cn("divide-y divide-slate-50", loading && "opacity-50 pointer-events-none")}>
          <AnimatePresence mode="popLayout">
            {entries.map((entry, index) => {
              const isTop3 = entry.rank <= 3;
              const rankColor = 
                entry.rank === 1 ? "text-amber-500" : 
                entry.rank === 2 ? "text-slate-400" : 
                entry.rank === 3 ? "text-amber-700" : "text-slate-400";
              
              const rankBg = 
                entry.rank === 1 ? "bg-amber-100" : 
                entry.rank === 2 ? "bg-slate-100" : 
                entry.rank === 3 ? "bg-orange-50" : "bg-transparent";
 
              return (
                <motion.div
                  key={entry.uuid}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group cursor-default`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${rankBg} ${rankColor}`}>
                    {entry.rank === 1 ? <Crown className="w-4 h-4" /> : entry.rank}
                  </div>
                  
                  <Avatar className="w-10 h-10 border-2 border-white shadow-sm flex-shrink-0">
                    <AvatarImage src={entry.company_logo} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 font-black text-xs">
                      {entry.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
 
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                       <h4 className="font-bold text-slate-900 truncate text-sm">{entry.name}</h4>
                       {entry.rank === 1 && <Medal className="w-3 h-3 text-amber-500 fill-amber-500" />}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate font-semibold uppercase tracking-tight">{entry.designation || 'Employee'}</p>
                  </div>
 
                  {getMetricDisplay(entry)}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {entries.length === 0 && !loading && (
          <div className="p-12 text-center bg-slate-50/50">
             <Trophy className="w-12 h-12 text-slate-200 mx-auto mb-3" />
             <p className="text-slate-400 text-sm font-bold">Waiting for competitors...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
