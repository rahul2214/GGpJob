"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Job } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PlusCircle, MoreHorizontal, Edit, Trash2, Share2, Users,
  TrendingUp, Briefcase, CheckCircle2
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
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/user-context";
import { ShareButton } from "@/components/share-button";
import { motion } from "framer-motion";

export function ActiveJobsList() {
  const { user } = useUser();
  const [referralJobs, setReferralJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const { toast } = useToast();

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
    }
  }, [user]);

  const monthStart = startOfMonth(new Date());

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

  if (loading && referralJobs.length === 0) {
    return (
      <Card className="border border-slate-100 shadow-sm">
        <CardHeader>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="p-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b border-slate-50 flex items-center gap-4">
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

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

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border border-slate-100/60 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-5 px-7 pt-7">
            <div>
              <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Active Referral Jobs</CardTitle>
              <CardDescription className="text-slate-400 text-sm font-semibold mt-1">
                Manage your posted referral jobs and track applicants.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] uppercase font-black text-indigo-600 bg-indigo-50 border-none tracking-widest px-2.5 py-1">
                {referralJobs.length} job{referralJobs.length !== 1 ? 's' : ''}
              </Badge>
              <Link href="/referrals/post">
                <Button size="sm" className="bg-indigo-600 hover:bg-slate-900 text-white font-black rounded-lg">
                  <PlusCircle className="w-4 h-4 mr-2" /> Post New
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b-slate-100">
                    <TableHead className="pl-7 font-black text-[10px] uppercase tracking-widest text-slate-400 py-4">Job Title</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-4">Company</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-4">Posted</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-4">Applicants</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-4">Selected</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-4">Referred</TableHead>
                    <TableHead className="text-right pr-7 font-black text-[10px] uppercase tracking-widest text-slate-400 py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referralJobs.map((job) => {
                    const isThisMonth = job.postedAt && new Date(job.postedAt) >= monthStart;
                    return (
                      <TableRow key={job.id} className="hover:bg-slate-50/50 transition-colors border-b-slate-50 group">
                        <TableCell className="pl-7 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm tracking-tight group-hover:text-indigo-600 transition-colors">{job.title}</span>
                            {isThisMonth && (
                              <Badge className="text-[9px] px-1.5 py-0 bg-indigo-50 text-indigo-600 border-none font-black uppercase tracking-widest">
                                New
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm font-semibold">{job.companyName || '—'}</TableCell>
                        <TableCell className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                          {job.postedAt ? format(new Date(job.postedAt), 'MMM dd, yyyy') : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-slate-700 text-sm font-black tracking-tight">
                            <Users className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
                            {job.applicantCount || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-black tracking-tight">
                            <TrendingUp className="w-4 h-4 text-emerald-300 group-hover:text-emerald-500 transition-colors" />
                            {job.selectedApplicantCount || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-violet-600 text-sm font-black tracking-tight">
                            <CheckCircle2 className="w-4 h-4 text-violet-300 group-hover:text-violet-500 transition-colors" />
                            {job.referredApplicantCount || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-7 pt-4 pb-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-slate-100 p-1">
                              <DropdownMenuItem asChild className="rounded-lg font-bold text-slate-600 text-xs focus:bg-slate-50">
                                <Link href={`/jobs/${job.id}/applications`} className="flex items-center cursor-pointer">
                                  <Users className="mr-2 h-4 w-4 text-slate-400" />
                                  View Applications
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-lg font-bold text-slate-600 text-xs focus:bg-slate-50 cursor-pointer">
                                <Share2 className="mr-2 h-4 w-4 text-slate-400" />
                                <ShareButton variant="text" jobId={job.uuid} jobTitle={job.title} companyName={job.companyName} />
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="rounded-lg font-bold text-slate-600 text-xs focus:bg-slate-50">
                                <Link href={`/referrals/edit/${job.id}`} className="flex items-center cursor-pointer">
                                  <Edit className="mr-2 h-4 w-4 text-slate-400" />
                                  Edit Job
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setJobToDelete(job)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg font-bold text-xs cursor-pointer mt-1"
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
            </div>

            {referralJobs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-slate-50/30 m-4 rounded-2xl border border-dashed border-slate-200">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-5 text-indigo-500">
                  <Briefcase className="w-8 h-8" />
                </div>
                <p className="text-slate-900 font-black text-lg mb-2 tracking-tight">No referral jobs yet</p>
                <p className="text-slate-500 text-sm mb-6 max-w-sm font-medium leading-relaxed">Post a referral job to start connecting candidates with your company and earning points.</p>
                <Link href="/referrals/post">
                  <Button className="bg-indigo-600 hover:bg-slate-900 hover:scale-105 active:scale-95 transition-all text-white rounded-xl px-6 h-12 shadow-lg shadow-indigo-200 font-black tracking-tight text-sm">
                    <PlusCircle className="w-5 h-5 mr-2" /> Post Your First Referral
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
