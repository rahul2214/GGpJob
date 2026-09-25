"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  Info,
  Headphones,
  KeyRound,
  Shield,
  Mail,
  Phone,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  FileText,
  Sparkles,
  Building,
  Lock,
  Globe,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Send,
  LoaderCircle,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/user-context";
import { ChangePasswordForm } from "@/components/change-password-form";

function SettingsSkeleton() {
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
      <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
      <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse mt-4" />
      <div className="h-72 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse mt-4" />
    </div>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useUser();
  const { toast } = useToast();

  const tabQuery = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>("about");

  // Auth Protection: If unauthenticated, redirect to login page with redirect URL
  useEffect(() => {
    if (!loading && !user) {
      const currentParam = searchParams.toString();
      const redirectUrl = currentParam ? `/settings?${currentParam}` : `/settings`;
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
    }
  }, [user, loading, router, searchParams]);

  // Support inquiry form state
  const [inquiryName, setInquiryName] = useState(user?.name || "");
  const [inquiryEmail, setInquiryEmail] = useState(user?.email || "");
  const [inquiryCategory, setInquiryCategory] = useState("General Inquiry");
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  // Sync user info once loaded
  useEffect(() => {
    if (user) {
      if (user.name && !inquiryName) setInquiryName(user.name);
      if (user.email && !inquiryEmail) setInquiryEmail(user.email);
    }
  }, [user]);

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    if (tabQuery === "about" || tabQuery === "support" || tabQuery === "password") {
      setActiveTab(tabQuery);
    }
  }, [tabQuery]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.replace(`/settings?tab=${value}`, { scroll: false });
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter your message before sending.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingInquiry(true);
    // Simulate support ticket submission
    await new Promise((res) => setTimeout(res, 800));
    setIsSubmittingInquiry(false);

    toast({
      title: "Support Request Sent ✨",
      description: "Thank you! Our support team has received your ticket and will respond to your email shortly.",
    });

    setInquirySubject("");
    setInquiryMessage("");
  };

  const FAQS = [
    {
      q: "How do platform credits work for Job Seekers and Employers?",
      a: "Job Seekers use credits for AI resume optimizations, tailored recommendations, and direct messaging. Recruiters and employers use credits to post premium job openings and access candidate profiles.",
    },
    {
      q: "How does the ATS Score checker evaluate my resume?",
      a: "Our ATS auditor scans keyword density, standard resume sections (Summary, Experience, Education, Skills), readability formulas, and formatting compliance to provide an actionable percentage score.",
    },
    {
      q: "How long do recruiter job postings stay active?",
      a: "Standard job postings remain live for 30 days. Recruiters can extend, edit, or archive postings at any time directly through the 'My Postings' tab.",
    },
    {
      q: "What should I do if a credit purchase or payment fails?",
      a: "Failed transactions are processed through our secure payment gateway and typically auto-refund within 24 to 48 business hours. If you need urgent assistance, please contact admin@veltria.in.",
    },
  ];

  if (loading || !user) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300">Settings</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <Settings className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Settings
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your security credentials, reach customer support, and discover JobsDart platform details.
            </p>
          </div>
          
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md h-11 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <TabsTrigger
            value="about"
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-xs transition-all"
          >
            <Info className="w-4 h-4" />
            <span>About</span>
          </TabsTrigger>
          <TabsTrigger
            value="support"
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-xs transition-all"
          >
            <Headphones className="w-4 h-4" />
            <span>Support</span>
          </TabsTrigger>
          <TabsTrigger
            value="password"
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-xs transition-all"
          >
            <KeyRound className="w-4 h-4" />
            <span>Change Password</span>
          </TabsTrigger>
        </TabsList>

        {/* ── 1. ABOUT TAB ────────────────────────────────────────────────── */}
        <TabsContent value="about" className="space-y-6 focus-visible:outline-none">
          {/* Main About Card */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-none font-bold text-xs px-2.5 py-0.5">
                  A Sub-Product of Veltria
                </Badge>
                
              </div>
              <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                Jobs<span className="text-indigo-600 dark:text-indigo-400">Dart</span> — A Sub-Product of Veltria
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                JobsDart is an AI-powered career growth and recruitment platform developed as a dedicated sub-product of <strong className="text-slate-800 dark:text-slate-200">Veltria</strong>. Built to streamline modern hiring, JobsDart connects ambitious job seekers with top recruiters through advanced ATS resume intelligence, 12 live interactive CV templates, and seamless matchmaking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Parent Company Spotlight */}
              <div className="p-4 sm:p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                      Company
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Veltria
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                    JobsDart is proud to be a specialized sub-product under Veltria, focused on empowering career paths, optimizing resumes for global ATS standards, and delivering high-efficiency recruitment workflows.
                  </p>
                </div>
                <a
                  href="https://veltria.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 self-start sm:self-center group"
                >
                  <Globe className="w-4 h-4" />
                  <span>Visit veltria.in</span>
                  <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>

              {/* Core Feature Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">ATS Resume Scorer</h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Test your resume against strict recruiter filtering algorithms. Get instant score breakdowns, keyword matches, and improvement tips.
                  </p>
                  <Link
                    href="/ats-score"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
                  >
                    Open ATS Checker <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">12 Visual Resume Templates</h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Live interactive resume generator with 12 dense, professional layouts tailored for software, leadership, creative, and technical roles.
                  </p>
                  <Link
                    href="/resume-builder"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline pt-1"
                  >
                    Launch Resume Builder <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Verified Job Discovery</h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Search hundreds of vetted positions across technology, design, finance, and engineering with quick one-click applications.
                  </p>
                  <Link
                    href="/jobs"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1"
                  >
                    Browse Active Jobs <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Building className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Recruiter Hiring Suite</h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Post openings, review applicants, organize candidate pipelines, and streamline candidate outreach seamlessly in one place.
                  </p>
                  <Link
                    href="/jobs/post"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline pt-1"
                  >
                    Post a Job Opening <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Company & Platform Info (NO Supabase, purely user-facing) */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Company</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">Veltria</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Website</span>
                  <a
                    href="https://veltria.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 justify-center"
                  >
                    veltria.in <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Product</span>
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">JobsDart</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Availability</span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">Active</span>
                </div>
              </div>

              {/* Legal & Policy Links */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span>© 2026 JobsDart. A sub-product of <strong>Veltria</strong>. All rights reserved.</span>
                  <span>•</span>
                  <a
                    href="https://veltria.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    veltria.in
                  </a>
                </div>
                <div className="flex items-center gap-4">
                  <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Terms
                  </Link>
                  <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Privacy
                  </Link>
                  <Link href="/refund" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Refund Policy
                  </Link>
                  <Link href="/feedback" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Feedback
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 2. SUPPORT TAB ──────────────────────────────────────────────── */}
        <TabsContent value="support" className="space-y-6 focus-visible:outline-none">
          {/* Contact Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <CardContent className="pt-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Email Support</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    For billing, credits, and general support.
                  </p>
                </div>
                <a
                  href="mailto:admin@veltria.in"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline block truncate"
                >
                  admin@veltria.in
                </a>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <CardContent className="pt-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Helpline Phone</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Mon-Fri from 9:00 AM to 6:00 PM IST.
                  </p>
                </div>
                <a
                  href="tel:+916303563546"
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline block"
                >
                  +91 63035 63546
                </a>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <CardContent className="pt-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Grievance Desk</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Formal escalation & data compliance.
                  </p>
                </div>
                <a
                  href="mailto:admin@veltria.in"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline block truncate"
                >
                  admin@veltria.in
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Quick Ticket Form */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Submit a Support Request
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Send a direct message to our support agents. We typically respond within 24 business hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="inquiry-name" className="text-xs font-semibold">Your Name</Label>
                    <Input
                      id="inquiry-name"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="inquiry-email" className="text-xs font-semibold">Your Email</Label>
                    <Input
                      id="inquiry-email"
                      type="email"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      placeholder="alex@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="inquiry-category" className="text-xs font-semibold">Inquiry Category</Label>
                    <select
                      id="inquiry-category"
                      value={inquiryCategory}
                      onChange={(e) => setInquiryCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Account & Login">Account & Login</option>
                      <option value="Billing & Credits">Billing & Credits</option>
                      <option value="ATS Score & Resume">ATS Score & Resume</option>
                      <option value="Job Applications">Job Applications</option>
                      <option value="Bug Report">Bug Report</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="inquiry-subject" className="text-xs font-semibold">Subject Line</Label>
                    <Input
                      id="inquiry-subject"
                      value={inquirySubject}
                      onChange={(e) => setInquirySubject(e.target.value)}
                      placeholder="Brief summary of your question"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inquiry-message" className="text-xs font-semibold">Message</Label>
                  <Textarea
                    id="inquiry-message"
                    rows={4}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Describe your issue or question in detail..."
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmittingInquiry}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-4 gap-2"
                  >
                    {isSubmittingInquiry ? (
                      <>
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Support Request
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* FAQs Accordion */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {FAQS.map((faq, index) => {
                const isOpen = expandedFaq === index;
                return (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-3.5 transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between text-left gap-3"
                    >
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 3. CHANGE PASSWORD TAB ───────────────────────────────────────── */}
        <TabsContent value="password" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Form Column */}
            <div className="md:col-span-2">
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                        Change Account Password
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                        Choose a strong, unique password to safeguard your career profile and applications.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <ChangePasswordForm />
                </CardContent>
              </Card>
            </div>

            {/* Security Tips Column */}
            <div>
              <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shadow-xs space-y-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    Security Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Use at least 8 characters (12+ recommended).</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Mix uppercase, lowercase, numbers, and symbols.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Avoid easily guessed words or personal birthdays.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Never share your password with anyone.</span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Account Status
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Logged in as <strong className="text-slate-700 dark:text-slate-300">{user?.email || "Current User"}</strong>.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}
