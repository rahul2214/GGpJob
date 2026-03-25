"use client"

import { ProfileForm } from "@/components/profile-form";
import { useUser } from "@/contexts/user-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { UserCog, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function MobileEditBasicInfo() {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return <div className="container mx-auto p-4">Loading...</div>;
    }

    if (!user) {
        return null; // Prevent flicker before redirect
    }

    return (
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 max-w-2xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0 text-slate-500 hover:text-slate-800 hover:bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
            </Button>

            <Card className="w-full border shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="px-6 border-b border-slate-50 bg-slate-50/50">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <UserCog className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-xl">Edit Basic Information</CardTitle>
                    </div>
                    <CardDescription>Update your primary identity details below.</CardDescription>
                </CardHeader>
                <CardContent className="px-5 pt-6 pb-6">
                    <ProfileForm user={user} isEditingPage={true} />
                </CardContent>
            </Card>
        </div>
    );
}
