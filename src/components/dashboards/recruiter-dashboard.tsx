
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Job } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Users, Share2, Calendar, LayoutDashboard, Crown, Star, Search, TrendingUp, Briefcase, Power, PowerOff } from "lucide-react";
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
import { useSubscription } from "@/hooks/use-subscription";
import { SubscriptionExpiryBanner } from "@/components/subscription-expiry-banner";
import { SubscriptionExpiredModal } from "@/components/subscription-expired-modal";
import { JobStatusBadge } from "@/components/job-status-badge";

type JobTab = "active" | "archived" | "closed" | "draft";

interface RecruiterDashboardProps {
  onlyPostings?: boolean;
}

export default function RecruiterDashboard({ onlyPostings = false }: RecruiterDashboardProps) {
  const { user } = useUser();
  const subInfo = useSubscription();
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  // Modal control
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [modalVariant, setModalVariant] = useState<"expired" | "required">("expired");
  const [activeTab, setActiveTab] = useState<JobTab>("active");

  const { toast } = useToast();
  const isExpired = subInfo?.isExpired ?? false;
  const graceDays = subInfo?.isInGracePeriod ? subInfo.graceDaysRemaining : undefined;

  const fetchJobs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // fresh=true + recruiterId returns all statuses for dashboard tabs
      const res = await fetch(`/api/jobs?recruiterId=${user.uuid}&isReferral=false&fresh=true`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const sortedJobs = data.sort(
            (a: Job, b: Job) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
          );
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

  const handleToggleStatus = async (job: Job) => {
    const currentStatus = (job.status || "active").toLowerCase();
    const newStatus = currentStatus === "active" ? "closed" : "active";
    try {
      const response = await fetch(`/api/jobs/${job.uuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update job status");
      }
      toast({
        title: "Success",
        description: `Job posting marked as ${newStatus === "active" ? "active" : "inactive"}.`,
      });
      await fetchJobs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update job status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    const uuidToDelete = jobToDelete.uuid;

    try {
      const response = await fetch(`/api/jobs/${uuidToDelete}`, { method: "DELETE" });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete job");
      }
      toast({ title: "Success", description: "Job deleted successfully." });
      await fetchJobs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job.",
        variant: "destructive",
      });
      await fetchJobs();
      console.error(error);
    } finally {
      setJobToDelete(null);
    }
  };

  // Guard restricted actions — show modal instead of navigating
  const guardAction = (action: "post" | "edit") => {
    if (isExpired) {
      setModalVariant(action === "post" ? "required" : "expired");
      setShowExpiredModal(true);
      return false;
    }
    return true;
  };

  const jobsByTab = useMemo(() => {
    const map: Record<JobTab, Job[]> = { active: [], archived: [], closed: [], draft: [] };
    for (const job of postedJobs) {
      const s = (job.status || "active").toLowerCase() as JobTab;
      if (s in map) map[s].push(job);
      else map.active.push(job); // fallback
    }
    return map;
  }, [postedJobs]);

  const activeJobs = jobsByTab.active;
  const totalApplicants = postedJobs.reduce((acc, job) => acc + (job.applicantCount || 0), 0);
  const totalSelected = postedJobs.reduce((acc, job) => acc + (job.selectedApplicantCount || 0), 0);

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

  const renderJobTable = (jobs: Job[]) => (
    <>
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
            {jobs.map((job) => (
              <TableRow key={job.id} className="group hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-bold text-slate-800">{job.title}</TableCell>
                <TableCell className="text-slate-500 text-xs">{job.location}</TableCell>
                <TableCell className="text-slate-500 text-xs">
                  {format(new Date(job.postedAt), "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  <JobStatusBadge
                    status={(job.status || "active").toLowerCase()}
                    graceDaysRemaining={
                      isExpired && (job.status || "active").toLowerCase() === "active"
                        ? graceDays
                        : undefined
                    }
                  />
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
                      {/* View applications always allowed */}
                      <DropdownMenuItem asChild className="rounded-lg font-bold text-xs focus:bg-slate-50">
                        <Link href={`/jobs/${job.id}/applications`} className="flex items-center cursor-pointer">
                          <Users className="mr-2 h-4 w-4 text-slate-400" />
                          View Applications
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="rounded-lg font-bold text-xs focus:bg-slate-50 cursor-pointer"
                      >
                        <Share2 className="mr-2 h-4 w-4 text-slate-400" />
                        <ShareButton
                          variant="text"
                          jobId={job.uuid}
                          jobTitle={job.title}
                          companyName={job.companyName}
                        />
                      </DropdownMenuItem>
                      {/* Edit — blocked when expired */}
                      <DropdownMenuItem
                        className="rounded-lg font-bold text-xs focus:bg-slate-50 cursor-pointer"
                        onClick={() => {
                          if (guardAction("edit")) {
                            window.location.href = `/jobs/edit/${job.id}`;
                          }
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4 text-slate-400" />
                        Edit Job
                      </DropdownMenuItem>
                      {/* Mark as Inactive / Active option */}
                      <DropdownMenuItem
                        className="rounded-lg font-bold text-xs focus:bg-slate-50 cursor-pointer"
                        onClick={() => handleToggleStatus(job)}
                      >
                        {(job.status || "active").toLowerCase() === "active" ? (
                          <>
                            <PowerOff className="mr-2 h-4 w-4 text-amber-500" />
                            <span className="text-amber-700 font-bold">Mark as Inactive</span>
                          </>
                        ) : (
                          <>
                            <Power className="mr-2 h-4 w-4 text-emerald-500" />
                            <span className="text-emerald-700 font-bold">Mark as Active</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setJobToDelete(job)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg font-bold text-xs cursor-pointer mt-1"
                      >
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
      {!loading && jobs.length === 0 && (
        <div className="py-20 text-center bg-slate-50/50 m-4 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="font-bold text-slate-800 mb-1">No {activeTab} jobs</h3>
          <p className="text-slate-500 text-sm mb-6">
            {activeTab === "active"
              ? "Post your first position to start receiving applications."
              : `You have no ${activeTab} jobs.`}
          </p>
          {activeTab === "active" && (
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 font-bold shadow-lg shadow-indigo-100"
              onClick={() => {
                if (guardAction("post")) {
                  window.location.href = "/jobs/post";
                }
              }}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Post a Job
            </Button>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="px-4 md:px-6 lg:px-8 pt-4">
      {/* Subscription Expiry Banner */}
      {!onlyPostings && subInfo && (
        <div className="mb-6">
          <SubscriptionExpiryBanner subInfo={subInfo} />
        </div>
      )}

      {/* Stats cards */}
      {!onlyPostings && user && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 mt-2">
          <Card className="border-none shadow-lg shadow-indigo-100 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  {user.planType === "premium" || user.planType === "pro" ? (
                    <Crown className="w-5 h-5" />
                  ) : (
                    <Star className="w-5 h-5" />
                  )}
                </div>
                <Badge
                  className={`border-none uppercase text-[10px] tracking-widest font-bold ${
                    isExpired
                      ? "bg-orange-400/30 text-orange-100"
                      : "bg-white/20 hover:bg-white/30 text-white"
                  }`}
                >
                  {isExpired ? "Expired" : "Active Plan"}
                </Badge>
              </div>
              <h3 className="text-2xl font-black mb-1 capitalize">
                {user.planType === "pro" ? "Pro" : user.planType || "Basic"} Plan
              </h3>
              <p className="text-indigo-100 text-xs font-medium opacity-80">
                {isExpired
                  ? subInfo?.isInGracePeriod
                    ? `Grace period: ${subInfo.graceDaysRemaining} days left`
                    : "Renew to restore access"
                  : user.planType === "pro"
                  ? "50 Jobs, 3-Month Portal Access"
                  : user.planType === "premium"
                  ? "Full portal access"
                  : "Entry-level hiring tools"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white border border-slate-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Active Jobs
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-black text-slate-900">{activeJobs.length}</span>
                <span className="text-slate-400 font-bold text-sm">
                  / {user.planType === "pro" ? "50" : user.planType === "premium" ? "10" : "1"}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      (activeJobs.length /
                        (user.planType === "pro" ? 50 : user.planType === "premium" ? 10 : 1)) *
                        100,
                      100
                    )}%`,
                  }}
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
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Total Appls
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-black text-slate-900">{totalApplicants}</span>
                <span className="text-slate-400 font-bold text-sm">Applications</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  Live Tracking
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white border border-slate-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Selections
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-black text-slate-900">{totalSelected}</span>
                <span className="text-slate-400 font-bold text-sm">Candidates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  Hiring Success
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white border border-slate-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {isExpired ? "Grace Period" : "Expiration"}
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-black text-slate-900">
                  {isExpired
                    ? subInfo?.graceDaysRemaining ?? 0
                    : user.planExpiresAt
                    ? Math.max(0, differenceInDays(new Date(user.planExpiresAt), new Date()))
                    : "30"}
                </span>
                <span className="text-slate-400 font-bold text-sm">Days Left</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {isExpired
                  ? subInfo?.gracePeriodEnd
                    ? `Until ${format(new Date(subInfo.gracePeriodEnd), "MMM dd, yyyy")}`
                    : "Jobs will be archived"
                  : user.planExpiresAt
                  ? `Until ${format(new Date(user.planExpiresAt), "MMM dd, yyyy")}`
                  : format(new Date().setDate(new Date().getDate() + 30), "MMM dd, yyyy")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Posting?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-slate-600">
              <span>This will attempt to delete the job posting &quot;{jobToDelete?.title}&quot;.</span>
              <span className="block text-xs font-semibold text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mt-2">
                Note: Jobs with active candidate applications cannot be deleted to preserve applicant history. You can mark the job as inactive instead.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-wrap gap-2 sm:justify-end">
            <AlertDialogCancel onClick={() => setJobToDelete(null)}>Cancel</AlertDialogCancel>
            <Button
              variant="outline"
              className="border-amber-200 text-amber-700 hover:bg-amber-50 font-bold text-xs h-10 px-4 rounded-md"
              onClick={() => {
                if (jobToDelete) {
                  const targetJob = jobToDelete;
                  setJobToDelete(null);
                  handleToggleStatus(targetJob);
                }
              }}
            >
              <PowerOff className="w-4 h-4 mr-1.5 text-amber-500" />
              Mark as Inactive
            </Button>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-10 px-4 rounded-md">
              Delete Job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Subscription expired modal */}
      <SubscriptionExpiredModal
        open={showExpiredModal}
        onClose={() => setShowExpiredModal(false)}
        variant={modalVariant}
        expiredAt={subInfo?.planExpiresAt}
      />

      {onlyPostings ? (
        <div className="w-full space-y-8">
          <Card className="border border-slate-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Job Postings</CardTitle>
                <CardDescription>Manage your company&apos;s open positions.</CardDescription>
              </div>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100"
                onClick={() => {
                  if (guardAction("post")) {
                    window.location.href = "/jobs/post";
                  }
                }}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Post a Job
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as JobTab)}>
                <TabsList className="mb-4 bg-slate-100 rounded-xl p-1">
                  <TabsTrigger value="active" className="rounded-lg text-xs font-bold data-[state=active]:bg-white">
                    Active
                    {jobsByTab.active.length > 0 && (
                      <Badge className="ml-1.5 bg-emerald-100 text-emerald-700 border-none text-[10px] px-1.5">
                        {jobsByTab.active.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="rounded-lg text-xs font-bold data-[state=active]:bg-white">
                    Archived
                    {jobsByTab.archived.length > 0 && (
                      <Badge className="ml-1.5 bg-slate-200 text-slate-600 border-none text-[10px] px-1.5">
                        {jobsByTab.archived.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="closed" className="rounded-lg text-xs font-bold data-[state=active]:bg-white">
                    Closed
                    {jobsByTab.closed.length > 0 && (
                      <Badge className="ml-1.5 bg-red-100 text-red-600 border-none text-[10px] px-1.5">
                        {jobsByTab.closed.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="draft" className="rounded-lg text-xs font-bold data-[state=active]:bg-white">
                    Draft
                    {jobsByTab.draft.length > 0 && (
                      <Badge className="ml-1.5 bg-blue-100 text-blue-600 border-none text-[10px] px-1.5">
                        {jobsByTab.draft.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active">{renderJobTable(jobsByTab.active)}</TabsContent>
                <TabsContent value="archived">{renderJobTable(jobsByTab.archived)}</TabsContent>
                <TabsContent value="closed">{renderJobTable(jobsByTab.closed)}</TabsContent>
                <TabsContent value="draft">{renderJobTable(jobsByTab.draft)}</TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 space-y-8">
            <Card className="border border-slate-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Job Postings</CardTitle>
                  <CardDescription>Manage your company&apos;s open positions.</CardDescription>
                </div>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100"
                  onClick={() => {
                    if (guardAction("post")) {
                      window.location.href = "/jobs/post";
                    }
                  }}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Post a Job
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as JobTab)}>
                  <TabsList className="mb-4 bg-slate-100 rounded-xl p-1">
                    <TabsTrigger value="active" className="rounded-lg text-xs font-bold data-[state=active]:bg-white">
                      Active
                      {jobsByTab.active.length > 0 && (
                        <Badge className="ml-1.5 bg-emerald-100 text-emerald-700 border-none text-[10px] px-1.5">
                          {jobsByTab.active.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="archived" className="rounded-lg text-xs font-bold data-[state=active]:bg-white">
                      Archived
                      {jobsByTab.archived.length > 0 && (
                        <Badge className="ml-1.5 bg-slate-200 text-slate-600 border-none text-[10px] px-1.5">
                          {jobsByTab.archived.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="closed" className="rounded-lg text-xs font-bold data-[state=active]:bg-white">
                      Closed
                      {jobsByTab.closed.length > 0 && (
                        <Badge className="ml-1.5 bg-red-100 text-red-600 border-none text-[10px] px-1.5">
                          {jobsByTab.closed.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="draft" className="rounded-lg text-xs font-bold data-[state=active]:bg-white">
                      Draft
                      {jobsByTab.draft.length > 0 && (
                        <Badge className="ml-1.5 bg-blue-100 text-blue-600 border-none text-[10px] px-1.5">
                          {jobsByTab.draft.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="active">{renderJobTable(jobsByTab.active)}</TabsContent>
                  <TabsContent value="archived">{renderJobTable(jobsByTab.archived)}</TabsContent>
                  <TabsContent value="closed">{renderJobTable(jobsByTab.closed)}</TabsContent>
                  <TabsContent value="draft">{renderJobTable(jobsByTab.draft)}</TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
