
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Application, Job } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, MoreHorizontal, CheckCircle, XCircle, Lock, MessageCircle, Trophy } from "lucide-react";
import { ChatDrawer } from '@/components/chat/ChatDrawer';
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
            case 'Selected':
            case 'Accepted':
                return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 uppercase text-[10px] font-bold">Selected</Badge>;
            case 'Interviewing':
                return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Interview Scheduled</Badge>;
            case 'Offer Received':
                return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Offer Received</Badge>;
            case 'Joined Company':
                return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Joined</Badge>;
            case 'Completed':
                return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 uppercase text-[10px] font-bold">Completed</Badge>;
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
                                            

                                             {/* Primary Next Action Buttons */}

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
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    {app.statusId <= 2 && (
                                                        <DropdownMenuItem 
                                                            onClick={() => handleStatusChange(app.id, 3)}
                                                            className="bg-indigo-50 text-indigo-700 font-bold"
                                                        >
                                                            Select Candidate
                                                        </DropdownMenuItem>
                                                    )}

                                                    {app.statusId === 3 && (
                                                        <DropdownMenuItem onClick={() => handleStatusChange(app.id, 6)}>
                                                            Schedule Interview
                                                        </DropdownMenuItem>
                                                    )}

                                                    {app.statusId === 6 && (
                                                        <DropdownMenuItem onClick={() => handleStatusChange(app.id, 7)}>
                                                            Offer Received
                                                        </DropdownMenuItem>
                                                    )}

                                                    {app.statusId === 7 && (
                                                        <DropdownMenuItem onClick={() => handleStatusChange(app.id, 9)}>
                                                            Mark Joined
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuItem onClick={() => handleStatusChange(app.id, 12)} className="text-destructive font-bold">
                                                        <XCircle className="mr-2 h-4 w-4"/>
                                                        Reject Candidate
                                                    </DropdownMenuItem>
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

            <ChatDrawer 
                applicationId={activeChatAppId || ""} 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)} 
                onMessageRead={() => fetchJobAndApplications(true)} 
            />
        </div>
    );
}
