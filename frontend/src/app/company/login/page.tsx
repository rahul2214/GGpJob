"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, Eye, EyeOff, Briefcase, Building2, Users, TrendingUp, ArrowRight, Zap, Database, Star, BarChart2, Mail, Phone, ShieldCheck, Sparkles, CheckCircle2, ShieldAlert, Award, UserCheck, AlertTriangle, Coins } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { motion } from "framer-motion";
import RecruiterPricingGrid from "@/components/recruiter-pricing-grid";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof formSchema>;

const recruiterStats = [
  { icon: Building2, label: "Post Jobs Free", sub: "No hiring fees ever", color: "from-emerald-500 to-teal-600", delay: 0 },
  { icon: Users, label: "100K+ Candidates", sub: "Ready to be hired", color: "from-sky-500 to-blue-600", delay: 1.5 },
  { icon: TrendingUp, label: "85% Success Rate", sub: "Roles filled faster", color: "from-violet-500 to-purple-600", delay: 3 },
];

export default function CompanyLoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [activeTab, setActiveTab] = useState<'recruiters' | 'employees'>('recruiters');

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const { isSubmitting } = form.formState;

  const handleResendVerification = async (email: string) => {
    setIsResending(true);
    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirectUrl: window.location.origin + '/company/login' }),
      });
      if (!res.ok) throw new Error('Failed to resend');
      toast({ title: 'Verification Email Sent', description: 'A new verification link has been sent via Firebase. Please check your inbox.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to resend verification.', variant: 'destructive' });
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Email Not Verified",
            description: "Please verify your email address before logging in.",
            variant: "destructive",
            duration: 10000,
            action: (
              <Button variant="outline" size="sm" onClick={() => handleResendVerification(data.email)} disabled={isResending}>
                {isResending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Resend Email"}
              </Button>
            )
          });
          return;
        }
        throw error;
      }

      if (authData.user) {
        const res = await fetch(`/api/users?uid=${authData.user.id}`);
        if (res.ok) {
          const profile = await res.json();
          // Only Recruiters (account owners) need a paid plan.
          // Employees are added by the company and use the company's plan.
          if (profile.role === 'Recruiter') {
            if (!profile.isPaid) {
              router.push("/company/payment");
              return;
            }
          }
        } else {
          await supabase.auth.signOut();
          toast({ title: "Access Denied", description: "Company profile not found in Supabase.", variant: "destructive" });
          return;
        }
      }
      router.push("/");
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message || "Invalid email or password.", variant: "destructive" });
    }
  };

  const handlePasswordReset = async () => {
    const email = form.getValues("email");
    if (!email) {
      toast({ title: "Email Required", description: "Please enter your email address to reset your password.", variant: "destructive" });
      return false;
    }
    setIsResettingPassword(true);
    try {
      // Use Firebase to send password reset — bypasses Supabase email rate limits
      const res = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirectUrl: window.location.origin + '/reset-password' }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send password reset email.');
      }
      toast({ title: "Password Reset Email Sent", description: "Check your inbox for a link from Firebase to reset your password." });
      return true;
    } finally {
      setIsResettingPassword(false);
    }
  };

  if (loading || user) return null;

  const features = [
    {
      icon: Database,
      title: "Resume Database Access",
      desc: "Search and filter through 100K+ verified candidate profiles. Find the perfect fit using skills, location, experience, and domain filters — all in real time.",
      gradient: "from-sky-500 to-blue-600",
      bg: "bg-sky-50",
      border: "border-sky-100",
    },
    {
      icon: Star,
      title: "Premium Job Posts",
      desc: "Supercharge your listings with featured placement, priority indexing, and highlighted badges that put your opportunities in front of the right candidates first.",
      gradient: "from-amber-400 to-orange-500",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      icon: Users,
      title: "Referral Network",
      desc: "Unlock insider referrals from verified employees in your industry. Referral hires are 5x faster and show 40% higher retention — a channel no recruiter can afford to skip.",
      gradient: "from-violet-500 to-purple-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
    },
    {
      icon: BarChart2,
      title: "Analytics & Insights",
      desc: "Track job performance, application funnel metrics, candidate engagement, and time-to-hire benchmarks with a powerful real-time recruiter dashboard.",
      gradient: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
  ];

  const employeeFeatures = [
    {
      icon: Users,
      title: "Direct Referral Payouts",
      desc: "Earn guaranteed XP and direct cash payouts when your referred candidates advance through interview rounds and get hired.",
      gradient: "from-violet-500 to-purple-600",
      highlight: "Guaranteed Payout per Milestone",
    },
    {
      icon: Star,
      title: "Gamified Leaderboards",
      desc: "Unlock exclusive badges (Connector, Talent Spotter, Trusted Referrer) and climb company leaderboards as your referral success rate grows.",
      gradient: "from-amber-400 to-orange-500",
      highlight: "Multi-Tier Milestone Unlock",
    },
    {
      icon: BarChart2,
      title: "Transparent Tracking",
      desc: "Track every candidate's real-time interview status, HR feedback, and milestone verification updates directly from your dashboard.",
      gradient: "from-sky-500 to-blue-600",
      highlight: "Real-Time Pipeline Updates",
    },
    {
      icon: Briefcase,
      title: "Fast Direct Withdrawals",
      desc: "Once a milestone proof is verified by HR, your earned cash rewards are instantly available to withdraw straight to your bank account.",
      gradient: "from-emerald-500 to-teal-600",
      highlight: "Zero Hidden Deductions",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Split Login Section */}
      <div className="flex">
        {/* Left Panel — Brand side */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex-col justify-between p-12" style={{ minHeight: '100vh' }}>
          {/* Decorative blobs */}
          <div className="absolute top-0 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[80px]" />

          {/* Center content */}
          <div className="relative z-10 space-y-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
                Hire the <br />
                <span className="text-emerald-200">Best Talent</span> Fast
              </h1>
              <p className="text-emerald-100 text-lg leading-relaxed max-w-sm">
                Post jobs for free, receive referrals from insiders, and connect with qualified candidates in minutes.
              </p>
            </motion.div>

            {/* Floating stat cards */}
            <div className="space-y-4">
              {recruiterStats.map((card, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
                  transition={{ opacity: { duration: 0.5, delay: 0.4 + idx * 0.15 }, x: { duration: 0.5, delay: 0.4 + idx * 0.15 }, y: { duration: 3 + idx, repeat: Infinity, ease: "easeInOut", delay: card.delay } }}
                  className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 w-fit"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{card.label}</p>
                    <p className="text-emerald-200 text-xs">{card.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom switch link */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="relative z-10">
            <p className="text-emerald-100 text-sm">
              Looking for jobs instead?{" "}
              <Link href="/login" className="text-white font-semibold underline underline-offset-2 hover:text-emerald-100 transition-colors">
                Candidate Login →
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Right Panel — Form side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >

            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                <Zap className="w-3 h-3" /> Recruiter Portal
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome back 🏢</h2>
              <p className="text-slate-500">Sign in to manage your jobs and candidates.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">Work Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@company.com"
                          className="h-12 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-100 bg-slate-50 focus:bg-white transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-slate-700 font-semibold">Password</FormLabel>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="link" type="button" className="p-0 h-auto text-sm text-emerald-600 hover:text-emerald-700">Forgot Password?</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reset Password</AlertDialogTitle>
                              <AlertDialogDescription>
                                Enter your email address. If an account exists, we'll send you a reset link.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4">
                              <Input id="reset-email" type="email" placeholder="your.email@company.com" defaultValue={form.getValues("email")} onChange={(e) => form.setValue("email", e.target.value)} />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={async (e) => {
                                e.preventDefault();
                                const success = await handlePasswordReset();
                                if (success) {
                                  const cancel = document.querySelector('[data-radix-collection-item][aria-label="Cancel"]');
                                  if (cancel instanceof HTMLElement) cancel.click();
                                }
                              }} disabled={isResettingPassword}>
                                {isResettingPassword && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Send Reset Link
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-12 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-100 bg-slate-50 focus:bg-white transition-colors pr-12"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-200 transition-all"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                    {isSubmitting ? "Signing in..." : "Sign In as Recruiter"}
                  </Button>
                </motion.div>
              </form>
            </Form>

            <p className="mt-6 text-center text-sm text-slate-500">
              New recruiter?{" "}
              <Link href="/company/signup" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                Create a company account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* ============ MARKETING SECTION ============ */}
      <div className="bg-slate-950 text-white pb-12">
        {/* Tab Switcher Header */}
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-8 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
            One Portal, <span className="text-emerald-400">Two Powerful Roles</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Explore advanced enterprise tools for recruiters or discover how employees earn rewards through verified referrals.
          </p>

          <div className="inline-flex p-1.5 rounded-full bg-slate-900 border border-slate-800 shadow-xl">
            <button
              onClick={() => setActiveTab("recruiters")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                activeTab === "recruiters"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Building2 className="w-4 h-4" /> For Recruiters & HR
            </button>
            <button
              onClick={() => setActiveTab("employees")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                activeTab === "employees"
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" /> For Insider Employees
            </button>
          </div>
        </div>

        {activeTab === "recruiters" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {/* Why Jobs Dart — Feature Cards */}
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 bg-emerald-900/50 border border-emerald-700/40 text-emerald-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                  <ShieldCheck className="w-3 h-3" /> Enterprise-Grade Hiring Tools
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                  Why Top Companies Choose <span className="text-emerald-400">Jobs Dart</span>
                </h3>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  From your first hire to scaling entire teams — we give recruiters and HR professionals the unfair advantage they need.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((f, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-7 hover:border-slate-600 transition-all duration-300 overflow-hidden"
                  >
                    <div className={`absolute -top-10 -right-10 w-36 h-36 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500`} />

                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg mb-5`}>
                      <f.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">{f.title}</h4>
                    <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Pricing Plans Section */}
            <div id="plans" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-emerald-900/50 border border-emerald-700/40 text-emerald-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                  <Zap className="w-3 h-3" /> Flexible Hiring Plans & Limits
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                  Job Posting Limits & <span className="text-emerald-400">Application Access</span>
                </h3>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  Compare our transparent quotas below — including maximum job posts allowed, job listing validity (30 to 90 days), and application tracking windows.
                </p>
              </div>

              <RecruiterPricingGrid isMarketing={true} />
              
              <div className="mt-12 text-center">
                <p className="text-slate-500 text-sm italic">
                  All plans are one-time payments. No recurring subscriptions. No hidden fees.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="max-w-7xl mx-auto px-6 py-12 space-y-12 md:space-y-16">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-violet-900/50 border border-violet-700/40 text-violet-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                <Sparkles className="w-3 h-3" /> Gamified Referral Rewards
              </div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                Turn Your Connections Into <span className="text-violet-400">Extra Earnings</span>
              </h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                Employees earn guaranteed XP and direct cash payouts when referred candidates successfully advance through interview rounds and final hiring stages.
              </p>
            </div>

            {/* Employee Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {employeeFeatures.map((ef, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group relative bg-slate-900/90 border border-slate-800 rounded-2xl p-7 hover:border-violet-500/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl"
                >
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-violet-500/10 group-hover:bg-violet-500/20 rounded-full blur-2xl transition-all duration-500" />
                  <div className="flex-1 flex flex-col mb-6 relative z-10">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ef.gradient} flex items-center justify-center shadow-lg mb-5 shrink-0`}>
                      <ef.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-3">{ef.title}</h4>
                    <p className="text-slate-400 leading-relaxed text-sm flex-1">{ef.desc}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-800 text-xs font-semibold text-violet-300 flex items-center gap-2 mt-auto relative z-10">
                    <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" /> {ef.highlight}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Insider Quotas & Eligibility Banner */}
            <div className="bg-slate-900 border border-violet-500/30 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="text-center max-w-2xl mx-auto mb-10 relative z-10">
                <div className="inline-flex items-center gap-2 bg-violet-900/50 border border-violet-700/40 text-violet-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
                  <Zap className="w-3 h-3" /> Privileges & Quotas
                </div>
                <h4 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                  Insider Employee <span className="text-violet-400">Eligibility Limits</span>
                </h4>
                <p className="text-slate-400 text-sm">
                  Verified employees enjoy full, uninhibited access to refer top talent without any recruiter subscription costs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg hover:border-violet-500/40 transition-all duration-300">
                  <div>
                    <div className="text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">Posting Limit</div>
                    <div className="text-3xl font-black text-white mb-3">5 / Month</div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Post up to 5 verified internal company referral opportunities each calendar month. Zero subscription fees.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Monthly Quota Resets 1st
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg hover:border-violet-500/40 transition-all duration-300">
                  <div>
                    <div className="text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">Job Validity</div>
                    <div className="text-3xl font-black text-white mb-3">14 Days</div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Each referral opportunity stays active for exactly 14 days before automatically expiring to ensure fresh listings.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs font-semibold text-violet-400">
                    <CheckCircle2 className="w-4 h-4" /> 14-Day Active Window
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg hover:border-violet-500/40 transition-all duration-300">
                  <div>
                    <div className="text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">Application Quota</div>
                    <div className="text-3xl font-black text-white mb-3">100 / Job</div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Receive up to 100 candidate applications per referral job. Full pipeline tracking access for 14 days per application.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> 100 Verified Applies Max
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg hover:border-violet-500/40 transition-all duration-300">
                  <div>
                    <div className="text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">Referral Rewards</div>
                    <div className="text-3xl font-black text-white mb-3">Instant Credit</div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      When candidate applications are unlocked, cash rewards and XP are credited directly to your wallet upon successful interview verification.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs font-semibold text-violet-400">
                    <CheckCircle2 className="w-4 h-4" /> Verified Payout Guarantee
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Conditions & Rules Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-violet-500/30 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-slate-800 pb-8">
                  <div>
                    <h4 className="text-2xl font-extrabold text-white mb-2 flex items-center gap-2">
                      <ShieldAlert className="w-6 h-6 text-violet-400" /> Employee Eligibility & Rules
                    </h4>
                    <p className="text-slate-400 text-sm">
                      Strict compliance and quality benchmarks required to maintain active referrer status.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-violet-500/10 border border-violet-500/20 px-5 py-3 rounded-2xl">
                    <Award className="w-8 h-8 text-violet-400 shrink-0" />
                    <div>
                      <p className="text-white font-bold text-sm">Trust Score Model</p>
                      <p className="text-violet-300 text-xs">Maintain 80%+ rating for instant payouts</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-violet-400 font-bold text-base">
                      <UserCheck className="w-5 h-5" /> 1. Corporate Verification
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Employees must register using a verifiable company work email. Anonymous or unverified external personal accounts cannot post company referrals.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-violet-400 font-bold text-base">
                      <AlertTriangle className="w-5 h-5" /> 2. Honest Proof Validation
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Referrers are responsible for reviewing candidate interview/hiring proofs accurately. Fraudulent approvals or fake milestone claims lead to immediate account suspension.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-violet-400 font-bold text-base">
                      <Coins className="w-5 h-5" /> 3. Reward Distribution
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      XP and milestone cash rewards are credited automatically when candidates pass verification checks. Payouts can be directly withdrawn to your bank account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Business Inquiry CTA Strip */}
        <div className="border-t border-slate-800 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-center justify-between gap-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-amber-900/40 border border-amber-700/30 text-amber-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                <Briefcase className="w-3 h-3" /> Business Inquiry
              </div>
              <h3 className="text-3xl font-extrabold text-white mb-2">
                Looking for an Enterprise Plan?
              </h3>
              <p className="text-slate-400 max-w-lg leading-relaxed">
                We offer customised enterprise solutions including bulk resume access, dedicated account managers, ATS integrations, white-label portals, and priority support — tailored around your hiring volume.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col gap-4 min-w-[260px]"
            >
              <a
                href="mailto:admin@veltria.in"
                className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/40 group"
              >
                <Mail className="w-5 h-5 shrink-0" />
                <div>
                  <p className="text-sm font-bold">Email Sales Team</p>
                  <p className="text-emerald-200 text-xs font-medium">admin@veltria.in</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="tel:+916303563546"
                className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-4 rounded-xl transition-all duration-200 border border-slate-700 group"
              >
                <Phone className="w-5 h-5 shrink-0 text-emerald-400" />
                <div>
                  <p className="text-sm font-bold">Call Us Directly</p>
                  <p className="text-slate-400 text-xs font-medium">Mon–Sat, 9am–6pm IST</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
