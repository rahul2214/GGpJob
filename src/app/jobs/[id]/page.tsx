
"use client";

import { notFound, useParams, useSearchParams, useRouter } from 'next/navigation';
import type { Job, Application } from "@/lib/types";
import { Badge } from '@/components/ui/badge';
import { 
    Briefcase, MapPin, Building, Calendar, Users, 
    BadgeDollarSign, Clock, UserCheck, 
    ChevronRight, Info, Award, LayoutList, CheckCircle2,
    Layers, User as UserIcon, ArrowLeft, Bookmark,
    ChevronDown
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ApplyButton } from './apply-button';
import JobCard from '@/components/job-card';
import { ShareButton } from '@/components/share-button';
import { useUser } from '@/contexts/user-context';
import { useState, useEffect, Suspense, useCallback, useMemo, useRef } from 'react';
import JobDetailsLoading from './loading';
import { useSavedJobs } from '@/hooks/use-jobs';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

async function getJobData(id: string): Promise<{ job: Job | null; relatedJobs: Job[] }> {
    const jobRes = await fetch(`/api/jobs/${id}?fresh=true`, { cache: 'no-store' });
    if (!jobRes.ok) {
        if (jobRes.status === 404) return { job: null, relatedJobs: [] };
        throw new Error('Failed to fetch job data');
    }
    const job: Job = await jobRes.json();

    const relatedJobsRes = await fetch(`/api/jobs?domainId=${job.domainId}&limit=10`, { cache: 'no-store' });
    let relatedJobs: Job[] = [];
    if (relatedJobsRes.ok) {
        const allRelated = await relatedJobsRes.json();
        relatedJobs = allRelated
            .filter((j: Job) => j.id !== job.id)
            .slice(0, 3);
    }
    
    return { job, relatedJobs };
}

