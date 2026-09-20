"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import {
  Users, Mail, Sparkles, RefreshCw, Send, CheckCircle2,
  AlertTriangle, ShieldCheck, Filter, Search,
  Eye, ShieldAlert, Cpu,
  ExternalLink, Loader2, Play, BookOpen
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { CRMCandidate, CRMEmailLog, CRMAnalyticsSummary, CampaignType } from "@/lib/crm/types";
import { CAMPAIGN_STRUCTURE_CATALOG, renderCRMTemplate, renderBlogEmailTemplate } from "@/lib/crm/template-engine";
import { filterCandidatesByCampaignType } from "@/lib/crm/candidate-crm";

export interface BlogSummary {
  slug: string;
  heading: string;
  excerpt: string;
  category: string;
  readingMinutes: number;
  publishedAt: string;
}

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
  const [executingCampaignType, setExecutingCampaignType] = useState<string | null>(null);

  // Blog Campaigns State
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string>("");
  const [blogSearchQuery, setBlogSearchQuery] = useState("");
  const [blogCategoryFilter, setBlogCategoryFilter] = useState("ALL");
  const [blogCustomSubject, setBlogCustomSubject] = useState("");
  const [blogTargetStage, setBlogTargetStage] = useState<string>("ALL");
  const [includeRelatedBlogs, setIncludeRelatedBlogs] = useState(true);
  const [blogTestEmail, setBlogTestEmail] = useState("");
  const [isSendingBlogTest, setIsSendingBlogTest] = useState(false);
  const [isLaunchingBlogCampaign, setIsLaunchingBlogCampaign] = useState(false);

  // Template Preview Dialog State
  const [activePreviewTemplate, setActivePreviewTemplate] = useState<{ title: string; html: string } | null>(null);

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

  const fetchBlogs = async () => {
    setBlogsLoading(true);
    try {
      const res = await fetch("/api/crm/blogs");
      if (!res.ok) throw new Error("Failed to load blog articles");
      const data = await res.json();
      const fetched: BlogSummary[] = data.blogs || [];
      setBlogs(fetched);
      if (fetched.length > 0) {
        setSelectedBlogSlug(prev => prev || fetched[0].slug);
        setBlogCustomSubject(prev => prev || `📖 Must-Read: ${fetched[0].heading} | JobsDart Career Insights`);
      }
    } catch (err: any) {
      console.warn("Failed to fetch blogs for CRM:", err);
    } finally {
      setBlogsLoading(false);
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
        fetchBlogs();
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

  const handleExecuteCampaign = async (campaignType: CampaignType) => {
    setExecutingCampaignType(campaignType);
    try {
      const res = await fetch("/api/crm/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Campaign execution failed");

      toast({
        title: "🚀 Campaign Dispatched via Brevo",
        description: data.message,
      });
      fetchCRMData();
    } catch (err: any) {
      toast({
        title: "Campaign Execution Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setExecutingCampaignType(null);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;
    setIsSendingTest(true);
    try {
      const res = await fetch("/api/crm/send-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send test email.");

      toast({
        title: "✓ Test AI Recommendation Sent",
        description: `Dispatched live sample email to ${testEmail}`,
      });
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

  const handlePreviewCampaignTemplate = (templateId: string, label: string) => {
    const sampleCandidate = candidates[0] || {
      id: 'demo',
      uuid: 'demo-uuid',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      role: 'Job Seeker',
      headline: 'Senior Full Stack Engineer',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'],
      currentCity: 'Bengaluru',
      country: 'India',
      preferredJobTitles: ['Senior Engineer'],
      preferredLocations: ['Remote'],
      lifecycleStage: 'HIGHLY_ENGAGED',
      engagementScore: 88,
      brevoSyncStatus: 'SYNCED',
      emailFrequency: 'WEEKLY',
      isUnsubscribed: false,
      totalEmailsSent: 4,
      totalEmailsOpened: 3,
      totalEmailsClicked: 2,
      totalApplicationsSubmitted: 1,
      createdAt: new Date().toISOString(),
    };

    const { subject, htmlContent } = renderCRMTemplate(templateId, sampleCandidate);
    setActivePreviewTemplate({
      title: `${label} — Subject: ${subject}`,
      html: htmlContent,
    });
  };

  // Blog Action Handlers & Calculations
  const selectedBlog = blogs.find(b => b.slug === selectedBlogSlug) || blogs[0] || null;

  const blogCategories = ["ALL", ...Array.from(new Set(blogs.map(b => b.category))).filter(Boolean)];

  const filteredBlogs = blogs.filter(b => {
    const matchesCat = blogCategoryFilter === "ALL" || b.category === blogCategoryFilter;
    const matchesSearch = !blogSearchQuery ||
      b.heading.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
      b.slug.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(blogSearchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getStageCount = (stage: string) => {
    const activeList = candidates.filter(c => !c.isUnsubscribed && c.emailFrequency !== 'PAUSED');
    if (stage === 'ALL') return activeList.length;
    return activeList.filter(c => c.lifecycleStage === stage).length;
  };

  const handleSelectBlog = (b: BlogSummary) => {
    setSelectedBlogSlug(b.slug);
    setBlogCustomSubject(`📖 Must-Read: ${b.heading} | JobsDart Career Insights`);
  };

  const handlePreviewBlogEmail = () => {
    if (!selectedBlog) {
      toast({ title: "No Blog Selected", description: "Please pick a blog article to preview.", variant: "destructive" });
      return;
    }
    const sampleCandidate = candidates[0] || {
      id: 'demo',
      uuid: 'demo-uuid',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      role: 'Job Seeker',
      headline: 'Senior Full Stack Engineer',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
      currentCity: 'Bengaluru',
      country: 'India',
      preferredJobTitles: ['Senior Engineer'],
      preferredLocations: ['Remote'],
      lifecycleStage: 'HIGHLY_ENGAGED',
      engagementScore: 88,
      brevoSyncStatus: 'SYNCED',
      emailFrequency: 'WEEKLY',
      isUnsubscribed: false,
      totalEmailsSent: 4,
      totalEmailsOpened: 3,
      totalEmailsClicked: 2,
      totalApplicationsSubmitted: 1,
      createdAt: new Date().toISOString(),
    };

    const related = includeRelatedBlogs
      ? blogs.filter(b => b.slug !== selectedBlog.slug).slice(0, 2)
      : [];

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://jobsdart.in';

    const { subject, htmlContent } = renderBlogEmailTemplate({
      candidate: sampleCandidate,
      blog: selectedBlog,
      relatedBlogs: related,
      origin,
      customSubject: blogCustomSubject.trim() || undefined,
    });

    setActivePreviewTemplate({
      title: `Blog Campaign Preview: ${subject}`,
      html: htmlContent,
    });
  };

  const handleSendBlogTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlog) {
      toast({ title: "No Blog Selected", description: "Please pick a blog article first.", variant: "destructive" });
      return;
    }
    if (!blogTestEmail || !blogTestEmail.includes("@")) {
      toast({ title: "Invalid Email", description: "Please provide a valid recipient email address.", variant: "destructive" });
      return;
    }

    setIsSendingBlogTest(true);
    try {
      const res = await fetch("/api/crm/send-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: selectedBlog.slug,
          testEmail: blogTestEmail.trim(),
          customSubject: blogCustomSubject.trim() || undefined,
          includeRelated: includeRelatedBlogs,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send test blog email");

      toast({
        title: "✓ Test Blog Email Dispatched!",
        description: data.message || `Dispatched to ${blogTestEmail}`,
      });
      fetchCRMData();
    } catch (err: any) {
      toast({
        title: "Test Dispatch Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSendingBlogTest(false);
    }
  };

  const handleLaunchBlogCampaign = async () => {
    if (!selectedBlog) {
      toast({ title: "No Blog Selected", description: "Please pick a blog article first.", variant: "destructive" });
      return;
    }

    const eligibleCount = getStageCount(blogTargetStage);
    if (eligibleCount === 0) {
      toast({
        title: "No Eligible Candidates",
        description: `No candidates found in the "${blogTargetStage}" audience segment.`,
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to launch this Blog Campaign?\n\n` +
      `Article: "${selectedBlog.heading}"\n` +
      `Audience Segment: ${blogTargetStage} (${eligibleCount} recipient${eligibleCount > 1 ? 's' : ''})\n` +
      `Brevo Email Delivery will initiate immediately.`
    );
    if (!confirmed) return;

    setIsLaunchingBlogCampaign(true);
    try {
      const res = await fetch("/api/crm/send-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: selectedBlog.slug,
          targetStage: blogTargetStage,
          customSubject: blogCustomSubject.trim() || undefined,
          includeRelated: includeRelatedBlogs,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to launch blog campaign");

      toast({
        title: "🚀 Blog Campaign Dispatched!",
        description: data.message,
      });
      fetchCRMData();
    } catch (err: any) {
      toast({
        title: "Campaign Launch Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLaunchingBlogCampaign(false);
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
            <h1 className="text-3xl font-black tracking-tight">JobsDart CRM & Brevo Automation</h1>
          </div>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Enterprise Multi-Campaign Segmentation & Email Automation Engine with automated Brevo delivery, fresh job digests, profile completion nudges, community conversations, and CAN-SPAM deliverability controls.
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
                {summary?.deliveryRatePercentage ?? 100}%
              </span>
              <span className="block text-[11px] font-bold text-blue-600 mt-1">
                {summary?.openRatePercentage ?? 0}% Open Rate | {summary?.clickRatePercentage ?? 0}% Click Rate
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/70 dark:border-slate-800/70 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">App Conversion</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {summary?.conversionRatePercentage ?? 0}%
              </span>
              <span className="block text-[11px] font-bold text-slate-500 mt-1">
                {summary?.totalApplicationsConverted || 0} Direct Job Applications
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/70 dark:border-slate-800/70 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Bounce & Spam</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {summary?.bounceRatePercentage ?? 0}%
              </span>
              <span className="block text-[11px] font-bold text-amber-600 mt-1">
                {summary?.spamComplaintRatePercentage ?? 0}% Spam | {summary?.unsubscribeRatePercentage ?? 0}% Opt-Out
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/70">
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
            Run AI Job Recommendation
          </Button>
        </div>

        {/* Test Email Dispatch Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-11 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Mail className="w-4 h-4 mr-2 text-indigo-600" /> Send Test Email Digest
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Dispatch Test Recommendation Email
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
      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex-wrap h-auto gap-1">
          <TabsTrigger value="campaigns" className="rounded-xl font-bold text-xs px-4 py-2.5">
            <Sparkles className="w-4 h-4 mr-2 text-indigo-600" /> 7-Campaign Segmentation Engine
          </TabsTrigger>
          <TabsTrigger value="blogs" className="rounded-xl font-bold text-xs px-4 py-2.5">
            <BookOpen className="w-4 h-4 mr-2 text-violet-600" /> Blog Campaigns & Traffic ({blogs.length})
          </TabsTrigger>
          <TabsTrigger value="directory" className="rounded-xl font-bold text-xs px-4 py-2.5">
            <Users className="w-4 h-4 mr-2" /> Candidate Directory ({filteredCandidates.length})
          </TabsTrigger>
          <TabsTrigger value="engine" className="rounded-xl font-bold text-xs px-4 py-2.5">
            <Cpu className="w-4 h-4 mr-2 text-indigo-600" /> AI Match Matrix
          </TabsTrigger>
          <TabsTrigger value="logs" className="rounded-xl font-bold text-xs px-4 py-2.5">
            <Mail className="w-4 h-4 mr-2 text-emerald-600" /> Email Dispatch Logs
          </TabsTrigger>
          <TabsTrigger value="deliverability" className="rounded-xl font-bold text-xs px-4 py-2.5">
            <ShieldCheck className="w-4 h-4 mr-2 text-amber-500" /> Anti-Spam & Deliverability
          </TabsTrigger>
        </TabsList>

        {/* --- TAB 0: 7-Campaign Segmentation Engine --- */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800/70">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" /> JobsDart Recommended 7-Campaign Communication Architecture
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Separate communication streams into dedicated targeted campaigns to maximize open rates and comply with CAN-SPAM regulations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CAMPAIGN_STRUCTURE_CATALOG.map((camp) => {
                const targetAudience = filterCandidatesByCampaignType(candidates, camp.type);

                return (
                  <Card key={camp.type} className="rounded-2xl border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between hover:shadow-lg transition-all border-t-4 border-t-indigo-600">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{camp.icon}</span>
                        <Badge variant="outline" className="font-extrabold text-[10px] uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50">
                          {camp.recommendedFrequency}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{camp.label}</h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">Subject: &quot;{camp.exampleSubject}&quot;</p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Trigger:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300 line-clamp-1">{camp.triggerCondition}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Eligible Audience:</span>
                          <span className="font-extrabold text-emerald-600">{targetAudience.length} candidates</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreviewCampaignTemplate(camp.defaultTemplateId, camp.label)}
                        className="flex-1 h-9 rounded-xl text-xs font-bold"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" /> Preview
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleExecuteCampaign(camp.type)}
                        disabled={executingCampaignType !== null || targetAudience.length === 0}
                        className="flex-1 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                      >
                        {executingCampaignType === camp.type ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 mr-1" /> Execute
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* --- TAB: Blog Campaigns & Traffic Acquisition --- */}
        <TabsContent value="blogs" className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white border border-violet-800/30 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-2xl bg-violet-600/30 text-violet-300 border border-violet-500/30">
                    <BookOpen className="w-6 h-6" />
                  </span>
                  <h2 className="text-2xl font-black tracking-tight">Blog Newsletter & Traffic Acquisition</h2>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Boost site traffic by dispatching curated career roadmaps, tech interview guides, and industry insights directly to candidate inboxes. Every email includes UTM-tagged CTAs pointing back to your published articles on <strong>jobsdart.in/blog</strong>.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 block">Published Articles</span>
                  <span className="text-xl font-black text-white">{blogs.length}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 block">Reachable Candidates</span>
                  <span className="text-xl font-black text-emerald-400">{getStageCount('ALL')}</span>
                </div>
              </div>
            </div>
          </div>

          {blogsLoading ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200/70 dark:border-slate-800/70 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-600" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading Published Blog Articles...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200/70 dark:border-slate-800/70 text-center">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No published blog articles found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Blog Explorer & Picker (5 columns) */}
              <div className="lg:col-span-5 space-y-4">
                <Card className="rounded-3xl border-slate-200/70 dark:border-slate-800/70 shadow-sm overflow-hidden">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Search className="w-4 h-4 text-violet-600" /> Select Article
                      </CardTitle>
                      <Badge variant="outline" className="text-[11px] font-bold">
                        {filteredBlogs.length} of {blogs.length}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-slate-500">
                      Choose which guide to feature in your email newsletter.
                    </CardDescription>

                    {/* Search & Category Filter */}
                    <div className="space-y-2 pt-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                        <Input
                          placeholder="Search articles by title or keyword..."
                          value={blogSearchQuery}
                          onChange={e => setBlogSearchQuery(e.target.value)}
                          className="pl-9 h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200"
                        />
                      </div>

                      {/* Category Filter Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                        {blogCategories.slice(0, 8).map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setBlogCategoryFilter(cat)}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider shrink-0 transition-all",
                              blogCategoryFilter === cat
                                ? "bg-violet-600 text-white shadow-sm"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-1 max-h-[560px] overflow-y-auto space-y-2.5">
                    {filteredBlogs.map(b => {
                      const isSelected = selectedBlog?.slug === b.slug;
                      return (
                        <div
                          key={b.slug}
                          onClick={() => handleSelectBlog(b)}
                          className={cn(
                            "p-3.5 rounded-2xl border transition-all cursor-pointer text-left space-y-2",
                            isSelected
                              ? "border-violet-500 bg-violet-50/70 dark:bg-violet-950/30 shadow-md ring-2 ring-violet-500/20"
                              : "border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950/40"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                              {b.category}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-slate-400">
                                ⏱️ {b.readingMinutes} min
                              </span>
                              {isSelected && (
                                <Badge className="bg-violet-600 text-white text-[10px] font-extrabold py-0 h-5">
                                  ✓ Selected
                                </Badge>
                              )}
                            </div>
                          </div>

                          <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                            {b.heading}
                          </h3>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {b.excerpt}
                          </p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Campaign Studio & Dispatch (7 columns) */}
              <div className="lg:col-span-7 space-y-5">
                {selectedBlog ? (
                  <Card className="rounded-3xl border-slate-200/70 dark:border-slate-800/70 shadow-sm p-6 space-y-5">
                    {/* Selected Blog Snapshot */}
                    <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                          Active Article Featured
                        </span>
                        <a
                          href={`/blog/${selectedBlog.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline gap-1"
                        >
                          View Live on Site <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                        {selectedBlog.heading}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {selectedBlog.excerpt}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] font-bold text-slate-400">
                        <span>Category: <strong className="text-slate-700 dark:text-slate-200">{selectedBlog.category}</strong></span>
                        <span>&bull;</span>
                        <span>Estimated Read: <strong className="text-slate-700 dark:text-slate-200">{selectedBlog.readingMinutes} mins</strong></span>
                        <span>&bull;</span>
                        <span>Published: <strong className="text-slate-700 dark:text-slate-200">{selectedBlog.publishedAt}</strong></span>
                      </div>
                    </div>

                    {/* Subject Line Customization */}
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                        Email Subject Line
                      </label>
                      <Input
                        value={blogCustomSubject}
                        onChange={e => setBlogCustomSubject(e.target.value)}
                        placeholder="e.g. 📖 Must-Read: ..."
                        className="h-11 rounded-xl text-xs font-bold bg-white dark:bg-slate-900"
                      />
                      <p className="text-[11px] text-slate-400">
                        Supports <code className="text-violet-600">{"{{FIRSTNAME}}"}</code>, <code className="text-violet-600">{"{{BLOG_TITLE}}"}</code>, and <code className="text-violet-600">{"{{CATEGORY}}"}</code> variables.
                      </p>
                    </div>

                    {/* Audience Segment Selection */}
                    <div className="space-y-2.5">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                        Target Audience Segment
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {[
                          { id: 'ALL', label: 'All Active Users', count: getStageCount('ALL') },
                          { id: 'ACTIVE_SEEKER', label: 'Active Job Seekers', count: getStageCount('ACTIVE_SEEKER') },
                          { id: 'PASSIVE_SEEKER', label: 'Passive Seekers', count: getStageCount('PASSIVE_SEEKER') },
                          { id: 'HIGHLY_ENGAGED', label: 'Highly Engaged', count: getStageCount('HIGHLY_ENGAGED') },
                          { id: 'DORMANT', label: 'Dormant (Reactivate)', count: getStageCount('DORMANT') },
                        ].map(seg => (
                          <button
                            key={seg.id}
                            type="button"
                            onClick={() => setBlogTargetStage(seg.id)}
                            className={cn(
                              "p-3 rounded-2xl border text-left transition-all flex flex-col justify-between",
                              blogTargetStage === seg.id
                                ? "border-violet-600 bg-violet-50/60 dark:bg-violet-950/30 ring-2 ring-violet-500/20"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                            )}
                          >
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                              {seg.label}
                            </span>
                            <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 mt-1">
                              {seg.count} recipient{seg.count !== 1 ? 's' : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Options: Related Articles Toggle */}
                    <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                      <input
                        type="checkbox"
                        id="includeRelated"
                        checked={includeRelatedBlogs}
                        onChange={e => setIncludeRelatedBlogs(e.target.checked)}
                        className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 cursor-pointer"
                      />
                      <label htmlFor="includeRelated" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                        Include 2 Recommended Reads in Email Footer <span className="font-normal text-slate-400">(Increases internal link clicks &amp; multi-page sessions)</span>
                      </label>
                    </div>

                    {/* Action Controls & Preview */}
                    <div className="pt-2 space-y-4">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePreviewBlogEmail}
                          className="h-11 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex-1 border-slate-300 dark:border-slate-700"
                        >
                          <Eye className="w-4 h-4 mr-2 text-violet-600" /> Preview Rendered Email
                        </Button>
                      </div>

                      {/* Test Dispatch Box */}
                      <form onSubmit={handleSendBlogTestEmail} className="p-4 bg-violet-50/50 dark:bg-violet-950/20 rounded-2xl border border-violet-200 dark:border-violet-900/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-violet-900 dark:text-violet-300 flex items-center gap-1.5">
                            <Send className="w-3.5 h-3.5" /> Send Test Email via Brevo
                          </span>
                          <span className="text-[10px] text-slate-400">Verifies layout in your inbox</span>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="email"
                            placeholder="admin@example.com"
                            value={blogTestEmail}
                            onChange={e => setBlogTestEmail(e.target.value)}
                            required
                            className="h-10 text-xs rounded-xl bg-white dark:bg-slate-900 border-violet-200"
                          />
                          <Button
                            type="submit"
                            disabled={isSendingBlogTest}
                            className="h-10 px-5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-bold text-xs uppercase shrink-0"
                          >
                            {isSendingBlogTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Send Test"}
                          </Button>
                        </div>
                      </form>

                      {/* Launch Full Campaign CTA */}
                      <Button
                        type="button"
                        onClick={handleLaunchBlogCampaign}
                        disabled={isLaunchingBlogCampaign || getStageCount(blogTargetStage) === 0}
                        className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-violet-600/25"
                      >
                        {isLaunchingBlogCampaign ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Dispatching via Brevo Automation...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Launch Blog Campaign to {getStageCount(blogTargetStage)} Candidate(s)
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card className="rounded-3xl border-slate-200/70 dark:border-slate-800/70 shadow-sm p-12 text-center">
                    <p className="text-sm font-bold text-slate-400">Select an article from the list to configure campaign.</p>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>

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
                              <span className="text-[10px] text-slate-400 font-bold">+{c.skills.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            className={cn(
                              "font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border",
                              c.lifecycleStage === "HIGHLY_ENGAGED" && "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
                              c.lifecycleStage === "ACTIVE_SEEKER" && "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",
                              c.lifecycleStage === "PASSIVE_SEEKER" && "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
                              c.lifecycleStage === "NEW_ONBOARDED" && "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300",
                              c.lifecycleStage === "DORMANT" && "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
                              c.lifecycleStage === "UNSUBSCRIBED" && "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
                            )}
                          >
                            {c.lifecycleStage.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  c.engagementScore >= 75 ? "bg-emerald-500" : c.engagementScore >= 50 ? "bg-indigo-500" : "bg-amber-500"
                                )}
                                style={{ width: `${c.engagementScore}%` }}
                              />
                            </div>
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">{c.engagementScore}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className={cn("font-extrabold text-[10px]", c.brevoSyncStatus === "SYNCED" ? "text-emerald-600 border-emerald-200" : "text-amber-600 border-amber-200")}>
                            {c.brevoSyncStatus}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRunAIRecommendations(c.id)}
                            className="h-8 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                          >
                            Send Email
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

      {/* HTML Template Live Preview Dialog */}
      <Dialog open={!!activePreviewTemplate} onOpenChange={() => setActivePreviewTemplate(null)}>
        <DialogContent className="max-w-3xl rounded-3xl p-6 max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
              {activePreviewTemplate?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto mt-4 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white">
            <div dangerouslySetInnerHTML={{ __html: activePreviewTemplate?.html || '' }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
