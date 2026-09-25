"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  KeyRound,
  Shield,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useUser } from "@/contexts/user-context";
import { ChangePasswordForm } from "@/components/change-password-form";

function PasswordSkeleton() {
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
      <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2 h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}

function PasswordContent() {
  const router = useRouter();
  const { user, loading } = useUser();

  // Auth Protection: If unauthenticated, redirect to login page with redirect URL
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=%2Fsettings%2Fpassword");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <PasswordSkeleton />;
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/settings" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Settings
          </Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300">Change Password</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <KeyRound className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Change Password
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Update your account login password and manage credential security.
            </p>
          </div>
        </div>
      </div>

      {/* Password Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="md:col-span-2">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    Change Account Password
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Choose a strong, unique password to safeguard your career profile and applications.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </div>

        {/* Security Tips Column */}
        <div>
          <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shadow-xs space-y-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                Security Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Use at least 8 characters (12+ recommended).</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Mix uppercase, lowercase, numbers, and symbols.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Avoid easily guessed words or personal birthdays.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Never share your password with anyone.</span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Account Status
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Logged in as <strong className="text-slate-700 dark:text-slate-300">{user?.email || "Current User"}</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PasswordPage() {
  return (
    <Suspense fallback={<PasswordSkeleton />}>
      <PasswordContent />
    </Suspense>
  );
}
