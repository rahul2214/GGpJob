"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle, XCircle, Loader2, ShieldCheck, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Application } from "@/lib/types";
import { format } from "date-fns";

export default function AdminVerificationsPage() {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const isAdminOrSuperAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

    const fetchPendingVerifications = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch applications with status 5 (Referred) or 9 (Joined Company)
            const res = await fetch(`/api/applications?statusId=5,9`);
            if (res.ok) {
                const data = await res.json();
                setApplications(data);
            }
        } catch (error) {
            console.error("Failed to fetch verifications", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!userLoading && !isAdminOrSuperAdmin) {
            router.push('/');
        } else if (isAdminOrSuperAdmin) {
            fetchPendingVerifications();
        }
    }, [user, userLoading, isAdminOrSuperAdmin, router, fetchPendingVerifications]);

    const handleVerify = async (applicationId: string, currentStatusId: number, approve: boolean) => {
        setProcessingId(applicationId);
        try {
            // Mapping:
            // 5 (Referred) -> Approve (6: Interviewing) or Reject (11: Disputed)
            // 9 (Joined Company) -> Approve (10: Completed) or Reject (11: Disputed)
            
            let nextStatusId = 11; // Default to Disputed
            if (approve) {
                nextStatusId = currentStatusId === 5 ? 6 : 10;
            }

            const res = await fetch(`/api/applications/${applicationId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statusId: nextStatusId }),
            });

            if (!res.ok) throw new Error("Failed to update verification status");

            toast({
                title: approve ? "Verification Approved" : "Submission Rejected",
                description: approve ? "The referral progress has been confirmed." : "Submission marked as disputed.",
            });

            fetchPendingVerifications();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setProcessingId(null);
        }
    };

    if (userLoading || loading) {
        return <div className="container mx-auto p-12 text-center">Loading pending verifications...</div>;
    }

    return (
        <div className="container mx-auto py-12 px-4 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                    <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Referral Verifications</h1>
                    <p className="text-slate-500">Review and approve proofs submitted by employees.</p>
                </div>
            </div>

            <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Pending Queue</CardTitle>
                    <CardDescription>
                        {applications.length} applications awaiting verification.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {applications.length === 0 ? (
                        <div className="py-20 text-center">
                            <CheckCircle className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-medium">All caught up! No pending verifications.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead>Applicant</TableHead>
                                    <TableHead>Referrer</TableHead>
                                    <TableHead>Milestone</TableHead>
                                    <TableHead>Submitted On</TableHead>
                                    <TableHead>Proof</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map((app) => (
                                    <TableRow key={app.id} className="hover:bg-slate-50/30 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{app.applicantName}</div>
                                                    <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Job: {app.jobTitle}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium text-slate-600">{app.companyName}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={app.statusId === 5 ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"}>
                                                {app.statusId === 5 ? "Submission Proof" : "Hiring Proof"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500">
                                            {format(new Date(app.updatedAt || app.appliedAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            {app.proofUrl ? (
                                                <a 
                                                    href={app.proofUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-bold text-xs bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
                                                >
                                                    View Proof
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : (
                                                <span className="text-rose-400 text-xs italic">Missing Proof</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-full"
                                                disabled={processingId === app.id}
                                                onClick={() => handleVerify(app.id, app.statusId, false)}
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full"
                                                disabled={processingId === app.id}
                                                onClick={() => handleVerify(app.id, app.statusId, true)}
                                            >
                                                {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
