
"use client";

import { useState, useEffect } from "react";
import type { Application } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Eye, CheckCircle, XCircle, Info, Star, Building, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function HiringDisputesPage() {
  const [disputedApps, setDisputedApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Application | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ appId: string; action: 'verify' | 'reject' } | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const { toast } = useToast();

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      // Fetch applications that have verification_status as 'disputed'
      const res = await fetch('/api/applications?verificationStatus=disputed');
      if (res.ok) {
        const data = await res.json();
        setDisputedApps(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch disputes");
      }
    } catch (error) {
      console.error("Failed to fetch disputes", error);
      toast({ title: 'Error', description: 'Failed to fetch disputes.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolveDispute = async (appId: string, action: 'verify' | 'reject') => {
    setIsResolving(true);
    try {
      const response = await fetch(`/api/applications/${appId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action === 'verify' ? 'approve' : 'reject' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resolve dispute');
      }

      toast({ 
        title: 'Dispute Resolved', 
        description: action === 'verify' ? 'Hire confirmed and rewards released.' : 'Hire rejected and claim marked invalid.' 
      });
      
      // Refresh disputes list
      await fetchDisputes();
      setSelectedDispute(null);
      setConfirmAction(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      console.error(error);
    } finally {
      setIsResolving(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead>Dispute Reason</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-32" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    if (disputedApps.length === 0) {
      return (
        <div className="text-center py-12">
          <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
          <h3 className="text-lg font-medium">No Pending Disputes</h3>
          <p className="text-muted-foreground">Everything is currently in order.</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Proof</TableHead>
            <TableHead>Dispute Reason</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {disputedApps.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-medium whitespace-nowrap">
                <div>{app.applicantName}</div>
                <div className="text-[10px] text-muted-foreground">{app.applicantEmail}</div>
              </TableCell>
              <TableCell>{app.companyName}</TableCell>
              <TableCell>
                {app.proofUrl ? (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={app.proofUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (app.proofUrl?.startsWith('r2://')) {
                          e.preventDefault();
                          toast({ 
                            title: 'Resolution Error', 
                            description: 'The proof link failed to resolve to a secure URL. Please refresh the page.',
                            variant: 'destructive'
                          });
                        }
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Proof
                    </a>
                  </Button>
                ) : (
                  <span className="text-muted-foreground text-xs italic">No proof uploaded</span>
                )}
              </TableCell>
              <TableCell className="text-rose-600 italic text-sm max-w-xs truncate">
                {app.disputeReason || 'No reason provided.'}
              </TableCell>
              <TableCell className="text-right space-x-2 whitespace-nowrap">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-blue-600" 
                    onClick={() => setSelectedDispute(app)}
                    title="Investigation Details"
                >
                    <Info className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  className="bg-emerald-600 hover:bg-emerald-700 h-8" 
                  onClick={() => setConfirmAction({ appId: String(app.id), action: 'verify' })}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Hire
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="h-8" 
                  onClick={() => setConfirmAction({ appId: String(app.id), action: 'reject' })}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Hiring Disputes</CardTitle>
              <CardDescription>Review and resolve disputed hiring claims from job seekers.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>

      <Dialog open={!!selectedDispute} onOpenChange={(open) => !open && setSelectedDispute(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Dispute Investigation</DialogTitle>
                <DialogDescription>
                    Comparing details from candidate and employer sources.
                </DialogDescription>
            </DialogHeader>
            {selectedDispute && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Candidate Side */}
                        <div className="bg-slate-50 p-4 rounded-lg border">
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                <Star className="w-4 h-4" /> Candidate Profile
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-lg font-bold">{selectedDispute.applicantName}</div>
                                    <div className="text-sm text-muted-foreground">{selectedDispute.applicantEmail}</div>
                                    <div className="text-sm italic text-primary">{selectedDispute.applicantHeadline}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-white p-2 border rounded">
                                        <span className="block text-muted-foreground">Location</span>
                                        <span className="font-medium">{selectedDispute.applicantLocation || 'N/A'}</span>
                                    </div>
                                    <div className="bg-white p-2 border rounded">
                                        <span className="block text-muted-foreground">Exp</span>
                                        <span className="font-medium">{selectedDispute.applicantExperience}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block mb-1">Key Skills</span>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedDispute.applicantSkills?.split(',').map(s => (
                                            <Badge key={s} variant="secondary" className="text-[10px]">{s.trim()}</Badge>
                                        )) || <span className="text-xs italic">No skills listed</span>}
                                    </div>
                                </div>
                                {selectedDispute.applicantSummary && (
                                    <div className="text-xs text-muted-foreground border-t pt-2">
                                        {selectedDispute.applicantSummary.substring(0, 200)}...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Job/Employer Side */}
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                             <h3 className="text-sm font-bold text-indigo-500 uppercase mb-3 flex items-center gap-2">
                                <Building className="w-4 h-4" /> Job & Company
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-lg font-bold text-indigo-900">{selectedDispute.jobTitle}</div>
                                    <div className="text-sm font-semibold">{selectedDispute.companyName}</div>
                                    <Badge variant="outline" className="mt-1 border-indigo-200 text-indigo-700">
                                        {selectedDispute.jobType}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-white p-2 border rounded border-indigo-50">
                                        <span className="block text-muted-foreground">Salary Range</span>
                                        <span className="font-medium">
                                            {selectedDispute.jobSalaryMin ? `₹${selectedDispute.jobSalaryMin} - ₹${selectedDispute.jobSalaryMax}` : 'Negotiable'}
                                        </span>
                                    </div>
                                    <div className="bg-white p-2 border rounded border-indigo-50">
                                        <span className="block text-muted-foreground">Job Location</span>
                                        <span className="font-medium">{selectedDispute.jobLocation || 'Hybrid'}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/50 border border-indigo-100 rounded text-xs italic">
                                    <div className="font-semibold text-rose-600 mb-1">Employee Dispute Reason:</div>
                                    &quot;{selectedDispute.disputeReason || 'No reason provided.'}&quot;
                                </div>
                                {selectedDispute.jobIsReferral && (
                                    <div className="flex items-center gap-3 p-2 bg-emerald-50 border border-emerald-100 rounded">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-[10px]">
                                                {selectedDispute.posterName?.charAt(0) || 'E'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-[10px]">
                                            <div className="font-bold text-emerald-900">Posted By: {selectedDispute.posterName || 'Unknown Employee'}</div>
                                            <div className="text-emerald-700">{selectedDispute.posterEmail || 'Email unavailable'}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-slate-100 p-4 rounded-lg border-dashed border-2">
                         <div className="text-sm">
                            <span className="font-bold flex items-center gap-2 mb-1">
                                <ShieldCheck className="w-4 h-4 text-primary" /> Verification Proof
                            </span>
                            <span className="text-xs text-muted-foreground">Upload reference document or hire confirmation</span>
                        </div>
                        {selectedDispute.proofUrl ? (
                            <Button variant="default" asChild>
                                <a 
                                    href={selectedDispute.proofUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Review Proof Document
                                </a>
                            </Button>
                        ) : (
                            <Badge variant="destructive">No Proof Uploaded</Badge>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => setSelectedDispute(null)}>Close</Button>
                        <Button 
                            variant="destructive" 
                            className="bg-rose-600 hover:bg-rose-700"
                            onClick={() => setConfirmAction({ appId: String(selectedDispute.id), action: 'reject' })}
                        >
                            <XCircle className="mr-2 h-4 w-4" /> Reject Claim
                        </Button>
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => setConfirmAction({ appId: String(selectedDispute.id), action: 'verify' })}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" /> Confirm Hire
                        </Button>
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && !isResolving && setConfirmAction(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Info className="w-5 h-5 text-indigo-600" />
              Confirm Dispute Resolution
            </DialogTitle>
            <DialogDescription className="pt-2">
              {confirmAction?.action === 'verify'
                ? "Are you sure you want to approve this hire/referral claim? The employee will receive a 25 trust score refund and rewards will be released."
                : "Are you sure you want to reject this claim? The job seeker will be refunded 2 credits and the employee will lose 100 XP (with level recalculated)."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={isResolving}>Cancel</Button>
            <Button 
              variant={confirmAction?.action === 'verify' ? 'default' : 'destructive'}
              className={confirmAction?.action === 'verify' ? "bg-emerald-600 hover:bg-emerald-700 font-bold" : "bg-rose-600 hover:bg-rose-700 font-bold"}
              disabled={isResolving}
              onClick={async () => {
                if (!confirmAction) return;
                await handleResolveDispute(confirmAction.appId, confirmAction.action);
              }}
            >
              {isResolving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {confirmAction?.action === 'verify' ? "Yes, Approve Hire" : "Yes, Reject Claim"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
