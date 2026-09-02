"use client";

import { useMemo, useState } from "react";
import { Sparkles, Zap, Target, AlertCircle, CheckCircle2, PlusCircle, ChevronRight, X } from "lucide-react";
import { calculateSkillMatch } from "@/lib/skill-match";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkillMatchBadgeProps {
  jobSkills?: string[];
  userSkills?: (string | { name: string; [key: string]: any })[];
  showDetailsInPopover?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function SkillMatchBadge({
  jobSkills = [],
  userSkills = [],
  showDetailsInPopover = true,
  size = "md",
  className
}: SkillMatchBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const matchData = useMemo(() => {
    return calculateSkillMatch(jobSkills, userSkills);
  }, [jobSkills, userSkills]);

  if (!jobSkills || jobSkills.length === 0) return null;

  const getIcon = () => {
    switch (matchData.tier) {
      case "top":
        return <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />;
      case "strong":
        return <Zap className="w-3.5 h-3.5 text-indigo-500" />;
      case "potential":
        return <Target className="w-3.5 h-3.5 text-amber-500" />;
      case "low":
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
    }
  };

  const badgeContent = (
    <div
      onClick={(e) => {
        if (showDetailsInPopover) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md transition-all duration-300 font-extrabold cursor-pointer group shadow-sm hover:shadow-md",
        matchData.badgeBg,
        matchData.borderColor,
        size === "sm" && "px-2 py-0.5 text-[10px]",
        size === "md" && "px-2.5 py-1 text-xs",
        size === "lg" && "px-3.5 py-1.5 text-sm",
        matchData.tier === "top" && "ring-2 ring-emerald-400/20 dark:ring-emerald-500/30",
        className
      )}
    >
      <span className="flex items-center justify-center shrink-0">
        {getIcon()}
      </span>
      <span className="tracking-tight">
        {matchData.matchPercentage}%
      </span>
      <span className="text-slate-300 dark:text-slate-700">•</span>
      <span className="font-bold truncate max-w-[140px]">
        {matchData.tier === "top" ? "Top Rated Candidate" : matchData.tierLabel}
      </span>
      {showDetailsInPopover && (
        <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
      )}
    </div>
  );

  if (!showDetailsInPopover) {
    return badgeContent;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {badgeContent}
      </PopoverTrigger>

      <PopoverContent
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="w-80 sm:w-96 p-0 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
        side="top"
        align="start"
      >
        {/* Header Banner */}
        <div className={cn(
          "p-4 relative border-b border-slate-100 dark:border-slate-800/60",
          matchData.tier === "top" && "bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-600/10",
          matchData.tier === "strong" && "bg-gradient-to-r from-indigo-500/10 to-blue-500/10",
          matchData.tier === "potential" && "bg-gradient-to-r from-amber-500/10 to-orange-500/10",
          matchData.tier === "low" && "bg-gradient-to-r from-rose-500/10 to-purple-500/10"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center">
                {getIcon()}
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  {matchData.tierLabel}
                  {matchData.tier === "top" && (
                    <span className="text-[9px] bg-emerald-500 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                      Top 5%
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {matchData.tierTagline}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Animated Progress Bar */}
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-600 dark:text-slate-300">Skill Compatibility Score</span>
              <span className={cn(
                matchData.tier === "top" && "text-emerald-600 dark:text-emerald-400 font-black",
                matchData.tier === "strong" && "text-indigo-600 dark:text-indigo-400 font-black",
                matchData.tier === "potential" && "text-amber-600 dark:text-amber-400 font-black",
                matchData.tier === "low" && "text-rose-600 dark:text-rose-400 font-black"
              )}>
                {matchData.matchPercentage}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${matchData.matchPercentage}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full transition-all",
                  matchData.tier === "top" && "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50",
                  matchData.tier === "strong" && "bg-gradient-to-r from-indigo-500 to-blue-500 shadow-sm shadow-indigo-500/50",
                  matchData.tier === "potential" && "bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm shadow-amber-500/50",
                  matchData.tier === "low" && "bg-gradient-to-r from-rose-500 to-pink-500 shadow-sm shadow-rose-500/50"
                )}
              />
            </div>
          </div>
        </div>

        {/* Skill Details Breakdown Body */}
        <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
          {/* Matched Skills */}
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1.5">
              <CheckCircle2 className="w-3 h-3" />
              Matched Skills ({matchData.matchedSkills.length})
            </span>
            {matchData.matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {matchData.matchedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No matching skills found on your profile.</p>
            )}
          </div>

          {/* Missing Skills */}
          {matchData.missingSkills.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-1.5">
                <PlusCircle className="w-3 h-3" />
                Recommended Skills to Add ({matchData.missingSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchData.missingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200/80 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/60"
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {userSkills.length === 0 && (
            <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
              💡 <strong>Tip:</strong> Add skills to your profile to get accurate candidate matching scores!
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