function JobDetailsContent() {
    const { user } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const [job, setJob] = useState<Job | null>(null);
    const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
    const [userApplications, setUserApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const { savedJobs, mutateSavedJobs } = useSavedJobs(user?.id);
    
    // Visibility tracking for footer
    const [isApplyAreaVisible, setIsApplyAreaVisible] = useState(false);
    const [isSimilarJobsVisible, setIsSimilarJobsVisible] = useState(false);
    const footerSentinelRef = useRef<HTMLDivElement>(null);
    const similarJobsSectionRef = useRef<HTMLDivElement>(null);

    const isAdminView = searchParams.get('view') === 'admin';

    const appliedJobIds = useMemo(() => new Set(userApplications.map(app => app.jobId)), [userApplications]);
    const savedJobIds = useMemo(() => new Set(savedJobs || []), [savedJobs]);
    const isCurrentlySaved = savedJobIds.has(id);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [jobAndRelatedData, appsRes] = await Promise.all([
                getJobData(id),
                user ? fetch(`/api/applications?userId=${user.id}`) : Promise.resolve(null)
            ]);

            const { job: jobData, relatedJobs: relatedJobsData } = jobAndRelatedData;
            
            setJob(jobData);
            
            let appsData: Application[] = [];
            if (appsRes && appsRes.ok) {
                appsData = await appsRes.json();
                setUserApplications(Array.isArray(appsData) ? appsData : []);
            }

            if (user?.role === 'Job Seeker' && Array.isArray(relatedJobsData)) {
                const currentAppliedJobIds = new Set(appsData.map(app => app.jobId));
                const filteredRelatedJobs = relatedJobsData.filter(j => !currentAppliedJobIds.has(j.id));
                setRelatedJobs(filteredRelatedJobs);
            } else {
                setRelatedJobs(relatedJobsData);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id, loadData]);

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

    const handleSaveToggle = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        const jobId = id;
        const wasSaved = isCurrentlySaved;
        const originalSavedJobs = savedJobs ? [...savedJobs] : [];

        const newSavedJobs = wasSaved
            ? originalSavedJobs.filter(id => id !== jobId)
            : [...originalSavedJobs, jobId];
        mutateSavedJobs(newSavedJobs, false);

        const method = wasSaved ? 'DELETE' : 'POST';
        const url = wasSaved 
            ? `/api/users/${user.id}/saved-jobs?jobId=${jobId}`
            : `/api/users/${user.id}/saved-jobs`;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: wasSaved ? undefined : JSON.stringify({ jobId }),
            });

            if (!response.ok) throw new Error('Failed');
            
            toast({
                title: wasSaved ? "Job Unsaved" : "Job Saved",
                description: `"${job?.title}" has been ${wasSaved ? 'removed from' : 'added to'} your saved jobs.`,
            });
            mutateSavedJobs();
        } catch (error) {
            mutateSavedJobs(originalSavedJobs, false);
            toast({ title: "Error", description: "Could not update saved jobs.", variant: "destructive" });
        }
    };

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

        // If user is already an applicant, just open the link
        if (appliedJobIds.has(id) || user.role !== 'Job Seeker') {
            window.open(url, '_blank', 'noopener,noreferrer');
            return;
        }

        try {
            // Track application by creating a record in the applications collection
            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId: id, userId: user.id }),
            });

            if (response.ok || response.status === 409) {
                // Application recorded successfully or already exists
                loadData(); // Refresh to update count in UI
            }
        } catch (error) {
            console.error("External application tracking failed", error);
        } finally {
            // Always open the link for the user
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

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
            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={handleSaveToggle} className="rounded-full">
                        <Bookmark className={cn("h-6 w-6", isCurrentlySaved && "fill-primary text-primary")} />
                    </Button>
                    <ShareButton jobId={job.id} jobTitle={job.title} />
                </div>
            </div>

            <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        
                        {/* Desktop Header */}
                        <div className="hidden md:block bg-white rounded-2xl shadow-sm border p-8 mb-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-4">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-gray-600 font-medium">{job.companyName}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-4 text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <Briefcase className="h-4 w-4" />
                                                <span className="text-sm">{job.experienceLevel}</span>
                                            </div>
                                            <div className="w-px h-4 bg-gray-200" />
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-gray-800">₹ {job.salary || 'Not Disclosed'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <MapPin className="h-4 w-4" />
                                            <span className="text-sm">{job.location}</span>
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
                                        <span className="text-gray-400">Posted:</span> <span className="font-semibold text-gray-700">{formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}</span>
                                    </div>
                                    <div className="w-px h-4 bg-gray-200" />
                                    <div>
                                        <span className="text-gray-400">Applicants:</span> <span className="font-semibold text-gray-700">{job.applicantCount || 0}</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <Button 
                                        variant="outline" 
                                        className={cn(
                                            "rounded-full px-10 h-11 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-base transition-colors",
                                            isCurrentlySaved && "bg-blue-50"
                                        )}
                                        onClick={handleSaveToggle}
                                    >
                                        {isCurrentlySaved ? 'Saved' : 'Save'}
                                    </Button>
                                    <div className="min-w-[120px]">
                                        {job.jobLink ? (
                                            <Button 
                                                className="w-full bg-[#2e5bff] hover:bg-blue-700 text-white rounded-full font-bold h-11 text-base px-10" 
                                                onClick={(e) => handleExternalApply(e, job.jobLink!)}
                                            >
                                                Apply
                                            </Button>
                                        ) : (
                                            <ApplyButton job={job} variant="desktop" />
                                        )}
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
                                        Posted {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
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
                            </TabsList>

                            <TabsContent value="details" className="space-y-6">
                                <div className="bg-white rounded-xl border p-6 space-y-8">
                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-3 text-sm sm:text-base">
                                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <MapPin className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Location</div>
                                                <div className="font-bold">{job.location}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm sm:text-base">
                                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <Briefcase className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Job Type</div>
                                                <div className="font-bold">{job.type}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm sm:text-base">
                                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <BadgeDollarSign className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Salary</div>
                                                <div className="font-bold">{job.salary || 'Not Disclosed'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm sm:text-base">
                                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <Layers className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Domain</div>
                                                <div className="font-bold">{job.domain}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm sm:text-base">
                                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <UserIcon className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Role</div>
                                                <div className="font-bold">{job.role}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm sm:text-base">
                                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <Building className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Workplace</div>
                                                <div className="font-bold">{job.workplaceType}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm sm:text-base">
                                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <UserCheck className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Experience</div>
                                                <div className="font-bold">{job.experienceLevel}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm sm:text-base">
                                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <Calendar className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Posted On</div>
                                                <div className="font-bold">{format(new Date(job.postedAt), "MMMM do, yyyy")}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm sm:text-base">
                                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <Clock className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Vacancies</div>
                                                <div className="font-bold">{job.vacancies || 1}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <Info className="h-5 w-5 text-primary" />
                                            Job Description
                                        </h3>
                                        <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
                                            {job.description.split('\n').map((line, index) => (
                                                <p key={index}>{line}</p>
                                            ))}
                                        </div>
                                    </div>

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
                                            <ApplyButton job={job} />
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
                                                Perks & Benefits
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
                                            isApplied={appliedJobIds.has(relatedJob.id)} 
                                            isSaved={savedJobIds.has(relatedJob.id)}
                                            onSaveToggle={handleSaveToggle}
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
                <div className={cn("w-full", showSimilarJobs ? "flex-[2.5]" : "flex-1")}>
                    {job.jobLink ? (
                        <Button 
                            size="lg" 
                            className="w-full bg-[#2e5bff] hover:bg-[#1e4be0] text-white font-bold rounded-full" 
                            onClick={(e) => handleExternalApply(e, job.jobLink!)}
                        >
                            Apply on Website
                        </Button>
                    ) : (
                        <ApplyButton job={job} />
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
