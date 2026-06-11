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
    const [showReferralStep, setShowReferralStep] = useState(true);
    const [referralMessage, setReferralMessage] = useState<{ text: string; type: 'success' | 'warning' | 'error' } | null>(null);

    useEffect(() => {
        if (user) {
            if (user.referredBy) {
                setShowReferralStep(false);
            }
            const stored = localStorage.getItem('jobsdart_referral_code');
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
                localStorage.removeItem('jobsdart_referral_code');
            } else {
                const claimData = await claimRes.json();
                // If it failed due to email verification, that is expected for unverified users
                if (claimRes.status === 400 && claimData.error?.toLowerCase().includes('confirm')) {
                    setReferralMessage({
                        text: `Code verified! Referral from ${referrer.name} will be active once you verify your email.`,
                        type: 'warning'
                    });
                    localStorage.setItem('jobsdart_referral_code', referralCode.trim());
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
            if (user.metadata?.achievements && Array.isArray(user.metadata.achievements) && achievements.length === 0) {
                setAchievements(user.metadata.achievements);
            }
            if (user.metadata?.certifications && Array.isArray(user.metadata.certifications) && certifications.length === 0) {
                setCertifications(user.metadata.certifications);
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

            // 2. Save Domain, Phone, and all other details
            const finalPhone = (user.phone && user.phone.length >= 10) ? user.phone : phone;
            const finalDomainId = user.domainId || selectedDomain;
            
            // Clean empty entries from education, experience, projects, achievements, certifications
            const finalEducation = education.filter(e => e.institution || e.degree || e.fieldOfStudy);
            const finalExperience = experience.filter(e => e.company || e.title);
            const finalProjects = projects.filter(p => p.name || p.description);
            const finalAchievements = achievements.filter(Boolean);
            const finalCertifications = certifications.filter(Boolean);

            const finalMetadata = {
                ...(user.metadata || {}),
                achievements: finalAchievements,
                certifications: finalCertifications,
            };

            const profileRes = await fetch(`/api/users/${user.uuid}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    name: user.name, 
                    email: user.email, 
                    phone: finalPhone, 
                    domainId: finalDomainId,
                    linkedinUrl: linkedinUrl || user.linkedinUrl,
                    githubUrl: githubUrl || user.githubUrl,
                    portfolioUrl: portfolioUrl || user.portfolioUrl,
                    education: finalEducation,
                    experience: finalExperience,
                    projects: finalProjects,
                    metadata: finalMetadata,
                    role: user.role,
                    referredBy: referrerId || undefined
                }),
            });
            if (!profileRes.ok) throw new Error("Failed to save profile info.");

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
                                onClick={() => {
                                    localStorage.removeItem('jobsdart_referral_code');
                                    setShowReferralStep(false);
                                }}
                                className="flex-1 h-14 rounded-2xl text-slate-500 hover:text-slate-800 font-bold hover:bg-slate-50 transition-colors"
                            >
                                Skip
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setShowReferralStep(false)}
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

                    {/* Social & Portfolio Links */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-sky-500" />
                                Portfolio URL (Optional)
                            </label>
                            <Input
                                placeholder="https://yourportfolio.com"
                                className="h-14 rounded-2xl border-slate-200 focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors text-base"
                                value={portfolioUrl}
                                onChange={(e) => setPortfolioUrl(e.target.value)}
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

                    {/* Education Details */}
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-indigo-600 animate-pulse" />
                            Education Details
                        </h3>
                        {education.map((edu, idx) => (
                            <motion.div 
                                key={idx} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-4 relative group"
                            >
                                <button
                                    type="button"
                                    onClick={() => removeEducation(idx)}
                                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">School / Institution</label>
                                        <Input
                                            placeholder="e.g. Stanford University"
                                            value={edu.institution || ""}
                                            onChange={(e) => updateEducation(idx, { institution: e.target.value })}
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">Degree</label>
                                        <Input
                                            placeholder="e.g. Bachelor of Science"
                                            value={edu.degree || ""}
                                            onChange={(e) => updateEducation(idx, { degree: e.target.value })}
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">Field of Study</label>
                                        <Input
                                            placeholder="e.g. Computer Science"
                                            value={edu.fieldOfStudy || ""}
                                            onChange={(e) => updateEducation(idx, { fieldOfStudy: e.target.value })}
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">Grade / CGPA</label>
                                        <Input
                                            placeholder="e.g. 3.8/4.0 or 85%"
                                            value={edu.grade || ""}
                                            onChange={(e) => updateEducation(idx, { grade: e.target.value })}
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">Start Date (YYYY-MM)</label>
                                        <Input
                                            placeholder="YYYY-MM (e.g. 2020-09)"
                                            value={edu.startDate || ""}
                                            onChange={(e) => updateEducation(idx, { startDate: e.target.value })}
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>
                                    {!edu.isCurrent && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600">End Date (YYYY-MM)</label>
                                            <Input
                                                placeholder="YYYY-MM (e.g. 2024-06)"
                                                value={edu.endDate || ""}
                                                onChange={(e) => updateEducation(idx, { endDate: e.target.value })}
                                                className="h-11 rounded-xl border-slate-200 bg-white"
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
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor={`edu-current-${idx}`} className="text-xs font-semibold text-slate-600 cursor-pointer">
                                        I am currently studying here
                                    </label>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Description</label>
                                    <textarea
                                        placeholder="Achievements, coursework, or extra-curricular activities..."
                                        value={edu.description || ""}
                                        onChange={(e) => updateEducation(idx, { description: e.target.value })}
                                        rows={2}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-indigo-400 transition-colors"
                                    />
                                </div>
                            </motion.div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addEducation}
                            className="w-full py-5 rounded-2xl border-dashed border-2 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 font-bold text-xs"
                        >
                            <Plus className="w-4 h-4" /> Add Education
                        </Button>
                    </div>

                    {/* Work Experience */}
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-emerald-600 animate-pulse" />
                            Work Experience
                        </h3>
                        {experience.map((exp, idx) => (
                            <motion.div 
                                key={idx} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-4 relative group"
                            >
                                <button
                                    type="button"
                                    onClick={() => removeExperience(idx)}
                                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">Company Name</label>
                                        <Input
                                            placeholder="e.g. Acme Corp"
                                            value={exp.company || ""}
                                            onChange={(e) => updateExperience(idx, { company: e.target.value })}
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">Job Title</label>
                                        <Input
                                            placeholder="e.g. Software Engineer"
                                            value={exp.title || ""}
                                            onChange={(e) => updateExperience(idx, { title: e.target.value })}
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">Location</label>
                                        <Input
                                            placeholder="e.g. Bengaluru, India or Remote"
                                            value={exp.location || ""}
                                            onChange={(e) => updateExperience(idx, { location: e.target.value })}
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">Employment Type</label>
                                        <Select
                                            onValueChange={(val) => updateExperience(idx, { employmentType: val })}
                                            value={exp.employmentType || "Full-time"}
                                        >
                                            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg border-slate-100 shadow-xl">
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
                                        <label className="text-xs font-bold text-slate-600">Start Date (YYYY-MM)</label>
                                        <Input
                                            placeholder="YYYY-MM (e.g. 2021-06)"
                                            value={exp.startDate || ""}
                                            onChange={(e) => updateExperience(idx, { startDate: e.target.value })}
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>
                                    {!exp.isCurrent && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600">End Date (YYYY-MM)</label>
                                            <Input
                                                placeholder="YYYY-MM (e.g. 2023-12)"
                                                value={exp.endDate || ""}
                                                onChange={(e) => updateExperience(idx, { endDate: e.target.value })}
                                                className="h-11 rounded-xl border-slate-200 bg-white"
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
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor={`exp-current-${idx}`} className="text-xs font-semibold text-slate-600 cursor-pointer">
                                        I currently work here
                                    </label>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Description</label>
                                    <textarea
                                        placeholder="Describe your achievements, roles, and tech stack used..."
                                        value={exp.description || ""}
                                        onChange={(e) => updateExperience(idx, { description: e.target.value })}
                                        rows={3}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-indigo-400 transition-colors"
                                    />
                                </div>
                            </motion.div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addExperience}
                            className="w-full py-5 rounded-2xl border-dashed border-2 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 font-bold text-xs"
                        >
                            <Plus className="w-4 h-4" /> Add Work Experience
                        </Button>
                    </div>

                    {/* Projects */}
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-indigo-600 animate-pulse" />
                            Projects
                        </h3>
                        {projects.map((proj, idx) => (
                            <motion.div 
                                key={idx} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-4 relative group"
                            >
                                <button
                                    type="button"
                                    onClick={() => removeProject(idx)}
                                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">Project Name</label>
                                        <Input
                                            placeholder="e.g. Portfolio Website"
                                            value={proj.name || ""}
                                            onChange={(e) => updateProject(idx, { name: e.target.value })}
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">Project Link / URL</label>
                                        <Input
                                            placeholder="e.g. https://github.com/..."
                                            value={proj.url || ""}
                                            onChange={(e) => updateProject(idx, { url: e.target.value })}
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">Start Date (YYYY-MM)</label>
                                        <Input
                                            placeholder="YYYY-MM (e.g. 2023-01)"
                                            value={proj.startDate || ""}
                                            onChange={(e) => updateProject(idx, { startDate: e.target.value })}
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">End Date (YYYY-MM)</label>
                                        <Input
                                            placeholder="YYYY-MM (e.g. 2023-03)"
                                            value={proj.endDate || ""}
                                            onChange={(e) => updateProject(idx, { endDate: e.target.value })}
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Description</label>
                                    <textarea
                                        placeholder="Describe the project objective, your role, and the tech stack used..."
                                        value={proj.description || ""}
                                        onChange={(e) => updateProject(idx, { description: e.target.value })}
                                        rows={2}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-indigo-400 transition-colors"
                                    />
                                </div>
                            </motion.div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addProject}
                            className="w-full py-5 rounded-2xl border-dashed border-2 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 font-bold text-xs"
                        >
                            <Plus className="w-4 h-4" /> Add Project
                        </Button>
                    </div>

                    {/* Achievements & Certifications */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                        {/* Achievements */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-500 animate-pulse" />
                                Achievements
                            </h3>
                            <div className="space-y-2">
                                {achievements.map((ach, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Input
                                            placeholder="e.g. Won Hackathon 2025"
                                            value={ach || ""}
                                            onChange={(e) => updateAchievement(idx, e.target.value)}
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeAchievement(idx)}
                                            className="p-2.5 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addAchievement}
                                className="w-full py-4 rounded-xl border-dashed hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5 font-bold text-xs"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Achievement
                            </Button>
                        </div>

                        {/* Certifications */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-500 animate-pulse" />
                                Certifications
                            </h3>
                            <div className="space-y-2">
                                {certifications.map((cert, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Input
                                            placeholder="e.g. AWS Certified Solutions Architect"
                                            value={cert || ""}
                                            onChange={(e) => updateCertification(idx, e.target.value)}
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeCertification(idx)}
                                            className="p-2.5 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addCertification}
                                className="w-full py-4 rounded-xl border-dashed hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5 font-bold text-xs"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Certification
                            </Button>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-6 border-t border-slate-100">
                        <Button
                            type="submit"
                            disabled={isSubmitting || uploadProgress !== null}
                            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
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
