
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Share2 } from "lucide-react";

interface ShareButtonProps {
    jobId: string;
    jobTitle: string;
    companyName?: string;
    variant?: 'icon' | 'text';
}

export function ShareButton({ jobId, jobTitle, companyName, variant }: ShareButtonProps) {
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
        const jobUrl = `${window.location.origin}/jobs/${jobId}`;
        const companyText = companyName ? ` at ${companyName}` : '';
        const shareData = {
            title: `Job Opening: ${jobTitle}${companyText}`,
            text: `Check out this job: ${jobTitle}${companyText}`,
            url: jobUrl,
        };

        if (navigator.share) {
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
