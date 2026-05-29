"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/user-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { CheckCircle, LoaderCircle, Ban, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { Application, Job } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

interface ApplyButtonProps {
    job: Job;
    variant?: 'default' | 'desktop';
    isApplied?: boolean;
    onSuccess?: () => void;
}

export function ApplyButton({ job, variant = 'default', isApplied: propIsApplied = false, onSuccess }: ApplyButtonProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isApplied, setIsApplied] = useState(propIsApplied);

    // ATS checking states
    const [isCheckingAts, setIsCheckingAts] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [atsResult, setAtsResult] = useState<{
        score: number;
        missingSkills: string[];
    } | null>(null);

    useEffect(() => {
        setIsApplied(propIsApplied);
    }, [propIsApplied]);

    // Calculate ownership synchronously
    const isJobOwner = (user && job) && (user.role === 'Recruiter' || user.role === 'Employee' || user.role === 'Admin') && 
                       (job.recruiterId === user.uuid || job.employeeId === user.uuid || job.recruiterPk === user.id || job.employeePk === user.id);

    const submitApplication = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ jobId: job.uuid, userId: user?.uuid }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to apply');
            }
            
            setIsApplied(true);
            onSuccess?.();
            toast({
                title: "Application Submitted!",
                description: "Your application has been successfully submitted.",
                action: (
                    <div className="flex items-center text-green-500">
                        <CheckCircle className="h-5 w-5" />
                    </div>
                )
            });

        } catch (error: any) {
            toast({
                title: "Application Failed",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const checkAtsAndApply = async () => {
        if (!user?.resumeUrl) {
            // Bypass if no resume URL
            await submitApplication();
            return;
        }

        setIsCheckingAts(true);
        try {
            const formData = new FormData();
            formData.append("resumeUrl", user.resumeUrl);
            formData.append("jobDescription", job.description || "");

            const response = await fetch('/api/ats-score', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error("ATS verification failed");
            }

            const data = await response.json();
            const result = {
                score: typeof data.score === 'number' ? data.score : 50,
                missingSkills: Array.isArray(data.missingSkills) ? data.missingSkills : []
            };

            setAtsResult(result);

            if (result.score < 80) {
                setShowWarningModal(true);
            } else {
                await submitApplication();
            }
        } catch (err) {
            console.error("ATS checking failed, applying fallback:", err);
            // Don't block application if AI verification fails
            await submitApplication();
        } finally {
            setIsCheckingAts(false);
        }
    };

    const handleApply = async () => {
        if (!user) {
            toast({
                title: "Authentication Required",
                description: "Please log in to apply for jobs.",
                variant: "destructive",
            });
            router.push('/login');
            return;
        }

        // Referral Optimization Check
        if (job.isReferral && !isApplied) {
            if (atsResult) {
                if (atsResult.score < 80) {
                    setShowWarningModal(true);
                } else {
                    await submitApplication();
                }
            } else {
                await checkAtsAndApply();
            }
            return;
        }

        await submitApplication();
    };

    const handleImproveResume = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('jobsdart_ats_jd', job.description || '');
        }
        setShowWarningModal(false);
        router.push('/ats-score');
    };

    const handleForceSubmit = async () => {
        setShowWarningModal(false);
        await submitApplication();
    };
    
    if (isJobOwner) {
        return (
            <Button disabled className={cn("w-full rounded-full", variant === 'desktop' && "h-11 font-bold text-base px-10")} size={variant === 'desktop' ? 'default' : 'lg'}>
                <Ban className="mr-2 h-4 w-4" />
                {variant === 'desktop' ? 'Owner' : 'Cannot apply to own post'}
            </Button>
        );
    }

    const buttonLoading = isLoading || isCheckingAts;

    return (
        <>
            <Button 
                onClick={handleApply} 
                disabled={buttonLoading || isApplied} 
                className={cn(
                    "w-full rounded-full bg-[#2e5bff] hover:bg-blue-700 text-white font-bold transition-all duration-300",
                    variant === 'desktop' && "h-11 text-base px-10"
                )}
                size={variant === 'desktop' ? 'default' : 'lg'}
            >
                {buttonLoading && <LoaderCircle className="animate-spin mr-2 h-4 w-4 shrink-0" />}
                {isApplied && <CheckCircle className="mr-2 h-4 w-4 shrink-0" />}
                <div className="flex flex-col items-center">
                    <span>
                        {isApplied ? 'Applied' : (buttonLoading ? (isCheckingAts ? 'Checking Match...' : 'Applying...') : (job.isReferral ? 'Get Referral' : 'Apply Now'))}
                    </span>
                    {!isApplied && job.isReferral && !buttonLoading && (
                        <span className="text-[9px] opacity-80 font-medium leading-none mt-0.5">
                            (Requires 2 credits to unlock later)
                        </span>
                    )}
                </div>
            </Button>

            {/* Referral low score warning modal */}
            <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
                <DialogContent className="max-w-md p-6 bg-slate-900 text-white border border-slate-800 rounded-2xl shadow-2xl">
                    <DialogHeader className="space-y-3">
                        <div className="flex items-center gap-2.5 text-amber-400">
                            <AlertTriangle className="h-6 w-6 shrink-0" />
                            <DialogTitle className="text-xl font-bold tracking-tight text-white">
                                Optimize Referral Success
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-slate-300 text-sm leading-relaxed">
                            Your resume has an ATS match score of only <span className="font-bold text-amber-400">{atsResult?.score}%</span> for this role. Employees are far more likely to refer candidates with an ATS score of <span className="font-semibold text-emerald-400">80% or above</span>.
                        </DialogDescription>
                    </DialogHeader>

                    {atsResult?.missingSkills && atsResult.missingSkills.length > 0 && (
                        <div className="my-4 space-y-2.5 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                                Recommended skills to add before referral:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {atsResult.missingSkills.map((skill, index) => (
                                    <Badge 
                                        key={index} 
                                        variant="secondary" 
                                        className="bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/20 font-medium text-xs px-2.5 py-0.5 rounded-full"
                                    >
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-3 justify-end">
                        <Button 
                            variant="ghost" 
                            onClick={handleForceSubmit}
                            className="w-full sm:w-auto text-slate-400 hover:text-white hover:bg-slate-800 rounded-full font-semibold border border-transparent hover:border-slate-700"
                        >
                            Submit Anyway
                        </Button>
                        <Button 
                            onClick={handleImproveResume}
                            className="w-full sm:w-auto bg-[#2e5bff] hover:bg-blue-600 text-white font-bold rounded-full px-6 flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
                        >
                            ✨ Improve Resume
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
