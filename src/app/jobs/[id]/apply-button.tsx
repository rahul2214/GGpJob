
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
    isApplied?: boolean;
}

export function ApplyButton({ job, variant = 'default', isApplied: propIsApplied = false }: ApplyButtonProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isApplied, setIsApplied] = useState(propIsApplied);

    useEffect(() => {
        setIsApplied(propIsApplied);
    }, [propIsApplied]);

    // Calculate ownership synchronously
    const isJobOwner = (user && job) && (user.role === 'Recruiter' || user.role === 'Employee' || user.role === 'Admin') && 
                       (job.recruiterId === user.uuid || job.employeeId === user.uuid || job.recruiterPk === user.id || job.employeePk === user.id);



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
                body: JSON.stringify({ jobId: job.uuid, userId: user.uuid }),
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
