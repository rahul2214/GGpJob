"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SaveJobButtonProps {
  jobUuid?: string;
  jobTitle?: string;
  className?: string;
}

export function SaveJobButton({ jobUuid, jobTitle, className }: SaveJobButtonProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uuid || !jobUuid) return;
    let isMounted = true;
    
    const checkSavedStatus = async () => {
      try {
        const res = await fetch(`/api/jobs/saved?userId=${user.uuid}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && isMounted) {
            const found = data.some((j: any) => j.uuid === jobUuid || j.id === jobUuid);
            setIsSaved(found);
          }
        }
      } catch (err) {
        console.error("Failed to check saved job status:", err);
      }
    };

    checkSavedStatus();
    return () => { isMounted = false; };
  }, [user?.uuid, jobUuid]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save jobs.",
        variant: "destructive"
      });
      return;
    }

    if (user.role !== 'Job Seeker') {
      toast({
        title: "Access Restricted",
        description: "Only candidate profiles can save jobs.",
        variant: "destructive"
      });
      return;
    }

    if (!jobUuid || loading) return;

    setLoading(true);
    try {
      const method = isSaved ? 'DELETE' : 'POST';
      const url = isSaved
        ? `/api/jobs/saved?userId=${user.uuid}&jobId=${jobUuid}`
        : `/api/jobs/saved`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: isSaved ? undefined : JSON.stringify({ userId: user.uuid, jobId: jobUuid })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update bookmark");
      }

      const nextSavedState = !isSaved;
      setIsSaved(nextSavedState);

      toast({
        title: nextSavedState ? "✓ Saved to Bookmarks" : "Removed from Bookmarks",
        description: nextSavedState 
          ? `"${jobTitle || 'Job'}" has been saved.` 
          : `"${jobTitle || 'Job'}" was removed from saved jobs.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not save job",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleSave}
      disabled={loading}
      className={cn(
        "w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-95",
        isSaved 
          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" 
          : "hover:bg-slate-100 text-slate-600 dark:text-zinc-400 dark:hover:bg-white/10",
        className
      )}
      aria-label={isSaved ? "Unsave Job" : "Save Job"}
      title={isSaved ? "Unsave Job" : "Save Job"}
    >
      <Bookmark className={cn("w-4.5 h-4.5 transition-colors", isSaved && "fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400")} />
    </button>
  );
}
