
"use client";

import { useState, useEffect } from "react";
import type { Job } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Users, Share2, Zap, Calendar, LayoutDashboard, Crown, Star, Search, TrendingUp, Briefcase, Bell, Info, MessageSquareQuote } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { useUser } from "@/contexts/user-context";
import { ShareButton } from "../share-button";


export default function RecruiterDashboard() {
  const { user } = useUser();
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [latestNotifId, setLatestNotifId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchJobs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Use cache: 'no-store' to ensure recruiters always see their latest job list
      const res = await fetch(`/api/jobs?recruiterId=${user.uuid}&isReferral=false&fresh=true`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if(Array.isArray(data)) {
          // Sort by date on the client side
          const sortedJobs = data.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
          setPostedJobs(sortedJobs);
        } else {
          setPostedJobs([]);
        }
      } else {
        setPostedJobs([]);
        console.error("Failed to fetch posted jobs");
      }
    } catch (error) {
      console.error("Failed to fetch posted jobs", error);
      setPostedJobs([]);
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
                        if (latestNotifId && newest.id > latestNotifId) {
                            toast({
                                title: "New Notification",
                                description: newest.message,
                            });
                        }
                        setLatestNotifId(newest.id);
                        setRecentActivity(data.slice(0, 10)); // Keep last 10 for activity feed
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
  
  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    
    const uuidToDelete = jobToDelete.uuid;
    // Optimistic UI update
    setPostedJobs(prev => prev.filter(job => job.uuid !== uuidToDelete));
    
    try {
      const response = await fetch(`/api/jobs/${uuidToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
      toast({ title: 'Success', description: 'Job deleted successfully.' });
      // Re-fetch to confirm sync with server
      await fetchJobs();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete job. Reverting list.', variant: 'destructive' });
      // Revert UI on failure
      await fetchJobs();
      console.error(error);
    } finally {
      setJobToDelete(null);
    }
  };


  if (loading && postedJobs.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-36" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                
                <TableHead>Location</TableHead>
                <TableHead>Date Posted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
  const totalApplicants = postedJobs.reduce((acc, job) => acc + (job.applicantCount || 0), 0);
  const totalSelected = postedJobs.reduce((acc, job) => acc + (job.selectedApplicantCount || 0), 0);

  return (
    <>
      {user && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 mt-2">
            <Card className="border-none shadow-lg shadow-indigo-100 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                            {(user.planType === 'premium' || user.planType === 'pro') ? <Crown className="w-5 h-5" /> : (user.planType === 'talent' ? <Search className="w-5 h-5" /> : <Star className="w-5 h-5" />)}
                        </div>
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none uppercase text-[10px] tracking-widest font-bold">
                            Active Plan
                        </Badge>
                    </div>
                    <h3 className="text-2xl font-black mb-1 capitalize">{user.planType === 'pro' ? 'Pro' : (user.planType || 'Basic')} Plan</h3>
                    <p className="text-indigo-100 text-xs font-medium opacity-80">
                        {user.planType === 'pro' ? '50 Jobs, 3-Month Portal Access' : (user.planType === 'premium' ? 'Full portal access & Talent Search' : (user.planType === 'talent' ? 'Talent database access only' : 'Entry-level hiring tools'))}
                    </p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white border border-slate-100">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Jobs</div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-black text-slate-900">{postedJobs.length}</span>
                        <span className="text-slate-400 font-bold text-sm">/ {user.planType === 'pro' ? '50' : (user.planType === 'premium' ? '10' : '1')}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                            className="bg-blue-500 h-full transition-all duration-500" 
                            style={{ width: `${Math.min((postedJobs.length / (user.planType === 'pro' ? 50 : (user.planType === 'premium' ? 10 : 1))) * 100, 100)}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white border border-slate-100">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <LayoutDashboard className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Appls</div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-black text-slate-900">{totalApplicants}</span>
                        <span className="text-slate-400 font-bold text-sm">Applications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Live Tracking</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white border border-slate-100">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selections</div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-black text-slate-900">{totalSelected}</span>
                        <span className="text-slate-400 font-bold text-sm">Candidates</span>
                    </div>
                     <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Hiring Success</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white border border-slate-100">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expiration</div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-black text-slate-900">
                            {user.planExpiresAt ? differenceInDays(new Date(user.planExpiresAt), new Date()) : '30'}
                        </span>
                        <span className="text-slate-400 font-bold text-sm">Days Left</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                        Until {user.planExpiresAt ? format(new Date(user.planExpiresAt), "MMM dd, yyyy") : format(new Date().setDate(new Date().getDate() + 30), "MMM dd, yyyy")}
                    </p>
                </CardContent>
            </Card>
        </div>
      )}

      <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job posting for &quot;{jobToDelete?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setJobToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-8">
            <Card className="border border-slate-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>My Job Postings</CardTitle>
                    <CardDescription>Manage your company's open positions.</CardDescription>
                </div>
                </CardHeader>
                <CardContent>
                <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Date Posted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applicants</TableHead>
                        <TableHead>Selected</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {postedJobs.map((job) => (
                        <TableRow key={job.id} className="group hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-bold text-slate-800">{job.title}</TableCell>
                        <TableCell className="text-slate-500 text-xs">{job.location}</TableCell>
                        <TableCell className="text-slate-500 text-xs">{format(new Date(job.postedAt), "dd MMM yyyy")}</TableCell>
                        <TableCell>
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                            Active
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1.5 font-bold text-slate-700">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                {job.applicantCount || 0}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1.5 font-black text-indigo-600">
                                <TrendingUp className="w-3.5 h-3.5" />
                                {job.selectedApplicantCount || 0}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-slate-100 p-1">
                                <DropdownMenuItem asChild className="rounded-lg font-bold text-xs focus:bg-slate-50">
                                    <Link href={`/jobs/${job.id}/applications`} className="flex items-center cursor-pointer">
                                        <Users className="mr-2 h-4 w-4 text-slate-400" />
                                        View Applications
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-lg font-bold text-xs focus:bg-slate-50 cursor-pointer">
                                    <Share2 className="mr-2 h-4 w-4 text-slate-400" />
                                    <ShareButton variant="text" jobId={job.uuid} jobTitle={job.title} companyName={job.companyName} />
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-lg font-bold text-xs focus:bg-slate-50">
                                    <Link href={`/jobs/edit/${job.id}`} className="flex items-center cursor-pointer">
                                        <Edit className="mr-2 h-4 w-4 text-slate-400" />
                                        Edit Job
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setJobToDelete(job)} className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg font-bold text-xs cursor-pointer mt-1">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Posting
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </div>
                {!loading && postedJobs.length === 0 && (
                    <div className="py-20 text-center bg-slate-50/50 m-4 rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mx-auto mb-4">
                            <Briefcase className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">No Active Jobs</h3>
                        <p className="text-slate-500 text-sm mb-6">Post your first position to start receiving applications.</p>
                        <Link href="/jobs/post">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 font-bold shadow-lg shadow-indigo-100">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Post a Job
                            </Button>
                        </Link>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>

        <div className="xl:col-span-1 space-y-6">
            <Card className="border-none bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-xl shadow-indigo-100 overflow-hidden relative group">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
                <CardContent className="p-7 relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20">
                            <PlusCircle className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-black text-lg tracking-tight">Need Help?</h4>
                    </div>
                    <p className="text-indigo-100 text-xs mb-6 leading-relaxed font-medium">
                        Our premium recruiters get dedicated support and candidate matching. 
                        Upgrade your plan for full access.
                    </p>
                    <Link href="/company/payment">
                        <Button className="w-full bg-white text-indigo-700 hover:bg-indigo-50 font-black border-none rounded-xl text-[11px] h-10 uppercase tracking-widest shadow-lg">
                            View Plans
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            <Card className="border border-slate-100 shadow-sm overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-50 pb-4 px-6 pt-6">
                    <CardTitle className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Bell className="w-5 h-5 text-indigo-600" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-2">
                    <div className="divide-y divide-slate-50">
                        {(() => {
                            const cleanMessage = (msg: string) => msg.replace(/\[APP_ID:[^\]]+\]\s*/, '');
                            return recentActivity.map((act) => (
                            <div key={act.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                                <div className="flex gap-4">
                                    <div className={cn(
                                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors",
                                        act.message.includes('[APP_ID:') ? "bg-indigo-50 text-indigo-600 border border-indigo-100/50" : "bg-slate-50 text-slate-400 border border-slate-100"
                                    )}>
                                        {act.message.includes('[APP_ID:') ? <MessageSquareQuote className="w-4 h-4" /> : <Info className="w-4 h-4" />}
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
                    {recentActivity.length > 0 && (
                        <div className="p-4 px-6 border-t border-slate-50">
                            <Link href="/notifications" className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors">
                                View All Notifications
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
