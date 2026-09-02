"use client";

import { useForm } from "react-hook-form";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { ChevronsUpDown, Check, LoaderCircle, Edit2, Briefcase, Link2, Users, FileText, X, Globe, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/user-context";
import { supabase } from "@/lib/supabase-client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import { User, CompanySize, VisaRequirement, NoticePeriod } from "@/lib/types";
import { parsePhoneNumber } from "@/utils/country-codes";
import { CountryCodeSelect } from "./country-code-select";
import { Switch } from "@/components/ui/switch";
import { SUPPORTED_CURRENCIES } from "@/utils/currency";
import { onFormInvalid } from "@/lib/form-toast-utils";

function SearchableCombobox({
  options,
  value,
  onSelect,
  placeholder,
  disabled = false,
  emptyText = "No results found.",
  className = ""
}: {
  options: { id: number; name: string }[];
  value?: string | number | null;
  onSelect: (option: { id: number; name: string }) => void;
  placeholder: string;
  disabled?: boolean;
  emptyText?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const selectedOption = options.find(
    (o) => o.id === Number(value) || o.name.toLowerCase() === String(value || '').toLowerCase()
  );

  const displayValue = selectedOption ? selectedOption.name : (value ? String(value) : "");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          type="button"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal text-left h-10 px-3 bg-background border-slate-200 shadow-none", className)}
        >
          <span className={cn("truncate", !displayValue && "text-muted-foreground")}>
            {displayValue || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={`Search ${placeholder.toLowerCase()}...`} 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList className="max-h-60 overflow-y-auto">
            <CommandEmpty className="p-2 text-center text-xs text-slate-500">
              <p>{emptyText}</p>
              {searchValue.trim() && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-indigo-600 hover:text-indigo-700 text-xs w-full"
                  onClick={() => {
                    onSelect({ id: 0, name: searchValue.trim() });
                    setOpen(false);
                    setSearchValue("");
                  }}
                >
                  Use "{searchValue.trim()}"
                </Button>
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedOption?.id === option.id || selectedOption?.name.toLowerCase() === option.name.toLowerCase();
                return (
                  <CommandItem
                    key={option.id}
                    value={option.name}
                    onSelect={() => {
                      onSelect(option);
                      setOpen(false);
                      setSearchValue("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 text-indigo-600",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const PillSelect = ({ value, onChange, options, className = "" }: { value?: string, onChange: (v: string) => void, options: string[], className?: string }) => (
    <div className={`flex flex-wrap gap-2 ${className}`}>
        {options.map(opt => (
            <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${value === opt ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}
            >
                {opt}
            </button>
        ))}
    </div>
);

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

const formSchema = z.object({
    name: z.string().min(2, "Full name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    phone: z.string().min(7, "Phone number must be at least 7 digits.").max(15, "Phone number cannot exceed 15 digits.").regex(/^\d+$/, "Phone number must contain digits only.").optional().or(z.literal('')),
    country: z.string().optional().or(z.literal('')),
    countryId: z.coerce.number().optional().nullable(),
    state: z.string().optional().or(z.literal('')),
    stateId: z.coerce.number().optional().nullable(),
    headline: z.string().optional(),
    linkedinUrl: z.string().optional().or(z.literal('')),
    githubUrl: z.string().optional().or(z.literal('')),
    portfolioUrl: z.string().optional().or(z.literal('')),
    workStatus: z.enum(['Fresher', 'Experienced']).optional(),
    experienceYears: z.coerce.number().optional().or(z.literal('')),
    experienceMonths: z.coerce.number().optional().or(z.literal('')),
    currentCity: z.string().optional(),
    cityId: z.coerce.number().optional().nullable(),
    currentArea: z.string().optional(),
    annualSalary: z.coerce.number().optional().or(z.literal('')),
    expectedSalary: z.coerce.number().optional().or(z.literal('')),
    salaryBreakdown: z.enum(['Fixed', 'Fixed + Variable', 'Fixed + Variable + Stocks', 'Fixed + Stocks']).nullable().optional().or(z.literal('')),
    noticePeriod: z.string().nullable().optional().or(z.literal('')),
    noticePeriodId: z.coerce.number().optional().nullable(),
    companyName: z.string().optional().or(z.literal('')),
    companyWebsite: z.string().optional().or(z.literal('')),
    companySizeId: z.string().optional().or(z.literal('')),
    companyOverview: z.string().optional().or(z.literal('')),
    companyAddress: z.string().optional().or(z.literal('')),
    companyLinkedinUrl: z.string().optional().or(z.literal('')),
    preferredLocations: z.array(z.string()).optional(),
    preferredJobTitles: z.array(z.string()).optional(),
    preferredSalaryMin: z.coerce.number().optional().or(z.literal('')),
    preferredSalaryMax: z.coerce.number().optional().or(z.literal('')),
    preferredCurrency: z.string().optional(),
    remotePreference: z.enum(['remote', 'hybrid', 'onsite', 'any']).optional(),
    employmentTypes: z.array(z.string()).optional(),
    preferredIndustries: z.array(z.string()).optional(),
    openToRelocate: z.boolean().optional(),
    openWorldwide: z.boolean().optional(),
    workAuthorization: z.array(z.string()).optional(),
    visaRequirement: z.string().optional(),
    visaRequirementId: z.number().nullable().optional(),
    workplaceTypeId: z.coerce.number().optional().nullable(),
    preferredLanguages: z.array(z.string()).optional(),
});

type ProfileFormValues = z.infer<typeof formSchema>;

interface ProfileFormProps {
    user: User;
    isEditingPage?: boolean;
}

export function ProfileForm({ user, isEditingPage = false }: ProfileFormProps) {
    const { toast } = useToast();
    const { setUser } = useUser();
    const [companySizes, setCompanySizes] = useState<CompanySize[]>([]);
    const [visaRequirements, setVisaRequirements] = useState<VisaRequirement[]>([]);
    const [workplaceTypes, setWorkplaceTypes] = useState<{ id: number; name: string }[]>([]);
    const [noticePeriods, setNoticePeriods] = useState<NoticePeriod[]>([]);
    const isMobile = useIsMobile();
    const router = useRouter();

    const initialPhone = parsePhoneNumber(user.phone);
    const [countryCode, setCountryCode] = useState(initialPhone.countryCode);

    const [dbCountries, setDbCountries] = useState<{ id: number; name: string }[]>([]);
    const [dbStates, setDbStates] = useState<{ id: number; name: string }[]>([]);
    const [dbCities, setDbCities] = useState<{ id: number; name: string }[]>([]);

    useEffect(() => {
        fetch('/api/geo?type=countries')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setDbCountries(data);
            })
            .catch(err => console.error("Failed to load countries", err));
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sizesRes, visaRes, workplaceRes, noticeRes] = await Promise.all([
                    fetch('/api/company-sizes'),
                    fetch('/api/visa-requirements'),
                    fetch('/api/workplace-types'),
                    fetch('/api/notice-periods')
                ]);
                setCompanySizes(await sizesRes.json());
                setVisaRequirements(await visaRes.json());
                const wpData = await workplaceRes.json();
                if (Array.isArray(wpData)) setWorkplaceTypes(wpData);
                const npData = await noticeRes.json();
                if (Array.isArray(npData)) setNoticePeriods(npData);
            } catch (error) {
                console.error("Failed to fetch form data", error);
            }
        }
        fetchData();
    }, []);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
            phone: initialPhone.phoneDigits,
            country: user.country || "",
            countryId: (user as any).countryId || null,
            state: user.state || "",
            stateId: (user as any).stateId || null,
            headline: user.headline || "",
            linkedinUrl: user.linkedinUrl || "",
            githubUrl: user.githubUrl || "",
            portfolioUrl: user.portfolioUrl || "",
            workStatus: user.workStatus as any,
            experienceYears: user.experienceYears || "" as any,
            experienceMonths: user.experienceMonths || "" as any,
            currentCity: user.currentCity || "",
            cityId: (user as any).cityId || null,
            currentArea: user.currentArea || "",
            annualSalary: user.annualSalary || "" as any,
            expectedSalary: user.expectedSalary || "" as any,
            salaryBreakdown: user.salaryBreakdown || "" as any,
            noticePeriod: user.noticePeriod || "" as any,
            noticePeriodId: (user as any).noticePeriodId || (user as any).notice_period_id || null,
            companyName: user.companyName || "",
            companyWebsite: user.companyWebsite || "",
            companySizeId: user.companySizeId || "",
            companyOverview: user.companyOverview || "",
            companyAddress: user.companyAddress || "",
            companyLinkedinUrl: user.companyLinkedinUrl || "",
            preferredLocations: user.preferredLocations || [],
            preferredJobTitles: user.preferredJobTitles || [],
            preferredSalaryMin: user.preferredSalaryMin || "" as any,
            preferredSalaryMax: user.preferredSalaryMax || "" as any,
            preferredCurrency: user.preferredCurrency || "INR",
            remotePreference: user.remotePreference || "any",
            employmentTypes: user.employmentTypes || [],
            preferredIndustries: user.preferredIndustries || [],
            openToRelocate: user.openToRelocate ?? user.openToRelocation ?? false,
            openWorldwide: user.openWorldwide ?? false,
            workAuthorization: user.workAuthorization || [],
            visaRequirement: user.visaRequirement || "",
            workplaceTypeId: (user as any).workplaceTypeId || (user as any).workplace_type_id || null,
            preferredLanguages: user.preferredLanguages || [],
        },
    });

    const { reset, watch, formState: { errors, isSubmitting } } = form;
    const workStatus = watch('workStatus');

    // Fetch states whenever selected country changes
    const selectedCountryName = watch("country");
    const selectedCountryId = watch("countryId");

    useEffect(() => {
        let activeCountryId = selectedCountryId;
        if (!activeCountryId && selectedCountryName && dbCountries.length > 0) {
            const found = dbCountries.find(c => c.name.toLowerCase() === selectedCountryName.toLowerCase());
            if (found) {
                activeCountryId = found.id;
                form.setValue("countryId", found.id);
            }
        }
        if (activeCountryId) {
            fetch(`/api/geo?type=states&countryId=${activeCountryId}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setDbStates(data);
                })
                .catch(err => console.error("Failed to load states", err));
        } else {
            setDbStates([]);
        }
    }, [selectedCountryId, selectedCountryName, dbCountries, form]);

    // Fetch cities whenever selected state changes
    const selectedStateName = watch("state");
    const selectedStateId = watch("stateId");

    useEffect(() => {
        let activeStateId = selectedStateId;
        if (!activeStateId && selectedStateName && dbStates.length > 0) {
            const found = dbStates.find(s => s.name.toLowerCase() === selectedStateName.toLowerCase());
            if (found) {
                activeStateId = found.id;
                form.setValue("stateId", found.id);
            }
        }
        if (activeStateId) {
            fetch(`/api/geo?type=cities&stateId=${activeStateId}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setDbCities(data);
                })
                .catch(err => console.error("Failed to load cities", err));
        } else {
            setDbCities([]);
        }
    }, [selectedStateId, selectedStateName, dbStates, form]);

    // Debug: Log form errors to console if validation fails
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log("Form Validation Errors:", errors);
        }
    }, [errors]);

    useEffect(() => {
        const { countryCode: code, phoneDigits } = parsePhoneNumber(user.phone);
        setCountryCode(code);
        reset({
            name: user.name,
            email: user.email,
            phone: phoneDigits,
            country: user.country || "",
            countryId: (user as any).countryId || null,
            state: user.state || "",
            stateId: (user as any).stateId || null,
            headline: user.headline || "",
            linkedinUrl: user.linkedinUrl || "",
            githubUrl: user.githubUrl || "",
            portfolioUrl: user.portfolioUrl || "",
            workStatus: user.workStatus as any,
            experienceYears: user.experienceYears || "" as any,
            experienceMonths: user.experienceMonths || "" as any,
            currentCity: user.currentCity || "",
            cityId: (user as any).cityId || null,
            currentArea: user.currentArea || "",
            annualSalary: user.annualSalary || "" as any,
            expectedSalary: user.expectedSalary || "" as any,
            salaryBreakdown: user.salaryBreakdown || "" as any,
            noticePeriod: user.noticePeriod || "" as any,
            noticePeriodId: (user as any).noticePeriodId || (user as any).notice_period_id || null,
            companyName: user.companyName || "",
            companyWebsite: user.companyWebsite || "",
            companySizeId: user.companySizeId ? String(user.companySizeId) : "",
            companyOverview: user.companyOverview || "",
            companyAddress: user.companyAddress || "",
            companyLinkedinUrl: user.companyLinkedinUrl || "",
            preferredLocations: user.preferredLocations || [],
            preferredJobTitles: user.preferredJobTitles || [],
            preferredSalaryMin: user.preferredSalaryMin || "" as any,
            preferredSalaryMax: user.preferredSalaryMax || "" as any,
            preferredCurrency: user.preferredCurrency || "INR",
            remotePreference: user.remotePreference || "any",
            employmentTypes: user.employmentTypes || [],
            preferredIndustries: user.preferredIndustries || [],
            openToRelocate: user.openToRelocate ?? user.openToRelocation ?? false,
            openWorldwide: user.openWorldwide ?? false,
            workAuthorization: user.workAuthorization || [],
            visaRequirement: user.visaRequirement || "",
            workplaceTypeId: (user as any).workplaceTypeId || (user as any).workplace_type_id || null,
            preferredLanguages: user.preferredLanguages || [],
        });
    }, [user, reset]);


    const onSubmit = async (data: ProfileFormValues) => {
        try {
            const fullPhone = data.phone ? `${countryCode}${data.phone.replace(/\D/g, '')}` : '';
            const formatUrl = (val?: string | null) => {
                if (!val || !val.trim()) return null;
                const trimmed = val.trim();
                return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
            };

            // Clean up the data before sending: convert empty strings to null for numeric/url fields
            const cleanedData = {
                ...data,
                phone: fullPhone,
                experienceYears: data.experienceYears === '' ? null : data.experienceYears,
                experienceMonths: data.experienceMonths === '' ? null : data.experienceMonths,
                annualSalary: data.annualSalary === '' ? null : data.annualSalary,
                expectedSalary: data.expectedSalary === '' ? null : data.expectedSalary,
                preferredSalaryMin: data.preferredSalaryMin === '' ? null : data.preferredSalaryMin,
                preferredSalaryMax: data.preferredSalaryMax === '' ? null : data.preferredSalaryMax,
                linkedinUrl: formatUrl(data.linkedinUrl),
                githubUrl: formatUrl(data.githubUrl),
                portfolioUrl: formatUrl(data.portfolioUrl),
                companySizeId: data.companySizeId === '' ? null : data.companySizeId,
                companyWebsite: formatUrl(data.companyWebsite),
                companyLinkedinUrl: formatUrl(data.companyLinkedinUrl),
                companyAddress: data.companyAddress === '' ? null : data.companyAddress,
                companyOverview: data.companyOverview === '' ? null : data.companyOverview,
            };

            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const { countryId, stateId, cityId, visaRequirementId, workplaceTypeId, noticePeriodId, ...userClean } = user as any;
            const response = await fetch(`/api/users/${user.uuid}`, {
                method: "PUT",
                headers,
                body: JSON.stringify({ ...userClean, ...cleanedData }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update profile");
            }

            const updatedUser = await response.json();
            setUser({ ...user, ...updatedUser });

            toast({
                title: "Profile Updated!",
                description: "Your basic profile information has been successfully updated.",
            });

            if (isEditingPage) {
                router.push('/profile');
            }

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    };

    if (isMobile && !isEditingPage) {
        return (
            <div className="space-y-4">
                <div className="space-y-3">
                    <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</span>
                        <span className="text-sm text-slate-800 font-medium">{user.name}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</span>
                        <span className="text-sm text-slate-800 font-medium">{user.email}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</span>
                        <span className="text-sm text-slate-800 font-medium">{user.phone}</span>
                    </div>
                    {user.role === 'Job Seeker' && (
                        <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Headline</span>
                            <span className="text-sm text-slate-800 font-medium">{user.headline || "Not specified"}</span>
                        </div>
                    )}
                    {user.role === 'Job Seeker' && (
                        <>
                            <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Work Status</span>
                                <span className="text-sm text-slate-800 font-medium">{user.workStatus || "Not specified"}</span>
                            </div>
                            {user.workStatus === 'Experienced' && (
                                <>
                                    <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Experience</span>
                                        <span className="text-sm text-slate-800 font-medium">{user.experienceYears || 0} Years {user.experienceMonths || 0} Months</span>
                                    </div>
                                    <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Annual Salary</span>
                                        <span className="text-sm text-slate-800 font-medium">₹ {user.annualSalary?.toLocaleString() || "Not specified"} ({user.salaryBreakdown || "Fixed"})</span>
                                    </div>
                                </>
                            )}
                            <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expected Salary</span>
                                <span className="text-sm text-slate-800 font-medium">₹ {user.expectedSalary?.toLocaleString() || "Not specified"}</span>
                            </div>
                            <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Notice Period</span>
                                <span className="text-sm text-slate-800 font-medium">
                                    {noticePeriods.find(np => np.id === (user as any).noticePeriodId || np.id === (user as any).notice_period_id)?.name || user.noticePeriod || "Not specified"}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-3">
                                 <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                                     <MapPin className="w-3.5 h-3.5" /> Location Hierarchy (Country &rarr; State &rarr; City)
                                 </span>
                                 <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                                     <div>
                                         <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] block">Country</span>
                                         <span className="font-bold text-slate-900 dark:text-white text-sm">{user.country || "Not specified"}</span>
                                     </div>
                                     <div>
                                         <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] block">State / Province</span>
                                         <span className="font-bold text-slate-900 dark:text-white text-sm">{user.state || "Not specified"}</span>
                                     </div>
                                     <div>
                                         <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] block">City / Metro</span>
                                         <span className="font-bold text-slate-900 dark:text-white text-sm">
                                             {user.currentCity || "Not specified"}
                                         </span>
                                     </div>
                                 </div>
                             </div>
                            <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Work Preference</span>
                                <span className="text-sm text-slate-800 font-medium">
                                    {workplaceTypes.find(wt => wt.id === (user as any).workplaceTypeId || wt.id === (user as any).workplace_type_id)?.name || user.workplaceType || (user.remotePreference ? user.remotePreference.toUpperCase() : "Not specified")}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Preferred Locations</span>
                                <span className="text-sm text-slate-800 font-medium">
                                    {user.preferredLocations && user.preferredLocations.length > 0
                                        ? user.preferredLocations.join(', ')
                                        : "Not specified"}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">LinkedIn URL</span>
                                <span className="text-sm text-slate-800 font-medium">{user.linkedinUrl || "Not specified"}</span>
                            </div>
                            <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">GitHub URL</span>
                                <span className="text-sm text-slate-800 font-medium">{user.githubUrl || "Not specified"}</span>
                            </div>
                            <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Portfolio URL</span>
                                <span className="text-sm text-slate-800 font-medium">{user.portfolioUrl || "Not specified"}</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="pt-2">
                    <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100" onClick={() => router.push('/profile/basic-info/edit')}>
                        <Edit2 className="w-4 h-4" />
                        Edit Basic Information
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, (err) => onFormInvalid(err, toast))} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <div className="flex gap-2 items-center">
                                    <CountryCodeSelect
                                        value={countryCode}
                                        onChange={setCountryCode}
                                        className="h-10 max-w-[110px] rounded-md border border-slate-200 bg-slate-100 text-slate-700 font-bold text-sm"
                                    />
                                    <Input placeholder="9876543210" className="flex-1" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 my-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-1">
                        <MapPin className="w-4 h-4" /> Location (Country, State & City)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Country Select */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Country</label>
                            <SearchableCombobox
                                options={dbCountries}
                                value={form.watch("countryId") || form.watch("country")}
                                placeholder="Select Country"
                                onSelect={(c) => {
                                    form.setValue("country", c.name);
                                    form.setValue("countryId", c.id || null);
                                    form.setValue("state", "");
                                    form.setValue("stateId", null);
                                    form.setValue("currentCity", "");
                                    form.setValue("cityId", null);
                                }}
                            />
                        </div>

                        {/* State Select */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">State / Province</label>
                            <SearchableCombobox
                                options={dbStates}
                                value={form.watch("stateId") || form.watch("state")}
                                placeholder="Select State"
                                disabled={!form.watch("country") && !form.watch("countryId")}
                                emptyText={(!form.watch("country") && !form.watch("countryId")) ? "Select a country first" : "No states found."}
                                onSelect={(s) => {
                                    form.setValue("state", s.name);
                                    form.setValue("stateId", s.id || null);
                                    form.setValue("currentCity", "");
                                    form.setValue("cityId", null);
                                }}
                            />
                        </div>

                        {/* City Select */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">City / Metro</label>
                            <SearchableCombobox
                                options={dbCities}
                                value={form.watch("cityId") || form.watch("currentCity")}
                                placeholder="Select City"
                                disabled={!form.watch("state") && !form.watch("stateId")}
                                emptyText={(!form.watch("state") && !form.watch("stateId")) ? "Select a state first" : "No cities found."}
                                onSelect={(ci) => {
                                    form.setValue("currentCity", ci.name);
                                    form.setValue("cityId", ci.id || null);
                                }}
                            />
                        </div>
                    </div>
                </div>
                {user.role === 'Job Seeker' && (
                    <FormField
                        control={form.control}
                        name="headline"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Headline</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Senior Software Engineer at Acme Inc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}


                {user.role === 'Job Seeker' && (
                    <>

                        <div className="pt-4 border-t border-slate-100 mt-6">
                            <h4 className="font-semibold text-slate-800 mb-4 tracking-tight text-lg flex items-center gap-2">
                                <Globe className="w-5 h-5 text-indigo-600" /> International Preferences & Targeting
                            </h4>
                        </div>

                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <FormField
                                control={form.control}
                                name="preferredCurrency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-600">Preferred Currency</FormLabel>
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
                                name="workplaceTypeId"
                                render={({ field }) => {
                                    const currentWpId = field.value;
                                    return (
                                        <FormItem>
                                            <FormLabel className="text-slate-600">Work Preference</FormLabel>
                                            <Select 
                                                onValueChange={(val) => {
                                                    const idNum = val ? Number(val) : null;
                                                    field.onChange(idNum);
                                                    const matched = workplaceTypes.find(wt => wt.id === idNum);
                                                    if (matched) {
                                                        const lower = matched.name.toLowerCase();
                                                        if (lower.includes('remote')) form.setValue('remotePreference', 'remote');
                                                        else if (lower.includes('hybrid')) form.setValue('remotePreference', 'hybrid');
                                                        else if (lower.includes('site') || lower.includes('on-site')) form.setValue('remotePreference', 'onsite');
                                                        else form.setValue('remotePreference', 'any');
                                                    }
                                                }} 
                                                value={currentWpId ? String(currentWpId) : ""}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select work preference" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {workplaceTypes.map((wt) => (
                                                        <SelectItem key={wt.id} value={String(wt.id)}>
                                                            {wt.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                            <FormField
                                control={form.control}
                                name="visaRequirement"
                                render={({ field }) => {
                                    const currentId = form.watch("visaRequirementId");
                                    const currentName = field.value || "";

                                    // Match by ID or Name
                                    const activeObj = visaRequirements.find(
                                        v => (currentId && v.id === currentId) || v.name.toLowerCase() === currentName.toLowerCase()
                                    );

                                    return (
                                        <FormItem>
                                            <FormLabel className="text-slate-600">Visa / Sponsorship Requirement</FormLabel>
                                            <Select 
                                                onValueChange={(val) => {
                                                    const matched = visaRequirements.find(v => v.id.toString() === val || v.name === val);
                                                    const vName = matched ? matched.name : val;
                                                    const vId = matched ? matched.id : null;
                                                    field.onChange(vName);
                                                    form.setValue("visaRequirementId", vId);
                                                }} 
                                                value={activeObj ? activeObj.id.toString() : (currentId ? currentId.toString() : currentName)}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select visa status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {visaRequirements.map((v) => (
                                                        <SelectItem key={v.id} value={v.id.toString()}>
                                                            {v.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                        </div>



                        <FormField
                            control={form.control}
                            name="workAuthorization"
                            render={({ field }) => (
                                <FormItem className="mt-4">
                                    <FormLabel className="text-slate-600">Work Authorization Countries (Press Enter or comma to add)</FormLabel>
                                    <FormControl>
                                        <TagInput
                                            value={field.value || []}
                                            onChange={field.onChange}
                                            placeholder="e.g. India, United States, Canada"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
                            <FormField
                                control={form.control}
                                name="openToRelocate"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg p-2">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-sm font-semibold text-slate-800 dark:text-slate-200">Open to Relocation</FormLabel>
                                            <p className="text-xs text-slate-500">Willing to relocate for the right role</p>
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
                                name="openWorldwide"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg p-2">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-sm font-semibold text-slate-800 dark:text-slate-200">Open Worldwide</FormLabel>
                                            <p className="text-xs text-slate-500">Open to global remote / worldwide positions</p>
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

                        <div className="pt-4 border-t border-slate-100 mt-6">
                            <h4 className="font-semibold text-slate-800 mb-4 tracking-tight text-lg">Employment Profile</h4>
                        </div>

                        <FormField
                            control={form.control}
                            name="workStatus"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-600">Work status</FormLabel>
                                    <FormControl>
                                        <PillSelect
                                            value={field.value}
                                            onChange={field.onChange}
                                            options={['Fresher', 'Experienced']}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {workStatus === 'Experienced' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">

                                {/* Experience Duration Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="experienceYears"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-600">Experience Years</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input type="number" min={0} max={40} className="pr-14" placeholder="0" {...field} />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">Yrs</span>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="experienceMonths"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-600">Experience Months</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input type="number" min={0} max={11} className="pr-16" placeholder="0" {...field} />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">Mos</span>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Current Salary + Breakdown Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="annualSalary"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-600">Current Annual Salary</FormLabel>
                                                <FormControl>
                                                    <div className="relative flex items-center">
                                                        <span className="absolute left-3 text-slate-500 font-semibold text-sm pointer-events-none">₹</span>
                                                        <Input type="number" min={0} className="pl-7 pr-20" placeholder="e.g. 600000" {...field} />
                                                        <span className="absolute right-3 text-xs text-slate-400 pointer-events-none whitespace-nowrap">Per year</span>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="salaryBreakdown"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-600">Salary Breakdown</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select breakdown" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Fixed">Fixed</SelectItem>
                                                        <SelectItem value="Fixed + Variable">Fixed + Variable</SelectItem>
                                                        <SelectItem value="Fixed + Variable + Stocks">Fixed + Variable + Stocks</SelectItem>
                                                        <SelectItem value="Fixed + Stocks">Fixed + Stocks</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Expected Salary + Notice Period Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="expectedSalary"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-600">Expected Salary</FormLabel>
                                                <FormControl>
                                                    <div className="relative flex items-center">
                                                        <span className="absolute left-3 text-slate-500 font-semibold text-sm pointer-events-none">₹</span>
                                                        <Input type="number" min={0} className="pl-7 pr-20" placeholder="e.g. 900000" {...field} />
                                                        <span className="absolute right-3 text-xs text-slate-400 pointer-events-none whitespace-nowrap">Per year</span>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="noticePeriodId"
                                        render={({ field }) => {
                                            const currentId = field.value;
                                            const currentName = form.watch("noticePeriod") || "";
                                            const activeObj = noticePeriods.find(
                                                np => (currentId && np.id === Number(currentId)) || (currentName && np.name.toLowerCase() === currentName.toLowerCase())
                                            );
                                            return (
                                                <FormItem>
                                                    <FormLabel className="text-slate-600">Notice Period</FormLabel>
                                                    <Select 
                                                        onValueChange={(val) => {
                                                            const idNum = val ? Number(val) : null;
                                                            field.onChange(idNum);
                                                            const matched = noticePeriods.find(np => np.id === idNum);
                                                            if (matched) {
                                                                form.setValue("noticePeriod", matched.name);
                                                            }
                                                        }} 
                                                        value={activeObj ? String(activeObj.id) : (currentId ? String(currentId) : "")}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select notice period" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {noticePeriods.map((np) => (
                                                                <SelectItem key={np.id} value={String(np.id)}>
                                                                    {np.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            );
                                        }}
                                    />
                                </div>

                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-100 mt-6">
                            <h4 className="font-semibold text-slate-800 mb-4 tracking-tight text-lg">Other Details</h4>
                        </div>
                        <FormField
                            control={form.control}
                            name="linkedinUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>LinkedIn URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://linkedin.com/in/your-profile" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="githubUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>GitHub URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://github.com/your-username" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="portfolioUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Portfolio URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://yourportfolio.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}

                {user.role === 'Recruiter' && (
                    <>
                        <div className="pt-4 border-t border-slate-100 mt-6">
                            <h4 className="font-semibold text-slate-800 mb-4 tracking-tight text-lg">Company Information</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-600">Company Name</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                                <Input className="pl-9" placeholder="e.g. Acme Corporation" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="companyWebsite"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-600">Company Website</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Link2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                                <Input className="pl-9" placeholder="https://www.acme.com" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="mt-4">
                            <FormField
                                control={form.control}
                                name="companySizeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-600">Company Size</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <FormControl>
                                                <div className="relative">
                                                    <Users className="absolute left-3 top-3 w-4 h-4 text-slate-400 z-10" />
                                                    <SelectTrigger className="pl-9">
                                                        <SelectValue placeholder="Select company size" />
                                                    </SelectTrigger>
                                                </div>
                                            </FormControl>
                                            <SelectContent>
                                                {companySizes.map(size => (
                                                    <SelectItem key={size.uuid} value={size.uuid}>{size.name} Employees</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <FormField
                                control={form.control}
                                name="companyLinkedinUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-600">Company LinkedIn</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Edit2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                                <Input className="pl-9" placeholder="LinkedIn Page URL" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="companyAddress"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-600">Company Address</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                                <Input className="pl-9" placeholder="Full office address" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="companyOverview"
                            render={({ field }) => (
                                <FormItem className="mt-4">
                                    <FormLabel className="text-slate-600">Company Overview</FormLabel>
                                    <FormControl>
                                        <textarea
                                            className="flex min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Write a catchy overview about your company culture and mission..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}
                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    );
}
