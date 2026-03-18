"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import type { Application } from "@/lib/types";
import { useApplications } from "@/hooks/use-jobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Briefcase, Calendar, ClipboardList, Search, CheckCircle2, Clock, XCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  "Profile Viewed": { label: "In Review", color: "text-blue-700", bg: "bg-blue-100", icon: Eye },
  "Selected":       { label: "Selected",  color: "text-emerald-700", bg: "bg-emerald-100", icon: CheckCircle2 },
  "Not Suitable":   { label: "Not Suitable", color: "text-rose-700", bg: "bg-rose-100", icon: XCircle },
  default:          { label: "Applied",   color: "text-slate-600", bg: "bg-slate-100", icon: Clock },
};

function StatusBadge({ status }: { status: Application["statusName"] }) {
  const cfg = statusConfig[status ?? ""] ?? statusConfig.default;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" } }),
};

export default function ApplicationsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !user) router.push("/login");
  }, [user, userLoading, router]);

  const { applications, isLoading: loading } = useApplications(user ? { userId: user.id } : undefined);

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
          const inReview  = applications.filter(a => a.statusName === "Profile Viewed").length;
          const selected  = applications.filter(a => a.statusName === "Selected").length;
          const rejected  = applications.filter(a => a.statusName === "Not Suitable").length;
          const stats = [
            { label: "Applied",    value: applied,  color: "from-slate-400 to-slate-500",    bg: "bg-slate-50",   text: "text-slate-600",   icon: Clock },
            { label: "In Review",  value: inReview, color: "from-blue-400 to-indigo-500",    bg: "bg-blue-50",    text: "text-blue-600",    icon: Eye },
            { label: "Selected",   value: selected, color: "from-emerald-400 to-teal-500",   bg: "bg-emerald-50", text: "text-emerald-600", icon: CheckCircle2 },
            { label: "Not Suitable", value: rejected, color: "from-rose-400 to-pink-500",  bg: "bg-rose-50",    text: "text-rose-600",    icon: XCircle },
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
                        <StatusBadge status={app.statusName} />
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
                      </div>
                    </div>
                  </div>
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
    </div>
  );
}
