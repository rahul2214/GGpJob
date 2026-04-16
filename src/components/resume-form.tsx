"use client";

import { useState, useEffect } from "react";
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
import { LoaderCircle, FileText, ExternalLink, UploadCloud, Paperclip } from "lucide-react";
import { User } from "@/lib/types";
import { useUser } from "@/contexts/user-context";
import Link from "next/link";
import { Progress } from "./ui/progress";

const formSchema = z.object({
  resumeFile: z.instanceof(File).optional(),
});

type ResumeFormValues = z.infer<typeof formSchema>;

interface ResumeFormProps {
  user: User;
}

export function ResumeForm({ user: initialUser }: ResumeFormProps) {
  const { toast } = useToast();
  const { user, setUser } = useUser();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(formSchema),
  });

  const { formState: { isSubmitting }, reset, watch, setValue } = form;
  const selectedFile = watch("resumeFile");
  
  useEffect(() => {
    // Only reset if the actual user identity changes (login/logout)
    // Avoid resetting on every user object update to preserve unsaved file selections
    if (user?.uuid !== initialUser?.uuid) {
        reset();
    }
  }, [user?.uuid, initialUser?.uuid, reset]);


  const onSubmit = async (data: ResumeFormValues) => {
    if (!user) return;
    if (!data.resumeFile) {
        toast({ title: "No file selected", description: "Please select a resume file to upload.", variant: "destructive" });
        return;
    }
    
    const file = data.resumeFile;
    setUploadProgress(10); // Start progress
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(30);

      if (!user.uuid) throw new Error("User ID is missing. Please refresh and try again.");

      // Upload via Server Proxy to bypass mobile CORS issues
      const response = await fetch(`/api/users/${user.uuid}/resume/upload`, {
          method: "POST",
          body: formData,
      });

      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || response.statusText || "Failed to upload resume.";
          const errorDetails = errorData.details ? `: ${errorData.details}` : "";
          throw new Error(`${errorMessage}${errorDetails}`);
      }
      
      const { resumeUrl } = await response.json();
      
      setUploadProgress(90);
      
      // Update local state
      setUser({ ...user, resumeUrl: resumeUrl });

      setUploadProgress(100);
      toast({ title: "Resume Uploaded!", description: "Your resume was uploaded successfully." });
      
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast({ 
        title: "Upload Failed", 
        description: error.message || "Your resume could not be uploaded. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setTimeout(() => setUploadProgress(null), 500);
      reset();
    }
  };
  
  const currentResumeUrl = user?.resumeUrl;

  return (
    <div className="space-y-4">
        {currentResumeUrl && (
             <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Current Resume</span>
                </div>
                <Button asChild variant="ghost" size="sm">
                    <Link href={currentResumeUrl} target="_blank" download>
                        View Resume <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        )}
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
            control={form.control}
            name="resumeFile"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Upload New Resume</FormLabel>
                <FormControl>
                    <div className="relative">
                       <UploadCloud className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="pl-8"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    if (file.size > 2 * 1024 * 1024) {
                                        toast({
                                            title: "File too large",
                                            description: "Resume must be less than 2MB.",
                                            variant: "destructive"
                                        });
                                        e.target.value = ""; // Clear file
                                        setValue("resumeFile", undefined);
                                        return;
                                    }
                                    setValue("resumeFile", file);
                                }
                            }}
                        />
                    </div>
                </FormControl>
                 <FormMessage />
                </FormItem>
            )}
            />
            
            {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border rounded-md">
                    <Paperclip className="h-4 w-4" />
                    <span>{selectedFile.name}</span>
                </div>
            )}


            {uploadProgress !== null && (
                <div className="space-y-1">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">Uploading... {Math.round(uploadProgress)}%</p>
                </div>
            )}

            <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting || uploadProgress !== null}>
                {(isSubmitting || uploadProgress !== null) && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Upload and Save
            </Button>
            </div>
        </form>
        </Form>
    </div>
  );
}
