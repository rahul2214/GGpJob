"use client";

import { notFound, useParams, useSearchParams, useRouter } from 'next/navigation';
import type { Job, Application } from "@/lib/types";
import {
    Briefcase, MapPin, Building, Calendar, Users,
    BadgeDollarSign, Clock, UserCheck,
    ChevronRight, Info, Award, LayoutList, CheckCircle2,
    Layers, User as UserIcon, ArrowLeft, Bookmark,
    ChevronDown, Linkedin, Star, ShieldCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ApplyButton } from './apply-button';
import JobCard from '@/components/job-card';
import { ShareButton } from '@/components/share-button';
import { useUser } from '@/contexts/user-context';
import { useState, useEffect, Suspense, useCallback, useMemo, useRef } from 'react';
import JobDetailsLoading from './loading';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DOMPurify from 'isomorphic-dompurify';
import { Separator } from '@/components/ui/separator';
import SkillMatchBadge from '@/components/skill-match-badge';
import { calculateSkillMatch } from '@/lib/skill-match';
import { Sparkles, Zap, Target, AlertCircle, PlusCircle } from 'lucide-react';

async function getJobData(id: string, userId?: string): Promise<Job | null> {
    const url = `/api/jobs/${id}?fresh=true${userId ? `&userId=${userId}` : ''}`;
    const jobRes = await fetch(url, { cache: 'no-store' });
    if (!jobRes.ok) {
        if (jobRes.status === 404) return null;
        throw new Error('Failed to fetch job data');
    }
    return jobRes.json();
}

