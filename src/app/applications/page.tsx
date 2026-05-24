"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import type { Application } from "@/lib/types";
import { useApplications } from "@/hooks/use-jobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Briefcase, Calendar, ClipboardList, Search, CheckCircle2, CheckCircle, Clock, XCircle, Eye, MessageCircle, Trophy } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Coins, Lock, Unlock, ShieldCheck, AlertCircle, UploadCloud } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ChatDrawer } from "@/components/chat/ChatDrawer";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  "Under Review":     { label: "Under Review",    color: "text-blue-700",    bg: "bg-blue-100",    icon: Clock },
  "Accepted":         { label: "Accepted",        color: "text-cyan-700",    bg: "bg-cyan-100",    icon: CheckCircle2 },
  "Referral Unlocked":{ label: "Unlocked",        color: "text-indigo-700",  bg: "bg-indigo-100",  icon: CheckCircle2 },
  "Referred":         { label: "Referred",        color: "text-indigo-700",  bg: "bg-indigo-100",  icon: ArrowRight },
  "Verified Referral":{ label: "Verified Referral", color: "text-emerald-700", bg: "bg-emerald-100", icon: ShieldCheck },
  "Interviewing":     { label: "Interview Needs to be Scheduled", color: "text-amber-700", bg: "bg-amber-100", icon: Clock },
  "Offer Received":   { label: "Offer Received",  color: "text-purple-700",  bg: "bg-purple-100",  icon: CheckCircle2 },
  "Pending Confirmation": { label: "Joined?",     color: "text-orange-700",  bg: "bg-orange-100",  icon: Clock },
  "Joined Company":   { label: "Joined",          color: "text-emerald-700", bg: "bg-emerald-100", icon: CheckCircle2 },
  "Completed":        { label: "Completed",       color: "text-emerald-700", bg: "bg-emerald-100", icon: CheckCircle2 },
  "Disputed":         { label: "Disputed",        color: "text-red-700",     bg: "bg-red-100",     icon: XCircle },
  "Rejected":         { label: "Rejected",        color: "text-rose-700",    bg: "bg-rose-100",    icon: XCircle },
  default:            { label: "Applied",         color: "text-slate-600",   bg: "bg-slate-100",   icon: Clock },
};

function StatusBadge({ app }: { app: Application }) {
  const status = app.statusName;
  let label = statusConfig[status ?? ""]?.label ?? statusConfig.default.label;
  
  if (status === "Interviewing") {
    if (app.verificationStatus === "pending" || app.verificationStatus === "pending_jobseeker") {
      label = "Waiting for Interview Confirmation";
    } else if (app.verificationStatus === "pending_employee") {
      label = "Awaiting Employee Verification";
    } else if (app.verificationStatus === "verified") {
      label = "Waiting for Offer Letter";
    } else {
      label = "Waiting for Interview";
    }
  } else if (status === "Offer Received") {
    if (app.verificationStatus === "pending" || app.verificationStatus === "pending_jobseeker") {
      label = "Waiting for Offer Confirmation";
    } else if (app.verificationStatus === "pending_employee") {
      label = "Awaiting Employee Verification";
    }
  } else if (status === "Referred") {
    if (app.verificationStatus === "pending" || app.verificationStatus === "pending_jobseeker") {
      label = "Waiting for Referral Confirmation";
    } else if (app.verificationStatus === "pending_employee") {
      label = "Awaiting Employee Verification";
    }
  } else if (status === "Joined Company") {
    if (app.verificationStatus === "pending" || app.verificationStatus === "pending_jobseeker") {
      label = "Waiting for Hire Confirmation";
    } else if (app.verificationStatus === "pending_employee") {
      label = "Awaiting Employee Verification";
    }
  } else if (status === "Pending Confirmation") {
    label = "Offer Verified! Time to Join";
  }
  
  const cfg = statusConfig[status ?? ""] ?? statusConfig.default;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-4 h-4" />
      {label}
    </span>
  );
}

