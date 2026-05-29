"use client";

import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { LoaderCircle, FileText, CheckCircle2, UploadCloud, Building2, ChevronRight, Phone, Sparkles, X, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase-client";
import type { Domain, MasterSkill } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { isOnboardingComplete } from "@/lib/onboarding";


export default function OnboardingPage() {
    const { user, loading, setUser } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const [domains, setDomains] = useState<Domain[]>([]);
    const [masterSkills, setMasterSkills] = useState<MasterSkill[]>([]);
    const [selectedDomain, setSelectedDomain] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
    const [skillSearch, setSkillSearch] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState<string>("");
    const [githubUrl, setGithubUrl] = useState<string>("");
    const [isParsing, setIsParsing] = useState(false);
    const [buildMethod, setBuildMethod] = useState<'upload' | 'manual' | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [domainsRes, skillsRes] = await Promise.all([
                    fetch('/api/domains'),
                    fetch('/api/skills'),
                ]);
                if (domainsRes.ok) setDomains(await domainsRes.json());
                if (skillsRes.ok) setMasterSkills(await skillsRes.json());
            } catch (error) {
                console.error("Failed to fetch onboarding data", error);
            }
        };
        fetchData();
    }, []);

    const handleParseResume = async () => {
        if (!resumeFile) return;
        setIsParsing(true);
        try {
            const formData = new FormData();
            formData.append("file", resumeFile);
            const res = await fetch("/api/resume/parse", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to parse resume");
            }
            const data = await res.json();
            
            // 1. Phone number
            if (data.phone) {
                setPhone(data.phone);
            }
            
            // 2. Domain (name-matching)
            if (data.domain && domains.length > 0) {
                const matchedDomain = domains.find(d => 
                    d.name.toLowerCase().includes(data.domain.toLowerCase()) || 
                    data.domain.toLowerCase().includes(d.name.toLowerCase())
                );
                if (matchedDomain) {
                    setSelectedDomain(matchedDomain.uuid);
                }
            }
            
            // 3. Social links
            if (data.linkedinUrl) {
                setLinkedinUrl(data.linkedinUrl);
            }
            if (data.githubUrl) {
                setGithubUrl(data.githubUrl);
            }
            
            // 4. Skills matching against masterSkills
            if (data.skills && data.skills.length > 0 && masterSkills.length > 0) {
                const matchedSkillIds: string[] = [];
                data.skills.forEach((extractedSkillName: string) => {
                    const matched = masterSkills.find(s => s.name.toLowerCase() === extractedSkillName.toLowerCase());
                    if (matched) {
                        matchedSkillIds.push(matched.uuid);
                    } else {
                        // fuzzy check: does it include?
                        const fuzzyMatch = masterSkills.find(s => 
                            s.name.toLowerCase().includes(extractedSkillName.toLowerCase()) || 
                            extractedSkillName.toLowerCase().includes(s.name.toLowerCase())
                        );
                        if (fuzzyMatch && !matchedSkillIds.includes(fuzzyMatch.uuid)) {
                            matchedSkillIds.push(fuzzyMatch.uuid);
                        }
                    }
                });
                if (matchedSkillIds.length > 0) {
                    setSelectedSkillIds(prev => {
                        const merged = [...prev];
                        matchedSkillIds.forEach(id => {
                            if (!merged.includes(id)) merged.push(id);
                        });
                        return merged;
                    });
                }
            }

            toast({
                title: "Resume Parsed Successfully! ✨",
                description: "We have auto-filled your phone, domain, socials, and skills based on your resume.",
            });
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Parsing Failed",
                description: error.message || "Could not auto-fill details from this PDF. You can still enter them manually.",
                variant: "destructive",
            });
        } finally {
            setIsParsing(false);
        }
    };

    // Auto-trigger parsing when resume is selected in "upload" mode
    useEffect(() => {
        if (resumeFile && buildMethod === 'upload') {
            handleParseResume();
        }
    }, [resumeFile, buildMethod]);

    // Redirect logic: only allow logged-in job seekers missing essential fields
    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'Job Seeker') {
                router.push('/');
            } else if (isOnboardingComplete(user)) {
                if (!user.planType) {
                    router.push('/jobseeker/plans');
                } else {
                    router.push('/');
                }
            }
        }
    }, [user, loading, router]);

    const toggleSkill = (skillId: string) => {
        setSelectedSkillIds(prev =>
            prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
        );
    };

    const filteredSkills = masterSkills.filter(s =>
        s.name.toLowerCase().includes(skillSearch.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!user.domainId && !selectedDomain) {
            toast({ title: "Domain Required", description: "Please select your primary job domain.", variant: "destructive" });
            return;
        }
        if ((!user.phone || user.phone.length < 10) && (!phone || phone.length < 10)) {
            toast({ title: "Phone Required", description: "Please enter a valid 10-digit phone number.", variant: "destructive" });
            return;
        }
        if (!user.resumeUrl && !resumeFile) {
            toast({ title: "Resume Required", description: "Please upload your resume to continue.", variant: "destructive" });
            return;
        }
        if (!user.profileStats?.hasSkills && selectedSkillIds.length === 0) {
            toast({ title: "Skills Required", description: "Please select at least one skill.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Upload Resume if needed
            let currentResumeUrl = user.resumeUrl || "";
            if (!user.resumeUrl && resumeFile) {
                setUploadProgress(30);
                
                // 1. Get presigned upload URL from our API
                const presignedResponse = await fetch(`/api/users/${user.uuid}/resume/presigned`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        fileName: resumeFile.name, 
                        contentType: resumeFile.type || 'application/pdf'
                    }),
                });

                if (!presignedResponse.ok) throw new Error("Failed to get upload authorization.");
                const { url, r2Uri } = await presignedResponse.json();
                
                setUploadProgress(50);

                // 2. Upload directly to Cloudflare R2
                const uploadResponse = await fetch(url, {
                    method: "PUT",
                    body: resumeFile,
                    headers: {
                        "Content-Type": resumeFile.type || 'application/pdf',
                    },
                });

                if (!uploadResponse.ok) {
                    const errorText = await uploadResponse.text();
                    console.error("R2 Upload Error:", errorText);
                    throw new Error("Direct upload to Cloudflare failed.");
                }
                
                currentResumeUrl = r2Uri;

                const resumeRes = await fetch(`/api/users/${user.uuid}/resume`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ resumeUrl: currentResumeUrl }),
                });
                if (!resumeRes.ok) throw new Error("Failed to save resume URL.");
                setUploadProgress(70);
            }

            // 2. Save Domain ID and Phone if needed
            const finalPhone = (user.phone && user.phone.length >= 10) ? user.phone : phone;
            const finalDomainId = user.domainId || selectedDomain;
            if (!user.domainId || !user.phone || user.phone.length < 10) {
                const profileRes = await fetch(`/api/users/${user.uuid}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        name: user.name, 
                        email: user.email, 
                        phone: finalPhone, 
                        domainId: finalDomainId,
                        linkedinUrl: linkedinUrl || user.linkedinUrl,
                        githubUrl: githubUrl || user.githubUrl
                    }),
                });
                if (!profileRes.ok) throw new Error("Failed to save profile info.");
            }

            // 3. Save Skills subcollection if needed
            if (!user.profileStats?.hasSkills && selectedSkillIds.length > 0) {
                setUploadProgress(85);
                const skillsToSave = selectedSkillIds.map(uuid => {
                    const skill = masterSkills.find(s => s.uuid === uuid);
                    return { id: uuid, name: skill?.name || "" };
                });
                const skillsRes = await fetch(`/api/users/${user.uuid}/skills`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ skills: skillsToSave }),
                });
                if (!skillsRes.ok) throw new Error("Failed to save skills.");
            }

            setUploadProgress(100);

            // 4. Fetch fresh profile & update context
            const updatedProfileRes = await fetch(`/api/users?uid=${user.uuid}`);
            const updatedProfile = await updatedProfileRes.json();
            setUser(updatedProfile);

            toast({ title: "Profile Completed! 🎉", description: "You're all set! Up next, choose your plan." });
            router.push('/jobseeker/plans');

        } catch (error: any) {
            console.error("Onboarding error:", error);
            toast({ title: "Submission Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
            setUploadProgress(null);
        }
    };

    if (loading || !user) return null;

    const needsDomain = !user.domainId;
    const needsPhone = !user.phone || user.phone.length < 10;
    const needsResume = !user.resumeUrl;
    const needsSkills = !user.profileStats?.hasSkills;

    const totalSteps = [needsDomain, needsPhone, needsResume, needsSkills].filter(Boolean).length;
    // Progress tracking (this is just cosmetic — based on filled fields)
    const stepsLeft = [
        needsDomain && !selectedDomain,
        needsPhone && phone.length < 10,
        needsResume && !resumeFile,
        needsSkills && selectedSkillIds.length === 0,
    ].filter(Boolean).length;
    const progressPct = totalSteps > 0 ? Math.round(((totalSteps - stepsLeft) / totalSteps) * 100) : 100;

    if (buildMethod === null) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
                {/* Background Aesthetics */}
                <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 lg:p-12 relative z-10 text-center"
                >
                    <div className="mb-10 mt-4">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-3">
                            How would you like to build your profile?
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">
                            Choose a method to set up your JobsDart profile and start applying.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Option 1: Upload Resume */}
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => setBuildMethod('upload')}
                            className="flex items-center gap-6 p-6 rounded-3xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-white hover:border-indigo-500 hover:shadow-lg transition-all text-left group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-8 h-8 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                                    Upload my Resume
                                </h3>
                                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                                    Our AI will parse your resume to auto-fill your domain, phone, and skills in seconds.
                                </p>
                            </div>
                        </motion.button>

                        {/* Option 2: Fill Manually */}
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => setBuildMethod('manual')}
                            className="flex items-center gap-6 p-6 rounded-3xl border-2 border-slate-100 bg-white hover:border-indigo-500 hover:shadow-lg transition-all text-left group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:scale-110 transition-all">
                                <FileText className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                                    Fill it Manually
                                </h3>
                                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                                    Skip the AI auto-fill and enter your phone number, skills, and profile details manually.
                                </p>
                            </div>
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (buildMethod === 'upload' && !resumeFile) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
                <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 lg:p-12 relative z-10"
                >
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setBuildMethod(null)}
                        className="absolute top-6 left-6 text-slate-500 hover:text-slate-800 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider rounded-xl py-2 px-3 hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>

                    <div className="text-center mb-10 mt-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
                            <UploadCloud className="w-8 h-8 text-white animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Upload your resume</h1>
                        <p className="text-slate-500 text-sm font-medium">Our AI will extract all details to build your profile automatically.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border-2 border-dashed border-slate-300 group-hover:border-indigo-400 transition-colors" />
                            <div className="relative px-6 py-12 flex flex-col items-center justify-center text-center cursor-pointer">
                                <UploadCloud className="w-12 h-12 mb-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                <h3 className="text-base font-bold text-slate-700 mb-1">
                                    Click to upload or drag and drop
                                </h3>
                                <p className="text-xs text-slate-500 max-w-[200px]">
                                    PDF, DOC, or DOCX (max. 5MB)
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
                    </div>
                </motion.div>
            </div>
        );
    }

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
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                        setBuildMethod(null);
                        setResumeFile(null);
                    }}
                    className="absolute top-6 left-6 text-slate-500 hover:text-slate-800 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider rounded-xl py-2 px-3 hover:bg-slate-50 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>

                <div className="text-center mb-8 mt-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Almost there!</h1>
                    <p className="text-slate-500 text-lg">Just a few more quick details to complete your profile.</p>
                </div>

                {/* Live progress bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                        <span>Profile completion</span>
                        <span className="font-semibold text-indigo-600">{progressPct}%</span>
                    </div>
                    <Progress value={progressPct} className="h-2 bg-slate-100" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Domain */}
                    {needsDomain && (
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-indigo-500" />
                                Select your preferred domain
                            </label>
                            <Select onValueChange={setSelectedDomain} value={selectedDomain}>
                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 focus:border-indigo-400 bg-slate-50 focus:bg-white text-base transition-all">
                                    <SelectValue placeholder="Select your preferred domain" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                    {domains.map(domain => (
                                        <SelectItem key={domain.uuid} value={domain.uuid} className="py-3 px-4 rounded-lg cursor-pointer focus:bg-indigo-50 focus:text-indigo-700">
                                            {domain.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Phone */}
                    {needsPhone && (
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
                    )}

                    {/* Social Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-blue-500" />
                                LinkedIn URL (Optional)
                            </label>
                            <Input
                                placeholder="https://linkedin.com/in/yourprofile"
                                className="h-14 rounded-2xl border-slate-200 focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors text-base"
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-800" />
                                GitHub URL (Optional)
                            </label>
                            <Input
                                placeholder="https://github.com/yourprofile"
                                className="h-14 rounded-2xl border-slate-200 focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors text-base"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Resume Upload */}
                    {needsResume && (
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
                            {resumeFile && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleParseResume}
                                    disabled={isParsing}
                                    className="w-full flex items-center justify-center gap-2 border-indigo-200 text-indigo-700 bg-indigo-50/30 hover:bg-indigo-50 hover:text-indigo-800 rounded-2xl py-3 font-semibold text-sm transition-colors mt-2"
                                >
                                    <Sparkles className="w-4 h-4 text-indigo-500" />
                                    Auto-fill Form with AI
                                </Button>
                            )}
                            {uploadProgress !== null && (
                                <div className="space-y-2 mt-4">
                                    <Progress value={uploadProgress} className="h-2.5 rounded-full bg-slate-100" />
                                    <p className="text-xs font-medium text-slate-500 text-center animate-pulse">
                                        Uploading securely... {Math.round(uploadProgress)}%
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Skills */}
                    {needsSkills && (
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                Your Key Skills
                                <span className="ml-auto text-xs font-normal text-slate-400">Select all that apply</span>
                            </label>

                            {/* Selected badges */}
                            {selectedSkillIds.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    {selectedSkillIds.map(id => {
                                        const skill = masterSkills.find(s => s.uuid === id);
                                        return skill ? (
                                            <Badge key={id} className="bg-indigo-600 text-white hover:bg-indigo-700 gap-1 pr-1.5">
                                                {skill.name}
                                                <button type="button" onClick={() => toggleSkill(id)}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ) : null;
                                    })}
                                </div>
                            )}

                            {/* Search filter */}
                            <Input
                                placeholder="Search skills..."
                                value={skillSearch}
                                onChange={e => setSkillSearch(e.target.value)}
                                className="h-10 rounded-xl border-slate-200 bg-slate-50"
                            />

                            {/* Skill chips */}
                            <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto py-1 pr-1">
                                {filteredSkills.map(skill => {
                                    const selected = selectedSkillIds.includes(skill.uuid);
                                    return (
                                        <button
                                            key={skill.uuid}
                                            type="button"
                                            onClick={() => toggleSkill(skill.uuid)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                                selected
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
                                            }`}
                                        >
                                            {skill.name}
                                        </button>
                                    );
                                })}
                                {filteredSkills.length === 0 && (
                                    <p className="text-xs text-slate-400 py-2">No skills match your search.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting || uploadProgress !== null}
                            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slateigo-800 text-white font-bold text-lg shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoaderCircle className="w-5 h-5 mr-3 animate-spin" />
                                    Saving Profile...
                                </>
                            ) : (
                                <>
                                    Complete Profile
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </motion.div>

            {isParsing && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 flex flex-col items-center"
                    >
                        <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 mb-4 animate-bounce">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing Resume...</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Our AI is extracting skills, contact info, and matching your professional domain. This will take a moment.
                        </p>
                        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                            <LoaderCircle className="w-5 h-5 animate-spin" />
                            <span>Processing with Grok...</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
