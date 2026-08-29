"use client";

import { motion } from "framer-motion";

interface JobsDartLoadingProps {
  fullScreen?: boolean;
  message?: string;
}

export function JobsDartLoading({
  fullScreen = true,
  message = "Loading your workspace..."
}: JobsDartLoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-slate-950 ${
        fullScreen ? "fixed inset-0 z-50 min-h-screen" : "min-h-[50vh] w-full py-16"
      }`}
    >
      <div className="flex flex-col items-center gap-5 px-4">
       

        {/* Static JobsDart Text with Horizontal Shimmer Sheen (Left to Right) */}
        <div className="relative overflow-hidden inline-flex items-center select-none px-3 py-1 rounded-xl">
          {/* Base Crisp Text without any wave/jump movement */}
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center">
            Jobs<span className="text-indigo-600 dark:text-indigo-400">Dart</span>
          </span>

          {/* Smooth Light Beam sweeping horizontally across from left to right */}
          <motion.div
            className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/70 dark:via-white/35 to-transparent pointer-events-none -skew-x-12"
            animate={{
              left: ["-100%", "200%"],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0.2,
            }}
          />
        </div>

        {/* Left to right sweep progress bar */}
        <div className="w-40 sm:w-48 h-1 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden relative">
          <motion.div
            className="h-full w-20 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-500 rounded-full"
            animate={{
              x: ["-100%", "260%"],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Status message */}
        {message && (
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 tracking-wide">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
