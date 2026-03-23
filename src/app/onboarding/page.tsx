"use client";

import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { LoaderCircle, FileText, CheckCircle2, UploadCloud, Briefcase, Building2, Paperclip, ChevronRight, LayoutDashboard, Phone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/config";
import type { Domain } from "@/lib/types";
import { Input } from "@/components/ui/input";

export default function OnboardingPage() {
    const { user, loading, setUser } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const [domains, setDomains] = useState<Domain[]>([]);
    const [selectedDomain, setSelectedDomain] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchDomains = async () => {
            try {
                const res = await fetch('/api/domains');
                if (res.ok) setDomains(await res.json());
            } catch (error) {
                console.error("Failed to fetch domains", error);
            }
        };
        fetchDomains();
    }, []);

    // Redirect logic: only allow logged in job seekers missing domain or resume
    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'Job Seeker') {
                router.push('/');
            } else if (user.domainId && user.resumeUrl && user.phone) {
                router.push('/');
            }
        }
    }, [user, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) return;
        if (!selectedDomain) {
            toast({ title: "Domain Required", description: "Please select your primary job domain.", variant: "destructive" });
            return;
        }
        if (!phone || phone.length < 10) {
            toast({ title: "Phone Required", description: "Please enter a valid 10-digit Indian phone number.", variant: "destructive" });
            return;
        }
        if (!resumeFile) {
            toast({ title: "Resume Required", description: "Please upload your resume to continue.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Upload Resume
            setUploadProgress(50);
            const storageRef = ref(storage, `resumes/${user.id}/${resumeFile.name}`);
            
            // Using standard uploadBytes instead of uploadBytesResumable to avoid chunked SSL Proxy errors
            const uploadSnapshot = await uploadBytes(storageRef, resumeFile);
            setUploadProgress(90);
            
            const downloadURL = await getDownloadURL(uploadSnapshot.ref);

            // 2. Save Resume URL to DB
            const resumeRes = await fetch(`/api/users/${user.id}/resume`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeUrl: downloadURL }),
            });
            if (!resumeRes.ok) throw new Error("Failed to save resume URL.");

            // 3. Save Domain ID to DB (Requires name, email, phone too)
            const profileRes = await fetch(`/api/users/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: user.name,
                    email: user.email,
                    phone: phone,
                    domainId: selectedDomain
                }),
            });
            if (!profileRes.ok) throw new Error("Failed to save domain info.");
            const updatedProfile = await profileRes.json();

            // 4. Update Context & Redirect
            setUser({ ...user, ...updatedProfile, resumeUrl: downloadURL, domainId: selectedDomain, phone: phone });
            toast({ title: "Profile Completed! 🎉", description: "Welcome aboard! Let's find your next job." });
            router.push('/');

        } catch (error: any) {
            console.error("Onboarding error:", error);
            toast({ title: "Submission Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
            setUploadProgress(null);
        }
    };

    if (loading || !user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6 }}
                className="w-full max-w-xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 lg:p-12 relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Almost there!</h1>
                    <p className="text-slate-500 text-lg">Just a few more quick details to complete your profile.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Domain Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-indigo-500" />
                            What is your primary profession?
                        </label>
                        <Select onValueChange={setSelectedDomain} value={selectedDomain}>
                            <SelectTrigger className="h-14 rounded-2xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-100 bg-slate-50 focus:bg-white text-base transition-all">
                                <SelectValue placeholder="Select your domain" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                {domains.map(domain => (
                                    <SelectItem key={domain.id} value={domain.id} className="py-3 px-4 rounded-lg cursor-pointer focus:bg-indigo-50 focus:text-indigo-700 transition-colors">
                                        {domain.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Phone Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-emerald-500" />
                            Your Phone Number
                        </label>
                        <div className="flex items-center">
                            <span className="px-4 h-14 flex items-center bg-slate-100 border border-r-0 border-slate-200 rounded-l-2xl text-slate-600 text-base font-medium">+91</span>
                            <Input 
                                type="tel" 
                                maxLength={10} 
                                placeholder="10-digit number" 
                                className="h-14 rounded-l-none rounded-r-2xl border-slate-200 focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors text-base"
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} 
                            />
                        </div>
                    </div>

                    {/* Resume Upload */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-violet-500" />
                            Upload your Resume
                        </label>
                        <div className="relative group">
                            <div className={`absolute inset-0 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border-2 border-dashed transition-colors ${resumeFile ? 'border-indigo-400' : 'border-slate-300 group-hover:border-indigo-300'}`} />
                            <div className="relative px-6 py-8 flex flex-col items-center justify-center text-center cursor-pointer">
                                <UploadCloud className={`w-10 h-10 mb-4 transition-colors ${resumeFile ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                                <h3 className="text-sm font-semibold text-slate-700 mb-1">
                                    {resumeFile ? 'Resume Selected' : 'Click to upload or drag and drop'}
                                </h3>
                                <p className="text-xs text-slate-500 max-w-[200px]">
                                    {resumeFile ? resumeFile.name : 'PDF, DOC, or DOCX (max. 5MB)'}
                                </p>
                                <Input 
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setResumeFile(file);
                                    }}
                                />
                            </div>
                        </div>

                        {uploadProgress !== null && (
                            <div className="space-y-2 mt-4">
                                <Progress value={uploadProgress} className="h-2.5 rounded-full bg-slate-100" indicatorClassName="bg-gradient-to-r from-indigo-500 to-violet-500" />
                                <p className="text-xs font-medium text-slate-500 text-center animate-pulse">
                                    Uploading securely... {Math.round(uploadProgress)}%
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <Button 
                            type="submit" 
                            disabled={isSubmitting || uploadProgress !== null}
                            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoaderCircle className="w-5 h-5 mr-3 animate-spin hidden sm:inline-block" />
                                    Saving Profile...
                                </>
                            ) : (
                                <>
                                    Complete Profile
                                    <ChevronRight className="w-5 h-5 ml-2 hidden sm:inline-block" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
