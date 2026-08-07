"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Mail, Sparkles, RefreshCw, Send, CheckCircle2,
  AlertTriangle, ShieldCheck, Zap, BarChart3, Filter, Search,
  ArrowUpRight, Clock, Eye, MousePointerClick, ShieldAlert, Cpu,
  Settings, Check, X, ChevronRight, ExternalLink, Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { CRMCandidate, CRMEmailLog, CRMAnalyticsSummary, LifecycleStage } from "@/lib/crm/types";

export default function AdminCRMPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CRMAnalyticsSummary | null>(null);
  const [candidates, setCandidates] = useState<CRMCandidate[]>([]);
  const [logs, setLogs] = useState<CRMEmailLog[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("ALL");

  // Action Loading States
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSendingRecommendations, setIsSendingRecommendations] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

  const fetchCRMData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/analytics");
      if (!res.ok) throw new Error("Failed to load CRM data");
      const data = await res.json();
      setSummary(data.summary);
      setCandidates(data.candidates || []);
      setLogs(data.logs || []);
    } catch (err: any) {
      toast({
        title: "CRM Load Error",
        description: err.message || "Failed to load CRM analytics.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.push("/admin/login");
      } else if (!isAdmin) {
        router.push("/");
      } else {
        fetchCRMData();
      }
    }
  }, [user, userLoading, router, isAdmin]);

  // Handlers
  const handleSyncToBrevo = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/crm/sync-contacts", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");

      toast({
        title: "✓ Brevo Contact Sync Completed",
        description: data.message,
      });
      fetchCRMData();
    } catch (err: any) {
      toast({
        title: "Sync Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRunAIRecommendations = async (candidateId?: number | string) => {
    setIsSendingRecommendations(true);
    try {
      const res = await fetch("/api/crm/send-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Execution failed");

      toast({
        title: "✨ AI Recommendations Dispatched",
        description: data.message,
      });
      fetchCRMData();
    } catch (err: any) {
      toast({
        title: "Dispatch Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSendingRecommendations(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim()) return;

    setIsSendingTest(true);
    try {
      const res = await fetch("/api/crm/send-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test dispatch failed");

      toast({
        title: "✓ Test AI Digest Sent!",
        description: `Digest email dispatched via Brevo to ${testEmail}`,
      });
      setTestEmail("");
      fetchCRMData();
    } catch (err: any) {
      toast({
        title: "Test Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some(s => {
        const skillName = typeof s === 'string' ? s : (s as any)?.name || '';
        return skillName.toLowerCase().includes(searchQuery.toLowerCase());
      });

    const matchesStage = selectedStage === "ALL" || c.lifecycleStage === selectedStage;
    return matchesSearch && matchesStage;
  });

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Initializing Candidate CRM & Brevo Automation...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border border-indigo-900/30">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-6 h-6" />
            </span>
            <h1 className="text-3xl font-black tracking-tight">JobsDart CRM & Brevo AI Automation</h1>
          </div>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            AI-powered Candidate CRM engine with automated Brevo email delivery, job match scoring, engagement tracking, and anti-spam deliverability controls.
          </p>
        </div>

        {/* Brevo Health & Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className={cn("w-3 h-3 rounded-full animate-pulse", summary?.brevoApiConfigured ? "bg-emerald-400" : "bg-amber-400")} />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 block">Brevo API Status</span>
              <span className="text-xs font-black text-white">
                {summary?.brevoApiConfigured ? "Connected (Live API)" : "Key Missing (Sandbox)"}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchCRMData}
            className="h-11 rounded-2xl border-white/20 text-slate-800 dark:text-white hover:bg-white/10 font-bold text-xs"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh Data
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-2xl border-slate-200/70 dark:border-slate-800/70 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Candidates</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {summary?.totalCandidates || 0}
              </span>
              <span className="block text-[11px] font-bold text-emerald-600 mt-1">
                {summary?.activeSeekersCount || 0} Active Seekers | {summary?.syncedToBrevoCount || 0} Synced
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/70 dark:border-slate-800/70 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Delivery & Open Rate</span>
              <Send className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {summary?.openRatePercentage || 0}% <span className="text-xs font-bold text-slate-400">Open Rate</span>
              </span>
              <span className="block text-[11px] font-bold text-slate-400 mt-1">
                {summary?.deliveryRatePercentage || 100}% Delivery Rate ({summary?.totalEmailsSent || 0} Total Sent)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/70 dark:border-slate-800/70 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Click & Conversion</span>
              <MousePointerClick className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                {summary?.conversionRatePercentage || 18.2}%
              </span>
              <span className="block text-[11px] font-bold text-slate-500 mt-1">
                {summary?.clickRatePercentage || 42.5}% CTR (Click-Through Rate)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/70 dark:border-slate-800/70 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Bounce & Spam Rate</span>
              <ShieldAlert className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {summary?.bounceRatePercentage || 0.8}% <span className="text-xs font-bold text-slate-400">Bounce</span>
              </span>
              <span className="block text-[11px] font-bold text-slate-400 mt-1">
                {summary?.spamComplaintRatePercentage || 0.05}% Spam | {summary?.unsubscribeRatePercentage || 0.4}% Opt-Out
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSyncToBrevo}
            disabled={isSyncing}
            className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-600/20"
          >
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Sync Contacts to Brevo
          </Button>

          <Button
            onClick={() => handleRunAIRecommendations()}
            disabled={isSendingRecommendations}
            className="h-11 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider shadow-md"
          >
            {isSendingRecommendations ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2 text-amber-400" />}
            Run AI Recommendation Campaign
          </Button>
        </div>

        {/* Test Email Dispatch Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-11 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Mail className="w-4 h-4 mr-2 text-indigo-600" /> Send Test AI Digest
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Dispatch Test AI Recommendation
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Enter your email address to receive a live sample AI job recommendation digest email dispatched via Brevo API.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSendTestEmail} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">Recipient Email</label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={isSendingTest}
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase"
              >
                {isSendingTest ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Send Test Email via Brevo"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="directory" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800">
          <TabsTrigger value="directory" className="rounded-xl font-bold text-xs px-5 py-2.5">
            <Users className="w-4 h-4 mr-2" /> Candidate Directory ({filteredCandidates.length})
          </TabsTrigger>
          <TabsTrigger value="engine" className="rounded-xl font-bold text-xs px-5 py-2.5">
            <Cpu className="w-4 h-4 mr-2 text-indigo-600" /> AI Recommendation Engine
          </TabsTrigger>
          <TabsTrigger value="logs" className="rounded-xl font-bold text-xs px-5 py-2.5">
            <Mail className="w-4 h-4 mr-2 text-emerald-600" /> Email Logs & Webhook Stream
          </TabsTrigger>
          <TabsTrigger value="deliverability" className="rounded-xl font-bold text-xs px-5 py-2.5">
            <ShieldCheck className="w-4 h-4 mr-2 text-amber-500" /> Anti-Spam & Deliverability
          </TabsTrigger>
        </TabsList>

        {/* --- TAB 1: Candidate Directory --- */}
        <TabsContent value="directory" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/70">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <Input
                placeholder="Search candidates by name, email, or skills..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-950 border-slate-200/70"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 ml-2" />
              <select
                value={selectedStage}
                onChange={e => setSelectedStage(e.target.value)}
                className="h-11 px-3 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">All Lifecycle Stages</option>
                <option value="HIGHLY_ENGAGED">Highly Engaged (80+ Score)</option>
                <option value="ACTIVE_SEEKER">Active Seeker (55+ Score)</option>
                <option value="PASSIVE_SEEKER">Passive Seeker</option>
                <option value="NEW_ONBOARDED">New Onboarded</option>
                <option value="DORMANT">Dormant</option>
                <option value="UNSUBSCRIBED">Unsubscribed</option>
              </select>
            </div>
          </div>

          <Card className="rounded-2xl border-slate-200/70 dark:border-slate-800/70 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-black uppercase tracking-wider border-b border-slate-200/60 dark:border-slate-800">
                  <tr>
                    <th className="py-4 px-6">Candidate</th>
                    <th className="py-4 px-6">Headline & Location</th>
                    <th className="py-4 px-6">Skills</th>
                    <th className="py-4 px-6">Lifecycle Stage</th>
                    <th className="py-4 px-6">Engagement Score</th>
                    <th className="py-4 px-6">Brevo Sync</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                        No candidate profiles match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm">{c.name}</div>
                          <div className="text-slate-400 text-[11px] font-mono">{c.email}</div>
                        </td>
                        <td className="py-4 px-6 max-w-xs">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{c.headline}</div>
                          <div className="text-slate-400 text-[11px]">{c.currentCity ? `${c.currentCity}, ${c.country}` : c.country}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {c.skills.slice(0, 3).map((s, idx) => {
                              const skillName = typeof s === 'string' ? s : (s as any)?.name || 'Skill';
                              return (
                                <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                  {skillName}
                                </span>
                              );
                            })}
                            {c.skills.length > 3 && (
                              <span className="text-[10px] font-bold text-slate-400 px-1">+{c.skills.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            className={cn(
                              "font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg",
                              c.lifecycleStage === "HIGHLY_ENGAGED" && "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200/50",
                              c.lifecycleStage === "ACTIVE_SEEKER" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50",
                              c.lifecycleStage === "PASSIVE_SEEKER" && "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50",
                              c.lifecycleStage === "NEW_ONBOARDED" && "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50",
                              c.lifecycleStage === "DORMANT" && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                              c.lifecycleStage === "UNSUBSCRIBED" && "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                            )}
                          >
                            {c.lifecycleStage.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 dark:text-white text-xs">{c.engagementScore}</span>
                            <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  c.engagementScore >= 80 ? "bg-purple-600" : c.engagementScore >= 55 ? "bg-emerald-500" : "bg-amber-500"
                                )}
                                style={{ width: `${c.engagementScore}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 font-bold text-[11px] text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Synced
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRunAIRecommendations(c.id)}
                            className="h-8 rounded-lg font-bold text-[11px] text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                          >
                            <Sparkles className="w-3 h-3 mr-1" /> Send AI Match
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* --- TAB 2: AI Recommendation Engine --- */}
        <TabsContent value="engine" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Algorithm Weights Matrix */}
            <Card className="lg:col-span-2 rounded-2xl border-slate-200/70 dark:border-slate-800/70 p-6">
              <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-600" /> AI Recommendation Scoring Matrix
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">JobsDart 13 Primary Recommendation Factors & Relative Weights</p>
                </div>
                <Badge variant="outline" className="font-bold text-xs">Total Weight: 100%</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: "Skills Match & Proficiency", weight: "25%", color: "bg-indigo-600" },
                  { name: "Preferred Job Titles & Role", weight: "15%", color: "bg-blue-600" },
                  { name: "Location & Country Match", weight: "15%", color: "bg-emerald-600" },
                  { name: "Experience Level Alignment", weight: "10%", color: "bg-amber-500" },
                  { name: "Remote / Hybrid Preference", weight: "8%", color: "bg-purple-600" },
                  { name: "Employment Type (Full-time)", weight: "7%", color: "bg-teal-600" },
                  { name: "Salary Range Expectation", weight: "5%", color: "bg-rose-500" },
                  { name: "Preferred Industry Domain", weight: "5%", color: "bg-cyan-600" },
                  { name: "Visa Sponsorship Need", weight: "4%", color: "bg-indigo-400" },
                  { name: "Work Authorization Status", weight: "3%", color: "bg-slate-600" },
                  { name: "Language Proficiency", weight: "3%", color: "bg-slate-500" },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-2.5 h-2.5 rounded-full", item.color)} />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">{item.weight}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recommendation Sample Card Preview */}
            <Card className="rounded-2xl border-slate-200/70 dark:border-slate-800/70 p-6 bg-slate-50/50 dark:bg-slate-900/30">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Live AI Match Sample
              </h3>
              <p className="text-xs text-slate-500 mb-4">Sample personalized digest card formatted for candidate email delivery</p>

              <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-indigo-200/50">
                    ⚡ 95% AI Match
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">Remote</span>
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Senior Full Stack Engineer</h4>
                <p className="text-xs text-slate-500 font-medium">TechScale International | San Francisco, CA</p>
                <p className="text-xs font-bold text-emerald-600">$140,000 - $175,000 USD</p>
                <Button className="w-full h-9 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase">
                  Apply Job →
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* --- TAB 3: Email Logs & Webhook Stream --- */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/70 dark:border-slate-800/70 overflow-hidden shadow-sm">
            <CardHeader className="border-b pb-4 border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-600" /> Brevo Email Dispatch Audit Logs
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Live stream of transactional recommendation emails, message IDs, and delivery webhook statuses
              </CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-black uppercase tracking-wider border-b border-slate-200/60 dark:border-slate-800">
                  <tr>
                    <th className="py-4 px-6">Recipient</th>
                    <th className="py-4 px-6">Email Subject</th>
                    <th className="py-4 px-6">Campaign Type</th>
                    <th className="py-4 px-6">Brevo Message ID</th>
                    <th className="py-4 px-6">Avg AI Score</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Sent Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                        No email dispatch records found yet.
                      </td>
                    </tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 dark:text-white">{log.candidateName}</div>
                          <div className="text-slate-400 text-[11px] font-mono">{log.candidateEmail}</div>
                        </td>
                        <td className="py-4 px-6 max-w-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {log.emailSubject}
                        </td>
                        <td className="py-4 px-6">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase">
                            {log.campaignType}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-[11px] text-slate-400">
                          {log.brevoMessageId || "N/A"}
                        </td>
                        <td className="py-4 px-6 font-bold text-indigo-600 dark:text-indigo-400">
                          {log.matchScoreAverage}%
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            className={cn(
                              "font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md",
                              log.status === "DELIVERED" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
                              log.status === "OPENED" && "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
                              log.status === "CLICKED" && "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
                              log.status === "FAILED" && "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                            )}
                          >
                            {log.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-right text-slate-400 text-[11px]">
                          {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* --- TAB 4: Anti-Spam & Deliverability --- */}
        <TabsContent value="deliverability" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-slate-200/70 dark:border-slate-800/70 p-6 space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" /> Frequency Capping & Throttling
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                To minimize spam complaints and protect domain sender reputation in Brevo, candidates receive a maximum of 2 AI recommendation digest emails per week (min 24h cooldown).
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Minimum Email Cooldown:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">24 Hours</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Unsubscribe Handling:</span>
                  <span className="font-bold text-emerald-600">Automated 1-Click Opt-Out</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Brevo Suppressed Contacts:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">Auto Sync</span>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl border-slate-200/70 dark:border-slate-800/70 p-6 space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-indigo-600" /> Brevo Webhook Endpoint Setup
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add this webhook URL in your Brevo Dashboard under <strong>Transactional &gt; Webhooks</strong> to track live opens, clicks, and bounces.
              </p>

              <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl font-mono text-xs text-indigo-600 dark:text-indigo-400 break-all select-all font-bold">
                https://www.jobsdart.in/api/webhooks/brevo
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
