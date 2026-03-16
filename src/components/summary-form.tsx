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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle } from "lucide-react";
import { User } from "@/lib/types";
import { useUser } from "@/contexts/user-context";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const countWords = (str: string) => {
  return str.trim().split(/\s+/).filter(Boolean).length;
};

const formSchema = z.object({
  summary: z.string().optional().refine(val => {
    if (!val) return true;
    return countWords(val) <= 1000;
  }, "Summary cannot exceed 1000 words."),
});

type SummaryFormValues = z.infer<typeof formSchema>;

interface SummaryFormProps {
  user: User;
}

export function SummaryForm({ user }: SummaryFormProps) {
  const { toast } = useToast();
  const { setUser } = useUser();

  const form = useForm<SummaryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      summary: user.summary || "",
    },
  });
  
  const { reset, watch } = form;
  const summaryValue = watch("summary") || "";
  const wordCount = countWords(summaryValue);

  const { isSubmitting } = form.formState;

  useEffect(() => {
    reset({
      summary: user.summary || "",
    });
  }, [user, reset]);


  const onSubmit = async (data: SummaryFormValues) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, summary: data.summary }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update summary");
      }
      
      const updatedUser = await response.json();
      setUser({ ...user, ...updatedUser });

      toast({
        title: "Summary Updated!",
        description: "Your professional summary has been successfully updated.",
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
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Briefly describe your career goals, key achievements, and skills.</FormLabel>
              <FormControl>
                <div className="space-y-1">
                  <Textarea 
                    placeholder="Write your professional summary here..." 
                    className="min-h-[250px] resize-y text-base leading-relaxed"
                    {...field} 
                  />
                  <div className={cn(
                    "text-xs text-right font-medium",
                    wordCount > 1000 ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {wordCount} / 1000 words
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting || wordCount > 1000}>
            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            Save Summary
          </Button>
        </div>
      </form>
    </Form>
  );
}
