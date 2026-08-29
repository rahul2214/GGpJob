"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WifiOff, RotateCw, Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isOffline, setIsOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Check if error is network-related or browser is offline
    const isNetwork =
      (typeof navigator !== "undefined" && !navigator.onLine) ||
      error.message?.toLowerCase().includes("network") ||
      error.message?.toLowerCase().includes("fetch") ||
      error.message?.toLowerCase().includes("failed to fetch") ||
      error.message?.toLowerCase().includes("timeout") ||
      error.message?.toLowerCase().includes("connection");

    setIsOffline(Boolean(isNetwork));
    console.error("Application Error:", error);
  }, [error]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      if (typeof window !== "undefined" && navigator.onLine) {
        const res = await fetch(`/api/health?t=${Date.now()}`, { method: "HEAD", cache: "no-store" });
        if (res.ok) {
          reset();
          return;
        }
      }
      reset();
    } catch {
      reset();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col justify-between text-slate-900 dark:text-white px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="JobsDart" className="h-7 w-auto object-contain" />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Jobs<span className="text-indigo-600 dark:text-indigo-400">Dart</span>
          </span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center mb-6 shadow-sm">
          {isOffline ? (
            <WifiOff className="w-10 h-10 text-slate-600 dark:text-slate-400" />
          ) : (
            <AlertCircle className="w-10 h-10 text-rose-500" />
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          {isOffline ? "Network Issue Detected" : "Something went wrong"}
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-sm mx-auto">
          {isOffline
            ? "We couldn't connect to JobsDart. Please verify your internet connection and try again."
            : "An unexpected error occurred while loading this page. Please try refreshing."}
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <RotateCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Reconnecting..." : "Try Again"}
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full h-11 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Link href="/">
              <Home className="w-3.5 h-3.5 mr-1.5" />
              Return to Homepage
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl w-full mx-auto text-center text-xs text-slate-400 dark:text-slate-600">
        JobsDart · Global Career Platform
      </div>
    </div>
  );
}
