"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/user-context";

function SettingsSkeleton() {
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
      <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
      <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse mt-4" />
      <div className="h-72 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse mt-4" />
    </div>
  );
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;

    const tab = searchParams.get("tab");
    let target = "/settings/support";
    if (tab === "password") {
      target = "/settings/password";
    } else if (tab === "about") {
      target = "/about";
    }

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(target)}`);
    } else {
      router.replace(target);
    }
  }, [user, loading, router, searchParams]);

  return <SettingsSkeleton />;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}
