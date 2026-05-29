
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
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, CalendarIcon, Users, HeartHandshake, Save } from "lucide-react";
import { User } from "@/lib/types";
import { useUser } from "@/contexts/user-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  gender: z.string().min(1, "Please select gender."),
  maritalStatus: z.string().min(1, "Please select marital status."),
  dateOfBirth: z.string().min(1, "Please provide your date of birth."),
  category: z.string().min(1, "Please select your category."),
  disabilityStatus: z.string().min(1, "Please select disability status."),
  militaryExperience: z.string().min(1, "Please select military experience."),
  careerBreak: z.string().min(1, "Please select career break status."),
});

type PersonalInfoFormValues = z.infer<typeof formSchema>;

interface PersonalInfoFormCombinedProps {
  user: User;
  onSuccess?: () => void;
}

export function PersonalInfoFormCombined({ user, onSuccess }: PersonalInfoFormCombinedProps) {
  const { toast } = useToast();
  const { setUser } = useUser();

  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: user.gender || "",
      maritalStatus: user.maritalStatus || "",
      dateOfBirth: user.dateOfBirth || "",
      category: user.category || "",
      disabilityStatus: user.disabilityStatus || "",
      militaryExperience: user.militaryExperience || "",
      careerBreak: user.careerBreak || "",
    },
  });
  
  const { reset, setValue } = form;
  const { isSubmitting } = form.formState;

  useEffect(() => {
    reset({
      gender: user.gender || "",
      maritalStatus: user.maritalStatus || "",
      dateOfBirth: user.dateOfBirth || "",
      category: user.category || "",
      disabilityStatus: user.disabilityStatus || "",
      militaryExperience: user.militaryExperience || "",
      careerBreak: user.careerBreak || "",
    });
  }, [user, reset]);


  const onSubmit = async (values: PersonalInfoFormValues) => {
    try {
      // We can use either the general user update endpoint or the section-specific one.
      // Since we want to update the local context as well, the general one is easier for now.
      const response = await fetch(`/api/users/${user.uuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, ...values }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update personal information");
      }
      
      const updatedUser = await response.json();
      setUser(updatedUser);

      toast({
        title: "Profile Updated!",
        description: "Your personal and diversity details have been successfully saved.",
      });

      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Section 1: Personal Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Users className="w-5 h-5 text-indigo-500" />
            <h4 className="font-bold text-slate-700">Personal Details</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                  <SelectTrigger className="rounded-xl border-slate-200 focus:ring-indigo-500">
                                      <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="Male">Male</SelectItem>
                                  <SelectItem value="Female">Female</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Marital Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                  <SelectTrigger className="rounded-xl border-slate-200 focus:ring-indigo-500">
                                      <SelectValue placeholder="Select marital status" />
                                  </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="Single">Single</SelectItem>
                                  <SelectItem value="Married">Married</SelectItem>
                                  <SelectItem value="Widowed">Widowed</SelectItem>
                                  <SelectItem value="Divorced">Divorced</SelectItem>
                                  <SelectItem value="Separated">Separated</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                  )}
              />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                      <FormItem className="flex flex-col">
                          <FormLabel className="mb-2">Date of Birth</FormLabel>
                          <Popover>
                              <PopoverTrigger asChild>
                                  <FormControl>
                                      <Button
                                          variant={"outline"}
                                          className={cn(
                                              "w-full pl-3 text-left font-normal rounded-xl border-slate-200 h-10",
                                              !field.value && "text-muted-foreground"
                                          )}
                                      >
                                          {field.value ? (
                                              format(new Date(field.value), "PPP")
                                          ) : (
                                              <span>Pick a date</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50 text-indigo-500" />
                                      </Button>
                                  </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border-slate-100" align="start">
                                  <Calendar
                                      mode="single"
                                      selected={field.value ? new Date(field.value) : undefined}
                                      onSelect={(date) => {
                                          if (date) {
                                              setValue("dateOfBirth", date.toISOString());
                                          }
                                      }}
                                      disabled={(date) =>
                                          date > new Date() || date < new Date("1900-01-01")
                                      }
                                      initialFocus
                                  />
                              </PopoverContent>
                          </Popover>
                          <FormMessage />
                      </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                  <SelectTrigger className="rounded-xl border-slate-200 focus:ring-indigo-500">
                                      <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="General">General</SelectItem>
                                  <SelectItem value="OBC">OBC</SelectItem>
                                  <SelectItem value="SC">SC</SelectItem>
                                  <SelectItem value="ST">ST</SelectItem>
                                  <SelectItem value="EWS">EWS</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                  )}
              />
          </div>
        </div>

        {/* Section 2: Diversity and Inclusion */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <HeartHandshake className="w-5 h-5 text-rose-500" />
            <h4 className="font-bold text-slate-700">Diversity and Inclusion</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                  control={form.control}
                  name="disabilityStatus"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Disability Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                  <SelectTrigger className="rounded-xl border-slate-200 focus:ring-indigo-500">
                                      <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="Yes">Yes</SelectItem>
                                  <SelectItem value="No">No</SelectItem>
                                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="militaryExperience"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Military Experience</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                  <SelectTrigger className="rounded-xl border-slate-200 focus:ring-indigo-500">
                                      <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="Yes">Yes</SelectItem>
                                  <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                  )}
              />
          </div>
          
          <FormField
              control={form.control}
              name="careerBreak"
              render={({ field }) => (
                  <FormItem className="max-w-md">
                      <FormLabel>Have you taken a career break?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                              <SelectTrigger className="rounded-xl border-slate-200 focus:ring-indigo-500">
                                  <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
              )}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-lg shadow-indigo-100 py-6 transition-all active:scale-95"
          >
            {isSubmitting ? (
              <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            Save All Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
