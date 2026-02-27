"use client";

import { notFound, useParams, useSearchParams, useRouter } from 'next/navigation';
import type { Job, Application } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Briefcase, MapPin, Building, Calendar, Users, FileText, 
    BadgeDollarSign, Workflow, Clock, UserCheck, 
    Sparkles, ExternalLink, ArrowLeft, Bookmark, Share2, 
    ChevronRight, Info, Award, LayoutList, CheckCircle2
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ApplyButton } from './apply-button';
import JobCard from '@/components/job-card';
import { ShareButton } from '@/components/share-button';
import { useUser } from '@/contexts/user-context';
import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import JobDetailsLoading from './loading';
import { useSavedJobs } from '@/hooks/use-jobs';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

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
                title: !wasSaved ? "Job Saved" : "Job Unsaved",
                description: `"${job?.title}" has been ${!wasSaved ? 'added to' : 'removed from'} your saved jobs.`,
            });
            mutateSavedJobs();
        } catch (error) {
            mutateSavedJobs(originalSavedJobs, false);
            toast({ title: "Error", description: "Could not update saved jobs.", variant: "destructive" });
        }
    };

    const handleExternalApply = (e: React.MouseEvent) => {
        if (!user) {
            e.preventDefault();
            toast({
                title: "Authentication Required",
                description: "Please log in to access the job application link.",
                variant: "destructive",
            });
            router.push('/login');
        }
    };

    if (loading) {
        return <JobDetailsLoading />;
    }

    if (!job) {
        notFound();
    }
    
    const detailItems = [
        { icon: MapPin, label: "Location", value: job.location, color: "text-primary" },
        { icon: Briefcase, label: "Job Type", value: job.type, color: "text-primary" },
        { icon: BadgeDollarSign, label: "Salary", value: job.salary || 'Not Disclosed', color: "text-primary" },
        { icon: Workflow, label: "Domain", value: job.domain, color: "text-primary" },
        { icon: UserCheck, label: "Role", value: job.role, color: "text-primary" },
        { icon: Building, label: "Workplace", value: job.workplaceType, color: "text-primary" },
        { icon: Users, label: "Experience", value: job.experienceLevel, color: "text-primary" },
        { icon: Clock, label: "Vacancies", value: job.vacancies, color: "text-primary" },
    ];

    const hasBenefits = job.benefits && job.benefits.length > 0;

    return (
       <div className="min-h-screen bg-[#f5f7fb] pb-24 md:pb-8">
            {/* Mobile-Only Header */}
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
                        {/* Job Branding Header */}
                        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
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

                        {/* Tabs Navigation */}
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 mb-6 gap-6 md:gap-8">
                                <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 font-semibold">Job details</TabsTrigger>
                                {hasBenefits && (
                                    <TabsTrigger value="benefits" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 font-semibold">Benefits</TabsTrigger>
                                )}
                            </TabsList>

                            <TabsContent value="details" className="space-y-6">
                                {/* Full Job Description */}
                                <div className="bg-white rounded-xl border p-6 space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <Info className="h-5 w-5 text-primary" />
                                            Full Job Description
                                        </h3>
                                        <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
                                            {job.description.split('\\n').map((line, index) => (
                                                <p key={index}>{line}</p>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 pt-4 border-t">
                                        {detailItems.map(item => item.value ? (
                                            <div key={item.label} className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-50 rounded-lg">
                                                    <item.icon className="h-5 w-5 text-primary"/>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                                                    <p className="text-sm font-semibold">{item.value}</p>
                                                </div>
                                            </div>
                                        ) : null)}
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
                        {relatedJobs.length > 0 && !isAdminView && (
                            <div>
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

            {/* Mobile-Only Sticky Footer */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t px-4 py-4 flex items-center gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <Button variant="ghost" size="lg" className="flex-1 flex flex-col items-center gap-1 h-auto py-2 text-primary font-bold">
                    <Briefcase className="h-5 w-5" />
                    <span className="text-[10px] uppercase tracking-wider">Similar jobs</span>
                </Button>
                {job.jobLink ? (
                    <Button asChild={!!user} size="lg" className="flex-[2.5] bg-[#2e5bff] hover:bg-[#1e4be0] text-white font-bold rounded-full" onClick={handleExternalApply}>
                        {user ? (
                            <Link href={job.jobLink} target="_blank">Apply on Website</Link>
                        ) : (
                            <span>Apply on Website</span>
                        )}
                    </Button>
                ) : (
                    <div className="flex-[2.5]">
                        <ApplyButton job={job} />
                    </div>
                )}
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
