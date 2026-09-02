"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  WifiOff, 
  RotateCw, 
  Home, 
  ArrowLeft, 
  CheckCircle2, 
  Radio, 
  ShieldAlert, 
  Smartphone, 
  Wifi 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NetworkErrorPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [reconnectSuccess, setReconnectSuccess] = useState(false);

  // Ping check to test actual connectivity
  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      // Test server reachability with timestamp to prevent caching
      const response = await fetch(`/api/health?t=${Date.now()}`, {
        method: "HEAD",
        cache: "no-store",
      });

      if (response.ok) {
        setIsOnline(true);
        setReconnectSuccess(true);
        setTimeout(() => {
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push("/");
          }
        }, 1200);
      } else {
        setIsOnline(false);
      }
    } catch {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
      setLastChecked(new Date());
    }
  }, [router]);

  useEffect(() => {
    // Initial check
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => {
      setIsOnline(true);
      checkConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setReconnectSuccess(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkConnection]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col justify-between text-slate-900 dark:text-white px-4 sm:px-6 py-8">
      {/* Top Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="JobsDart" className="h-7 w-auto object-contain" />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Jobs<span className="text-indigo-600 dark:text-indigo-400">Dart</span>
          </span>
        </Link>

        {/* Live Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          {reconnectSuccess ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-emerald-600 dark:text-emerald-400">Connection Restored</span>
            </>
          ) : isOnline === false ? (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-rose-600 dark:text-rose-400">Offline</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-600 dark:text-amber-400">Checking Signal...</span>
            </>
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-lg w-full mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm text-center">
        {/* Icon Circle */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center mb-6 shadow-sm">
          {reconnectSuccess ? (
            <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-in zoom-in-50 duration-300" />
          ) : (
            <WifiOff className="w-10 h-10 text-slate-600 dark:text-slate-400" />
          )}
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          {reconnectSuccess ? "Back Online!" : "Network Issue Detected"}
        </h1>

        {/* Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-sm mx-auto">
          {reconnectSuccess
            ? "Your internet connection has been restored. Redirecting you back..."
            : "We couldn't connect to JobsDart servers. Please check your internet connection and try again."}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={checkConnection}
            disabled={isChecking || reconnectSuccess}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <RotateCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
            {isChecking ? "Testing Connection..." : "Try Again"}
          </Button>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="h-11 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Go Back
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Link href="/">
                <Home className="w-3.5 h-3.5 mr-1.5" />
                Home
              </Link>
            </Button>
          </div>
        </div>

        {/* Last Checked status */}
        {lastChecked && !reconnectSuccess && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4">
            Last check: {lastChecked.toLocaleTimeString()} · Unable to reach server
          </p>
        )}

        {/* Troubleshooting Checklist */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
            Troubleshooting Steps
          </p>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-center gap-2.5">
              <Wifi className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Check your Wi-Fi or router connection</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Verify that mobile data or Ethernet is active</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Radio className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Make sure Airplane Mode is turned off</span>
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Check if your VPN, proxy, or firewall is blocking requests</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer info */}
      <div className="max-w-4xl w-full mx-auto text-center text-xs text-slate-400 dark:text-slate-600">
        JobsDart · The page will automatically refresh once your internet connection is restored.
      </div>
    </div>
  );
}
