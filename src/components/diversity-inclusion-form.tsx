
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
import { LoaderCircle } from "lucide-react";
import { User } from "@/lib/types";
import { useUser } from "@/contexts/user-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";

const formSchema = z.object({
  disabilityStatus: z.string().min(1, "Please select disability status."),
  militaryExperience: z.string().min(1, "Please select military experience."),
  careerBreak: z.string().min(1, "Please select career break status."),
});

type DiversityInclusionFormValues = z.infer<typeof formSchema>;

interface DiversityInclusionFormProps {
  user: User;
}

export function DiversityInclusionForm({ user }: DiversityInclusionFormProps) {
  const { toast } = useToast();
  const { setUser } = useUser();

  const form = useForm<DiversityInclusionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      disabilityStatus: user.disabilityStatus || "",
      militaryExperience: user.militaryExperience || "",
      careerBreak: user.careerBreak || "",
    },
  });
  
  const { reset } = form;
  const { isSubmitting } = form.formState;

  useEffect(() => {
    reset({
      disabilityStatus: user.disabilityStatus || "",
      militaryExperience: user.militaryExperience || "",
      careerBreak: user.careerBreak || "",
    });
  }, [user, reset]);


  const onSubmit = async (data: DiversityInclusionFormValues) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, ...data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update diversity and inclusion details");
      }
      
      const updatedUser = await response.json();
      setUser({ ...user, ...updatedUser });

      toast({
        title: "Details Updated!",
        description: "Your diversity and inclusion information has been successfully updated.",
      });
      
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
            control={form.control}
            name="disabilityStatus"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Disability Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                            <SelectTrigger>
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
                            <SelectTrigger>
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
        <FormField
            control={form.control}
            name="careerBreak"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Have you taken a career break?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                            <SelectTrigger>
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

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            Save Diversity Details
          </Button>
        </div>
      </form>
    </Form>
  );
}