const fadeUp: any = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" } }),
};

export default function ApplicationsPage() {
  const { user, loading: userLoading, refreshUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyingAction, setVerifyingAction] = useState<'confirm' | 'dispute' | null>(null);
  const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatAppId, setActiveChatAppId] = useState<string | null>(null);
  const [isInitiateModalOpen, setIsInitiateModalOpen] = useState(false);
  const [isSubmittingInitiate, setIsSubmittingInitiate] = useState(false);
  const [initiateFile, setInitiateFile] = useState<File | null>(null);
  const [initiateTargetStatus, setInitiateTargetStatus] = useState<6 | 7 | 9>(6);
  const [showDisputeInput, setShowDisputeInput] = useState(false);
  const [disputeReasonInput, setDisputeReasonInput] = useState("");
  const [simulatedElapsed, setSimulatedElapsed] = useState<Record<string, boolean>>({});
  const [feedbackAnswers, setFeedbackAnswers] = useState<Record<string, { recruiterContact: string; movedForward: string; genuineReferral: string }>>({});
  const [submittingFeedback, setSubmittingFeedback] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!userLoading && !user) router.push("/login");
  }, [user, userLoading, router]);

  const { applications, isLoading: loading, mutateApplications } = useApplications(user ? { userId: user.uuid, requesterId: user.uuid } : undefined);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <div className="hidden md:block bg-gradient-to-br from-violet-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">My Applications</h1>
            </div>
            <p className="text-white/75 text-sm ml-[52px]">
              {loading ? "Loading..." : `${applications.length} application${applications.length !== 1 ? "s" : ""} tracked`}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats row */}
        {!loading && applications.length > 0 && (() => {
          const applied   = applications.filter(a => !a.statusName || a.statusName === "Applied").length;
          const processing = applications.filter(a => ["Under Review", "Profile Viewed", "Accepted", "Referral Unlocked", "Referred", "Interviewing", "Offer Received", "Pending Confirmation"].includes(a.statusName)).length;
          const success   = applications.filter(a => ["Joined Company", "Completed", "Hired"].includes(a.statusName)).length;
          const rejected  = applications.filter(a => ["Not Suitable", "Rejected", "Disputed"].includes(a.statusName)).length;
          const stats = [
            { label: "Applied",    value: applied,    color: "from-slate-400 to-slate-500",    bg: "bg-slate-50",   text: "text-slate-600",   icon: Clock },
            { label: "In Progress",value: processing, color: "from-blue-400 to-indigo-500",    bg: "bg-blue-50",    text: "text-blue-600",    icon: Eye },
            { label: "Success",    value: success,    color: "from-emerald-400 to-teal-500",   bg: "bg-emerald-50", text: "text-emerald-600", icon: CheckCircle2 },
            { label: "Not Suitable", value: rejected,  color: "from-rose-400 to-pink-500",  bg: "bg-rose-50",    text: "text-rose-600",    icon: XCircle },
          ];
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {stats.map((s, i) => (
                <motion.div key={s.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                      <s.icon className={`w-4 h-4 ${s.text}`} />
                    </div>
                    <span className="text-2xl font-extrabold text-slate-800">{s.value}</span>
                  </div>
                  <p className="text-slate-500 text-xs font-medium">{s.label}</p>
                  <div className={`mt-2 h-1 rounded-full bg-gradient-to-r ${s.color} opacity-60`} />
                </motion.div>
              ))}
            </div>
          );
        })()}

        {/* Loading skeletons */}
        {(userLoading || loading) && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/5 rounded-lg" />
                  <Skeleton className="h-3 w-1/3 rounded-lg" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-xl hidden md:block" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Applications List */}
        {!loading && !userLoading && applications.length > 0 && (
          <AnimatePresence>
            <div className="space-y-3">
              {applications.map((app, i) => (
                <motion.div
                  key={app.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-4 md:p-5"
                >
                  <div className="flex items-start gap-4">
                    {/* Company logo placeholder */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-violet-500" />
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-800 text-base leading-tight">{app.jobTitle}</h3>
                          <p className="text-slate-500 text-sm mt-0.5">{app.companyName}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <StatusBadge app={app} />
                            {(app.statusId === 3 || app.statusName === "Accepted") && !app.isUnlocked && (
                                <div className="flex flex-col gap-2 items-end">
                                    <div className="flex gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="ghost"
                                            className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold text-[11px] uppercase tracking-wider rounded-lg"
                                            onClick={async () => {
                                                if (!confirm("Are you sure you want to reject this referral interest?")) return;
                                                try {
                                                    const res = await fetch(`/api/applications/${app.id}/status`, {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ statusId: 12 })
                                                    });
                                                    if (!res.ok) throw new Error('Failed to reject');
                                                    toast({ title: "Referral Rejected", description: "You have declined this interest." });
                                                    window.location.reload();
                                                } catch (e) {
                                                    toast({ title: "Error", description: "Operation failed", variant: "destructive" });
                                                }
                                            }}
                                        >
                                            <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                            Reject
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] uppercase tracking-wider rounded-lg shadow-sm"
                                            onClick={() => {
                                                setSelectedApp(app);
                                                setIsUnlockModalOpen(true);
                                            }}
                                        >
                                            <Lock className="w-3.5 h-3.5 mr-1.5" />
                                            Accept & Unlock
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-100 flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        Only 3 slots available - First come first served
                                    </p>
                                </div>
                            )}
                            {app.isUnlocked && app.statusId === 4 && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold uppercase py-1 px-3">
                                    <Clock className="w-4 h-4 mr-1.5" />
                                    Awaiting Referral
                                </Badge>
                            )}
                            {(app.isUnlocked) && ( (app.verificationStatus === 'pending' && (app.statusId === 5 || app.statusId === 9)) || app.verificationStatus === 'pending_jobseeker') && (
                                <div className="flex flex-col gap-1.5 items-end">
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="h-8 border-emerald-200 text-emerald-700 font-bold text-[11px] uppercase tracking-wider rounded-lg bg-emerald-50"
                                        onClick={() => {
                                            setSelectedApp(app);
                                            setIsVerifyModalOpen(true);
                                        }}
                                    >
                                        <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                                        Verify {app.statusId === 9 ? "Joining" : (app.statusId === 7 ? "Offer" : (app.statusId === 6 ? "Interview" : "Referral"))}
                                    </Button>
                                </div>
                            )}
                            {(app.verificationStatus === 'pending_employee' || (app.verificationStatus === 'pending' && (app.statusId === 6 || app.statusId === 7 || app.statusId === 9))) && (
                                <div className="flex flex-col gap-1.5 items-end">
                                    <p className="text-[10px] text-emerald-600 font-medium italic">Proof Submitted 📎</p>
                                    <p className="text-[9px] text-slate-400 italic">Waiting for employee verification</p>
                                </div>
                            )}
                             {((app.statusId === 5 && app.verificationStatus === 'verified') || (app.statusId === 6 && !['pending', 'pending_jobseeker', 'pending_employee', 'verified'].includes(app.verificationStatus || 'none'))) && !app.jobIsReferral && (
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="h-8 border-amber-200 text-amber-700 font-bold text-[11px] uppercase tracking-wider rounded-lg bg-amber-50"
                                    onClick={() => {
                                        setSelectedApp(app);
                                        setInitiateTargetStatus(6);
                                        setIsInitiateModalOpen(true);
                                    }}
                                >
                                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                    Interview Scheduled
                                </Button>
                             )}
                             {((app.statusId === 6 && app.verificationStatus === 'verified') || (app.statusId === 7 && !['pending', 'pending_jobseeker', 'pending_employee', 'verified'].includes(app.verificationStatus || 'none'))) && !app.jobIsReferral && (
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="h-8 border-purple-200 text-purple-700 font-bold text-[11px] uppercase tracking-wider rounded-lg bg-purple-50"
                                    onClick={() => {
                                        setSelectedApp(app);
                                        setInitiateTargetStatus(7);
                                        setIsInitiateModalOpen(true);
                                    }}
                                >
                                    <Trophy className="w-3.5 h-3.5 mr-1.5" />
                                    Offer Received
                                </Button>
                             )}
                             {((app.statusId === 7 && app.verificationStatus === 'verified') || app.statusId === 8 || (app.statusId === 9 && !['pending', 'pending_jobseeker', 'pending_employee', 'verified'].includes(app.verificationStatus || 'none'))) && !app.jobIsReferral && (
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="h-8 border-emerald-200 text-emerald-700 font-bold text-[11px] uppercase tracking-wider rounded-lg bg-emerald-50"
                                    onClick={() => {
                                        setSelectedApp(app);
                                        setInitiateTargetStatus(9);
                                        setIsInitiateModalOpen(true);
                                    }}
                                >
                                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                    Joined Company
                                </Button>
                             )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          Applied {format(new Date(app.appliedAt), "PPP")}
                        </span>
                        <Link href={`/jobs/${app.jobId}`}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs font-semibold transition-colors">
                          View Job <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        {/* Chat Button */}
                        {(app.statusId >= 3 && app.statusId <= 8) && (
                            <div className="relative inline-block">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold text-[11px] uppercase tracking-wider rounded-lg"
                                    onClick={() => {
                                        setActiveChatAppId(app.id);
                                        setIsChatOpen(true);
                                    }}
                                >
                                    <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                                    Chat
                                </Button>
                                {app.unreadChatCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white animate-bounce">
                                        {app.unreadChatCount > 9 ? '9+' : app.unreadChatCount}
                                    </span>
                                )}
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {app.statusId === 13 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      {app.jobseekerFeedback || app.feedbackSubmittedAt ? (
                        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 flex items-center gap-2.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          <span className="text-xs font-semibold text-slate-600">
                            Thank you! Referral confirmation feedback has been submitted.
                          </span>
                        </div>
                      ) : (() => {
                        const updatedAt = app.updatedAt ? new Date(app.updatedAt) : new Date(app.appliedAt);
                        const diffTime = new Date().getTime() - updatedAt.getTime();
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        const isEligible = diffDays >= 5 || simulatedElapsed[app.id];
                        
                        if (!isEligible) {
                          return (
                            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                                  <Clock className="w-4 h-4 text-indigo-500" />
                                  Candidate Confirmation Stage
                                </p>
                                <p className="text-[11px] text-indigo-600 leading-normal">
                                  JobsDart will ask for your confirmation feedback after 5 days to ensure transparency and track response time.
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[10px] font-bold uppercase tracking-wider bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg whitespace-nowrap self-start md:self-auto"
                                onClick={() => setSimulatedElapsed(prev => ({ ...prev, [app.id]: true }))}
                              >
                                Simulate 5 Days (Test Mode)
                              </Button>
                            </div>
                          );
                        }

                        // Retrieve current form state for this app
                        const formState = feedbackAnswers[app.id] || { recruiterContact: '', movedForward: '', genuineReferral: '' };
                        const updateForm = (field: string, val: string) => {
                          setFeedbackAnswers(prev => ({
                            ...prev,
                            [app.id]: {
                              ...formState,
                              [field]: val
                            }
                          }));
                        };

                        const isFormComplete = !!(formState.recruiterContact && formState.movedForward && formState.genuineReferral);

                        return (
                          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 md:p-5 space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                              <ShieldCheck className="w-5 h-5 text-indigo-600" />
                              <h4 className="font-extrabold text-slate-800 text-sm">Candidate Confirmation & Feedback</h4>
                            </div>

                            <div className="space-y-3.5">
                              {/* Q1 */}
                              <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700">1. Did you receive any recruiter call/email?</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {[
                                    "Received recruiter response",
                                    "No response yet",
                                    "Fake/Spam referral",
                                    "Interview scheduled"
                                  ].map((opt) => (
                                    <button
                                      key={opt}
                                      type="button"
                                      className={cn(
                                        "px-3 py-2 text-[11px] font-bold rounded-xl border text-center transition-all",
                                        formState.recruiterContact === opt
                                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100"
                                          : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/30"
                                      )}
                                      onClick={() => updateForm('recruiterContact', opt)}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Q2 */}
                              <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700">2. Did your application move forward?</Label>
                                <div className="flex gap-2">
                                  {["Yes", "No"].map((opt) => (
                                    <button
                                      key={opt}
                                      type="button"
                                      className={cn(
                                        "px-4 py-2 text-[11px] font-bold rounded-xl border text-center transition-all min-w-[70px]",
                                        formState.movedForward === opt
                                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100"
                                          : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/30"
                                      )}
                                      onClick={() => updateForm('movedForward', opt)}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Q3 */}
                              <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700">3. Was the referral genuine?</Label>
                                <div className="flex gap-2">
                                  {["Yes", "No"].map((opt) => (
                                    <button
                                      key={opt}
                                      type="button"
                                      className={cn(
                                        "px-4 py-2 text-[11px] font-bold rounded-xl border text-center transition-all min-w-[70px]",
                                        formState.genuineReferral === opt
                                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100"
                                          : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/30"
                                      )}
                                      onClick={() => updateForm('genuineReferral', opt)}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Warnings */}
                            {formState.recruiterContact === 'Fake/Spam referral' && (
                              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5">
                                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-rose-700">Dispute Escalation Alert</p>
                                  <p className="text-[10px] text-rose-600 leading-normal">
                                    Reporting this as Fake/Spam will deduct 25 trust score points from the employee and refund your 2 credits. Flagrant or false spam reports are subject to review.
                                  </p>
                                </div>
                              </div>
                            )}

                            {formState.recruiterContact === 'Interview scheduled' && (
                              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5">
                                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-emerald-700">Application Milestone</p>
                                  <p className="text-[10px] text-emerald-600 leading-normal">
                                    Selecting "Interview scheduled" will automatically advance your application to "Interviewing" and award rewards to your referrer employee.
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-end pt-2">
                              <Button
                                size="sm"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 shadow-lg shadow-indigo-100 text-xs h-9"
                                disabled={!isFormComplete || submittingFeedback[app.id]}
                                onClick={async () => {
                                  setSubmittingFeedback(prev => ({ ...prev, [app.id]: true }));
                                  try {
                                    const res = await fetch(`/api/applications/${app.id}/confirm`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify(formState)
                                    });
                                    if (!res.ok) throw new Error('Failed to submit feedback');
                                    
                                    toast({
                                      title: "Feedback Submitted! 👍",
                                      description: "Thank you for helping keep JobsDart transparent and reliable."
                                    });
                                    
                                    // Refresh applications
                                    mutateApplications();
                                    refreshUser();
                                  } catch (e) {
                                    toast({
                                      title: "Submission Failed",
                                      description: "Failed to process feedback. Please try again.",
                                      variant: "destructive"
                                    });
                                  } finally {
                                    setSubmittingFeedback(prev => ({ ...prev, [app.id]: false }));
                                  }
                                }}
                              >
                                {submittingFeedback[app.id] ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Submit Feedback"
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Empty State */}
        {!loading && !userLoading && applications.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center max-w-lg mx-auto mt-4"
          >
            <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-violet-400" />
            </div>
            <h3 className="text-slate-700 font-bold text-xl mb-2">No Applications Yet</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              You haven't applied to any jobs yet. Start browsing and apply to your dream roles!
            </p>
            <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-6">
              <Link href="/jobs">
                <Search className="w-4 h-4 mr-2" />
                Browse Jobs
              </Link>
            </Button>
          </motion.div>
        )}
      </div>

      {/* Unlock Confirmation Modal */}
      <Dialog open={isUnlockModalOpen} onOpenChange={setIsUnlockModalOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
                <Coins className="w-6 h-6 text-amber-500" />
                Unlock Premium Referral
            </DialogTitle>
            <DialogDescription className="pt-2 text-slate-600 leading-relaxed">
                A verified employee from <span className="font-bold text-slate-900">{selectedApp?.companyName}</span> is ready to refer you! 
                Unlocking will reveal your profile to them and allow them to proceed with the internal referral.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 my-2">
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Cost to Unlock</span>
                <span className="text-indigo-600 font-extrabold text-xl">2 Credits</span>
            </div>
            <div className="h-px bg-slate-200 mb-4" />
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Your Balance</span>
                <span className={`font-bold text-base ${(((user as any)?.subscriptionCredits || 0) + ((user as any)?.purchasedCredits || 0)) < 2 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {((user as any)?.subscriptionCredits || 0) + ((user as any)?.purchasedCredits || 0)} Credits
                </span>
            </div>
            {(((user as any)?.subscriptionCredits || 0) + ((user as any)?.purchasedCredits || 0)) < 2 && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-rose-700">Not Enough Credits</p>
                        <p className="text-[10px] text-rose-600 leading-normal">
                            You need at least 2 credits to unlock this referral. Please upgrade your plan or top up your credits.
                        </p>
                        <Link href="/jobseeker/credits" className="inline-block text-[10px] font-bold text-indigo-600 hover:underline mt-1">
                            Top Up Credits →
                        </Link>
                    </div>
                </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsUnlockModalOpen(false)}>
                Maybe Later
            </Button>
            <Button 
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200"
                disabled={unlockingId !== null || (((user as any)?.subscriptionCredits || 0) + ((user as any)?.purchasedCredits || 0)) < 2}
                onClick={async () => {
                    if (!selectedApp) return;
                    setUnlockingId(String(selectedApp.id));
                    try {
                        const res = await fetch(`/api/applications/${selectedApp.id}/unlock`, { method: 'POST' });
                        const data = await res.json();
                        
                        if (!res.ok) throw new Error(data.error || 'Failed to unlock');

                        toast({
                            title: "Referral Unlocked! 🎉",
                            description: "The employee will now submit your internal referral. Good luck!",
                        });
                        
                        setIsUnlockModalOpen(false);
                        refreshUser(); // Update credit balance
                        window.location.reload(); // Quickest way to refresh applications status
                    } catch (error: any) {
                        toast({
                            title: "Unlock Failed",
                            description: error.message,
                            variant: "destructive"
                        });
                    } finally {
                        setUnlockingId(null);
                    }
                }}
            >
                {unlockingId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Confirm & Unlock
                    </>
                )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Referral/Joining Verification Modal */}
      <Dialog open={isVerifyModalOpen} onOpenChange={(open) => {
        setIsVerifyModalOpen(open);
        if (!open) {
            setShowDisputeInput(false);
            setDisputeReasonInput("");
        }
      }}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
                Confirm {selectedApp?.statusId === 5 ? "Referral" : (selectedApp?.statusId === 6 ? "Interview Scheduled" : (selectedApp?.statusId === 7 ? "Offer Letter" : "Joining"))}
            </DialogTitle>
            <DialogDescription className="pt-2">
                {selectedApp?.statusId === 5 
                    ? "The referring employee has uploaded proof of your internal referral submission. Please verify if this is accurate to proceed." 
                    : (selectedApp?.statusId === 6 
                        ? "The employee has indicated that your interview is scheduled. Please confirm if this is correct."
                        : (selectedApp?.statusId === 7
                            ? "The employee indicated you have received an offer letter. Please confirm if you have received it."
                            : "The referring employee has uploaded proof of your successful hire. Please verify if this is accurate to proceed."))
                }
            </DialogDescription>
          </DialogHeader>

          {selectedApp?.proofUrl && selectedApp?.statusId !== 6 && selectedApp?.statusId !== 7 && (
            <div className="space-y-4 my-2">
                <div className="text-sm font-semibold text-slate-700 flex items-center gap-2 uppercase tracking-tight">
                    <Eye className="w-4 h-4" /> 
                    Uploaded Evidence
                </div>
                <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner group">
                    <img 
                        src={selectedApp.proofUrl} 
                        alt="Proof of referral" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <a 
                        href={selectedApp.proofUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold transition-opacity"
                    >
                        View Full Size
                    </a>
                </div>
            </div>
          )}

          {selectedApp?.internalReferralId && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500 flex justify-between">
                <span>Internal Tracking ID:</span>
                <code className="font-bold text-slate-700">{selectedApp.internalReferralId}</code>
            </div>
          )}

          <AnimatePresence>
            {showDisputeInput && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 mt-3 pt-3 border-t border-slate-100 overflow-hidden"
                >
                    <Label className="text-xs font-bold text-rose-600 flex items-center gap-1.5 uppercase tracking-tight">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Please state why this submission is invalid
                    </Label>
                    <Textarea 
                        placeholder="e.g. Proof image is fake / does not match my details / no referral email received..." 
                        value={disputeReasonInput}
                        onChange={(e) => setDisputeReasonInput(e.target.value)}
                        className="h-20 text-xs rounded-xl border-slate-200 focus-visible:ring-rose-500 placeholder:text-slate-400"
                        disabled={isSubmittingVerify}
                    />
                </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            {showDisputeInput ? (
                <>
                    <Button 
                        variant="ghost" 
                        className="flex-1 text-slate-500 hover:text-slate-700 font-medium text-xs rounded-xl"
                        disabled={isSubmittingVerify}
                        onClick={() => setShowDisputeInput(false)}
                    >
                        Cancel
                    </Button>
                    <Button 
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-100 text-xs"
                        disabled={isSubmittingVerify || !disputeReasonInput.trim()}
                        onClick={async () => {
                            if (!selectedApp || !disputeReasonInput.trim()) return;
                            setIsSubmittingVerify(true);
                            try {
                                const res = await fetch(`/api/applications/${selectedApp.id}/verify`, {
                                    method: 'POST',
                                    body: JSON.stringify({ action: 'dispute', requesterRole: user?.role, disputeReason: disputeReasonInput.trim() })
                                });
                                if (!res.ok) throw new Error('Failed to submit dispute');
                                toast({ title: "Dispute Submitted", description: "Admin will review the case shortly." });
                                setIsVerifyModalOpen(false);
                                window.location.reload();
                            } catch (e) {
                                toast({ title: "Error", description: "Submission failed", variant: "destructive" });
                            } finally {
                                setIsSubmittingVerify(false);
                            }
                        }}
                    >
                        {isSubmittingVerify ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Dispute"}
                    </Button>
                </>
            ) : (
                <>
                    <Button 
                        variant="ghost" 
                        className="flex-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold rounded-xl"
                        disabled={isSubmittingVerify}
                        onClick={() => setShowDisputeInput(true)}
                    >
                        It's Fake
                    </Button>
                    <Button 
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100"
                        disabled={isSubmittingVerify}
                        onClick={async () => {
                            if (!selectedApp) return;
                            setIsSubmittingVerify(true);
                            try {
                                const res = await fetch(`/api/applications/${selectedApp.id}/verify`, {
                                    method: 'POST',
                                    body: JSON.stringify({ action: 'confirm', requesterRole: user?.role })
                                });
                                if (!res.ok) throw new Error('Failed to confirm');
                                toast({ title: "Verified! 🎉", description: "Thank you for confirming your referral." });
                                setIsVerifyModalOpen(false);
                                window.location.reload();
                            } catch (e) {
                                toast({ title: "Error", description: "Submission failed", variant: "destructive" });
                            } finally {
                                setIsSubmittingVerify(false);
                            }
                        }}
                    >
                        {isSubmittingVerify ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, it's correct"}
                    </Button>
                </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Drawer */}
      {/* Interview Initiation Modal */}
      <Dialog open={isInitiateModalOpen} onOpenChange={setIsInitiateModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
                {initiateTargetStatus === 6 ? (
                    <>
                        <Calendar className="w-6 h-6 text-amber-600" />
                        Interview Scheduled
                    </>
                ) : initiateTargetStatus === 7 ? (
                    <>
                        <Trophy className="w-6 h-6 text-purple-600" />
                        Offer Received
                    </>
                ) : (
                    <>
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                        Joined Company
                    </>
                )}
            </DialogTitle>
            <DialogDescription className="pt-2">
                {initiateTargetStatus === 6 
                    ? `Have you received an interview invite for ${selectedApp?.companyName}? Upload a screenshot of the invite or email to update your status.`
                    : initiateTargetStatus === 7
                        ? `Congratulations! Have you received an offer letter from ${selectedApp?.companyName}? Upload the offer letter or confirmation email.`
                        : `Welcome aboard! Have you joined ${selectedApp?.companyName}? Upload your ID card, welcome email, or appointment letter to verify.`
                }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="initiateProof">
                    {initiateTargetStatus === 6 ? "Invitation Screenshot/Email (max 2MB)" : initiateTargetStatus === 7 ? "Offer Letter / Confirmation (max 2MB)" : "ID Card / Appointment Letter (max 2MB)"}
                </Label>
                <div className="relative group">
                    <div className={cn(
                        "absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 transition-colors",
                        initiateTargetStatus === 6 ? "group-focus-within:text-amber-500" : initiateTargetStatus === 7 ? "group-focus-within:text-purple-500" : "group-focus-within:text-emerald-500"
                    )}>
                        <UploadCloud className="w-5 h-5" />
                    </div>
                    <Input 
                        id="initiateProof" 
                        type="file" 
                        required
                        className="pl-10 cursor-pointer h-12 pt-3"
                        onChange={(e) => setInitiateFile(e.target.files?.[0] || null)}
                        accept=".pdf,image/*"
                    />
                </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsInitiateModalOpen(false)}>
                Cancel
            </Button>
            <Button 
                className={cn(
                    "flex-1 text-white font-bold rounded-xl shadow-lg",
                    initiateTargetStatus === 6 
                        ? "bg-amber-600 hover:bg-amber-700 shadow-amber-100" 
                        : initiateTargetStatus === 7
                            ? "bg-purple-600 hover:bg-purple-700 shadow-purple-100"
                            : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                )}
                disabled={!initiateFile || isSubmittingInitiate}
                onClick={async () => {
                    if (!selectedApp || !initiateFile) return;
                    setIsSubmittingInitiate(true);
                    try {
                        // 1. Upload proof
                        const formData = new FormData();
                        formData.append('file', initiateFile);
                        const uploadRes = await fetch(`/api/applications/${selectedApp.id}/proof`, {
                            method: 'POST',
                            body: formData
                        });
                        if (!uploadRes.ok) throw new Error('Failed to upload proof');
                        const { proofUrl } = await uploadRes.json();

                        // 2. Update status
                        const res = await fetch(`/api/applications/${selectedApp.id}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                statusId: initiateTargetStatus, 
                                proofUrl,
                                requesterRole: user?.role
                            })
                        });
                        if (!res.ok) throw new Error('Failed to update status');

                        toast({ 
                            title: initiateTargetStatus === 6 ? "Interview Marked! 🗓️" : initiateTargetStatus === 7 ? "Offer Reported! 🎉" : "Joined Reported! 🎊", 
                            description: "The employee has been notified to verify." 
                        });
                        setIsInitiateModalOpen(false);
                        window.location.reload();
                    } catch (e: any) {
                        toast({ title: "Error", description: e.message, variant: "destructive" });
                    } finally {
                        setIsSubmittingInitiate(false);
                    }
                }}
            >
                {isSubmittingInitiate ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Proof"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ChatDrawer 
        applicationId={activeChatAppId || ""} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        onMessageRead={mutateApplications}
      />
    </div>
  );
}
