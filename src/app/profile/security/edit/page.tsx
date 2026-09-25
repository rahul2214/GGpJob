"use client";

import { useUser } from "@/contexts/user-context";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { CurrencySelector } from "@/components/currency-selector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Globe, ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function MobileEditSecurityPage() {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) return <div className="container mx-auto p-4 text-sm text-slate-500">Loading...</div>;
    if (!user) return null;

    return (
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 max-w-2xl space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-2 pl-0 text-slate-500 hover:text-slate-800 hover:bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
            </Button>

            {/* System Preferences */}
            <Card className="w-full border shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="px-6 border-b border-slate-50 bg-slate-50/50">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Globe className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-xl">System Preferences</CardTitle>
                    </div>
                    <CardDescription>Customize your currency and regional settings.</CardDescription>
                </CardHeader>
                <CardContent className="px-5 pt-6 pb-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <div className="space-y-0.5">
                            <p className="font-bold text-slate-800 text-sm">Preferred Currency</p>
                            <p className="text-xs text-slate-400">Select currency for pricing & transactions.</p>
                        </div>
                        <CurrencySelector />
                    </div>
                </CardContent>
            </Card>

            {/* Password Link to Settings */}
            <Card className="w-full border border-indigo-100 dark:border-indigo-900/60 shadow-sm rounded-3xl overflow-hidden bg-indigo-50/30">
                <CardContent className="p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <KeyRound className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="font-bold text-slate-800 text-sm">Account Password</p>
                            <p className="text-xs text-slate-500">Password updates are managed in Settings.</p>
                        </div>
                    </div>
                    <Link
                        href="/settings?tab=password"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline shrink-0"
                    >
                        Go to Settings <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="w-full border border-rose-100 shadow-sm rounded-3xl overflow-hidden bg-rose-50/30">
                <CardHeader className="px-6 border-b border-rose-100/60">
                    <CardTitle className="text-lg text-rose-700">Danger Zone</CardTitle>
                    <CardDescription className="text-rose-600/80">Irreversible account actions.</CardDescription>
                </CardHeader>
                <CardContent className="px-5 pt-6 pb-6">
                    <DeleteAccountButton />
                </CardContent>
            </Card>
        </div>
    );
}
