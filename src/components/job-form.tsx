
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
import { LoaderCircle, Briefcase, MapPin, Save, PlusCircle, Trash2, Link as LinkIcon, GripVertical, X, Check, ChevronsUpDown, Globe, Building2, FileText, Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import type { JobType, WorkplaceType, Job, MasterSkill, CompanySize } from "@/lib/types";
import { useUser } from "@/contexts/user-context";
import { MultiSelectFilter } from "./multi-select-filter";
import { SUPPORTED_CURRENCIES } from "@/utils/currency";
import { onFormInvalid } from "@/lib/form-toast-utils";
import { supabase } from "@/lib/supabase-client";
import { WORLDWIDE_LOCATION, isWorldwideCountryId } from "@/lib/worldwide";
import { JOB_FORM_STEPS, LAST_JOB_FORM_STEP, firstStepWithError } from "@/lib/job-form-steps";

const BLANK_LOCATION = { countryId: null, stateId: null, cityId: null, country: "", state: "", city: "" };

/** The worldwide sentinel row is represented by the toggle, not by the picker. */
const withoutWorldwide = (locs: any[]) => {
  const real = (locs || []).filter(l => !isWorldwideCountryId(l?.countryId));
  return real.length > 0 ? real : [{ ...BLANK_LOCATION }];
};

// ─── Wizard steps ──────────────────────────────────────────────────────────

/** Icons live here rather than in the shared step data, which stays pure. */
const STEP_ICONS: Record<string, typeof Briefcase> = {
  role: Briefcase,
  company: Building2,
  location: MapPin,
  details: FileText,
  package: Wallet,
};

const STEPS = JOB_FORM_STEPS;
const LAST_STEP = LAST_JOB_FORM_STEP;

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

function SearchableCombobox({
  options,
  value,
  onSelect,
  placeholder,
  disabled = false,
  emptyText = "No results found."
}: {
  options: { id: number; name: string }[];
  value?: number | null;
  onSelect: (option: { id: number; name: string }) => void;
  placeholder: string;
  disabled?: boolean;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal text-left h-10 px-3 bg-background"
        >
          <span className="truncate">
            {selectedOption ? selectedOption.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList className="max-h-60 overflow-y-auto">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.name}
                  onSelect={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

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
    locations: z.array(z.object({
      countryId: z.coerce.number().optional().nullable(),
      stateId: z.coerce.number().optional().nullable(),
      cityId: z.coerce.number().optional().nullable(),
      country: z.string().optional(),
      state: z.string().optional(),
      city: z.string().optional(),
    })).min(1, "At least one location is required."),
    openToAllCountries: z.boolean().default(false),
    countryId: z.coerce.number().optional().nullable(),
    stateId: z.coerce.number().optional().nullable(),
    cityId: z.coerce.number().optional().nullable(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
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
  }).refine(
      // A location row with no country cannot be stored, so it is caught here
      // instead of failing at the API. The worldwide toggle replaces the picker.
      data => data.openToAllCountries || (data.locations || []).every(l => !!l.countryId),
      {
        message: "Select a country for every location, or mark the role open to all countries.",
        path: ["locations"]
      }
  ), [isAdmin]);

  type JobFormValues = z.infer<typeof formSchema>;

  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [workplaceTypes, setWorkplaceTypes] = useState<WorkplaceType[]>([]);
  const [companySizes, setCompanySizes] = useState<CompanySize[]>([]);
  const [masterSkills, setMasterSkills] = useState<MasterSkill[]>([]);
  const [masterBenefits, setMasterBenefits] = useState<{ id: string; name: string }[]>([]);

  const [dbCountries, setDbCountries] = useState<{ id: number; name: string }[]>([]);
  const [statesByCountry, setStatesByCountry] = useState<Record<number, { id: number; name: string }[]>>({});
  const [citiesByState, setCitiesByState] = useState<Record<number, { id: number; name: string }[]>>({});

  const fetchStatesForCountry = async (countryId: number) => {
    if (!countryId || statesByCountry[countryId]) return;
    try {
      const res = await fetch(`/api/geo?type=states&countryId=${countryId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setStatesByCountry(prev => ({ ...prev, [countryId]: data }));
        }
      }
    } catch (e) {}
  };

  const fetchCitiesForState = async (stateId: number) => {
    if (!stateId || citiesByState[stateId]) return;
    try {
      const res = await fetch(`/api/geo?type=cities&stateId=${stateId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCitiesByState(prev => ({ ...prev, [stateId]: data }));
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    const fetchSelectData = async () => {
        // Each list is loaded independently. They used to run in one await
        // chain, so a single bad response left every list after it — skills,
        // benefits, countries — silently empty behind one generic toast.
        const loadList = async <T,>(label: string, url: string, apply: (rows: T[]) => void) => {
            // One retry, because a transient hiccup (a rate-limit burst while
            // the rest of the page is also calling the API) used to leave the
            // dropdown permanently empty with nothing said about it.
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const rows = await res.json();
                    if (!Array.isArray(rows)) throw new Error('expected a list');
                    apply(rows);
                    return null;
                } catch (e: any) {
                    console.error(
                        `[JOB_FORM] Could not load ${label} from ${url} (attempt ${attempt + 1}):`,
                        e?.message || e
                    );
                    if (attempt === 0) await new Promise(r => setTimeout(r, 600));
                }
            }
            return label;
        };

        const failed = (await Promise.all([
            loadList<JobType>('employment types', '/api/job-types', setJobTypes),
            loadList<WorkplaceType>('workplace types', '/api/workplace-types', setWorkplaceTypes),
            loadList<CompanySize>('company sizes', '/api/company-sizes', setCompanySizes),
            loadList<MasterSkill>('skills', '/api/skills', setMasterSkills),
            loadList<{ id: string; name: string }>('benefits', '/api/benefits', setMasterBenefits),
            loadList<{ id: number; name: string }>('countries', '/api/geo?type=countries', setDbCountries),
        ])).filter(Boolean);

        if (failed.length > 0) {
            toast({
                title: "Some options could not be loaded",
                description: `Could not load ${failed.join(', ')}. Refresh the page to try again.`,
                variant: "destructive",
            });
        }
    };
    fetchSelectData();
  }, [toast]);



  const jobIsWorldwide = Boolean(
    (job as any)?.openToAllCountries ??
    (job as any)?.jobLocations?.some((l: any) => isWorldwideCountryId(l?.countryId))
  );

  const initialLocations = (job as any)?.jobLocations?.length
    ? withoutWorldwide((job as any).jobLocations)
    : [{
        countryId: (job as any)?.countryId || null,
        stateId: (job as any)?.stateId || null,
        cityId: (job as any)?.cityId || null,
        country: job?.country || "",
        state: job?.state || "",
        city: job?.city || "",
      }];

  const form = useForm<JobFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: job?.jobId ? job.title : "",
      jobId: job?.jobId || "",
      companyName: job?.companyName || (user?.role === 'Recruiter' ? user.companyName : "") || "",
      locations: initialLocations,
      openToAllCountries: jobIsWorldwide,
      countryId: (job as any)?.countryId || null,
      stateId: (job as any)?.stateId || null,
      cityId: (job as any)?.cityId || null,
      country: job?.country || "",
      state: job?.state || "",
      city: job?.city || "",
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

  const { fields: locationFields, append: appendLocation, remove: removeLocation } = useFieldArray({
    control: form.control,
    name: "locations",
  });

  // "Open to all countries" is only offered for a remote role — an on-site or
  // hybrid job has a place people report to. The API enforces the same rule.
  const selectedWorkplaceTypeId = form.watch("workplaceTypeId");
  const openToAllCountries = form.watch("openToAllCountries");

  const isRemoteSelected = useMemo(() => {
    const selected = workplaceTypes.find(
      wt => String(wt.uuid || wt.id) === String(selectedWorkplaceTypeId || "")
    );
    return String(selected?.name || "").toLowerCase().includes("remote");
  }, [workplaceTypes, selectedWorkplaceTypeId]);

  // Switching away from Remote drops the toggle, so a hybrid or on-site job can
  // never be submitted as worldwide.
  useEffect(() => {
    if (!isRemoteSelected && form.getValues("openToAllCountries")) {
      form.setValue("openToAllCountries", false, { shouldValidate: true, shouldDirty: true });
    }
  }, [isRemoteSelected, form]);

  // Sections field array
  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
    control: form.control,
    name: "sections",
  });

   useEffect(() => {
    if (job) {
      const builtSections = job?.sections?.map((s: any) => ({ title: s.title, items: (s.items || []).map((v: any) => ({ value: v })) }));
      const resetLocations = (job as any)?.jobLocations?.length
        ? withoutWorldwide((job as any).jobLocations)
        : [{
            countryId: (job as any)?.countryId || null,
            stateId: (job as any)?.stateId || null,
            cityId: (job as any)?.cityId || null,
            country: job.country || "",
            state: job.state || "",
            city: job.city || "",
          }];

      form.reset({
        jobTitle: job.title || "",
        jobId: job.jobId || "",
        companyName: job.companyName || "",
        locations: resetLocations,
        openToAllCountries: jobIsWorldwide,
        country: job.country || "",
        state: job.state || "",
        city: job.city || "",
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
      
      // A worldwide role is stored as the single sentinel location row, so the
      // country pickers are ignored whenever the toggle is on.
      const isWorldwide = Boolean(data.openToAllCountries);
      const effectiveLocations = isWorldwide ? [{ ...WORLDWIDE_LOCATION }] : (data.locations || []);
      const primaryLoc = effectiveLocations[0] || {};
      let finalBody: Record<string, any> = {};

      if (job) {
        // Delta computation: only include fields that differ from original `job`
        const norm = (v: any) => (v === undefined || v === null || v === '' ? null : String(v).trim());
        const normNum = (v: any) => (v === undefined || v === null || v === '' ? null : Number(v));

        if (norm(data.jobTitle) !== norm(job.title)) finalBody.title = data.jobTitle;
        if (norm(data.jobId) !== norm(job.jobId)) finalBody.jobId = data.jobId;
        if (norm(data.jobDescription) !== norm(job.description)) finalBody.description = data.jobDescription;
        if (norm(data.companyName) !== norm(job.companyName)) finalBody.companyName = data.companyName;
        if (norm(data.jobTypeId) !== norm(job.jobTypeId)) finalBody.jobTypeId = data.jobTypeId;
        if (norm(data.workplaceTypeId) !== norm(job.workplaceTypeId)) finalBody.workplaceTypeId = data.workplaceTypeId;
        if (norm(data.companySizeId) !== norm(job.companySizeId)) finalBody.companySizeId = data.companySizeId === '' ? null : data.companySizeId;
        if (normNum(data.salaryMin) !== normNum(job.salaryMin)) finalBody.salaryMin = data.salaryMin;
        if (normNum(data.salaryMax) !== normNum(job.salaryMax)) finalBody.salaryMax = data.salaryMax;
        if (norm(data.salaryCurrency) !== norm(job.salaryCurrency || job.currency)) finalBody.salaryCurrency = data.salaryCurrency;
        if (normNum(data.minExperience) !== normNum(job.minExperience)) finalBody.minExperience = data.minExperience;
        if (normNum(data.maxExperience) !== normNum(job.maxExperience)) finalBody.maxExperience = data.maxExperience;
        if (normNum(data.vacancies) !== normNum(job.vacancies)) finalBody.vacancies = data.vacancies;
        if (norm(data.remoteType) !== norm(job.remoteType)) finalBody.remoteType = data.remoteType;
        if (Boolean(data.visaSponsorship) !== Boolean(job.visaSponsorship ?? (job as any).visa_sponsorship)) {
          finalBody.visaSponsorship = data.visaSponsorship;
        }
        if (norm(data.companyOverview) !== norm((job as any).companyOverview)) finalBody.companyOverview = data.companyOverview;
        if (norm(data.companyWebsite) !== norm((job as any).companyWebsite)) finalBody.companyWebsite = data.companyWebsite;
        if (norm(data.companyLinkedinUrl) !== norm(job.companyLinkedinUrl)) finalBody.companyLinkedinUrl = data.companyLinkedinUrl;
        if (norm(data.address) !== norm((job as any).address)) finalBody.address = data.address;

        // Compare skillIds
        const origSkills = [...(job.skillIds || [])].sort().join(',');
        const newSkills = [...(data.skillIds || [])].sort().join(',');
        if (origSkills !== newSkills) finalBody.skillIds = data.skillIds || [];

        // Compare benefitIds
        const origBenefits = [...(job.benefitIds || [])].sort().join(',');
        const newBenefits = [...(data.benefitIds || [])].sort().join(',');
        if (origBenefits !== newBenefits) finalBody.benefitIds = data.benefitIds || [];

        // Compare locations. Only the ids matter — the names are labels the API
        // re-resolves — so a changed label alone does not count as an edit.
        const oldLocs = (job as any).jobLocations || [];
        const normLocs = (locs: any[]) => JSON.stringify(locs.map(l => ({
          countryId: l.countryId ?? null,
          stateId: l.stateId ?? null,
          cityId: l.cityId ?? null,
        })));
        if (normLocs(effectiveLocations) !== normLocs(oldLocs) || isWorldwide !== jobIsWorldwide) {
          finalBody.locations = effectiveLocations;
          finalBody.openToAllCountries = isWorldwide;
          finalBody.countryId = primaryLoc.countryId ?? data.countryId ?? null;
          finalBody.stateId = primaryLoc.stateId ?? data.stateId ?? null;
          finalBody.cityId = primaryLoc.cityId ?? data.cityId ?? null;
          finalBody.country = primaryLoc.country || data.country || "";
          finalBody.state = primaryLoc.state || data.state || "";
          finalBody.city = primaryLoc.city || data.city || "";
        }

        // Compare sections
        const formattedNewSections = data.sections?.map((s: any) => ({ title: s.title, items: s.items.map((i: any) => i.value) })) || [];
        const oldSections = job.sections || [];
        if (JSON.stringify(formattedNewSections) !== JSON.stringify(oldSections)) {
          finalBody.sections = formattedNewSections;
        }

        if (Object.keys(finalBody).length === 0) {
          toast({
            title: "No Changes Detected",
            description: "The job posting is already up to date.",
          });
          router.push('/');
          return;
        }
      } else {
        // Creation payload
        finalBody = {
          ...data,
          jobId: data.jobId,
          title: data.jobTitle,
          description: data.jobDescription,
          locations: effectiveLocations,
          openToAllCountries: isWorldwide,
          countryId: primaryLoc.countryId ?? data.countryId ?? null,
          stateId: primaryLoc.stateId ?? data.stateId ?? null,
          cityId: primaryLoc.cityId ?? data.cityId ?? null,
          country: primaryLoc.country || data.country || "",
          state: primaryLoc.state || data.state || "",
          city: primaryLoc.city || data.city || "",
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
          postedAt: new Date().toISOString(),
          sections: data.sections?.map((s: any) => ({ title: s.title, items: s.items.map((i: any) => i.value) })) || [],
          benefitIds: data.benefitIds || [],
          skillIds: data.skillIds || [],
          companyOverview: data.companyOverview,
          companyWebsite: data.companyWebsite,
          companySizeId: data.companySizeId === '' ? null : data.companySizeId,
          companyLinkedinUrl: data.companyLinkedinUrl,
          address: data.address,
        };
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(finalBody),
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

  // ─── Step navigation ─────────────────────────────────────────────────────
  // Editing starts with every step reachable, since the job already holds the
  // answers; a new post unlocks them one at a time.
  const [currentStep, setCurrentStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(job ? LAST_STEP : 0);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (job) setFurthestStep(LAST_STEP);
  }, [job]);

  const isLastStep = currentStep === LAST_STEP;
  const step = STEPS[currentStep];

  const goToStep = (index: number) => {
    setCurrentStep(index);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNext = async () => {
    // Only this step's fields, so an untouched later step cannot block you.
    const valid = await form.trigger(STEPS[currentStep].fields as any, { shouldFocus: true });
    if (!valid) return;
    const next = Math.min(currentStep + 1, LAST_STEP);
    setFurthestStep(f => Math.max(f, next));
    goToStep(next);
  };

  const handleBack = () => goToStep(Math.max(0, currentStep - 1));

  // A submit that fails validation lands you on the step holding the problem,
  // rather than on a step with no visible error.
  const handleInvalid = (errors: Record<string, any>) => {
    const firstStep = firstStepWithError(Object.keys(errors));
    if (firstStep !== null && firstStep !== currentStep) {
      setFurthestStep(f => Math.max(f, firstStep));
      goToStep(firstStep);
    }
    onFormInvalid(errors, toast);
  };

  // Posting only ever happens here, from an explicit click on the final button
  // or Enter on the final step. Nothing else in the form can trigger it.
  //
  // The ref, not the isSubmitting state, is what makes a double click safe: two
  // clicks in the same tick both run before React re-renders the button as
  // disabled, and each one would create a separate job.
  const submittingRef = useRef(false);

  const submitNow = () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    void form
      .handleSubmit(onSubmit, handleInvalid)()
      .finally(() => {
        submittingRef.current = false;
      });
  };

  // The browser must never post this form itself. Enter anywhere would
  // otherwise submit a half-filled post, so it advances a step instead until
  // the last one.
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLastStep) {
      handleNext();
      return;
    }
    submitNow();
  };

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div ref={topRef} className="scroll-mt-24" />

        {/* ── Stepper ────────────────────────────────────────────────── */}
        <nav aria-label="Job posting steps" className="pb-2">
          <ol className="flex items-center gap-1 sm:gap-2">
            {STEPS.map((s, idx) => {
              const StepIcon = STEP_ICONS[s.id];
              const isCurrent = idx === currentStep;
              const isDone = idx < currentStep;
              const isReachable = idx <= furthestStep;

              return (
                <li key={s.id} className="flex flex-1 items-center gap-1 sm:gap-2 min-w-0">
                  <button
                    type="button"
                    onClick={() => isReachable && goToStep(idx)}
                    disabled={!isReachable}
                    aria-current={isCurrent ? "step" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-full py-1 pl-1 pr-1 sm:pr-3 transition-colors min-w-0",
                      isReachable ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" : "cursor-not-allowed opacity-60"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                        isCurrent && "border-primary bg-primary text-primary-foreground",
                        isDone && "border-primary bg-primary/10 text-primary",
                        !isCurrent && !isDone && "border-slate-300 text-slate-500 dark:border-slate-700"
                      )}
                    >
                      {isDone ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                    </span>
                    <span
                      className={cn(
                        "truncate text-xs font-semibold sm:text-sm",
                        isCurrent ? "text-foreground" : "text-muted-foreground",
                        // Only the active label survives on a narrow screen.
                        !isCurrent && "hidden sm:inline"
                      )}
                    >
                      {s.title}
                    </span>
                  </button>
                  {idx < LAST_STEP && (
                    <span
                      aria-hidden
                      className={cn(
                        "h-px flex-1 min-w-2 transition-colors",
                        idx < currentStep ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="border-b pb-3">
          <h2 className="text-lg font-semibold">
            <span className="text-muted-foreground font-normal mr-2 text-sm">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            {step.title}
          </h2>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </div>

        {/* ── Step 1: Role ───────────────────────────────────────────── */}
        <div className={cn("space-y-4", currentStep !== 0 && "hidden")}>
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
        </div>

        {/* ── Step 2: Company ────────────────────────────────────────── */}
        <div className={cn("space-y-4", currentStep !== 1 && "hidden")}>
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
        </div>

        {/* ── Step 3: Location ───────────────────────────────────────── */}
        <div className={cn("space-y-4", currentStep !== 2 && "hidden")}>
          <div className="space-y-4 border rounded-xl p-6 bg-slate-50/30">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Locations
              </h3>
              {!openToAllCountries && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendLocation({ ...BLANK_LOCATION })}
                  className="flex items-center gap-1.5 text-xs font-semibold"
                >
                  <PlusCircle className="w-4 h-4" /> Add Location
                </Button>
              )}
            </div>

            {isRemoteSelected && (
              <FormField
                control={form.control}
                name="openToAllCountries"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 rounded-xl border bg-white dark:bg-slate-900 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                        <Globe className="h-4 w-4 text-primary" />
                        Open to all countries
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Hire from anywhere. Candidates in every country see this role, whatever
                        country they have set on their profile. Leave this off to hire in
                        specific countries only.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Open to all countries"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {openToAllCountries ? (
              <div className="flex items-start gap-3 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                <Globe className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>
                  This role is listed as <span className="font-semibold text-foreground">Worldwide</span>.
                  Turn the toggle off to pick specific countries instead.
                </span>
              </div>
            ) : (
            <div className="space-y-4">
              {locationFields.map((item, idx) => {
                const currentCountryId = form.watch(`locations.${idx}.countryId`);
                const currentStateId = form.watch(`locations.${idx}.stateId`);
                const countryStates = currentCountryId ? (statesByCountry[currentCountryId] || []) : [];
                const stateCities = currentStateId ? (citiesByState[currentStateId] || []) : [];

                return (
                  <div key={item.id} className="p-4 border rounded-xl bg-white dark:bg-slate-900 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Location #{idx + 1}
                      </span>
                      {locationFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLocation(idx)}
                          className="text-red-500 hover:text-red-700 h-7 w-7 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Country Select */}
                      <FormField
                        control={form.control}
                        name={`locations.${idx}.countryId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium">Country</FormLabel>
                            <FormControl>
                              <SearchableCombobox
                                options={dbCountries}
                                value={field.value}
                                placeholder="Select Country"
                                onSelect={(cObj) => {
                                  field.onChange(cObj.id);
                                  form.setValue(`locations.${idx}.country`, cObj.name);
                                  form.setValue(`locations.${idx}.stateId`, null);
                                  form.setValue(`locations.${idx}.state`, "");
                                  form.setValue(`locations.${idx}.cityId`, null);
                                  form.setValue(`locations.${idx}.city`, "");
                                  fetchStatesForCountry(cObj.id);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* State Select */}
                      <FormField
                        control={form.control}
                        name={`locations.${idx}.stateId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium">State / Province</FormLabel>
                            <FormControl>
                              <SearchableCombobox
                                options={countryStates}
                                value={field.value}
                                placeholder="Select State"
                                disabled={!currentCountryId || countryStates.length === 0}
                                emptyText={!currentCountryId ? "Select a country first" : "No states found."}
                                onSelect={(sObj) => {
                                  field.onChange(sObj.id);
                                  form.setValue(`locations.${idx}.state`, sObj.name);
                                  form.setValue(`locations.${idx}.cityId`, null);
                                  form.setValue(`locations.${idx}.city`, "");
                                  fetchCitiesForState(sObj.id);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* City Select */}
                      <FormField
                        control={form.control}
                        name={`locations.${idx}.cityId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium">City</FormLabel>
                            <FormControl>
                              <SearchableCombobox
                                options={stateCities}
                                value={field.value}
                                placeholder="Select City"
                                disabled={!currentStateId || stateCities.length === 0}
                                emptyText={!currentStateId ? "Select a state first" : "No cities found."}
                                onSelect={(ctObj) => {
                                  field.onChange(ctObj.id);
                                  form.setValue(`locations.${idx}.city`, ctObj.name);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            )}

            <FormField
              control={form.control}
              name="locations"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ── Step 4: Details ────────────────────────────────────────── */}
        <div className={cn("space-y-4", currentStep !== 3 && "hidden")}>
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

        </div>

        {/* ── Step 5: Package ────────────────────────────────────────── */}
        <div className={cn("space-y-4", currentStep !== 4 && "hidden")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
          </div>

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
            name="visaSponsorship"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
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

        {/* ── Wizard footer ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>

          {/*
            Both buttons are type="button" and the distinct keys stop React from
            reusing one DOM node as the other. A type="submit" here reached the
            browser's post-click activation with its type already flipped by the
            step change, so advancing off the second-to-last step posted the job
            on its own. Submitting is now only ever an explicit call.
          */}
          {isLastStep ? (
            <Button key="submit-step" type="button" onClick={submitNow} disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="animate-spin mr-2 h-4 w-4"/> : (job ? <Save className="mr-2 h-4 w-4" /> : <Briefcase className="mr-2 h-4 w-4" />)}
              {job ? "Save Changes" : "Post Job"}
            </Button>
          ) : (
            <Button key="next-step" type="button" onClick={handleNext} disabled={isSubmitting}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

