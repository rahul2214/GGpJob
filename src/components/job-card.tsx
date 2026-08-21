"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Job } from "@/lib/types";
import { MapPin, Briefcase, Clock, Star, CheckCircle, BadgeDollarSign, ShieldCheck, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@/contexts/user-context';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import SkillMatchBadge from '@/components/skill-match-badge';

interface JobCardProps {
  job: Job;
  isApplied?: boolean;
  hideDetails?: boolean;
  onSaveToggle?: (jobId: string, isCurrentlySaved: boolean) => void;
}

export default function JobCard({ job, isApplied = false, onSaveToggle }: JobCardProps) {
  const { user, currency, exchangeRates } = useUser();
  const { toast } = useToast();
  const [saved, setSaved] = useState(job.isSaved || false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSaved(job.isSaved || false);
  }, [job.isSaved]);

  const isCorporateEmail = (email?: string | null) => {
    if (!email) return false;
    const lower = email.toLowerCase();
    const publicDomains = ['@gmail.', '@yahoo.', '@outlook.', '@hotmail.', '@live.', '@icloud.', '@aol.', '@ymail.', '@rocketmail.'];
    return !publicDomains.some(d => lower.includes(d));
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save jobs.",
        variant: "destructive"
      });
      return;
    }

    if (user.role !== 'Job Seeker') {
      toast({
        title: "Access Restricted",
        description: "Only candidates can save jobs.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const method = saved ? 'DELETE' : 'POST';
      const url = saved
        ? `/api/jobs/saved?userId=${user.uuid}&jobId=${job.uuid}`
        : `/api/jobs/saved`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: saved ? undefined : JSON.stringify({ userId: user.uuid, jobId: job.uuid })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update bookmark");
      }

      const newSavedState = !saved;
      setSaved(newSavedState);

      toast({
        title: newSavedState ? "✓ Saved to Bookmarks" : "Removed from Bookmarks",
        description: newSavedState ? `"${job.title}" has been saved.` : `"${job.title}" was removed.`,
      });

      if (onSaveToggle) {
        onSaveToggle(job.uuid, newSavedState);
      }
    } catch (err: any) {
      toast({
        title: "Bookmark Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const showVerifiedBadge = job.isReferral && (job as any).employeeTrustScore >= 90 && isCorporateEmail((job as any).employeeEmail);

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      <Link href={`/jobs/${job.uuid || job.id}`} className="block h-full">
        <Card className={cn(
          "h-full flex flex-col relative overflow-hidden transition-all duration-300",
          "bg-white/80 dark:bg-slate-900/60 backdrop-blur-md",
          "border border-slate-200/50 dark:border-slate-800/50",
          "shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.06)]",
          job.isBoosted && "border-amber-400/60 dark:border-amber-500/40 bg-gradient-to-br from-amber-500/[0.015] to-orange-500/[0.015] shadow-md shadow-amber-500/5"
        )}>
          {/* Subtle light reflex layer for glassmorphic cards */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />
          
          <CardHeader className="relative pb-4">
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {/* Custom Brand Logo Tonal Box */}
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/50 flex items-center justify-center font-bold text-[#3525cd] dark:text-indigo-400 text-xl shadow-sm shrink-0 overflow-hidden p-1.5">
                  {job.companyLogo ? (
                    typeof job.companyLogo === 'string' && (job.companyLogo.startsWith('http') || job.companyLogo.startsWith('/')) ? (
                      <img
                        src={job.companyLogo}
                        alt={job.companyName}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                          (e.currentTarget.parentElement as HTMLElement).innerText = job.companyName?.charAt(0)?.toUpperCase() ?? '?';
                        }}
                      />
                    ) : (
                      <span className="text-xl leading-none">{job.companyLogo}</span>
                    )
                  ) : (
                    <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">{job.companyName?.charAt(0)?.toUpperCase() ?? '?'}</span>
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-snug truncate">
                    {job.title}
                  </CardTitle>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                    <span>{job.companyName}</span>
                    {job.job_role && (
                      <>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-slate-500 dark:text-slate-400 truncate">{job.job_role}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              
            </div>
            
            {/* Horizontal Tonal Dividers */}
            <div className="h-[1px] bg-slate-200/40 dark:bg-slate-800/40 w-full mt-4" />
          </CardHeader>

          <CardContent className="flex-grow pb-4">
            <div className="flex flex-col space-y-3.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-lg bg-slate-50 dark:bg-slate-950/30 flex items-center justify-center border border-slate-100/50 dark:border-slate-800/30 shrink-0">
                    <MapPin className="h-3 w-3 text-indigo-500" />
                  </div>
                  <span className="truncate font-medium" title={(job.locations && job.locations.length > 0) ? job.locations.join(', ') : (job.location || 'Not Disclosed')}>
                    {(job.locations && job.locations.length > 0) ? job.locations.join(', ') : (job.location || 'Not Disclosed')}
                  </span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-lg bg-slate-50 dark:bg-slate-950/30 flex items-center justify-center border border-slate-100/50 dark:border-slate-800/30 shrink-0">
                    <Briefcase className="h-3 w-3 text-indigo-500" />
                  </div>
                  <span className="truncate font-medium">{job.type || 'Not Disclosed'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-slate-50 dark:bg-slate-950/30 flex items-center justify-center border border-slate-100/50 dark:border-slate-800/30 shrink-0">
                    <BadgeDollarSign className="h-3 w-3 text-indigo-500" />
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {job.salaryMin || job.salaryMax
                      ? `${job.salaryCurrency || job.currency || '₹'} ${job.salaryMin ? job.salaryMin.toLocaleString() : '0'} - ${job.salaryMax ? job.salaryMax.toLocaleString() : 'Negotiable'}`
                      : ((job as any).salary || 'Not Disclosed')}
                  </span>
                </div>
                {job.companyVerification && (
                  <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60 text-[9px] font-bold">
                    <CheckCircle className="w-2.5 h-2.5 mr-1" /> Verified Company
                  </Badge>
                )}
              </div>

              {((job.requiredSkills && job.requiredSkills.length > 0) || (job.skills && job.skills.length > 0) || (job.requirements && job.requirements.length > 0)) && (
                <div className="flex items-center gap-1.5 pt-1 text-xs text-slate-500 dark:text-slate-400 font-medium truncate w-full flex-wrap">
                  <span className="font-bold text-slate-700 dark:text-slate-350 shrink-0">Skills:</span>
                  {(job.requiredSkills || job.skills || job.requirements || []).slice(0, 4).map((skill: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-[10px] font-semibold py-0 px-2 bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100/80 dark:border-indigo-900/40">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}

              {job.benefits && job.benefits.length > 0 && (
                <div className="flex items-center gap-1.5 pt-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium truncate w-full flex-wrap">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 shrink-0">Benefits:</span>
                  {job.benefits.slice(0, 3).map((benefit: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-[10px] font-semibold py-0 px-2 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40">
                      ✓ {benefit}
                    </Badge>
                  ))}
                </div>
              )}

              {/* AI Skill Match Badge for Job Seekers */}
              {user?.role === 'Job Seeker' && (job.requiredSkills || job.requirements || job.skills) && (
                <div className="shrink-0 pt-0.5">
                  <SkillMatchBadge
                    jobSkills={job.requiredSkills || job.skills || job.requirements || []}
                    userSkills={user?.skills || []}
                    size="sm"
                  />
                </div>
              )}
            </div>
          </CardContent>

          {/* Card Footer badges row */}
          <CardFooter className="flex justify-between items-center border-t border-slate-200/30 dark:border-slate-800/30 pt-4 pb-5">
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-600 flex items-center gap-1.5 tracking-wider">
              <Clock className="h-3.5 w-3.5 text-slate-400/80" />
              {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
            </div>
            
            <div className="flex items-center gap-1.5 flex-wrap">
              {job.isBoosted && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none font-black text-[9px] uppercase tracking-wider py-0.5 px-2 rounded-lg shadow-sm shadow-amber-500/20">
                  ⚡ Boosted
                </Badge>
              )}
              {isApplied && (
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-[9px] uppercase py-0.5 px-2 rounded-lg">
                  Applied
                </Badge>
              )}
              {user?.role === 'Job Seeker' && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSaveClick}
                  disabled={saving}
                  className={cn(
                    "p-1.5 rounded-lg border transition-all duration-300 flex items-center justify-center shrink-0 ml-1 bg-white/60 border-slate-200 text-slate-400 hover:text-indigo-600 dark:bg-slate-950/40 dark:border-slate-800/80 dark:text-slate-600 dark:hover:text-indigo-400",
                    saved && "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900/50 dark:text-indigo-400"
                  )}
                  title={saved ? "Remove Bookmark" : "Save Job"}
                >
                  <Bookmark className={cn("w-3 h-3 transition-transform", saved && "fill-indigo-600 dark:fill-indigo-400 scale-110")} />
                </motion.button>
              )}
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
