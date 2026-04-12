"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { LoaderCircle, CheckCircle2, XCircle, Eye, EyeOff, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type Mode = "resetPassword" | "verifyEmail" | "unknown";
type Status = "loading" | "ready" | "submitting" | "success" | "error";

export default function AuthActionPage() {
  const searchParams = useSearchParams();

  const mode = (searchParams.get("mode") || "unknown") as Mode;
  const oobCode = searchParams.get("oobCode") || "";

  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [successEmail, setSuccessEmail] = useState("");

  // Password reset form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setStatus("error");
      setErrorMsg("Invalid or missing action code. Please use the link from your email.");
      return;
    }

    if (mode === "verifyEmail") {
      handleVerifyEmail();
    } else if (mode === "resetPassword") {
      setStatus("ready");
    } else {
      setStatus("error");
      setErrorMsg("Unknown action. Please use the link directly from your email.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, oobCode]);

  const handleVerifyEmail = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/confirm-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oobCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Email verification failed.");
      setSuccessEmail(data.email || "");
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Email verification failed.");
      setStatus("error");
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    setErrorMsg("");
    setStatus("submitting");
    try {
      const res = await fetch("/api/auth/confirm-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oobCode, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password reset failed.");
      setSuccessEmail(data.email || "");
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Password reset failed.");
      setStatus("error");
    }
  };

  // ─── Shared wrapper ────────────────────────────────────────────────────────
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/20 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
      >
        {/* Brand header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6 text-center">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">JobsDart</h1>
          <p className="text-indigo-200 text-xs mt-1">Your career, accelerated.</p>
        </div>
        <div className="px-8 py-8">{children}</div>
      </motion.div>
    </div>
  );

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <Wrapper>
        <div className="text-center py-8">
          <LoaderCircle className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">
            {mode === "verifyEmail" ? "Verifying your email…" : "Loading…"}
          </p>
        </div>
      </Wrapper>
    );
  }

  // ─── Success ───────────────────────────────────────────────────────────────
  if (status === "success") {
    const isReset = mode === "resetPassword";
    return (
      <Wrapper>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isReset ? "Password Updated!" : "Email Verified! ✅"}
          </h2>
          {successEmail && (
            <p className="text-slate-400 text-sm mb-1">{successEmail}</p>
          )}
          <p className="text-slate-500 text-sm mb-8">
            {isReset
              ? "Your password has been reset successfully. You can now log in with your new password."
              : "Your email address has been verified. You can now log in to your account."}
          </p>
          <Link href="/login">
            <Button className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200">
              Go to Login →
            </Button>
          </Link>
        </div>
      </Wrapper>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <Wrapper>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-9 h-9 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Something went wrong</h2>
          <div className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3 mb-6 text-left">
            {errorMsg}
          </div>
          <Link href="/login">
            <Button variant="outline" className="w-full h-11 rounded-xl border-slate-200">
              Back to Login
            </Button>
          </Link>
        </div>
      </Wrapper>
    );
  }

  // ─── Reset Password Form (status === "ready") ──────────────────────────────
  if (mode === "resetPassword") {
    return (
      <Wrapper>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Set New Password</h2>
            <p className="text-slate-500 text-xs">Choose a strong password for your account.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 rounded-xl border-slate-200 focus:border-indigo-400 bg-slate-50 focus:bg-white pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 rounded-xl border-slate-200 focus:border-indigo-400 bg-slate-50 focus:bg-white pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={status === "submitting"}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200"
            >
              {status === "submitting" ? (
                <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Resetting…</>
              ) : (
                "Reset Password"
              )}
            </Button>
          </div>
        </form>
      </Wrapper>
    );
  }

  return null;
}
