"use client";

import { useUser } from "@/contexts/user-context";
import { ChangePasswordForm } from "@/components/change-password-form";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowLeft } from "lucide-react";
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

            <Card className="w-full border shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="px-6 border-b border-slate-50 bg-slate-50/50">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-xl">Security & Password</CardTitle>
                    </div>
                    <CardDescription>Update your account password and security settings.</CardDescription>
                </CardHeader>
                <CardContent className="px-5 pt-6 pb-6">
                    <ChangePasswordForm />
                </CardContent>
            </Card>

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
