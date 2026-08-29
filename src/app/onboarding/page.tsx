"use client";

import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { LoaderCircle, FileText, CheckCircle2, UploadCloud, Building2, ChevronRight, Phone, Sparkles, X, ArrowLeft, GraduationCap, Briefcase, Award, Plus, Trash2, Layers, Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase-client";
import type { MasterSkill } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { isOnboardingComplete } from "@/lib/onboarding";
import { cn } from "@/lib/utils";
import { COUNTRY_CODES } from "@/utils/country-codes";
import { CountryCodeSelect } from "@/components/country-code-select";

export default function OnboardingPage() {
    const { user, loading, setUser } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const [masterSkills, setMasterSkills] = useState<MasterSkill[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string>("");
    const [selectedState, setSelectedState] = useState<string>("");
    const [selectedCity, setSelectedCity] = useState<string>("");
    const [selectedCountryId, setSelectedCountryId] = useState<string | number | undefined>(undefined);
    const [selectedStateId, setSelectedStateId] = useState<string | number | undefined>(undefined);
    const [selectedCityId, setSelectedCityId] = useState<string | number | undefined>(undefined);
    const [phone, setPhone] = useState<string>("");
    const [countryCode, setCountryCode] = useState<string>("+91");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
    const [skillSearch, setSkillSearch] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState<string>("");
    const [githubUrl, setGithubUrl] = useState<string>("");
    const [portfolioUrl, setPortfolioUrl] = useState<string>("");
    const [isParsing, setIsParsing] = useState(false);
    const [buildMethod, setBuildMethod] = useState<'upload' | 'manual' | null>(null);

    const [education, setEducation] = useState<any[]>([]);
    const [experience, setExperience] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<string[]>([]);
    const [certifications, setCertifications] = useState<string[]>([]);

    const [referralCode, setReferralCode] = useState("");
    const [referrerName, setReferrerName] = useState<string | null>(null);
    const [referrerId, setReferrerId] = useState<number | null>(null);
    const [isValidatingCode, setIsValidatingCode] = useState(false);
    const [showReferralStep, setShowReferralStep] = useState(false);
    const [referralMessage, setReferralMessage] = useState<{ text: string; type: 'success' | 'warning' | 'error' } | null>(null);

    // Communities selections
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

    const dismissReferralStep = async () => {
        setShowReferralStep(false);
        if (user) {
            try {
                const targetId = user.id || user.uuid;
                if (targetId) {
                    const updatedMeta = {
                        ...(user.metadata || {}),
                        hasSeenReferralPrompt: true,
                        referralStepDismissed: true,
                    };
                    setUser({
                        ...user,
                        metadata: updatedMeta
                    });
                    await fetch(`/api/users/${targetId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            role: 'Job Seeker',
                            metadata: updatedMeta
                        })
                    });
                }
            } catch (err) {
                console.warn('[ONBOARDING] Failed to save referral prompt dismissal to database:', err);
            }
        }
    };

    useEffect(() => {
        if (user) {
            // 100% Database metadata check
            const isDismissedDb = !!(
                user.referredBy ||
                user.metadata?.hasSeenReferralPrompt ||
                user.metadata?.referralStepDismissed
            );

            if (isDismissedDb) {
                setShowReferralStep(false);
            } else {
                setShowReferralStep(true);
            }

            const stored = typeof window !== 'undefined' ? localStorage.getItem('jobsdart_referral_code') : null;
            if (stored && !user.referredBy && !referralCode) {
                setReferralCode(stored);
            }
        }
    }, [user]);

    const handleVerifyCode = async () => {
        if (!referralCode.trim() || !user) return;
        setIsValidatingCode(true);
        setReferralMessage(null);
        try {
            // 1. Validate the code
            const valRes = await fetch('/api/referral/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referralCode: referralCode.trim() }),
            });
            const valData = await valRes.json();

            if (!valRes.ok) {
                setReferralMessage({
                    text: valData.error || "Invalid referral code.",
                    type: 'error'
                });
                return;
            }

            const referrer = valData.referrer;
            setReferrerId(referrer.id);
            setReferrerName(referrer.name);

            // 2. Try to claim immediately (will succeed if already email-verified)
            const claimRes = await fetch('/api/referral/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    referralCode: referralCode.trim(),
                    userUuid: user.uuid
                }),
            });

            if (claimRes.ok) {
                setReferralMessage({
                    text: `Code applied! You were successfully referred by ${referrer.name}.`,
                    type: 'success'
                });
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('jobsdart_referral_code');
                }
                setTimeout(() => {
                    dismissReferralStep();
                }, 1000);
            } else {
                const claimData = await claimRes.json();
                if (claimRes.status === 400 && claimData.error?.toLowerCase().includes('confirm')) {
                    setReferralMessage({
                        text: `Code verified! Referral from ${referrer.name} will be active once you verify your email.`,
                        type: 'warning'
                    });
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('jobsdart_referral_code', referralCode.trim());
                    }
                } else {
                    setReferralMessage({
                        text: claimData.error || "Code validated, but could not claim referral.",
                        type: 'error'
                    });
                }
            }
        } catch (err) {
            console.error("Verification error:", err);
            setReferralMessage({
                text: "An error occurred while verifying the code.",
                type: 'error'
            });
        } finally {
            setIsValidatingCode(false);
        }
    };

    useEffect(() => {
        if (user) {
            if (user.education && user.education.length > 0 && education.length === 0) {
                setEducation(user.education.map(e => ({
                    institution: e.institution || "",
                    degree: e.degree || "",
                    fieldOfStudy: e.fieldOfStudy || "",
                    startDate: e.startDate || "",
                    endDate: e.endDate || "",
                    grade: e.grade || "",
                    description: e.description || "",
                    isCurrent: !!e.isCurrent
                })));
            }
            if (user.experience && user.experience.length > 0 && experience.length === 0) {
                setExperience(user.experience.map(e => ({
                    company: e.company || "",
                    title: e.title || "",
                    location: e.location || "",
                    employmentType: e.employmentType || "Full-time",
                    startDate: e.startDate || "",
                    endDate: e.endDate || "",
                    isCurrent: !!e.isCurrent,
                    description: e.description || ""
                })));
            }
            if (user.projects && user.projects.length > 0 && projects.length === 0) {
                setProjects(user.projects.map(p => ({
                    name: p.name || "",
                    description: p.description || "",
                    url: p.url || "",
                    startDate: p.startDate || "",
                    endDate: p.endDate || ""
                })));
            }
            if (user.achievements && Array.isArray(user.achievements) && achievements.length === 0) {
                setAchievements(user.achievements.map((a: any) => typeof a === 'string' ? a : (a.title || a.name || '')));
            }
            if (user.certifications && Array.isArray(user.certifications) && certifications.length === 0) {
                setCertifications(user.certifications.map((c: any) => typeof c === 'string' ? c : (c.name || c.title || '')));
            }
            if (user.portfolioUrl && !portfolioUrl) {
                setPortfolioUrl(user.portfolioUrl);
            }
            if (user.linkedinUrl && !linkedinUrl) {
                setLinkedinUrl(user.linkedinUrl);
            }
            if (user.githubUrl && !githubUrl) {
                setGithubUrl(user.githubUrl);
            }
        }
    }, [user]);

    const addEducation = () => {
        setEducation(prev => [...prev, {
            institution: "",
            degree: "",
            fieldOfStudy: "",
            startDate: "",
            endDate: "",
            grade: "",
            description: "",
            isCurrent: false
        }]);
    };
    const updateEducation = (index: number, fields: any) => {
        setEducation(prev => prev.map((item, idx) => idx === index ? { ...item, ...fields } : item));
    };
    const removeEducation = (index: number) => {
        setEducation(prev => prev.filter((_, idx) => idx !== index));
    };

    const addExperience = () => {
        setExperience(prev => [...prev, {
            company: "",
            title: "",
            location: "",
            employmentType: "Full-time",
            startDate: "",
            endDate: "",
            isCurrent: false,
            description: ""
        }]);
    };
    const updateExperience = (index: number, fields: any) => {
        setExperience(prev => prev.map((item, idx) => idx === index ? { ...item, ...fields } : item));
    };
    const removeExperience = (index: number) => {
        setExperience(prev => prev.filter((_, idx) => idx !== index));
    };

    const addProject = () => {
        setProjects(prev => [...prev, {
            name: "",
            description: "",
            url: "",
            startDate: "",
            endDate: ""
        }]);
    };
    const updateProject = (index: number, fields: any) => {
        setProjects(prev => prev.map((item, idx) => idx === index ? { ...item, ...fields } : item));
    };
    const removeProject = (index: number) => {
        setProjects(prev => prev.filter((_, idx) => idx !== index));
    };

    const addAchievement = () => {
        setAchievements(prev => [...prev, ""]);
    };
    const updateAchievement = (index: number, val: string) => {
        setAchievements(prev => prev.map((item, idx) => idx === index ? val : item));
    };
    const removeAchievement = (index: number) => {
        setAchievements(prev => prev.filter((_, idx) => idx !== index));
    };

    const addCertification = () => {
        setCertifications(prev => [...prev, ""]);
    };
    const updateCertification = (index: number, val: string) => {
        setCertifications(prev => prev.map((item, idx) => idx === index ? val : item));
    };
    const removeCertification = (index: number) => {
        setCertifications(prev => prev.filter((_, idx) => idx !== index));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [skillsRes] = await Promise.all([
                    fetch('/api/skills'),
                ]);
               
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
            
            // 3. Social links
            if (data.linkedinUrl) {
                setLinkedinUrl(data.linkedinUrl);
            }
            if (data.githubUrl) {
                setGithubUrl(data.githubUrl);
            }
            if (data.portfolioUrl) {
                setPortfolioUrl(data.portfolioUrl);
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

            // 5. Education
            if (data.education && data.education.length > 0) {
                setEducation(data.education);
            }
            
            // 6. Experience
            if (data.experience && data.experience.length > 0) {
                setExperience(data.experience);
            }

            // 7. Projects
            if (data.projects && data.projects.length > 0) {
                setProjects(data.projects);
            }

            // 8. Achievements & Certifications
            if (data.achievements && data.achievements.length > 0) {
                setAchievements(data.achievements);
            }
            if (data.certifications && data.certifications.length > 0) {
                setCertifications(data.certifications);
            }

            toast({
                title: "Resume Parsed Successfully! ✨",
                description: "We have auto-filled your profile details, education, experience, projects, and skills based on your resume.",
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
                router.push('/');
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
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;
            const authHeaders: Record<string, string> = { "Content-Type": "application/json" };
            if (token) authHeaders["Authorization"] = `Bearer ${token}`;

            // 1. Upload Resume if needed
            let currentResumeUrl = user.resumeUrl || "";
            if (!user.resumeUrl && resumeFile) {
                setUploadProgress(30);

                let uploadedUrl = "";

                // Attempt 1: Get presigned upload URL from our API for direct Cloudflare R2 upload
                try {
                    const presignedResponse = await fetch(`/api/users/${user.uuid}/resume/presigned`, {
                        method: "POST",
                        headers: authHeaders,
                        body: JSON.stringify({ 
                            fileName: resumeFile.name, 
                            contentType: resumeFile.type || 'application/pdf'
                        }),
                    });

                    if (presignedResponse.ok) {
                        const { url, r2Uri } = await presignedResponse.json();
                        setUploadProgress(50);

                        // Direct upload to Cloudflare R2
                        const uploadResponse = await fetch(url, {
                            method: "PUT",
                            body: resumeFile,
                            headers: {
                                "Content-Type": resumeFile.type || 'application/pdf',
                            },
                        });

                        if (uploadResponse.ok) {
                            uploadedUrl = r2Uri;
                        }
                    }
                } catch (presignedErr) {
                    console.warn("Direct R2 presigned upload error, falling back to server proxy upload:", presignedErr);
                }

                // Attempt 2 (Fallback): Upload via server proxy endpoint if direct R2 was not completed
                if (!uploadedUrl) {
                    setUploadProgress(45);
                    const formData = new FormData();
                    formData.append("file", resumeFile);

                    const proxyHeaders: Record<string, string> = {};
                    if (token) proxyHeaders["Authorization"] = `Bearer ${token}`;

                    const proxyResponse = await fetch(`/api/users/${user.uuid}/resume/upload`, {
                        method: "POST",
                        headers: proxyHeaders,
                        body: formData,
                    });

                    if (!proxyResponse.ok) {
                        const errorData = await proxyResponse.json().catch(() => ({}));
                        throw new Error(errorData.error || "Failed to upload resume.");
                    }

                    const proxyData = await proxyResponse.json();
                    uploadedUrl = proxyData.resumeUrl || proxyData.resume_url;
                }

                currentResumeUrl = uploadedUrl;

                const resumeRes = await fetch(`/api/users/${user.uuid}/resume`, {
                    method: "PUT",
                    headers: authHeaders,
                    body: JSON.stringify({ resumeUrl: currentResumeUrl }),
                });
                if (!resumeRes.ok) throw new Error("Failed to save resume URL.");
                setUploadProgress(70);
            }

            // 2. Save Phone, and all other details
            const formattedPhone = phone ? `${countryCode}${phone.replace(/\D/g, '')}` : "";
            const finalPhone = (user.phone && user.phone.length >= 10) ? user.phone : (formattedPhone || user.phone);
           
            
            // Clean empty entries from education, experience, projects, achievements, certifications
            const finalEducation = education.filter(e => e.institution || e.degree || e.fieldOfStudy);
            const finalExperience = experience.filter(e => e.company || e.title);
            const finalProjects = projects.filter(p => p.name || p.description);
            const finalAchievements = achievements.filter(Boolean);
            const finalCertifications = certifications.filter(Boolean);

            const profileRes = await fetch(`/api/users/${user.uuid}`, {
                method: "PUT",
                headers: authHeaders,
                body: JSON.stringify({ 
                    name: user.name, 
                    email: user.email, 
                    phone: finalPhone, 
                    
                    linkedinUrl: linkedinUrl || user.linkedinUrl,
                    githubUrl: githubUrl || user.githubUrl,
                    portfolioUrl: portfolioUrl || user.portfolioUrl,
                    country: selectedCountry || user.country || undefined,
                    state: selectedState || user.state || undefined,
                    currentCity: selectedCity || user.currentCity || undefined,
                    countryId: selectedCountryId || undefined,
                    stateId: selectedStateId || undefined,
                    cityId: selectedCityId || undefined,
                    education: finalEducation,
                    experience: finalExperience,
                    projects: finalProjects,
                    achievements: finalAchievements,
                    certifications: finalCertifications,
                    metadata: user.metadata,
                    role: user.role,
                    referredBy: referrerId || undefined
                }),
            });
            if (!profileRes.ok) throw new Error("Failed to save profile info.");

            // 3. Save Skills subcollection if selected
            if (selectedSkillIds.length > 0) {
                setUploadProgress(85);
                const skillsToSave = selectedSkillIds.map(uuid => {
                    const skill = masterSkills.find(s => s.uuid === uuid);
                    return { id: uuid, name: skill?.name || "" };
                });
                const { data: sessionData } = await supabase.auth.getSession();
                const token = sessionData?.session?.access_token;
                const headers: Record<string, string> = { "Content-Type": "application/json" };
                if (token) headers["Authorization"] = `Bearer ${token}`;

                const skillsRes = await fetch(`/api/users/${user.uuid}/skills`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({ skills: skillsToSave }),
                });
                if (!skillsRes.ok) throw new Error("Failed to save skills.");
            }

            // 4. Auto-join Communities matching selections
            try {
                await fetch('/api/communities/onboarding-autojoin', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userUuid: user.uuid,
                        skills: selectedSkillIds,
                        countries: selectedCountries,
                        interests: selectedInterests,
                        goals: selectedGoals
                    })
                });
            } catch (commErr) {
                console.error("Auto-joining communities failed:", commErr);
            }

            setUploadProgress(100);

            // 5. Fetch fresh profile & update context
            const updatedProfileRes = await fetch(`/api/users?uid=${user.uuid}`);
            const updatedProfile = await updatedProfileRes.json();
            setUser(updatedProfile);

            toast({ title: "Profile Completed! 🎉", description: "You're all set to explore jobs!" });
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

    if (showReferralStep && !user.referredBy) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
                {/* Background Aesthetics */}
                <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 lg:p-12 relative z-10"
                >
                    <div className="text-center mb-8 mt-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
                            <Sparkles className="w-8 h-8 text-white animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-3">
                            Got a referral code?
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">
                            If a friend referred you, enter their code below to claim your rewards.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Award className="w-4 h-4 text-indigo-500" />
                                Referral Code
                            </label>
                            <div className="flex gap-3">
                                <Input
                                    placeholder="e.g. JD123456"
                                    className="h-14 rounded-2xl border-slate-200 focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors text-base font-semibold uppercase placeholder:normal-case"
                                    value={referralCode}
                                    onChange={(e) => {
                                        setReferralCode(e.target.value);
                                        setReferralMessage(null);
                                    }}
                                    disabled={isValidatingCode || !!referrerId}
                                />
                                {!referrerId ? (
                                    <Button
                                        type="button"
                                        disabled={!referralCode.trim() || isValidatingCode}
                                        onClick={handleVerifyCode}
                                        className="h-14 px-6 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
                                    >
                                        {isValidatingCode ? (
                                            <LoaderCircle className="w-5 h-5 animate-spin" />
                                        ) : (
                                            "Apply"
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setReferrerId(null);
                                            setReferrerName(null);
                                            setReferralCode("");
                                            setReferralMessage(null);
                                        }}
                                        className="h-14 px-6 rounded-2xl border-2 border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>

                        {referralMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-2xl border text-sm font-medium flex items-start gap-3 ${
                                    referralMessage.type === 'success'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                        : referralMessage.type === 'warning'
                                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                                        : 'bg-rose-50 border-rose-200 text-rose-800'
                                }`}
                            >
                                <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${
                                    referralMessage.type === 'success'
                                        ? 'text-emerald-500'
                                        : referralMessage.type === 'warning'
                                        ? 'text-amber-500'
                                        : 'text-rose-500'
                                }`} />
                                <div>
                                    {referralMessage.text}
                                </div>
                            </motion.div>
                        )}

                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={dismissReferralStep}
                                className="flex-1 h-14 rounded-2xl text-slate-500 hover:text-slate-800 font-bold hover:bg-slate-50 transition-colors"
                            >
                                Skip
                            </Button>
                            <Button
                                type="button"
                                onClick={dismissReferralStep}
                                className="flex-1 h-14 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    const needsPhone = !user.phone || user.phone.length < 10;
    const needsResume = !user.resumeUrl;
    const needsSkills = !(
        user.profileStats?.hasSkills ||
        (Array.isArray(user.skills) && user.skills.length > 0) ||
        (Array.isArray((user as any).skill_ids) && (user as any).skill_ids.length > 0) ||
        (Array.isArray((user as any).skillIds) && (user as any).skillIds.length > 0)
    );
    const needsLocation = !(
        (user?.country || user?.countryId) &&
        (user?.state || user?.stateId) &&
        (user?.currentCity || user?.cityId)
    );

    const needsLinkedin = !user.linkedinUrl;
    const needsGithub = !user.githubUrl;
    const needsPortfolio = !user.portfolioUrl;

    const needsEducation = !user.education || user.education.length === 0;
    const needsExperience = !user.experience || user.experience.length === 0;
    const needsProjects = !user.projects || user.projects.length === 0;
    const needsAchievements = !(
        (Array.isArray((user as any).jobseekerAchievements) && (user as any).jobseekerAchievements.length > 0) ||
        (Array.isArray(user.metadata?.achievements) && user.metadata.achievements.length > 0) ||
        (Array.isArray(user.achievements) && user.achievements.length > 0)
    );
    const needsCertifications = !(
        (Array.isArray((user as any).jobseekerCertifications) && (user as any).jobseekerCertifications.length > 0) ||
        (Array.isArray(user.metadata?.certifications) && user.metadata.certifications.length > 0) ||
        (Array.isArray(user.certifications) && user.certifications.length > 0)
    );

    // Accurate weighted profile completion score (0-100%)
    const calculateProgressPct = () => {
        let score = 0;

        // 1. Phone number (15%)
        const currentPhone = phone || user?.phone || "";
        if (currentPhone.replace(/\D/g, "").length >= 7) {
            score += 15;
        }

        // 2. Location Hierarchy (20%)
        const cName = selectedCountry || user?.country;
        const sName = selectedState || user?.state;
        const ciName = selectedCity || user?.currentCity;
        if (cName && sName && ciName) {
            score += 20;
        } else if (cName && sName) {
            score += 13;
        } else if (cName) {
            score += 7;
        }

        // 3. Resume (20%)
        if (resumeFile || user?.resumeUrl) {
            score += 20;
        }

        // 4. Skills (20%)
        if (selectedSkillIds.length > 0 || user?.profileStats?.hasSkills) {
            score += 20;
        }

        // 5. Education (10%)
        if (education.length > 0 || user?.profileStats?.hasEducation || (user?.education && user.education.length > 0)) {
            score += 10;
        }

        // 6. Work Experience (10%)
        if (experience.length > 0 || user?.profileStats?.hasEmployment || (user?.experience && user.experience.length > 0)) {
            score += 10;
        }

        // 7. Social / Portfolio Links (5%)
        if (linkedinUrl || githubUrl || portfolioUrl || user?.linkedinUrl || user?.githubUrl || user?.portfolioUrl) {
            score += 5;
        }

        return Math.min(100, Math.max(0, score));
    };

    const progressPct = calculateProgressPct();

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
                                    Our AI will parse your resume to auto-fill your phone, and skills in seconds.
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800 p-6 sm:p-10 lg:p-12 relative z-10"
            >
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                        setBuildMethod(null);
                        setResumeFile(null);
                    }}
                    className="absolute top-6 left-6 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider rounded-xl py-2 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>

                <div className="text-center mb-8 mt-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200 dark:shadow-none">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-2">Almost there!</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium">Just a few more details to complete your professional profile.</p>
                </div>

                {/* Live progress bar */}
                <div className="mb-8 p-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 mb-2 font-bold">
                        <span>Profile Completion Rate</span>
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900">{progressPct}%</span>
                    </div>
                    <Progress value={progressPct} className="h-2.5 bg-slate-200/60 dark:bg-slate-700" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Location Hierarchy Selector */}
                    {needsLocation && (
                        <div className="space-y-3 bg-gradient-to-b from-indigo-50/40 via-slate-50/40 to-slate-50/40 dark:from-slate-900/60 dark:to-slate-900/30 p-6 rounded-2xl border border-indigo-100/80 dark:border-slate-800">
                            <label className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1">
                                <Globe className="w-4 h-4 text-indigo-500" />
                                Select your Primary Location
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Input 
                                    placeholder="Country" 
                                    value={selectedCountry || user?.country || ""} 
                                    onChange={(e) => setSelectedCountry(e.target.value)} 
                                />
                                <Input 
                                    placeholder="State / Province" 
                                    value={selectedState || user?.state || ""} 
                                    onChange={(e) => setSelectedState(e.target.value)} 
                                />
                                <Input 
                                    placeholder="City" 
                                    value={selectedCity || user?.currentCity || ""} 
                                    onChange={(e) => setSelectedCity(e.target.value)} 
                                />
                            </div>
                        </div>
                    )}

                    {/* Phone & Contact Details */}
                    {needsPhone && (
                        <div className="space-y-3 p-6 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <label className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-emerald-500" />
                                Your Phone Number
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                                <div className="sm:col-span-1">
                                    <CountryCodeSelect
                                        value={countryCode}
                                        onChange={setCountryCode}
                                        className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-sm"
                                    />
                                </div>
                                <div className="sm:col-span-3">
                                    <Input
                                        type="tel"
                                        maxLength={15}
                                        placeholder="9876543210"
                                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium transition-all"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Social & Portfolio Links */}
                    {(needsLinkedin || needsGithub || needsPortfolio) && (
                        <div className="space-y-4 p-6 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-indigo-500" />
                                Social & Portfolio Profiles
                            </h3>
                            <div className={cn(
                                "grid grid-cols-1 gap-4",
                                [needsLinkedin, needsGithub, needsPortfolio].filter(Boolean).length === 3 ? "sm:grid-cols-3" :
                                [needsLinkedin, needsGithub, needsPortfolio].filter(Boolean).length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1"
                            )}>
                                {needsLinkedin && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-blue-500" />
                                            LinkedIn URL
                                        </label>
                                        <Input
                                            placeholder="https://linkedin.com/in/..."
                                            className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                            value={linkedinUrl}
                                            onChange={(e) => setLinkedinUrl(e.target.value)}
                                        />
                                    </div>
                                )}
                                {needsGithub && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200" />
                                            GitHub URL
                                        </label>
                                        <Input
                                            placeholder="https://github.com/..."
                                            className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                            value={githubUrl}
                                            onChange={(e) => setGithubUrl(e.target.value)}
                                        />
                                    </div>
                                )}
                                {needsPortfolio && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                            <Globe className="w-3.5 h-3.5 text-sky-500" />
                                            Portfolio Website
                                        </label>
                                        <Input
                                            placeholder="https://yourportfolio.com"
                                            className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                            value={portfolioUrl}
                                            onChange={(e) => setPortfolioUrl(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Resume Upload */}
                    {needsResume && (
                        <div className="space-y-3 p-6 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <label className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-violet-500" />
                                Upload your Resume
                            </label>
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-violet-50/50 dark:from-slate-800 dark:to-slate-800 rounded-2xl border-2 border-dashed transition-colors ${resumeFile ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-700 group-hover:border-indigo-400'}`} />
                                <div className="relative px-6 py-8 flex flex-col items-center justify-center text-center cursor-pointer">
                                    <UploadCloud className={`w-10 h-10 mb-3 transition-colors ${resumeFile ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
                                        {resumeFile ? 'Resume File Attached' : 'Click to upload or drag & drop resume'}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        {resumeFile ? resumeFile.name : 'Supported formats: PDF, DOC, DOCX (max. 5MB)'}
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
                                    className="w-full flex items-center justify-center gap-2 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-xl py-3 font-bold text-sm transition-colors"
                                >
                                    <Sparkles className="w-4 h-4 text-indigo-500" />
                                    Auto-fill Form with AI
                                </Button>
                            )}
                            {uploadProgress !== null && (
                                <div className="space-y-2 mt-4">
                                    <Progress value={uploadProgress} className="h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 text-center animate-pulse">
                                        Uploading resume... {Math.round(uploadProgress)}%
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Skills */}
                    {needsSkills && (
                        <div className="space-y-4 p-6 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                    Your Core Skills
                                </label>
                                <span className="text-xs font-semibold text-slate-400">Select all that apply</span>
                            </div>

                            {/* Selected badges */}
                            {selectedSkillIds.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-3 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900">
                                    {selectedSkillIds.map(id => {
                                        const skill = masterSkills.find(s => s.uuid === id);
                                        return skill ? (
                                            <Badge key={id} className="bg-indigo-600 text-white hover:bg-indigo-700 gap-1.5 pr-2 py-1 text-xs font-semibold rounded-lg">
                                                {skill.name}
                                                <button type="button" onClick={() => toggleSkill(id)} className="hover:text-indigo-200 transition-colors">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ) : null;
                                    })}
                                </div>
                            )}

                            {/* Search filter */}
                            <Input
                                placeholder="Search skills (e.g. React, Node.js, Python)..."
                                value={skillSearch}
                                onChange={e => setSkillSearch(e.target.value)}
                                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                            />

                            {/* Skill chips */}
                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                                {filteredSkills.map(skill => {
                                    const selected = selectedSkillIds.includes(skill.uuid);
                                    return (
                                        <button
                                            key={skill.uuid}
                                            type="button"
                                            onClick={() => toggleSkill(skill.uuid)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                                selected
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:text-indigo-600'
                                            }`}
                                        >
                                            {skill.name}
                                        </button>
                                    );
                                })}
                                {filteredSkills.length === 0 && (
                                    <p className="text-xs text-slate-400 py-2 font-medium">No matching skills found.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Education Details */}
                    {needsEducation && (
                        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                                    Education Details
                                </h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addEducation}
                                    className="rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold text-xs gap-1.5"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Education
                                </Button>
                            </div>
                            {education.map((edu, idx) => (
                                <motion.div 
                                    key={idx} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4"
                                >
                                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
                                        <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                            Education #{idx + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeEducation(idx)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">School / Institution</label>
                                            <Input
                                                placeholder="e.g. Stanford University"
                                                value={edu.institution || ""}
                                                onChange={(e) => updateEducation(idx, { institution: e.target.value })}
                                                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Degree</label>
                                            <Input
                                                placeholder="e.g. Bachelor of Science"
                                                value={edu.degree || ""}
                                                onChange={(e) => updateEducation(idx, { degree: e.target.value })}
                                                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Field of Study</label>
                                            <Input
                                                placeholder="e.g. Computer Science"
                                                value={edu.fieldOfStudy || ""}
                                                onChange={(e) => updateEducation(idx, { fieldOfStudy: e.target.value })}
                                                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Grade / CGPA</label>
                                            <Input
                                                placeholder="e.g. 3.8/4.0 or 85%"
                                                value={edu.grade || ""}
                                                onChange={(e) => updateEducation(idx, { grade: e.target.value })}
                                                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Start Date (YYYY-MM)</label>
                                            <Input
                                                placeholder="YYYY-MM (e.g. 2020-09)"
                                                value={edu.startDate || ""}
                                                onChange={(e) => updateEducation(idx, { startDate: e.target.value })}
                                                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                            />
                                        </div>
                                        {!edu.isCurrent && (
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">End Date (YYYY-MM)</label>
                                                <Input
                                                    placeholder="YYYY-MM (e.g. 2024-06)"
                                                    value={edu.endDate || ""}
                                                    onChange={(e) => updateEducation(idx, { endDate: e.target.value })}
                                                    className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <input
                                            type="checkbox"
                                            id={`edu-current-${idx}`}
                                            checked={!!edu.isCurrent}
                                            onChange={(e) => updateEducation(idx, { isCurrent: e.target.checked, endDate: e.target.checked ? "" : edu.endDate })}
                                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                        <label htmlFor={`edu-current-${idx}`} className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                                            I am currently studying here
                                        </label>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                                        <textarea
                                            placeholder="Achievements, coursework, or extra-curricular activities..."
                                            value={edu.description || ""}
                                            onChange={(e) => updateEducation(idx, { description: e.target.value })}
                                            rows={2}
                                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Work Experience */}
                    {needsExperience && (
                        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-emerald-600" />
                                    Work Experience
                                </h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addExperience}
                                    className="rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-bold text-xs gap-1.5"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Experience
                                </Button>
                            </div>
                            {experience.map((exp, idx) => (
                                <motion.div 
                                    key={idx} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4"
                                >
                                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
                                        <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                            Experience #{idx + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeExperience(idx)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Company Name</label>
                                            <Input
                                                placeholder="e.g. Acme Corp"
                                                value={exp.company || ""}
                                                onChange={(e) => updateExperience(idx, { company: e.target.value })}
                                                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Job Title</label>
                                            <Input
                                                placeholder="e.g. Software Engineer"
                                                value={exp.title || ""}
                                                onChange={(e) => updateExperience(idx, { title: e.target.value })}
                                                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Location</label>
                                            <Input
                                                placeholder="e.g. Bengaluru, India or Remote"
                                                value={exp.location || ""}
                                                onChange={(e) => updateExperience(idx, { location: e.target.value })}
                                                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Employment Type</label>
                                            <Select
                                                onValueChange={(val) => updateExperience(idx, { employmentType: val })}
                                                value={exp.employmentType || "Full-time"}
                                            >
                                                <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                                    <SelectItem value="Full-time">Full-time</SelectItem>
                                                    <SelectItem value="Part-time">Part-time</SelectItem>
                                                    <SelectItem value="Contract">Contract</SelectItem>
                                                    <SelectItem value="Internship">Internship</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Start Date (YYYY-MM)</label>
                                            <Input
                                                placeholder="YYYY-MM (e.g. 2021-06)"
                                                value={exp.startDate || ""}
                                                onChange={(e) => updateExperience(idx, { startDate: e.target.value })}
                                                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                            />
                                        </div>
                                        {!exp.isCurrent && (
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">End Date (YYYY-MM)</label>
                                                <Input
                                                    placeholder="YYYY-MM (e.g. 2023-12)"
                                                    value={exp.endDate || ""}
                                                    onChange={(e) => updateExperience(idx, { endDate: e.target.value })}
                                                    className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <input
                                            type="checkbox"
                                            id={`exp-current-${idx}`}
                                            checked={!!exp.isCurrent}
                                            onChange={(e) => updateExperience(idx, { isCurrent: e.target.checked, endDate: e.target.checked ? "" : exp.endDate })}
                                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                        <label htmlFor={`exp-current-${idx}`} className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                                            I currently work here
                                        </label>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                                        <textarea
                                            placeholder="Describe your achievements, roles, and tech stack used..."
                                            value={exp.description || ""}
                                            onChange={(e) => updateExperience(idx, { description: e.target.value })}
                                            rows={3}
                                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Projects */}
                    {needsProjects && (
                        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-indigo-600" />
                                    Projects
                                </h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addProject}
                                    className="rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold text-xs gap-1.5"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Project
                                </Button>
                            </div>
                            {projects.map((proj, idx) => (
                                <motion.div 
                                    key={idx} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4"
                                >
                                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
                                        <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                            Project #{idx + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeProject(idx)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Project Name</label>
                                            <Input
                                                placeholder="e.g. Portfolio Website"
                                                value={proj.name || ""}
                                                onChange={(e) => updateProject(idx, { name: e.target.value })}
                                                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Project Link / URL</label>
                                            <Input
                                                placeholder="e.g. https://github.com/..."
                                                value={proj.url || ""}
                                                onChange={(e) => updateProject(idx, { url: e.target.value })}
                                                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Start Date (YYYY-MM)</label>
                                            <Input
                                                placeholder="YYYY-MM (e.g. 2023-01)"
                                                value={proj.startDate || ""}
                                                onChange={(e) => updateProject(idx, { startDate: e.target.value })}
                                                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">End Date (YYYY-MM)</label>
                                            <Input
                                                placeholder="YYYY-MM (e.g. 2023-03)"
                                                value={proj.endDate || ""}
                                                onChange={(e) => updateProject(idx, { endDate: e.target.value })}
                                                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                                        <textarea
                                            placeholder="Describe the project objective, your role, and the tech stack used..."
                                            value={proj.description || ""}
                                            onChange={(e) => updateProject(idx, { description: e.target.value })}
                                            rows={2}
                                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Achievements & Certifications */}
                    {(needsAchievements || needsCertifications) && (
                        <div className={cn(
                            "grid grid-cols-1 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800",
                            needsAchievements && needsCertifications ? "md:grid-cols-2" : "md:grid-cols-1"
                        )}>
                            {/* Achievements */}
                            {needsAchievements && (
                                <div className="space-y-4 p-6 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                            <Award className="w-4 h-4 text-amber-500" />
                                            Achievements
                                        </h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addAchievement}
                                            className="rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50 font-bold text-xs gap-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Add
                                        </Button>
                                    </div>
                                    <div className="space-y-2.5">
                                        {achievements.map((ach, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <Input
                                                    placeholder="e.g. Won Hackathon 2025"
                                                    value={ach || ""}
                                                    onChange={(e) => updateAchievement(idx, e.target.value)}
                                                    className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium flex-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeAchievement(idx)}
                                                    className="p-2.5 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors shrink-0"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Certifications */}
                            {needsCertifications && (
                                <div className="space-y-4 p-6 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                            <Award className="w-4 h-4 text-indigo-500" />
                                            Certifications
                                        </h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addCertification}
                                            className="rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold text-xs gap-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Add
                                        </Button>
                                    </div>
                                    <div className="space-y-2.5">
                                        {certifications.map((cert, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <Input
                                                    placeholder="e.g. AWS Certified Architect"
                                                    value={cert || ""}
                                                    onChange={(e) => updateCertification(idx, e.target.value)}
                                                    className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium flex-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeCertification(idx)}
                                                    className="p-2.5 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors shrink-0"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Communities Network Setup */}
                    <div className="space-y-5 p-6 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <div className="space-y-1">
                            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                                Communities Network Setup
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Select your target locations, interests, and career goals to automatically connect with relevant hubs.</p>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Countries</label>
                            <div className="flex flex-wrap gap-2">
                              {["India", "USA", "Canada", "Germany", "United Kingdom", "Australia", "Singapore", "UAE"].map(c => {
                                const active = selectedCountries.includes(c);
                                return (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => setSelectedCountries(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                                    className={cn(
                                      "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                                      active ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400"
                                    )}
                                  >
                                    {c}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Professional Interests</label>
                            <div className="flex flex-wrap gap-2">
                              {["React", "Next.js", "Node.js", "Python", "Java", "AI & Machine Learning", "Data Science", "DevOps", "UI/UX Design"].map(i => {
                                const active = selectedInterests.includes(i);
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setSelectedInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                                    className={cn(
                                      "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                                      active ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400"
                                    )}
                                  >
                                    {i}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Career Goals</label>
                            <div className="flex flex-wrap gap-2">
                              {["Resume Reviews", "Mock Interviews", "Career Guidance", "Remote Jobs", "Freelancing"].map(g => {
                                const active = selectedGoals.includes(g);
                                return (
                                  <button
                                    key={g}
                                    type="button"
                                    onClick={() => setSelectedGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
                                    className={cn(
                                      "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                                      active ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400"
                                    )}
                                  >
                                    {g}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            type="submit"
                            disabled={isSubmitting || uploadProgress !== null}
                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-base shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
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
                        className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center"
                    >
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-indigo-600 dark:text-indigo-400 mb-4 animate-bounce">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Analyzing Resume...</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Our AI is extracting skills, contact info, and matching your professional domain. This will take a moment.
                        </p>
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                            <LoaderCircle className="w-5 h-5 animate-spin" />
                            <span>Processing...</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
