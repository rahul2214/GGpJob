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
import { LoaderCircle, Edit2 } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";

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

const formSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().length(10, "Please enter a valid 10-digit phone number."),
  headline: z.string().optional(),
  domainId: z.string().optional(),
  linkedinUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  githubUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  workStatus: z.enum(['Fresher', 'Experienced']).optional(),
  experienceYears: z.coerce.number().optional().or(z.literal('')),
  experienceMonths: z.coerce.number().optional().or(z.literal('')),
  currentCity: z.string().optional(),
  currentArea: z.string().optional(),
  annualSalary: z.coerce.number().optional().or(z.literal('')),
  salaryBreakdown: z.enum(['Fixed', 'Fixed + Variable', 'Fixed + Variable + Stocks', 'Fixed + Stocks']).optional(),
  noticePeriod: z.enum(['15 Days or less', '1 Month', '2 Months', '3 Months', 'More than 3 Months', 'Serving Notice Period']).optional(),
});

type ProfileFormValues = z.infer<typeof formSchema>;

interface ProfileFormProps {
  user: User;
  isEditingPage?: boolean;
}

export function ProfileForm({ user, isEditingPage = false }: ProfileFormProps) {
  const { toast } = useToast();
  const { setUser } = useUser();
  const [domains, setDomains] = useState<Domain[]>([]);
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [domainsRes] = await Promise.all([
                fetch('/api/domains')
            ]);
            setDomains(await domainsRes.json());
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
      phone: user.phone,
      headline: user.headline || "",
      headline: user.headline || "",
      domainId: String(user.domainId || ''),
      linkedinUrl: user.linkedinUrl || "",
      workStatus: user.workStatus as any,
      experienceYears: user.experienceYears || "" as any,
      experienceMonths: user.experienceMonths || "" as any,
      currentCity: user.currentCity || "",
      currentArea: user.currentArea || "",
      annualSalary: user.annualSalary || "" as any,
      salaryBreakdown: user.salaryBreakdown as any,
      noticePeriod: user.noticePeriod as any,
    },
  });
  
  const { reset, watch } = form;
  const { isSubmitting } = form.formState;
  const workStatus = watch('workStatus');

  useEffect(() => {
    reset({
      name: user.name,
      email: user.email,
      phone: user.phone,
      headline: user.headline || "",
      headline: user.headline || "",
      domainId: String(user.domainId || ''),
      linkedinUrl: user.linkedinUrl || "",
      workStatus: user.workStatus as any,
      experienceYears: user.experienceYears || "" as any,
      experienceMonths: user.experienceMonths || "" as any,
      currentCity: user.currentCity || "",
      currentArea: user.currentArea || "",
      annualSalary: user.annualSalary || "" as any,
      salaryBreakdown: user.salaryBreakdown as any,
      noticePeriod: user.noticePeriod as any,
    });
  }, [user, reset]);


  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, ...data }),
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
     const domainName = domains.find(d => String(d.id) === String(user.domainId))?.name || "Not specified";
     
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
                                <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Notice Period</span>
                                    <span className="text-sm text-slate-800 font-medium">{user.noticePeriod || "Not specified"}</span>
                                </div>
                            </>
                        )}
                        <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Location</span>
                            <span className="text-sm text-slate-800 font-medium">
                                {[user.currentArea, user.currentCity].filter(Boolean).join(', ') || "Not specified"}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Preferred Domain</span>
                            <span className="text-sm text-slate-800 font-medium">{domainName}</span>
                        </div>
                        <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">LinkedIn URL</span>
                            <span className="text-sm text-slate-800 font-medium">{user.linkedinUrl || "Not specified"}</span>
                        </div>
                        <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">GitHub URL</span>
                            <span className="text-sm text-slate-800 font-medium">{(user as any).githubUrl || "Not specified"}</span>
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                        <FormField
                            control={form.control}
                            name="experienceYears"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-600">Experience Years</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type="number" {...field} />
                                            <span className="absolute right-3 top-2 text-sm text-slate-400">Years</span>
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
                                            <Input type="number" {...field} />
                                            <span className="absolute right-3 top-2 text-sm text-slate-400">Months</span>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                        control={form.control}
                        name="currentCity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-600">Current city</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Bengaluru" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="currentArea"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-600">Current area/town</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Basaveshwara Nagar" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {workStatus === 'Experienced' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                            <FormField
                                control={form.control}
                                name="annualSalary"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-600">Annual salary</FormLabel>
                                        <FormControl>
                                            <div className="relative flex items-center">
                                                <div className="absolute left-3 text-slate-500 font-medium">₹</div>
                                                <Input type="number" className="pl-8" {...field} />
                                                <span className="absolute right-3 text-sm text-slate-400">Per year</span>
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
                                        <FormLabel className="text-slate-600">Salary breakdown</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ''}>
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

                        <FormField
                            control={form.control}
                            name="noticePeriod"
                            render={({ field }) => (
                                <FormItem className="mt-4 animate-in fade-in slide-in-from-top-2">
                                    <FormLabel className="text-slate-600">Notice period</FormLabel>
                                    <FormControl>
                                        <PillSelect 
                                            value={field.value} 
                                            onChange={field.onChange} 
                                            options={['15 Days or less', '1 Month', '2 Months', '3 Months', 'More than 3 Months', 'Serving Notice Period']} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}
                
                <div className="pt-4 border-t border-slate-100 mt-6">
                    <h4 className="font-semibold text-slate-800 mb-4 tracking-tight text-lg">Other Details</h4>
                </div>
                
                <FormField
                control={form.control}
                name="domainId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-slate-600">Preferred Domain</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>

                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your preferred domain" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Array.isArray(domains) && domains.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
                />
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
