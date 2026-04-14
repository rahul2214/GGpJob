
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Job } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import {
  PlusCircle, MoreHorizontal, Edit, Trash2, Share2, Users,
  CalendarDays, TrendingUp, AlertTriangle, Briefcase
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className="h-full"
    >
      <Card className="h-full relative overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
        <div className={`absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5 ${color}`} />
        <CardContent className="pt-7 pb-6 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
              </div>
              {showLimit && isWarning && (
                <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tight ${isFull ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {isFull ? 'Limit reached' : 'Low quota'}
                </div>
              )}
            </div>

            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1.5">{label}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tighter transition-all group-hover:scale-105 origin-left">
                {used}
              </span>
              {showLimit ? (
                <span className="text-slate-300 text-lg font-medium">/ {limit}</span>
              ) : isUnlimited ? (
                <span className="text-emerald-500 text-lg font-bold ml-2">Unlimited</span>
              ) : null}
            </div>
          </div>

          {showLimit && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400">{Math.round(pct)}% UTILIZED</span>
              </div>
              <div className="h-2 bg-slate-50 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: delay + 0.2 }}
                  className={`h-full rounded-full ${isFull ? 'bg-red-500' : isWarning ? 'bg-amber-400' : color}`}
                />
              </div>
            </div>
          )}
          
          {!showLimit && (
            <div className="mt-6 pt-2 border-t border-slate-50 flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Monitoring</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function EmployeeDashboard() {
  const { user } = useUser();
  const [referralJobs, setReferralJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const { toast } = useToast();

  // Limits from employee profile (come through user context)
  const jobPostLimit = (user as any)?.jobPostLimit ?? 5;

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
    if (user) fetchJobs();
  }, [user]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const now = new Date();
  const monthStart = startOfMonth(now);

  const jobsThisMonth = useMemo(
    () => referralJobs.filter(j => j.postedAt && new Date(j.postedAt) >= monthStart).length,
    [referralJobs]
  );

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    const uuidToDelete = jobToDelete.uuid;
    setReferralJobs(prev => prev.filter(job => job.uuid !== uuidToDelete));
    try {
      const response = await fetch(`/api/jobs/${uuidToDelete}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete job');
      toast({ title: 'Success', description: 'Job deleted successfully.' });
      await fetchJobs();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete job. Reverting list.', variant: 'destructive' });
      await fetchJobs();
    } finally {
      setJobToDelete(null);
    }
  };

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

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <>
      <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The job posting for &quot;{jobToDelete?.title}&quot; will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setJobToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        {(() => {
          const totalSelected = referralJobs.reduce((s, j) => s + (j.selectedApplicantCount || 0), 0);
          const totalApplicants = referralJobs.reduce((s, j) => s + (j.applicantCount || 0), 0);
          
          // User-specific limits
          const appLimitPerJob = (user as any)?.max_applies_limit ?? -1;
          const totalAppQuota = referralJobs.length > 0 && appLimitPerJob !== -1 ? referralJobs.length * appLimitPerJob : appLimitPerJob;
          
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                icon={Briefcase}
                label="Jobs Posted (Month)"
                used={jobsThisMonth}
                limit={jobPostLimit}
                color="bg-indigo-600"
                delay={0}
              />
              <StatCard
                icon={Users}
                label="Total Applications"
                used={totalApplicants}
                limit={0} // Disable limit display
                color="bg-blue-600"
                delay={0.05}
              />
              <StatCard
                icon={TrendingUp}
                label="Selected Candidates"
                used={totalSelected}
                limit={0} // Disable limit display
                color="bg-emerald-600"
                delay={0.1}
              />
            </div>
          );
        })()}

        {/* ── Monthly limit notice ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-3 text-sm text-indigo-700"
        >
          <CalendarDays className="w-4 h-4 shrink-0 text-indigo-500" />
          <span>
            You have used <strong>{jobsThisMonth}</strong> of your <strong>{jobPostLimit}</strong> monthly job posts.
            {jobsThisMonth < jobPostLimit
              ? ` You can post ${jobPostLimit - jobsThisMonth} more job${jobPostLimit - jobsThisMonth !== 1 ? 's' : ''} this month.`
              : ' Your monthly limit is reached — resets on the 1st of next month.'}
          </span>
         
        </motion.div>

        {/* ── Jobs table ──────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="border border-slate-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">My Referral Jobs</CardTitle>
                <CardDescription className="text-slate-500 text-sm mt-0.5">
                  Refer candidates and earn rewards when they're hired.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
                  {referralJobs.length} job{referralJobs.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/60 hover:bg-slate-50/60">
                    <TableHead className="pl-5 font-semibold text-slate-600">Job Title</TableHead>
                    <TableHead className="font-semibold text-slate-600">Company</TableHead>
                    <TableHead className="font-semibold text-slate-600">Posted</TableHead>
                    <TableHead className="font-semibold text-slate-600">Status</TableHead>
                    <TableHead className="font-semibold text-slate-600">Applicants</TableHead>
                    <TableHead className="font-semibold text-slate-600">Selected</TableHead>
                    <TableHead className="text-right pr-5 font-semibold text-slate-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referralJobs.map((job, idx) => {
                    const isThisMonth = job.postedAt && new Date(job.postedAt) >= monthStart;
                    return (
                      <TableRow key={job.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="pl-5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 text-sm">{job.title}</span>
                            {isThisMonth && (
                              <Badge className="text-[10px] px-1.5 py-0 bg-indigo-100 text-indigo-700 border-indigo-200 font-medium">
                                This month
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">{job.companyName || '—'}</TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {job.postedAt ? format(new Date(job.postedAt), 'dd MMM yyyy') : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs font-medium">
                            Open
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-slate-700 text-sm font-medium">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {job.applicantCount || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {job.selectedApplicantCount || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-5">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem asChild>
                                <Link href={`/jobs/${job.id}/applications`} className="flex items-center">
                                  <Users className="mr-2 h-4 w-4 text-slate-500" />
                                  View Applications
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Share2 className="mr-2 h-4 w-4 text-slate-500" />
                                <ShareButton jobId={job.uuid} jobTitle={job.title} companyName={job.companyName} />
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/referrals/edit/${job.id}`} className="flex items-center">
                                  <Edit className="mr-2 h-4 w-4 text-slate-500" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setJobToDelete(job)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {!loading && referralJobs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <Briefcase className="w-7 h-7 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-semibold mb-1">No referral jobs yet</p>
                  <p className="text-slate-400 text-sm mb-5">Post a referral job to start connecting candidates with your company.</p>
                  <Link href="/referrals/post">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5">
                      <PlusCircle className="w-4 h-4 mr-2" /> Post Your First Referral
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
