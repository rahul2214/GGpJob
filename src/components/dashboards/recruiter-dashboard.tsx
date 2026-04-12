
"use client";

import { useState, useEffect } from "react";
import type { Job } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Users, Share2, Zap, Calendar, LayoutDashboard, Crown, Star, Search, TrendingUp, Briefcase } from "lucide-react";
import { format, differenceInDays } from "date-fns";
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Job Postings</CardTitle>
            <CardDescription>Manage your company's open positions.</CardDescription>
          </div>
         
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
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
                 <TableRow key={job.id}>
                   <TableCell className="font-medium">{job.title}</TableCell>
                   <TableCell className="text-muted-foreground">{job.companyName || '—'}</TableCell>
                   <TableCell className="text-xs">{job.location}</TableCell>
                   <TableCell className="text-xs">{format(new Date(job.postedAt), "dd MMM yyyy")}</TableCell>
                   <TableCell>
                     <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-[10px]">
                       Open
                     </Badge>
                   </TableCell>
                   <TableCell>
                     <div className="flex items-center gap-1.5 font-medium">
                        <Users className="w-3 h-3 text-slate-400" />
                        {job.applicantCount || 0}
                     </div>
                   </TableCell>
                   <TableCell>
                      <div className="flex items-center gap-1.5 font-bold text-indigo-600">
                        <TrendingUp className="w-3 h-3" />
                        {job.selectedApplicantCount || 0}
                      </div>
                   </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <DropdownMenuItem asChild>
                            <Link href={`/jobs/${job.id}/applications`}>
                                <Users className="mr-2 h-4 w-4" />
                                View Applications
                            </Link>
                         </DropdownMenuItem>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Share2 className="mr-2 h-4 w-4" />
                            <ShareButton jobId={job.uuid} jobTitle={job.title} companyName={job.companyName} />
                         </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                           <Link href={`/jobs/edit/${job.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                           </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setJobToDelete(job)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && postedJobs.length === 0 && (
            <p className="text-center text-muted-foreground py-8">You haven't posted any jobs yet.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
