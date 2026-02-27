
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/user-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { CheckCircle, LoaderCircle, Ban } from 'lucide-react';
import { Application, Job } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ApplyButtonProps {
    job: Job;
    variant?: 'default' | 'desktop';
}

export function ApplyButton({ job, variant = 'default' }: ApplyButtonProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isApplied, setIsApplied] = useState(false);
    const [isJobOwner, setIsJobOwner] = useState(false);
    const [loadingState, setLoadingState] = useState(true);

    useEffect(() => {
        const checkApplicationStatus = async () => {
            if (user && job) {
                setLoadingState(true);
                try {
                    const res = await fetch(`/api/applications?userId=${user.id}`);
                    if (res.ok) {
                        const userApplications: Application[] = await res.json();
                        const alreadyApplied = userApplications.some(app => app.jobId === job.id);
                        setIsApplied(alreadyApplied);
                    }
                } catch (error) {
                    console.error("Failed to check application status", error);
                }

                const isOwner = job.recruiterId === user.id || job.employeeId === user.id;
                setIsJobOwner(isOwner);
                setLoadingState(false);
            } else {
                setLoadingState(false);
            }
        };

        checkApplicationStatus();
    }, [user, job]);


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

        setIsLoading(true);
        try {
            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ jobId: job.id, userId: user.id }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to apply');
            }
            
            setIsApplied(true);
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
    
    if (loadingState) {
        return (
             <Button disabled className={cn("w-full rounded-full", variant === 'desktop' && "h-11 font-bold text-base px-10")} size={variant === 'desktop' ? 'default' : 'lg'}>
                <LoaderCircle className="animate-spin mr-2" />
                Loading...
            </Button>
        )
    }

    if (isJobOwner) {
        return (
            <Button disabled className={cn("w-full rounded-full", variant === 'desktop' && "h-11 font-bold text-base px-10")} size={variant === 'desktop' ? 'default' : 'lg'}>
                <Ban className="mr-2 h-4 w-4" />
                {variant === 'desktop' ? 'Owner' : 'Cannot apply to own post'}
            </Button>
        );
    }

    return (
        <Button 
            onClick={handleApply} 
            disabled={isLoading || isApplied} 
            className={cn(
                "w-full rounded-full bg-[#2e5bff] hover:bg-blue-700 text-white font-bold",
                variant === 'desktop' && "h-11 text-base px-10"
            )}
            size={variant === 'desktop' ? 'default' : 'lg'}
        >
            {isLoading && <LoaderCircle className="animate-spin mr-2 h-4 w-4" />}
            {isApplied && <CheckCircle className="mr-2 h-4 w-4" />}
            {isApplied ? 'Applied' : 'Apply'}
        </Button>
    );
}
