
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Share2 } from "lucide-react";
import { getJobUrl } from "@/lib/job-url";

interface ShareButtonProps {
    jobId?: string;
    jobTitle?: string;
    companyName?: string;
    variant?: 'icon' | 'text';
    className?: string;
}

export function ShareButton({ jobId, jobTitle, companyName, variant, className }: ShareButtonProps) {
    const { toast } = useToast();

    const copyToClipboard = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            toast({
                title: "Link Copied!",
                description: "The job link has been copied to your clipboard.",
            });
        } catch (error) {
            console.error("Error copying to clipboard:", error);
            toast({
                title: "Error",
                description: "Could not copy link to clipboard.",
                variant: "destructive",
            });
        }
    };

    const handleShare = async (e: React.MouseEvent<HTMLButtonElement | HTMLSpanElement>) => {
        e.stopPropagation();
        e.preventDefault();
        const pageH1 = typeof document !== 'undefined' ? document.querySelector('h1')?.textContent : '';
        const titleText = (jobTitle && jobTitle !== 'Job Details') ? jobTitle : (pageH1 || (typeof document !== 'undefined' ? document.title : 'Job Opening'));
        let jobUrl = typeof window !== 'undefined' ? window.location.href : '';
        if (jobId) {
            jobUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${getJobUrl({ id: jobId, title: jobTitle || titleText })}`;
        }
        const companyText = companyName ? ` at ${companyName}` : '';
        const shareData = {
            title: `Job Opening: ${titleText}${companyText}`,
            text: `Check out this job: ${titleText}${companyText}`,
            url: jobUrl,
        };

        if (typeof window !== 'undefined' && navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error("Error sharing:", error);
                    await copyToClipboard(jobUrl);
                }
            }
        } else {
            await copyToClipboard(jobUrl);
        }
    };

    if (variant === 'text') {
        return (
            <span onClick={handleShare} className="w-full text-left">
                Share
            </span>
        );
    }

    return (
        <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Share this job</span>
        </Button>
    );
}
