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
import { LoaderCircle } from "lucide-react";
import type { MasterSkill } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "Skill name must be at least 2 characters long."),
});

type SkillFormValues = z.infer<typeof formSchema>;

interface SkillFormProps {
  skill: MasterSkill | null;
  onSuccess: () => void;
}

export function SkillForm({ skill, onSuccess }: SkillFormProps) {
  const { toast } = useToast();
  const form = useForm<SkillFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: skill?.name || "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: SkillFormValues) => {
    try {
      const url = skill ? `/api/skills/${skill.id}` : "/api/skills";
      const method = skill ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${skill ? 'update' : 'create'} skill`);
      }
      
      toast({
        title: "Success!",
        description: `Skill successfully ${skill ? 'updated' : 'created'}.`,
      });
      onSuccess();
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skill Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. React.js" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            {skill ? "Save Changes" : "Create Skill"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
