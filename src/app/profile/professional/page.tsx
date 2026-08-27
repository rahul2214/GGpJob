"use client";

import { useUser } from "@/contexts/user-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Briefcase, ArrowLeft, FileText, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { SummaryForm } from "@/components/summary-form";
import { ResumeForm } from "@/components/resume-form";
import { ProfileSections } from "@/components/profile-sections";

export default function MobileProfessionalProfilePage() {
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
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 max-w-3xl space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-2 pl-0 text-slate-500 hover:text-slate-800 hover:bg-transparent font-bold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
            </Button>

        

            {/* Professional Summary */}
            <Card className="w-full border shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="px-6 border-b border-slate-50 bg-slate-50/50 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Professional Summary</CardTitle>
                            <CardDescription className="text-xs">Highlight your career path & goals.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-5 pt-6 pb-6">
                    <SummaryForm user={user} />
                </CardContent>
            </Card>

            {/* My Resume */}
            <Card className="w-full border shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="px-6 border-b border-slate-50 bg-slate-50/50 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                            <Link2 className="w-4 h-4" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">My Resume</CardTitle>
                            <CardDescription className="text-xs">Upload or link your resume file.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-5 pt-6 pb-6">
                    <ResumeForm user={user} />
                </CardContent>
            </Card>

            {/* Experience & Education */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                    Experience & Education History
                </h3>
                <ProfileSections userId={user.uuid || (user.id as any)} isEditable={true} />
            </div>
        </div>
    );
}
