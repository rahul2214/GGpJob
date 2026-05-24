
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Application, Job } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download, User, MoreHorizontal, CheckCircle, XCircle, Lock, MessageCircle, ShieldCheck, Trophy, Calendar } from "lucide-react";
import { ChatDrawer } from '@/components/chat/ChatDrawer';
import Link from "next/link";
import { useUser } from "@/contexts/user-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud, AlertCircle } from "lucide-react";

const ViewProfileLink = ({ applicationId, applicantId, children }: { applicationId: string, applicantId: string, children: React.ReactNode }) => {
    const router = useRouter();

    const handleViewProfile = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await fetch(`/api/applications/${applicationId}/view`, { method: 'POST' });
        } catch (error) {
            console.error("Failed to mark profile as viewed", error);
            // We still navigate even if this fails
        }
        router.push(`/profile/${applicantId}?applicationId=${applicationId}`);
    };

    return (
        <a href={`/profile/${applicantId}?applicationId=${applicationId}`} onClick={handleViewProfile} className="flex items-center w-full">
            {children}
        </a>
    );
};


export default function JobApplicationsPage() {
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();
    const { user } = useUser();
    const [job, setJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProofModalOpen, setIsProofModalOpen] = useState(false);
    const [selectedAppForHiring, setSelectedAppForHiring] = useState<Application | null>(null);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeChatAppId, setActiveChatAppId] = useState<string | null>(null);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [verifyingApp, setVerifyingApp] = useState<Application | null>(null);
    const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);

    const fetchJobAndApplications = useCallback(async (silent = false) => {
        if (id) {
            if (!silent) setLoading(true);
            try {
                const reqParam = user?.uuid ? `&requesterId=${user.uuid}` : '';
                const [jobRes, appsRes] = await Promise.all([
                    fetch(`/api/jobs/${id}`),
                    fetch(`/api/applications?jobId=${id}${reqParam}`)
                ]);

                if (jobRes.ok) {
                    const jobData = await jobRes.json();
                    setJob(jobData);
                } else {
                    console.error("Failed to fetch job details");
                }
                
                if (appsRes.ok) {
                    const appsData = await appsRes.json();
                    setApplications(Array.isArray(appsData) ? appsData : []);
                } else {
                     console.error("Failed to fetch applications");
                }

            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        }
    }, [id, user?.uuid]);

    useEffect(() => {
        fetchJobAndApplications();
        
        // Add polling for real-time updates (e.g., new chat messages)
        const interval = setInterval(() => {
            fetchJobAndApplications(true);
        }, 15000);

        return () => clearInterval(interval);
    }, [fetchJobAndApplications]);
    
     const getStatusBadge = (app: Application) => {
        const status = app.statusName;
        switch (status) {
            case 'Under Review':
                return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">Under Review</Badge>;
            case 'Accepted':
                return <Badge className="bg-cyan-50 text-cyan-700 border-cyan-100 uppercase text-[10px] font-bold">Waiting for jobseeker response</Badge>;
            case 'Referral Unlocked':
                return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Unlocked</Badge>;
            case 'Referred':
                if (app.verificationStatus === 'pending' || app.verificationStatus === 'pending_jobseeker') {
                    return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Waiting for Jobseeker Confirmation</Badge>;
                }
                return <Badge className="bg-violet-100 text-violet-800 border-violet-200 uppercase text-[10px] font-bold">Referral Submitted</Badge>;
            case 'Interviewing':
                if (app.verificationStatus === 'pending_jobseeker') {
                    return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Waiting for Jobseeker Confirmation</Badge>;
                }
                if (app.verificationStatus === 'pending' || app.verificationStatus === 'pending_employee') {
                    return <Badge className="bg-orange-100 text-orange-800 border-orange-200 uppercase text-[10px]">Verify Candidate's Interview Proof</Badge>;
                }
                if (app.verificationStatus === 'verified') {
                    return <Badge className="bg-amber-100 text-amber-800 border-amber-200 uppercase text-[10px] font-bold">Need to receive offer letter</Badge>;
                }
                return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Interview needs to be scheduled</Badge>;
            case 'Offer Received':
                if (app.verificationStatus === 'pending' || app.verificationStatus === 'pending_employee') {
                    return <Badge className="bg-orange-100 text-orange-800 border-orange-200 uppercase text-[10px]">Verify Candidate's Offer Proof</Badge>;
                }
                if (app.verificationStatus === 'pending_jobseeker') {
                    return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Waiting for Jobseeker Confirmation</Badge>;
                }
                return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Offer Received</Badge>;
            case 'Pending Confirmation':
                return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Pending Seeker</Badge>;
            case 'Joined Company':
                if (app.verificationStatus === 'pending' || app.verificationStatus === 'pending_jobseeker') {
                    return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Waiting for Jobseeker Confirmation</Badge>;
                }
                return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Joined</Badge>;
            case 'Completed':
                return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 uppercase text-[10px] font-bold">Completed</Badge>;
            case 'Disputed':
                return <Badge variant="destructive">Disputed</Badge>;
            case 'Rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            default: return <Badge variant="outline">Applied</Badge>;
        }
    };
    
    const handleStatusChange = async (applicationId: string | number, statusId: number, proofUrl?: string, internalReferralId?: string) => {
        try {
            const response = await fetch(`/api/applications/${applicationId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statusId, proofUrl, internalReferralId, requesterRole: user?.role }),
            });
            
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to update status');
            }
            
            const updatedApplicationFromServer = await response.json();

            setApplications(prev => 
                prev.map(app => 
                    app.id.toString() === applicationId.toString() ? { ...app, ...updatedApplicationFromServer } : app
                )
            );

            toast({
                title: "Status Updated",
                description: `Applicant marked as ${updatedApplicationFromServer.statusName}.`,
            });
        } catch (error: any) {
             toast({
                title: "Error",
                description: error.message || "Failed to update status. Please try again.",
                variant: "destructive",
            });
            console.error(error);
        }
    }

    const handleProofConfirmation = async (statusId: number, internalReferralId?: string) => {
        if (!selectedAppForHiring || !proofFile) return;
        
        setIsUploading(true);
        try {
            // 1. Upload proof
            const formData = new FormData();
            formData.append('file', proofFile);
            
            const uploadRes = await fetch(`/api/applications/${selectedAppForHiring.id}/proof`, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Failed to upload proof');
            const { proofUrl } = await uploadRes.json();

            // 2. Change status
            await handleStatusChange(selectedAppForHiring.id.toString(), statusId, proofUrl, internalReferralId);
            
            setIsProofModalOpen(false);
            setProofFile(null);
            setSelectedAppForHiring(null);
        } catch (error: any) {
            toast({
                title: "Upload Failed",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };


    if (loading) {
        return <div className="container mx-auto p-4">Loading...</div>;
    }

    if (!job) {
        return <div className="container mx-auto p-4">Job not found.</div>;
    }
    
    const renderSkills = (skills: string | undefined | null) => {
        if (!skills) return <span className="text-muted-foreground">No skills</span>;
        return <span className="text-sm text-muted-foreground">{skills}</span>;
    };

    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Card>
                <CardHeader>
                    <CardTitle>Applications for {job.title}</CardTitle>
                    <CardDescription>
                       {applications.length} {applications.length === 1 ? 'applicant' : 'applicants'} found for this position.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {applications.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Applicant</TableHead>
                                    <TableHead>Skills</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium flex items-center gap-3">
                                             <Avatar className="h-8 w-8">
                                                <AvatarFallback>{app.applicantName?.charAt(0)}</AvatarFallback>
                                             </Avatar>
                                             <div>
                                                <div className="flex items-center gap-2">
                                                    {app.applicantName}
                                                    {!app.isUnlocked && job.isReferral && (
                                                        <span title="Locked until you accept and they confirm">
                                                            <Lock className="w-3 h-3 text-slate-400" />
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`text-xs ${app.isUnlocked || !job.isReferral ? 'text-muted-foreground' : 'text-slate-300 font-mono italic'}`}>
                                                    {app.applicantEmail}
                                                </div>
                                             </div>
                                        </TableCell>
                                        <TableCell>{renderSkills(app.applicantSkills)}</TableCell>
                                        <TableCell>{getStatusBadge(app)}</TableCell>
                                        <TableCell className="text-right flex items-center justify-end gap-2">
                                             {(app.statusId >= 3 && app.statusId <= 8) && (
                                                 <div className="relative inline-block">
                                                     <Button 
                                                         variant="outline" 
                                                         size="sm" 
                                                         className="rounded-xl font-bold h-9 border-blue-200 text-blue-600 hover:bg-blue-50"
                                                         onClick={() => {
                                                             setActiveChatAppId(app.id.toString());
                                                             setIsChatOpen(true);
                                                         }}
                                                     >
                                                         <MessageCircle className="w-4 h-4 mr-2" />
                                                         Chat
                                                     </Button>
                                                     {app.unreadChatCount !== undefined && app.unreadChatCount > 0 && (
                                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white animate-bounce">
                                                            {app.unreadChatCount > 9 ? '9+' : app.unreadChatCount}
                                                        </span>
                                                     )}
                                                 </div>
                                             )}
                                             {(app.verificationStatus === 'pending_employee' || (app.verificationStatus === 'pending' && (app.statusId === 6 || app.statusId === 7 || app.statusId === 9))) && (
                                                 <Button 
                                                     variant="outline" 
                                                     size="sm" 
                                                     className="rounded-xl font-bold h-9 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                                     onClick={() => {
                                                        setVerifyingApp(app);
                                                        setIsVerifyModalOpen(true);
                                                     }}
                                                 >
                                                     <ShieldCheck className="w-4 h-4 mr-2" />
                                                     Verify Proof
                                                 </Button>
                                             )}

                                             {/* Primary Next Action Buttons */}

                                             {app.statusId === 5 && app.verificationStatus === 'verified' && !job.isReferral && (
                                                 <Button 
                                                     size="sm" 
                                                     variant="outline"
                                                     className="rounded-xl font-bold h-9 border-amber-200 text-amber-700 hover:bg-amber-50"
                                                     onClick={() => handleStatusChange(app.id.toString(), 6)}
                                                 >
                                                     <Calendar className="w-4 h-4 mr-2" />
                                                     Interview Scheduled
                                                 </Button>
                                             )}

                                             {app.statusId === 6 && app.verificationStatus === 'verified' && !job.isReferral && (
                                                 <Button 
                                                     size="sm" 
                                                     variant="outline"
                                                     className="rounded-xl font-bold h-9 border-purple-200 text-purple-700 hover:bg-purple-50"
                                                     onClick={() => handleStatusChange(app.id.toString(), 7)}
                                                 >
                                                     <Trophy className="w-4 h-4 mr-2" />
                                                     Offer Received
                                                 </Button>
                                             )}

                                             {((app.statusId === 7 || app.statusId === 8) && app.verificationStatus === 'verified') && !job.isReferral && (
                                                 <Button 
                                                     size="sm" 
                                                     className="rounded-xl font-bold h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                                     onClick={() => {
                                                         setSelectedAppForHiring(app);
                                                         setIsProofModalOpen(true);
                                                     }}
                                                 >
                                                     <CheckCircle className="w-4 h-4 mr-2" />
                                                     Confirm Joining
                                                 </Button>
                                             )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <ViewProfileLink applicationId={app.id.toString()} applicantId={app.applicantId!}>
                                                            <User className="mr-2 h-4 w-4" />
                                                            View Profile
                                                        </ViewProfileLink>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild disabled={!app.applicantResumeUrl}>
                                                        <a href={app.applicantResumeUrl || '#'} target="_blank" rel="noopener noreferrer" className={!app.isUnlocked && job.isReferral ? 'opacity-50 pointer-events-none' : ''}>
                                                            {(!app.isUnlocked && job.isReferral) ? <Lock className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
                                                            Resume {(!app.isUnlocked && job.isReferral) && '(Unlock Required)'}
                                                        </a>
                                                    </DropdownMenuItem>
                                                    {(app.statusId <= 2 || 
                                                      app.statusId === 4 || 
                                                      (app.statusId === 5 && app.verificationStatus === 'verified') || 
                                                      app.statusId === 6 || 
                                                      ((app.statusId === 7 || app.statusId === 8) && app.verificationStatus !== 'pending') || 
                                                      app.statusId < 5) && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            {/* Mark Under Review removed as it's automatic on view */}
                                                            {app.statusId <= 2 && (
                                                                <DropdownMenuItem 
                                                                    onClick={() => handleStatusChange(app.id, 3)}
                                                                    className="bg-indigo-50 text-indigo-700 font-bold"
                                                                >
                                                                    Select Candidate (Max 5)
                                                                </DropdownMenuItem>
                                                            )}
                                                            
                                                            {app.statusId === 4 && (
                                                                <DropdownMenuItem 
                                                                    onClick={() => {
                                                                        setSelectedAppForHiring(app);
                                                                        setIsProofModalOpen(true);
                                                                    }}
                                                                    className="bg-violet-600 text-white font-bold focus:bg-violet-700 focus:text-white"
                                                                >
                                                                    <UploadCloud className="mr-2 h-4 w-4" />
                                                                    Referred (Max 3)
                                                                </DropdownMenuItem>
                                                            )}

                                                             {app.statusId === 5 && app.verificationStatus === 'verified' && !job.isReferral && (
                                                                 <DropdownMenuItem onClick={() => handleStatusChange(app.id, 6)}>
                                                                     Candidate Interviewing
                                                                 </DropdownMenuItem>
                                                             )}

                                                             {app.statusId === 6 && !job.isReferral && (
                                                                 <>
                                                                     {app.verificationStatus !== 'pending' && app.verificationStatus !== 'verified' && (
                                                                         <DropdownMenuItem 
                                                                             onClick={() => handleStatusChange(app.id, 6)}
                                                                             className="bg-amber-600 text-white font-bold focus:bg-amber-700 focus:text-white"
                                                                         >
                                                                             <UploadCloud className="mr-2 h-4 w-4" />
                                                                             Interview Scheduled
                                                                         </DropdownMenuItem>
                                                                     )}
                                                                     {app.verificationStatus === 'verified' && (
                                                                         <DropdownMenuItem onClick={() => handleStatusChange(app.id, 7)}>
                                                                             Offer Received
                                                                         </DropdownMenuItem>
                                                                     )}
                                                                 </>
                                                             )}

                                                             {(app.statusId === 7 || app.statusId === 8) && app.verificationStatus !== 'pending' && !job.isReferral && (
                                                                 <DropdownMenuItem 
                                                                     onClick={() => {
                                                                         setSelectedAppForHiring(app);
                                                                         setIsProofModalOpen(true);
                                                                     }}
                                                                     className="bg-emerald-600 text-white font-bold focus:bg-emerald-700 focus:text-white"
                                                                 >
                                                                     <CheckCircle className="mr-2 h-4 w-4" />
                                                                     Confirm Hire
                                                                 </DropdownMenuItem>
                                                             )}

                                                            {app.statusId < 4 && (
                                                                <DropdownMenuItem onClick={() => handleStatusChange(app.id, 12)} className="text-destructive font-bold">
                                                                    <XCircle className="mr-2 h-4 w-4"/>
                                                                    Reject Candidate
                                                                </DropdownMenuItem>
                                                            )}
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No applications received yet for this job.</p>
                    )}
                </CardContent>
            </Card>

            {/* ── Referral/Hiring Proof Modal ────────────────────────────────────────── */}
            <Dialog open={isProofModalOpen} onOpenChange={setIsProofModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const internalId = formData.get('internalReferralId') as string;
                        // Logic: 
                        // If status 4 (Unlocked) -> Set to 5 (Referred)
                        // If status 6 (Interviewing) -> Set to 6 (Interview Scheduled)
                        // If status 7/8 (Offer/Hiring) -> Set to 9 (Joined)
                        const statusToSet = selectedAppForHiring?.statusId === 4 ? 5 : (selectedAppForHiring?.statusId === 6 ? 6 : 9);
                        handleProofConfirmation(statusToSet, internalId);
                    }}>
                        <DialogHeader>
                            <DialogTitle>
                                {selectedAppForHiring?.statusId === 4 ? 'Referred - Upload Proof' : (selectedAppForHiring?.statusId === 6 ? 'Interview Scheduled - Upload Proof' : 'Confirm Hiring')}
                            </DialogTitle>
                            <DialogDescription>
                                {selectedAppForHiring?.statusId === 4
                                    ? 'You have successfully referred this candidate internally. Please upload proof of submission.'
                                    : (selectedAppForHiring?.statusId === 6 
                                        ? 'Please upload proof that an interview has been scheduled (invite link, email confirmation, etc.)'
                                        : 'To reward your referral, please upload proof of hiring (Offer letter or email confirmation).')}
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-3 text-amber-800 text-[10px] leading-relaxed">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <p>Providing fake proof will result in a heavy penalty to your Trust Score (-100 points) and account suspension. Platform verification is mandatory.</p>
                            </div>

                            {selectedAppForHiring?.statusId === 4 && (
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="internalReferralId">Referral ID / Tracking Code (Optional)</Label>
                                    <Input 
                                        id="internalReferralId" 
                                        name="internalReferralId"
                                        placeholder="e.g. REF-12345"
                                        className="h-10"
                                    />
                                </div>
                            )}

                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="proof">Verification Document (SS/PDF/Image, max 2MB)</Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <UploadCloud className="w-5 h-5" />
                                    </div>
                                    <Input 
                                        id="proof" 
                                        type="file" 
                                        required
                                        className="pl-10 cursor-pointer h-12 pt-3"
                                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                        accept=".pdf,image/*"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="sm:justify-end gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setIsProofModalOpen(false)} disabled={isUploading}>
                                Cancel
                            </Button>
                            <Button 
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold" 
                                disabled={!proofFile || isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (selectedAppForHiring?.statusId === 4 ? 'Submit Referred Proof' : 'Confirm & Mark Hired')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <ChatDrawer 
                applicationId={activeChatAppId || ""} 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)} 
                onMessageRead={() => fetchJobAndApplications(true)} 
            />

            <Dialog open={isVerifyModalOpen} onOpenChange={setIsVerifyModalOpen}>
                <DialogContent className="max-w-2xl bg-white rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-8 pb-4 bg-gradient-to-r from-emerald-50 to-teal-50">
                        <DialogTitle className="text-2xl font-bold text-emerald-900 flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                            </div>
                            Verify Milestone Proof
                        </DialogTitle>
                        <DialogDescription className="text-emerald-700/70 mt-2 font-medium">
                            Review the proof submitted by candidate for {verifyingApp?.statusName}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 space-y-6">
                        <div className="rounded-2xl border-2 border-slate-100 overflow-hidden bg-slate-50 min-h-[300px] flex items-center justify-center relative group">
                            {verifyingApp?.proofUrl ? (
                                <>
                                    {verifyingApp.proofUrl.toLowerCase().endsWith('.pdf') ? (
                                        <div className="flex flex-col items-center gap-4 p-12 text-center">
                                            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                                                <Download className="w-8 h-8 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">PDF Document Submitted</p>
                                                <p className="text-sm text-slate-500 mt-1">Please download to review the contents</p>
                                            </div>
                                            <Button asChild variant="outline" className="rounded-xl mt-2">
                                                <a href={verifyingApp.proofUrl.replace('r2://', 'https://pub-844d1887e59740529d636417531776ce.r2.dev/')} target="_blank" rel="noopener noreferrer">
                                                    View PDF Document
                                                </a>
                                            </Button>
                                        </div>
                                    ) : (
                                        <img 
                                            src={verifyingApp.proofUrl.replace('r2://', 'https://pub-844d1887e59740529d636417531776ce.r2.dev/')} 
                                            alt="Proof" 
                                            className="max-h-[500px] object-contain w-full"
                                        />
                                    )}
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button asChild size="sm" variant="secondary" className="rounded-lg shadow-lg">
                                            <a href={verifyingApp.proofUrl.replace('r2://', 'https://pub-844d1887e59740529d636417531776ce.r2.dev/')} target="_blank" rel="noopener noreferrer">
                                                Open Full Size
                                            </a>
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-slate-400 flex flex-col items-center gap-2">
                                    <AlertCircle className="w-8 h-8" />
                                    <p>No proof URL found</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800">
                                Confirm if this proof accurately represents the milestone. Verified actions reward you with credits and the candidate with progress.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-0 flex flex-col sm:flex-row gap-3">
                        <Button 
                            variant="ghost" 
                            className="flex-1 rounded-2xl h-12 text-slate-500 font-bold hover:bg-slate-50 hover:text-red-600"
                            disabled={isSubmittingVerify}
                            onClick={async () => {
                                if (!verifyingApp) return;
                                if (!confirm("Are you sure you want to dispute this proof?")) return;
                                setIsSubmittingVerify(true);
                                try {
                                    const res = await fetch(`/api/applications/${verifyingApp.id}/verify`, {
                                        method: 'POST',
                                        body: JSON.stringify({ action: 'dispute', requesterRole: user?.role })
                                    });
                                    if (!res.ok) throw new Error('Failed to dispute');
                                    toast({ title: "Proof Disputed", description: "Admin will review the case." });
                                    setIsVerifyModalOpen(false);
                                    fetchJobAndApplications(true);
                                } catch (e: any) {
                                    toast({ title: "Error", description: e.message, variant: "destructive" });
                                } finally {
                                    setIsSubmittingVerify(false);
                                }
                            }}
                        >
                            Dispute Proof
                        </Button>
                        <Button 
                            className="flex-1 rounded-2xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-100"
                            disabled={isSubmittingVerify}
                            onClick={async () => {
                                if (!verifyingApp) return;
                                setIsSubmittingVerify(true);
                                try {
                                    const res = await fetch(`/api/applications/${verifyingApp.id}/verify`, {
                                        method: 'POST',
                                        body: JSON.stringify({ action: 'confirm', requesterRole: user?.role })
                                    });
                                    if (!res.ok) throw new Error('Failed to verify');
                                    toast({ title: "Milestone Verified! 🎉", description: "Credits have been distributed." });
                                    setIsVerifyModalOpen(false);
                                    fetchJobAndApplications(true);
                                } catch (e: any) {
                                    toast({ title: "Error", description: e.message, variant: "destructive" });
                                } finally {
                                    setIsSubmittingVerify(false);
                                }
                            }}
                        >
                            {isSubmittingVerify ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Verify"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
