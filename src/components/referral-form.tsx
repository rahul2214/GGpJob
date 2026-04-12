"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle, ThumbsUp, Save, PlusCircle, Trash2, Link as LinkIcon, GripVertical, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Domain, JobType, WorkplaceType, Job, Location, MasterSkill } from "@/lib/types";
import { useUser } from "@/contexts/user-context";
import { MultiSelectFilter } from "./multi-select-filter";

// ─── Schema ────────────────────────────────────────────────────────────────

const sectionSchema = z.object({
  title: z.string().min(1, "Section heading cannot be empty."),
  items: z.array(z.object({ value: z.string().min(1, "Point cannot be empty.") })),
});

const formSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters long."),
  jobTitle: z.string().min(5, "Job title must be at least 5 characters long."),
  locationIds: z.array(z.string()).min(1, "At least one location is required."),
  job_role: z.string().min(2, "Role must be at least 2 characters long."),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters long."),
  minExperience: z.coerce.number().min(0, "Min experience must be 0 or more."),
  maxExperience: z.coerce.number().min(0, "Max experience must be 0 or more."),
  jobTypeId: z.string().min(1, "Please select a job type."),
  workplaceTypeId: z.string().min(1, "Please select a workplace type."),
  domainId: z.string().min(1, "Please select a domain."),
  vacancies: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().min(1, "Vacancies must be at least 1.").optional()),
  jobLink: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  salaryMin: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().min(0, "Min salary must be 0 or more.").optional()),
  salaryMax: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().min(0, "Max salary must be 0 or more.").optional()),
  skillIds: z.array(z.string()).optional(),
  benefitIds: z.array(z.string()).optional(),
  sections: z.array(sectionSchema).optional(),
}).refine(data => data.maxExperience >= data.minExperience, { 
    message: "Max experience cannot be less than min experience",
    path: ["maxExperience"]
});

// ─── Components ─────────────────────────────────────────────────────────────

interface SectionItemsProps {
  nestIndex: number;
  control: any;
  register: any;
}