function renderFormattedDescription(desc?: string) {
    if (!desc) return null;

    const decoded = desc
        .replace(/&#x26;/gi, '&')
        .replace(/&#x27;/gi, "'")
        .replace(/&#x39;/gi, "'")
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&#039;/gi, "'");

    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(decoded);

    if (hasHtmlTags) {
        const sanitized = DOMPurify.sanitize(decoded);
        return (
            <div 
                className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-3 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5 [&_li]:my-1 [&_p]:my-2.5 [&_strong]:font-semibold [&_strong]:text-slate-900 [&_a]:text-indigo-600 [&_a]:underline font-normal"
                dangerouslySetInnerHTML={{ __html: sanitized }}
            />
        );
    }

    return (
        <div className="prose prose-slate max-w-none text-slate-700 space-y-3 font-normal leading-relaxed">
            {decoded.split('\n').map((line, index) => (
                line.trim() ? <p key={index}>{line}</p> : <br key={index} />
            ))}
        </div>
    );
}

function JobDetailsContent() {
    const { user, currency, exchangeRates } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const [job, setJob] = useState<Job | null>(null);
    const [allRelatedJobs, setAllRelatedJobs] = useState<Job[]>([]);
    const [userApplications, setUserApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;

    // Visibility tracking for footer
    const [isApplyAreaVisible, setIsApplyAreaVisible] = useState(false);
    const [isSimilarJobsVisible, setIsSimilarJobsVisible] = useState(false);
    const footerSentinelRef = useRef<HTMLDivElement>(null);
    const similarJobsSectionRef = useRef<HTMLDivElement>(null);
    const isAdminView = searchParams.get('view') === 'admin';

    const formatSalaryInJobCurrency = useCallback((min?: number | null, max?: number | null, currencyCode?: string | null) => {
        if (!min && !max) return 'Not Disclosed';
        const code = (currencyCode || 'USD').toUpperCase();
        const formatVal = (val: number) => {
            try {
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: code,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(val);
            } catch {
                return `${code} ${val.toLocaleString()}`;
            }
        };

        if (min && max) return `${formatVal(min)} - ${formatVal(max)}`;
        if (min) return `From ${formatVal(min)}`;
        if (max) return `Up to ${formatVal(max)}`;
        return 'Not Disclosed';
    }, []);

    const appliedJobIds = useMemo(() => new Set((userApplications || []).map(app => app.jobId)), [userApplications]);

    const isCorporateEmail = useCallback((email?: string | null) => {
        if (!email) return false;
        const lower = email.toLowerCase();
        const publicDomains = ['@gmail.', '@yahoo.', '@outlook.', '@hotmail.', '@live.', '@icloud.', '@aol.', '@ymail.', '@rocketmail.'];
        return !publicDomains.some(d => lower.includes(d));
    }, []);

    // Filter related jobs: remove those the user has already applied to
    const relatedJobs = useMemo(() => {
        if (user?.role === 'Job Seeker' && (allRelatedJobs || []).length > 0) {
            return (allRelatedJobs || []).filter(j => !appliedJobIds.has(j.uuid));
        }
        return allRelatedJobs || [];
    }, [allRelatedJobs, appliedJobIds, user]);

    // Calculate candidate skill match compatibility
    const matchData = useMemo(() => {
        return calculateSkillMatch(
            job?.requiredSkills || job?.requirements || [],
            user?.skills || []
        );
    }, [job?.requiredSkills, job?.requirements, user?.skills]);

    // Primary fetch for job details (runs once per ID)
    const fetchJobInfo = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await getJobData(id, user?.uuid);
            setJob(data);

            // If the API says we've applied, add it to our local state
            if (data?.isApplied) {
                setUserApplications([{ jobId: id } as any]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [id, user?.uuid, user?.id]);

    useEffect(() => {
        fetchJobInfo();
    }, [fetchJobInfo]);

    // Secondary fetch for user applications (runs when user session is available)
    useEffect(() => {
        if (!id) return;

        const fetchSecondaryData = async () => {
            try {
                if (job || loading) {
                    const baseUrl = '/api/jobs';
                    let query = '';
                    if (user) {
                        query = `?similar=true&userId=${user.uuid}&currentJobId=${id}&limit=10`;
                    }

                    if (query) {
                        const relRes = await fetch(baseUrl + query, { cache: 'no-store' });
                        if (relRes.ok) {
                            const data = await relRes.json();
                            const jobsList = Array.isArray(data) ? data : (data.jobs || data.recommended || []);
                            if (Array.isArray(jobsList)) {
                                const filtered = jobsList
                                    .filter((j: Job) => (j.id !== job?.id && j.uuid !== job?.uuid))
                                    .slice(0, 4);
                                setAllRelatedJobs(filtered);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch secondary job data", error);
            }
        };

        fetchSecondaryData();
    }, [id, job, user, loading]);

    useEffect(() => {
        const sentinel = footerSentinelRef.current;
        const similarSection = similarJobsSectionRef.current;
        if (!sentinel && !similarSection) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.target === sentinel) {
                        setIsApplyAreaVisible(entry.isIntersecting);
                    } else if (entry.target === similarSection) {
                        setIsSimilarJobsVisible(entry.isIntersecting);
                    }
                });
            },
            {
                threshold: 0,
                rootMargin: '0px 0px -10% 0px'
            }
        );

        if (sentinel) observer.observe(sentinel);
        if (similarSection) observer.observe(similarSection);

        return () => observer.disconnect();
    }, [loading, job]);


    const handleExternalApply = async (e: React.MouseEvent, url: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast({
                title: "Authentication Required",
                description: "Please log in to apply for jobs.",
                variant: "destructive",
            });
            router.push('/login');
            return;
        }

        if (appliedJobIds.has(id) || user.role !== 'Job Seeker') {
            window.open(url, '_blank', 'noopener,noreferrer');
            return;
        }

        try {
            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId: id, userId: user.uuid }),
            });

            if (response.ok || response.status === 409) {
                // Refresh only the applicant count and apps list locally
                const res = await fetch(`/api/applications?userId=${user.uuid}`);
                if (res.ok) {
                    const data = await res.json();
                    setUserApplications(Array.isArray(data) ? data : []);
                }
                // Refresh job info to update applicant count
                fetchJobInfo();
            }
        } catch (error) {
            console.error("External application tracking failed", error);
        } finally {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleApplySuccess = useCallback(() => {
        if (job) {
            setJob(prev => prev ? {
                ...prev,
                applicantCount: (prev.applicantCount || 0) + 1,
                isApplied: true
            } : null);
            setUserApplications(prev => [...prev, { jobId: id } as any]);
        }
    }, [job, id]);

    const scrollToSimilarJobs = () => {
        const element = document.getElementById('similar-jobs-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (loading) {
        return <JobDetailsLoading />;
    }

    if (!job) {
        notFound();
    }

    const hasBenefits = job.benefits && job.benefits.length > 0;
    const showSimilarJobs = relatedJobs.length > 0 && !isAdminView;
    const isFooterHidden = isApplyAreaVisible || isSimilarJobsVisible;

    return (
        <div className="min-h-screen bg-[#f5f7fb] pb-24 md:pb-8">
            <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">

                        {/* Desktop Header */}
                        <div className="hidden md:block bg-white rounded-2xl shadow-sm border p-8 mb-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-4">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <span className="text-gray-600 font-medium">{job.companyName}</span>
                                            {job.job_role && (
                                                <>
                                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                    <span className="text-blue-600 font-medium text-sm">{job.job_role}</span>
                                                </>
                                            )}
                                            {job.jobId && (
                                                <>
                                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                    <span className="text-gray-500 font-medium text-sm">ID: {job.jobId}</span>
                                                </>
                                            )}
                                            {job.visaSponsorship && (
                                                <>
                                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                    <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 font-bold text-xs py-0.5 px-2.5 rounded-full">
                                                        ✈ Visa Sponsorship Offered
                                                    </Badge>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-4 text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <Briefcase className="h-4 w-4" />
                                                <span className="text-sm">{job.experienceLevel || 'Not Disclosed'}</span>
                                            </div>
                                            <div className="w-px h-4 bg-gray-200" />
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-bold text-gray-800">
                                                    {formatSalaryInJobCurrency(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <MapPin className="h-4 w-4" />
                                            <span className="text-sm">{job.location || 'Not Disclosed'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-4">
                                    <div className="w-20 h-20 bg-black rounded-xl flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                                        {job.companyName.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            <Separator className="mb-6" />

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div>
                                        <span className="text-gray-400">Posted:</span> <span className="font-semibold text-gray-700">{formatDistanceToNow(new Date(job.postedAt), { addSuffix: true }).replace(/^about\s+/i, '')}</span>
                                    </div>
                                    <div className="w-px h-4 bg-gray-200" />
                                    <div>
                                        <span className="text-gray-400">Applicants:</span> <span className="font-semibold text-gray-700">{job.applicantCount || 0}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">

                                    <div className="flex items-center gap-3">
                                        <div className="min-w-[120px]">
                                            {job.jobLink ? (
                                                <Button
                                                    className="w-full bg-[#2e5bff] hover:bg-blue-700 text-white rounded-full font-bold h-11 text-base px-10"
                                                    onClick={(e) => handleExternalApply(e, job.jobLink!)}
                                                >
                                                    Apply on Website
                                                </Button>
                                            ) : (
                                                <ApplyButton 
                                                    job={job} 
                                                    variant="desktop" 
                                                    isApplied={appliedJobIds.has(id)} 
                                                    onSuccess={handleApplySuccess}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Info Summary */}
                        <div className="md:hidden bg-white rounded-xl shadow-sm border p-6 mb-6">
                            <div className="flex flex-col gap-4">
                                <div className="bg-black text-white w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold">
                                    {job.companyName.charAt(0).toUpperCase()}
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{job.title}</h1>
                                    <div className="flex items-center gap-1 text-primary font-medium">
                                        {job.companyName}
                                        <ChevronRight className="h-4 w-4" />
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 pt-2">
                                    <div className="flex items-center gap-1.5">
                                        <Users className="h-4 w-4" />
                                        {job.applicantCount || 0}+ applicants
                                    </div>
                                    <div className="flex items-center gap-1.5 ml-auto md:ml-0">
                                        Posted {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true }).replace(/^about\s+/i, '')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 mb-6 gap-6 md:gap-8">
                                <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 font-semibold text-base">Job details</TabsTrigger>
                                {hasBenefits && (
                                    <TabsTrigger value="benefits" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 font-semibold text-base">Benefits</TabsTrigger>
                                )}
                                {(job.companyOverview || job.companySize || job.companyLinkedinUrl) && (
                                    <TabsTrigger value="company" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 font-semibold text-base">About Company</TabsTrigger>
                                )}
                            </TabsList>

                            <TabsContent value="details" className="space-y-6">
                                <div className="bg-white rounded-xl border p-6 space-y-8">
                                    {/* Primary Info: Location, Vacancies, Salary, Experience */}
                                    <div className="space-y-4">
                                       
                                        <div className="flex items-center gap-3 text-sm sm:text-base">
                                            <div>
                                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Location</div>
                                                <div className="font-bold text-slate-900">{(job.locations && job.locations.length > 0) ? job.locations.join(' • ') : (job.location || 'Not Disclosed')}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 text-sm sm:text-base">
                                            <div>
                                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Vacancies</div>
                                                <div className="font-bold text-slate-900">{job.vacancies || 'Not Disclosed'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm sm:text-base">
                                            <div>
                                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Salary</div>
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="font-bold text-slate-900">
                                                        {formatSalaryInJobCurrency(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm sm:text-base">
                                            <div>
                                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Experience</div>
                                                <div className="font-bold text-slate-900">{job.experienceLevel || 'Not Disclosed'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm sm:text-base">
                                            <div>
                                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Visa Sponsorship</div>
                                                <div className="font-bold text-slate-900 mt-0.5">
                                                    {job.visaSponsorship ? (
                                                        <span className="text-sky-700 dark:text-sky-400 font-extrabold flex items-center gap-1">
                                                            ✈ Available / Offered
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500 font-medium">Not Offered</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Candidate Skill Match & Compatibility Panel for Job Seekers */}
                                    {user?.role === 'Job Seeker' && (job.requiredSkills || job.requirements) && ((job.requiredSkills?.length || 0) > 0 || (job.requirements?.length || 0) > 0) && (
                                        <div className={cn(
                                            "p-6 rounded-2xl border backdrop-blur-md my-6 transition-all shadow-sm relative overflow-hidden",
                                            matchData.tier === 'top' && "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-600/10 border-emerald-500/30",
                                            matchData.tier === 'strong' && "bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-indigo-600/10 border-indigo-500/30",
                                            matchData.tier === 'potential' && "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-600/10 border-amber-500/30",
                                            matchData.tier === 'low' && "bg-gradient-to-br from-rose-500/10 via-purple-500/5 to-rose-600/10 border-rose-500/30"
                                        )}>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center shadow-sm shrink-0">
                                                        {matchData.tier === 'top' && <Sparkles className="w-6 h-6 text-emerald-500 animate-pulse" />}
                                                        {matchData.tier === 'strong' && <Zap className="w-6 h-6 text-indigo-500" />}
                                                        {matchData.tier === 'potential' && <Target className="w-6 h-6 text-amber-500" />}
                                                        {matchData.tier === 'low' && <AlertCircle className="w-6 h-6 text-rose-500" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                                                                {matchData.tierLabel}
                                                            </h3>
                                                            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border text-slate-800 dark:text-slate-200 shadow-sm">
                                                                {matchData.matchPercentage}% Skill Match
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                                                            {matchData.tierTagline}
                                                        </p>
                                                    </div>
                                                </div>

                                                <SkillMatchBadge
                                                    jobSkills={job.requiredSkills || job.requirements || []}
                                                    userSkills={user?.skills || []}
                                                    size="md"
                                                />
                                            </div>

                                            {/* Matched vs Missing Skills Breakdown */}
                                            <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Your Matched Skills ({matchData.matchedSkills.length})
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {matchData.matchedSkills.map((skill, idx) => (
                                                            <span key={idx} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40">
                                                                ✓ {skill}
                                                            </span>
                                                        ))}
                                                        {matchData.matchedSkills.length === 0 && (
                                                            <span className="text-xs text-slate-400 italic">No matching skills found.</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {matchData.missingSkills.length > 0 && (
                                                    <div>
                                                        <div className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                                                            <PlusCircle className="w-3.5 h-3.5" />
                                                            Recommended Skills to Add ({matchData.missingSkills.length})
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {matchData.missingSkills.map((skill, idx) => (
                                                                <span key={idx} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/80 text-slate-600 border border-slate-200 dark:bg-slate-900/80 dark:text-slate-300 dark:border-slate-800">
                                                                    + {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Required Skills Section */}
                                    {((job.requiredSkills && job.requiredSkills.length > 0) || (job.skills && job.skills.length > 0) || (job.requirements && job.requirements.length > 0)) && (
                                        <div className="mt-6 border-t pt-6">
                                            <h3 className="text-lg font-bold text-slate-900 mb-3">
                                                Required Skills
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {(job.requiredSkills || job.skills || job.requirements || []).map((skill: string, idx: number) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs font-bold px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}



                                    <div className="mt-8 border-t pt-8">
                                        <h3 className="text-lg font-bold mb-4 text-slate-900">
                                            Job Description
                                        </h3>
                                        {renderFormattedDescription(job.description)}
                                    </div>

                                    {/* Secondary Info: Job Type, Role, Workplace, Visa Sponsorship */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mt-8 border-t pt-8">
                                        <div className="text-sm">
                                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Job Type</div>
                                            <div className="font-bold text-slate-800">{job.type || 'Not Disclosed'}</div>
                                        </div>
                                        <div className="text-sm">
                                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Role</div>
                                            <div className="font-bold text-slate-800">{job.job_role || 'Not Disclosed'}</div>
                                        </div>
                                        <div className="text-sm">
                                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Workplace</div>
                                            <div className="font-bold text-slate-800">{job.workplaceType || 'Not Disclosed'}</div>
                                        </div>
                                        <div className="text-sm">
                                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Visa Sponsorship</div>
                                            <div className="font-bold text-slate-800">
                                                {job.visaSponsorship ? '✈ Available / Offered' : 'Not Offered'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dynamic Sections (Responsibilities, Qualifications, etc.) */}
                                    {job.sections && Array.isArray(job.sections) && job.sections.map((section, sIndex) => (
                                        <div key={sIndex} className="mt-8 border-t pt-8">
                                            {section.title && (
                                                <h3 className="text-lg font-bold mb-4 text-slate-900">
                                                    {section.title}
                                                </h3>
                                            )}
                                            {section.items && Array.isArray(section.items) ? (
                                                <ul className="space-y-3">
                                                    {section.items.map((item: any, iIndex: number) => (
                                                        <li key={iIndex} className="flex items-start gap-3 text-sm text-gray-600">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0 mt-2" />
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : section.content ? (
                                                <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                                                    {section.content}
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}

                                    <div ref={footerSentinelRef} className="h-1 w-full" />

                                    <div className="pt-8 md:hidden">
                                        {job.jobLink ? (
                                            <Button
                                                size="lg"
                                                className="w-full bg-[#2e5bff] hover:bg-[#1e4be0] text-white font-bold rounded-full"
                                                onClick={(e) => handleExternalApply(e, job.jobLink!)}
                                            >
                                                Apply on Website
                                            </Button>
                                        ) : (
                                            <ApplyButton 
                                                job={job} 
                                                isApplied={appliedJobIds.has(id)} 
                                                onSuccess={handleApplySuccess}
                                            />
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {hasBenefits && (
                                <TabsContent value="benefits">
                                    <Card className="rounded-xl border shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Award className="h-5 w-5 text-primary" />
                                                Benefits
                                            </CardTitle>
                                            <CardDescription>What you can expect when joining our team.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {job.benefits?.map((benefit, index) => (
                                                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                                        <span className="text-sm font-medium">{benefit}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}

                            {(job.companyOverview || job.companySize || job.companyLinkedinUrl || (job as any).address) && (
                                <TabsContent value="company">
                                    <div className="bg-white rounded-xl border p-6 space-y-6">
                                        <div className="flex items-center gap-4 mb-2">
                                            {job.companyLogo ? (
                                                <div className="w-16 h-16 bg-white border rounded-xl overflow-hidden flex items-center justify-center p-1">
                                                    <img src={job.companyLogo} alt={job.companyName} className="max-w-full max-h-full object-contain" />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                                                    {job.companyName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{job.companyName}</h3>
                                                {job.companyWebsite && (
                                                    <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                                        Visit Website
                                                    </a>
                                                )}
                                                {job.companyLinkedinUrl && (
                                                    <a href={job.companyLinkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-800 hover:underline flex items-center gap-1 mt-1">
                                                        <Linkedin className="h-3 w-3" />
                                                        LinkedIn Profile
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {job.companySize && (
                                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Company Size</div>
                                                    <div className="flex items-center gap-2 font-bold text-slate-800">
                                                        <Users className="h-4 w-4 text-indigo-500" />
                                                        {job.companySize} Employees
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <Separator />

                                        {job.companyOverview && (
                                            <div>
                                                <h4 className="text-lg font-bold mb-3 flex items-center gap-2 text-slate-800">
                                                    <Building className="h-5 w-5 text-indigo-500" />
                                                    About the Company
                                                </h4>
                                                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                    {job.companyOverview}
                                                </div>
                                            </div>
                                        )}

                                        {job.address && (
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Office Address</h4>
                                                <p className="text-sm text-gray-600 flex items-start gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                                    {job.address}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        {showSimilarJobs && (
                            <div id="similar-jobs-section" ref={similarJobsSectionRef}>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <LayoutList className="h-5 w-5" />
                                    Similar Jobs
                                </h3>
                                <div className="space-y-4">
                                    {relatedJobs.map(relatedJob => (
                                        <JobCard
                                            key={relatedJob.id}
                                            job={relatedJob}
                                            isApplied={appliedJobIds.has(relatedJob.uuid)}

                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sticky Mobile Footer */}
            <div className={cn(
                "md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t px-4 py-4 flex items-center gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-all duration-500 ease-in-out transform",
                isFooterHidden ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
            )}>
                {showSimilarJobs && (
                    <Button variant="ghost" size="lg" className="flex-1 flex flex-col items-center gap-1 h-auto py-2 text-primary font-bold" onClick={scrollToSimilarJobs}>
                        <Briefcase className="h-5 w-5" />
                        <span className="text-[10px] uppercase tracking-wider">Similar jobs</span>
                    </Button>
                )}
                <div className={cn("w-full flex flex-col gap-2", showSimilarJobs ? "flex-[2.5]" : "flex-1")}>
                    {job.jobLink ? (
                        <Button
                            size="lg"
                            className="w-full bg-[#2e5bff] hover:bg-[#1e4be0] text-white font-bold rounded-full"
                            onClick={(e) => handleExternalApply(e, job.jobLink!)}
                        >
                            Apply on Website
                        </Button>
                    ) : (
                        <ApplyButton 
                            job={job} 
                            isApplied={appliedJobIds.has(id)} 
                            onSuccess={handleApplySuccess}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default function JobDetailsPage() {
    return (
        <Suspense fallback={<JobDetailsLoading />}>
            <JobDetailsContent />
        </Suspense>
    )
}
