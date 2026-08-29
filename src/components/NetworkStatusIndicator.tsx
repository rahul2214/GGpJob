"use client";

import { useState, useEffect, useCallback } from "react";
import { WifiOff, RotateCw, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showRestored, setShowRestored] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const checkHealth = useCallback(async () => {
    setIsRetrying(true);
    try {
      const res = await fetch(`/api/health?t=${Date.now()}`, {
        method: "HEAD",
        cache: "no-store",
      });
      if (res.ok) {
        setIsOnline(true);
        setShowRestored(true);
        setTimeout(() => setShowRestored(false), 3000);
      } else {
        setIsOnline(false);
      }
    } catch {
      setIsOnline(false);
    } finally {
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      setTimeout(() => setShowRestored(false), 3500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) return null;

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.25 }}
          className="fixed top-0 left-0 right-0 z-[9999] bg-slate-900 text-white border-b border-slate-800 shadow-lg px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-medium"
        >
          <div className="flex items-center gap-2.5 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
              </span>
              <WifiOff className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong className="font-semibold text-white">No internet connection.</strong>{" "}
                <span className="hidden sm:inline text-slate-400">Some features may be unavailable.</span>
              </span>
            </div>

            <button
              onClick={checkHealth}
              disabled={isRetrying}
              className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg text-xs font-semibold text-white transition-colors shrink-0"
            >
              <RotateCw className={`w-3 h-3 ${isRetrying ? "animate-spin" : ""}`} />
              {isRetrying ? "Testing..." : "Retry"}
            </button>
          </div>
        </motion.div>
      )}

      {showRestored && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.25 }}
          className="fixed top-0 left-0 right-0 z-[9999] bg-emerald-600 text-white shadow-lg px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>You are back online. Connection restored!</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