const SectionItemsInput = ({ nestIndex, control, register }: SectionItemsProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${nestIndex}.items`,
  });

  return (
    <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-primary/20 dark:border-primary/10 ml-1 sm:ml-2 mt-4">
      {fields.map((item, k) => (
        <div key={item.id} className="flex gap-3 group items-center animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="w-2 h-2 rounded-full bg-primary/30 shrink-0" />
          <Input
            {...register(`sections.${nestIndex}.items.${k}.value`)}
            placeholder={`Point ${k + 1}...`}
            className="flex-1 bg-white border-slate-200 dark:bg-slate-950 dark:border-slate-800 transition-all focus:ring-2 focus:ring-primary/20"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(k)}
            className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => append({ value: "" })}
        className="text-primary hover:text-primary/80 hover:bg-primary/5 -ml-1 h-9 mt-1 font-medium"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Bullet Point
      </Button>
    </div>
  );
};

type ReferralFormValues = z.infer<typeof formSchema>;

interface ReferralFormProps {
  job?: Job | null;
}

export function ReferralForm({ job }: ReferralFormProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [workplaceTypes, setWorkplaceTypes] = useState<WorkplaceType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [masterSkills, setMasterSkills] = useState<MasterSkill[]>([]);
  const [masterBenefits, setMasterBenefits] = useState<any[]>([]);

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const [domainsRes, jobTypesRes, workplaceTypesRes, locationsRes, skillsRes, benefitsRes] = await Promise.all([
          fetch('/api/domains'),
          fetch('/api/job-types'),
          fetch('/api/workplace-types'),
          fetch('/api/locations'),
          fetch('/api/skills'),
          fetch('/api/benefits')
        ]);
        
        setDomains(await domainsRes.json());
        const fetchedJobTypes = await jobTypesRes.json();
        if (Array.isArray(fetchedJobTypes)) {
          setJobTypes(fetchedJobTypes.filter(jt => jt.name !== 'Walk-in Interview'));
        }
        setWorkplaceTypes(await workplaceTypesRes.json());
        setLocations(await locationsRes.json());
        setMasterSkills(await skillsRes.json());
        setMasterBenefits(await benefitsRes.json());
        
      } catch (error) {
        console.error("Failed to fetch form select data", error);
        toast({
          title: "Error fetching form data",
          description: "Could not load all select options. Please try again later.",
          variant: "destructive",
        });
      }
    }
    fetchSelectData();
  }, [toast]);

  const form = useForm<ReferralFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: job?.companyName || "",
      jobTitle: job?.title || "",
      locationIds: job?.locationPks ? job.locationPks.map(pk => String(pk)) : (job?.locationPk ? [String(job.locationPk)] : []),
      job_role: job?.job_role || "",
      jobDescription: job?.description || "",
      vacancies: job?.vacancies ?? undefined,
      jobLink: job?.jobLink || "",
      salaryMin: job?.salaryMin ?? undefined,
      salaryMax: job?.salaryMax ?? undefined,
      minExperience: job?.minExperience ?? 0,
      maxExperience: job?.maxExperience ?? 0,
      jobTypeId: job?.jobTypePk ? String(job.jobTypePk) : '',
      workplaceTypeId: job?.workplaceTypePk ? String(job.workplaceTypePk) : '',
      domainId: job?.domainPk ? String(job.domainPk) : '',
      skillIds: job?.skillIds || [],
      benefitIds: job?.benefitIds || [],
      sections: job?.sections?.map(s => ({
        title: s.title,
        items: s.items.map(val => ({ value: val }))
      })) || [],
    },
  });

  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
    control: form.control,
    name: "sections",
  });

  useEffect(() => {
    if (job) {
      form.reset({
        companyName: job.companyName || "",
        jobTitle: job.title || "",
        locationIds: job.locationPks ? job.locationPks.map(pk => String(pk)) : (job.locationPk ? [String(job.locationPk)] : []),
        job_role: job.job_role || "",
        jobDescription: job.description || "",
        vacancies: job.vacancies ?? undefined,
        jobLink: job.jobLink || "",
        salaryMin: job.salaryMin ?? undefined,
        salaryMax: job.salaryMax ?? undefined,
        minExperience: job.minExperience ?? 0,
        maxExperience: job.maxExperience ?? 0,
        jobTypeId: job.jobTypePk ? String(job.jobTypePk) : '',
        workplaceTypeId: job.workplaceTypePk ? String(job.workplaceTypePk) : '',
        domainId: job.domainPk ? String(job.domainPk) : '',
        skillIds: job.skillIds || [],
        benefitIds: job.benefitIds || [],
        sections: job.sections?.map(s => ({
          title: s.title,
          items: s.items.map(val => ({ value: val }))
        })) || [],
      });
    }
  }, [job, form]);

  const locationOptions = useMemo(() => 
    locations.map(loc => ({ value: String(loc.id), label: `${loc.name}, ${loc.country}` })), 
  [locations]);

  const skillOptions = useMemo(() => 
    masterSkills.map(s => ({ value: s.uuid, label: s.name })), 
  [masterSkills]);

  const benefitOptions = useMemo(() => 
    masterBenefits.map(b => ({ value: b.uuid, label: b.name })), 
  [masterBenefits]);

  const onSubmit = async (data: ReferralFormValues) => {
    if (!user) {
        toast({ title: 'Not authorized', description: 'You must be logged in.' });
        return;
    }
    setIsSubmitting(true);
    try {
      const url = job ? `/api/jobs/${job.id}` : '/api/jobs';
      const method = job ? 'PUT' : 'POST';
      
      const payload = {
        title: data.jobTitle,
        companyName: data.companyName,
        locationIds: data.locationIds,
        description: data.jobDescription,
        minExperience: data.minExperience,
        maxExperience: data.maxExperience,
        jobTypeId: data.jobTypeId,
        workplaceTypeId: data.workplaceTypeId,
        domainId: data.domainId,
        job_role: data.job_role,
        vacancies: data.vacancies,
        jobLink: data.jobLink,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        isReferral: true,
        employeeId: user.uuid, // Required by API to identify the poster
        posted_at: job?.postedAt || new Date().toISOString(),
        skillIds: data.skillIds,
        benefitIds: data.benefitIds,
        sections: data.sections?.map(s => ({
          title: s.title,
          items: s.items.map(i => i.value)
        })) || []
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Referral Submission Error:", errorData);
        // Prioritize details/code from the API for better debugging
        const message = errorData.details || errorData.error || `Failed to ${job ? 'update' : 'submit'} referral`;
        throw new Error(message);
      }

      toast({
        title: `Referral ${job ? 'Updated' : 'Submitted'}!`,
        description: `Your referral job post has been successfully ${job ? 'updated' : 'submitted'}.`,
      });
      router.push('/');
    } catch (error: any) {
       toast({
        title: "Error",
        description: error.message || `There was an error ${job ? 'updating' : 'submitting'} your referral. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
      {/* Premium Header */}
      <div className="p-5 sm:p-10 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {job ? "Edit Referral Job" : "Post a Referral Job"}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
            {job 
              ? "Update the details for the job you want to refer." 
              : "Fill out the details for the job you want to refer. Your submission will be reviewed."}
          </p>
        </div>
    
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.log("Form Validation Errors:", errors))} className="p-5 sm:p-10 space-y-10 sm:space-y-12">
          
          {/* Section 1: Basic Information */}
          <section className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3 sm:gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
               <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-base sm:text-lg shadow-sm">1</div>
               <div>
                 <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Basic Information</h2>
                 <p className="text-[12px] sm:text-sm text-slate-500 font-medium">Core details about the role and company</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Acme Inc." {...field} className="h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-2 focus:ring-primary/20 transition-all" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
  
                <FormField
                  control={form.control}
                  name="job_role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">Specific Role / Designation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Frontend Specialist" {...field} className="h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-2 focus:ring-primary/20 transition-all" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">Job Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a detailed description of the role (min 50 characters)..." 
                        {...field} 
                        className="min-h-[150px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-2 focus:ring-primary/20 transition-all" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Software Engineer" {...field} className="h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-2 focus:ring-primary/20 transition-all" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vacancies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">Number of Vacancies</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1" {...field} className="h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-2 focus:ring-primary/20 transition-all" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <FormField
                  control={form.control}
                  name="jobTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">Job Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm transition-all focus:ring-2 focus:ring-primary/20">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {jobTypes.map(jt => <SelectItem key={jt.id} value={String(jt.id)}>{jt.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workplaceTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">Workplace Mode</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm transition-all focus:ring-2 focus:ring-primary/20">
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workplaceTypes.map(wt => <SelectItem key={wt.id} value={String(wt.id)}>{wt.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="domainId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">Functional Domain</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm transition-all focus:ring-2 focus:ring-primary/20">
                            <SelectValue placeholder="Select domain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {domains.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <FormField
              control={form.control}
              name="locationIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 dark:text-slate-400 font-semibold">Job Locations</FormLabel>
                  <FormControl>
                    <MultiSelectFilter
                      title="Add locations"
                      options={locationOptions}
                      selectedValues={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* Section 2: Experience & Salary */}
          <section className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3 sm:gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
               <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-base sm:text-lg shadow-sm">2</div>
               <div>
                 <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Experience & Compensation</h2>
                 <p className="text-[12px] sm:text-sm text-slate-500 font-medium">Define seniority and salary range</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <FormLabel className="text-slate-600 dark:text-slate-400 font-semibold">Experience Range (Years)</FormLabel>
                <div className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name="minExperience"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input type="number" min="0" placeholder="Min" {...field} className="h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm transition-all focus:ring-2 focus:ring-primary/20" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="text-slate-400 font-medium">to</div>
                  <FormField
                    control={form.control}
                    name="maxExperience"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input type="number" min="0" placeholder="Max" {...field} className="h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm transition-all focus:ring-2 focus:ring-primary/20" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormMessage />
              </div>

              <div className="space-y-4">
                <FormLabel className="text-slate-600 dark:text-slate-400 font-semibold text-sm">Monthly Net Salary (Optional)</FormLabel>
                <div className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name="salaryMin"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                            <Input type="number" placeholder="Min" {...field} className="h-12 pl-7 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm transition-all focus:ring-2 focus:ring-primary/20" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="text-slate-400 font-medium">to</div>
                  <FormField
                    control={form.control}
                    name="salaryMax"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                            <Input type="number" placeholder="Max" {...field} className="h-12 pl-7 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm transition-all focus:ring-2 focus:ring-primary/20" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormMessage />
              </div>
            </div>
          </section>

          {/* Section 3: Job Details */}
          <section className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3 sm:gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
               <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-base sm:text-lg shadow-sm">3</div>
               <div>
                 <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Requirements & Benefits</h2>
                 <p className="text-[12px] sm:text-sm text-slate-500 font-medium">Highlight key perks and necessary skills</p>
               </div>
            </div>
            

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <FormField
                control={form.control}
                name="skillIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-600 dark:text-slate-400 font-semibold">Required Technical Skills</FormLabel>
                    <FormControl>
                      <MultiSelectFilter
                        title="Add skills"
                        options={skillOptions}
                        selectedValues={field.value || []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="benefitIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-600 dark:text-slate-400 font-semibold">Company Benefits & Perks</FormLabel>
                    <FormControl>
                      <MultiSelectFilter
                        title="Add benefits"
                        options={benefitOptions}
                        selectedValues={field.value || []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="jobLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 dark:text-slate-400 font-semibold">External Job Link (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input placeholder="https://careers.company.com/job/123" {...field} className="h-12 pl-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm transition-all focus:ring-2 focus:ring-primary/20 font-mono text-sm" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* Section 4: Structured Content */}
          <section className="space-y-6 sm:space-y-8 p-1 rounded-3xl transition-all focus-within:ring-2 focus-within:ring-primary/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-base sm:text-lg shadow-sm border border-primary/10">4</div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Structured Content</h2>
                    <p className="text-[12px] sm:text-sm text-slate-500 font-medium">Add detailed responsibilities and role specifics</p>
                  </div>
               </div>
               <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendSection({ title: "", items: [{ value: "" }] })}
                className="h-9 px-4 rounded-lg bg-white dark:bg-slate-950 border-slate-200 hover:bg-slate-50 transition-all font-semibold"
              >
                <PlusCircle className="h-4 w-4 mr-2 text-primary" />
                Add New Section
              </Button>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {sectionFields.map((field, index) => (
                <div key={field.id} className="p-4 sm:p-8 bg-slate-50/40 dark:bg-slate-950/30 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative group transition-all hover:shadow-md hover:border-primary/20">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSection(index)}
                    className="absolute right-4 top-4 h-8 w-8 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <FormField
                    control={form.control}
                    name={`sections.${index}.title`}
                    render={({ field }) => (
                      <FormItem className="max-w-md">
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Section Title (e.g. Key Responsibilities)" 
                            className="text-lg font-bold text-slate-900 dark:text-white border-transparent bg-transparent hover:bg-white/50 focus:bg-white p-0 px-2 h-10 transition-colors" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <SectionItemsInput 
                    nestIndex={index} 
                    control={form.control} 
                    register={form.register} 
                  />
                </div>
              ))}
              
              {sectionFields.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/20">
                   <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                      <PlusCircle className="h-6 w-6" />
                   </div>
                   <p className="text-slate-500 dark:text-slate-400 font-medium text-center">
                    Add detailed sections to list specific requirements, technical stacks, or daily duties.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Action Footer */}
          <div className="pt-10 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-8 h-12 text-slate-500 font-bold hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full sm:w-auto h-12 px-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-xl shadow-primary/20 active:scale-95"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  job ? <Save className="h-5 w-5 mr-2" /> : <ThumbsUp className="h-5 w-5 mr-2" />
                )}
                {job ? "Update Referral Listing" : "Submit Referral Post"}
              </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
