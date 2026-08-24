
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Control } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, Briefcase, Save, PlusCircle, Trash2, Link as LinkIcon, GripVertical, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { JobType, WorkplaceType, Job, Location, MasterSkill, CompanySize } from "@/lib/types";
import { useUser } from "@/contexts/user-context";
import { MultiSelectFilter } from "./multi-select-filter";
import { SUPPORTED_CURRENCIES } from "@/utils/currency";
import { onFormInvalid } from "@/lib/form-toast-utils";

// ─── Schema ────────────────────────────────────────────────────────────────

const sectionSchema = z.object({
  title: z.string().min(1, "Section heading cannot be empty."),
  items: z.array(z.object({ value: z.string().min(1, "Point cannot be empty.") })),
});

// We'll define the dynamic schema inside the component or via a function

type JobFormValues = any; // We'll use the type from the schema inside

// ─── Nested Section Items ──────────────────────────────────────────────────

function SectionItemsInput({ sectionIndex, control }: { sectionIndex: number; control: Control<JobFormValues> }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.items`,
  });

  return (
    <div className="space-y-2 mt-2">
      {fields.map((field, itemIndex) => (
        <FormField
          key={field.id}
          control={control}
          name={`sections.${sectionIndex}.items.${itemIndex}.value`}
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <FormControl>
                <Input {...field} placeholder={`Point ${itemIndex + 1}`} className="flex-1" />
              </FormControl>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(itemIndex)}>
                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground"
        onClick={() => append({ value: "" })}
      >
        <PlusCircle className="mr-2 h-3.5 w-3.5" />
        Add point
      </Button>
    </div>
  );
}

// ─── Main Form ─────────────────────────────────────────────────────────────

const TagInput = ({ value = [], onChange, placeholder }: { value?: string[], onChange: (vals: string[]) => void, placeholder: string }) => {
  const [inputVal, setInputVal] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = inputVal.trim();
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed]);
        setInputVal("");
      }
    }
  };

  const handleRemove = (tagToRemove: string) => {
    onChange(value.filter(t => t !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {(value || []).map(tag => (
          <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 rounded-full text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/60">
            {tag}
            <button type="button" onClick={() => handleRemove(tag)} className="hover:text-rose-500 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <Input
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
};

interface JobFormProps {
  job?: Job | null;
}

export function JobForm({ job }: JobFormProps) {
  const { user } = useUser();
  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

  const formSchema = useMemo(() => z.object({
    jobTitle: z.string().min(5, "Job title must be at least 5 characters long."),
    jobId: z.string().optional(),
    companyName: z.string().min(2, "Company name must be at least 2 characters long."),
    locationIds: z.array(z.string()).min(1, "At least one location is required."),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    job_role: z.string().min(2, "Role must be at least 2 characters long."),
    industry: z.string().optional(),
    jobFunction: z.string().optional(),
    jobDescription: z.string().min(50, "Job description must be at least 50 characters long."),
    minExperience: z.coerce.number().min(0, "Min experience must be 0 or more."),
    maxExperience: z.coerce.number().min(0, "Max experience must be 0 or more."),
    jobTypeId: z.string().min(1, "Please select a job type."),
    workplaceTypeId: z.string().min(1, "Please select a workplace type."),
    remoteType: z.string().default("onsite"),
    domainId: z.string().optional().or(z.literal('')),
    vacancies: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().min(1, "Vacancies must be at least 1.").optional()),
    companyOverview: z.string().optional(),
    companyWebsite: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
    companySizeId: z.string().optional().or(z.literal('')),
    companyLinkedinUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
    address: z.string().optional(),
    salaryMin: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().min(0, "Min salary must be 0 or more.").optional()),
    salaryMax: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().min(0, "Max salary must be 0 or more.").optional()),
    salaryCurrency: z.string().default("INR"),
    jobLink: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
    skillIds: z.array(z.string()).min(1, "At least one required skill is required."),
    benefitIds: z.array(z.string()).optional(),
    visaSponsorship: z.boolean().default(false),
    workAuthorizationRequirement: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    companyVerification: z.boolean().default(false),
    companyRating: z.coerce.number().min(0).max(5).default(5.0),
    sections: z.array(sectionSchema).optional(),
  }).refine(data => data.maxExperience >= data.minExperience, {
      message: "Max experience cannot be less than min experience",
      path: ["maxExperience"]
  }), [isAdmin]);

  type JobFormValues = z.infer<typeof formSchema>;

  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [workplaceTypes, setWorkplaceTypes] = useState<WorkplaceType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [companySizes, setCompanySizes] = useState<CompanySize[]>([]);
  const [masterSkills, setMasterSkills] = useState<MasterSkill[]>([]);
  const [masterBenefits, setMasterBenefits] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchSelectData = async () => {
        try {
            const [jobTypesRes, workplaceTypesRes, locationsRes, companySizesRes] = await Promise.all([
                fetch('/api/job-types'),
                fetch('/api/workplace-types'),
                fetch('/api/locations'),
                fetch('/api/company-sizes')
            ]);
            
            setWorkplaceTypes(await workplaceTypesRes.json());
            setLocations(await locationsRes.json());
            setCompanySizes(await companySizesRes.json());
            
            const fetchedJobTypes = await jobTypesRes.json();
            setJobTypes(fetchedJobTypes);
            
            const skillsRes = await fetch('/api/skills');
            if (skillsRes.ok) setMasterSkills(await skillsRes.json());

            const benefitsRes = await fetch('/api/benefits');
            if (benefitsRes.ok) setMasterBenefits(await benefitsRes.json());
        } catch (error) {
            console.error("Failed to fetch form select data", error);
            toast({
                title: "Error fetching form data",
                description: "Could not load all select options. Please try again later.",
                variant: "destructive",
            });
        }
    };
    fetchSelectData();
  }, [toast]);



  const form = useForm<JobFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: job?.jobId ? job.title : "",
      jobId: job?.jobId || "",
      companyName: job?.companyName || (user?.role === 'Recruiter' ? user.companyName : "") || "",
      locationIds: job?.locationIds || (job?.locationId ? [job.locationId] : []),
      country: job?.country || "",
      state: job?.state || "",
      city: job?.city || "",
      job_role: job?.job_role || "",
      industry: job?.industry || "",
      jobFunction: job?.jobFunction || "",
      jobDescription: job?.description || "",
      vacancies: job?.vacancies ?? undefined,
      companyOverview: (job as any)?.companyOverview || (user?.role === 'Recruiter' ? user.companyOverview : "") || "",
      companyWebsite: (job as any)?.companyWebsite || (user?.role === 'Recruiter' ? user.companyWebsite : "") || "",
      companySizeId: job?.companySizeId || (user?.role === 'Recruiter' ? user.companySizeId : "") || "",
      companyLinkedinUrl: job?.companyLinkedinUrl || (user?.role === 'Recruiter' ? user.companyLinkedinUrl : "") || "",
      address: (job as any)?.address || (user?.role === 'Recruiter' ? user.companyAddress : "") || "",
      salaryMin: job?.salaryMin ?? undefined,
      salaryMax: job?.salaryMax ?? undefined,
      salaryCurrency: job?.salaryCurrency || job?.currency || "INR",
      remoteType: job?.remoteType || "onsite",
      jobLink: job?.jobLink || "",
      minExperience: job?.minExperience ?? 0,
      maxExperience: job?.maxExperience ?? 0,
      jobTypeId: job?.jobTypeId || "",
      workplaceTypeId: job?.workplaceTypeId || "",
      domainId: job?.domainId || "",
      skillIds: job?.skillIds || [],
      benefitIds: job?.benefitIds || [],
      visaSponsorship: job?.visaSponsorship ?? (job as any)?.visa_sponsorship ?? false,
      workAuthorizationRequirement: job?.workAuthorizationRequirement || (job as any)?.work_authorization_requirement || [],
      languages: job?.languages || [],
      companyVerification: job?.companyVerification ?? (job as any)?.company_verification ?? false,
      companyRating: job?.companyRating ?? (job as any)?.company_rating ?? 5.0,
      sections: job?.sections?.map((s: any) => ({ title: s.title, items: (s.items || []).map((v: any) => ({ value: v })) })) ,
    },
  });

  // Sections field array
  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
    control: form.control,
    name: "sections",
  });

   useEffect(() => {
    if (job) {
      const builtSections = job?.sections?.map((s: any) => ({ title: s.title, items: (s.items || []).map((v: any) => ({ value: v })) }));
      form.reset({
        jobTitle: job.title || "",
        jobId: job.jobId || "",
        companyName: job.companyName || "",
        locationIds: job.locationIds || (job.locationId ? [job.locationId] : []),
        country: job.country || "",
        state: job.state || "",
        city: job.city || "",
        job_role: job.job_role || "",
        industry: job.industry || "",
        jobFunction: job.jobFunction || "",
        jobDescription: job.description || "",
        vacancies: job.vacancies ?? undefined,
        companyOverview: (job as any)?.companyOverview || "",
        companyWebsite: (job as any)?.companyWebsite || "",
        companySizeId: job.companySizeId || (user?.role === 'Recruiter' ? user.companySizeId : "") || "",
        companyLinkedinUrl: job.companyLinkedinUrl || (user?.role === 'Recruiter' ? user.companyLinkedinUrl : "") || "",
        address: (job as any)?.address || "",
        salaryMin: job.salaryMin ?? undefined,
        salaryMax: job.salaryMax ?? undefined,
        salaryCurrency: job.salaryCurrency || job.currency || "INR",
        remoteType: job.remoteType || "onsite",
        jobLink: job.id ? String(job.jobLink || "") : "",
        minExperience: job.minExperience ?? 0,
        maxExperience: job.maxExperience ?? 0,
        jobTypeId: job.jobTypeId || "",
        workplaceTypeId: job.workplaceTypeId || "",
        domainId: job.domainId || "",
        skillIds: job.skillIds || [],
        benefitIds: job.benefitIds || [],
        visaSponsorship: job.visaSponsorship ?? (job as any)?.visa_sponsorship ?? false,
        workAuthorizationRequirement: job.workAuthorizationRequirement || (job as any)?.work_authorization_requirement || [],
        languages: job.languages || [],
        companyVerification: job.companyVerification ?? (job as any)?.company_verification ?? false,
        companyRating: job.companyRating ?? (job as any)?.company_rating ?? 5.0,
        sections: builtSections,
      });
    }
  }, [job, form, user]);

  const locationOptions = useMemo(() => 
    locations.map(loc => ({ value: loc.uuid || String(loc.id), label: `${loc.name}, ${loc.country}` })), 
  [locations]);

  const skillOptions = useMemo(() =>
    masterSkills.map(s => ({ value: s.uuid || String(s.id), label: s.name })),
  [masterSkills]);

  const benefitOptions = useMemo(() =>
    masterBenefits.map(b => ({ value: (b as any).uuid || String(b.id), label: b.name })),
  [masterBenefits]);

  const onSubmit = async (data: JobFormValues) => {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to post a job.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      const url = job ? `/api/jobs/${job.id}` : '/api/jobs';
      const method = job ? 'PUT' : 'POST';
      
      const payload = {
        ...data,
        jobId: data.jobId,
        title: data.jobTitle,
        description: data.jobDescription,
        job_role: data.job_role,
        country: data.country,
        state: data.state,
        city: data.city,
        remoteType: data.remoteType,
        salaryCurrency: data.salaryCurrency,
        industry: data.industry,
        jobFunction: data.jobFunction,
        visaSponsorship: data.visaSponsorship,
        workAuthorizationRequirement: data.workAuthorizationRequirement || [],
        languages: data.languages || [],
        companyVerification: data.companyVerification,
        companyRating: data.companyRating,
        isReferral: false,
        recruiterId: user.role === 'Recruiter' ? user.uuid : undefined,
        adminId: (user.role === 'Admin' || user.role === 'Super Admin') ? user.uuid : undefined,
        postedAt: job?.postedAt || new Date().toISOString(),
        sections: data.sections?.map(s => ({ title: s.title, items: s.items.map(i => i.value) })) || [],
        benefitIds: data.benefitIds || [],
        skillIds: data.skillIds || [],
        companyOverview: data.companyOverview,
        companyWebsite: data.companyWebsite,
        companySizeId: data.companySizeId === '' ? null : data.companySizeId,
        companyLinkedinUrl: data.companyLinkedinUrl,
        address: data.address,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${job ? 'update' : 'post'} job`);
      }

      toast({
        title: `Job ${job ? 'Updated' : 'Posted'}!`,
        description: `Your job posting has been successfully ${job ? 'updated' : 'posted'}.`,
      });
      router.push('/');
    } catch (error: any) {
       toast({
        title: "Error",
        description: error.message || `There was an error ${job ? 'updating' : 'posting'} your job. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, (err) => onFormInvalid(err, toast))} className="space-y-4">
        <FormField
          control={form.control}
          name="jobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Senior Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="jobId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job ID (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. JOB-1234" {...field} />
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
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Full Stack Developer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

          <div className="space-y-4 border rounded-xl p-6 bg-slate-50/30">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Company Details
            </h3>
            
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Acme Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Website</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-10" placeholder="https://example.com" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyLinkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company LinkedIn URL</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-10" placeholder="https://linkedin.com/company/..." {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="companySizeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Size</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companySizes.map((size) => (
                        <SelectItem key={size.uuid || size.id} value={size.uuid || String(size.id)}>
                          {size.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyOverview"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Overview</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about the company..." 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Office Address</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 123 Business Park, City" {...field} />
                  </FormControl>
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
                <FormLabel>Job Locations (Multiple Selection Allowed)</FormLabel>
                <FormControl>
                    <MultiSelectFilter
                        title="Locations"
                        options={locationOptions}
                        selectedValues={field.value}
                        onChange={field.onChange}
                    />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 items-center">
          <FormField
            control={form.control}
            name="salaryCurrency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary Currency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "INR"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {SUPPORTED_CURRENCIES.map((item) => (
                      <SelectItem key={item.code} value={item.code}>
                        {item.flag} {item.code} ({item.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visaSponsorship"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 mt-2">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">Visa Sponsorship</FormLabel>
                  <p className="text-xs text-slate-500">Enable if work visa sponsorship is offered</p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="jobDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the role and responsibilities..." className="min-h-[120px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Required Skills */}
        <FormField
          control={form.control}
          name="skillIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <FormControl>
                <MultiSelectFilter
                  title="Skills"
                  options={skillOptions}
                  selectedValues={field.value || []}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Dynamic Sections ─────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel className="text-base">
              Job Sections{" "}
              <span className="text-xs font-normal text-muted-foreground">({sectionFields.length}/5)</span>
            </FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={sectionFields.length >= 5}
              onClick={() => appendSection({ title: "", items: [{ value: "" }] })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {sectionFields.length >= 5 ? "Max 5 sections" : "Add Section"}
            </Button>
          </div>

          {sectionFields.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-muted-foreground text-sm">
              No sections yet. Click <strong>Add Section</strong> to add structured content like<br />
              &quot;Requirements&quot;, &quot;Key Responsibilities&quot;, &quot;Qualifications&quot;, etc.
            </div>
          )}

          {sectionFields.map((section, sectionIndex) => (
            <div key={section.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
              {/* Section header row */}
              <div className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name={`sections.${sectionIndex}.title`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Section heading (e.g. Key Responsibilities)"
                          className="font-semibold bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSection(sectionIndex)}
                  title="Remove section"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              {/* Section items (nested) */}
              <SectionItemsInput sectionIndex={sectionIndex} control={form.control} />
            </div>
          ))}
        </div>

        {/* Benefits */}
        <FormField
          control={form.control}
          name="benefitIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Benefits (Optional)</FormLabel>
              <FormControl>
                <MultiSelectFilter
                  title="Benefits"
                  options={benefitOptions}
                  selectedValues={field.value || []}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <FormField
            control={form.control}
            name="jobTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employment Type</FormLabel>
                <Select onValueChange={field.onChange} value={String(field.value || '')}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.isArray(jobTypes) && jobTypes.map(jt => <SelectItem key={jt.uuid || jt.id} value={jt.uuid || String(jt.id)}>{jt.name}</SelectItem>)}
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
                <FormLabel>Workplace Type</FormLabel>
                <Select onValueChange={field.onChange} value={String(field.value || '')}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select workplace type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                     {Array.isArray(workplaceTypes) && workplaceTypes.map(wt => <SelectItem key={wt.uuid || wt.id} value={wt.uuid || String(wt.id)}>{wt.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Experience (Years)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="maxExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Experience (Years)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vacancies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Vacancies</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="salaryMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Yearly Net Salary (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="e.g. 600000" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salaryMax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Yearly Net Salary (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="e.g. 1200000" {...field} value={field.value || ''} />
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
                <FormLabel>External Job Link (Optional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="https://company.com/careers/job-id" className="pl-8" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end pt-4">
           <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="animate-spin mr-2 h-4 w-4"/> : (job ? <Save className="mr-2 h-4 w-4" /> : <Briefcase className="mr-2 h-4 w-4" />)}
              {job ? "Save Changes" : "Post Job"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
