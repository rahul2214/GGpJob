"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import type { MasterSkill } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SkillForm } from "@/components/skill-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditSkillPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [skill, setSkill] = useState<MasterSkill | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchSkill = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/skills');
                const skills = await res.json();
                const skillToEdit = Array.isArray(skills) ? skills.find(s => String(s.id) === id) : null;
                
                if (skillToEdit) {
                    setSkill(skillToEdit);
                } else {
                    notFound();
                }
            } catch (error) {
                console.error("Failed to fetch skill", error);
                notFound();
            } finally {
                setLoading(false);
            }
        };

        fetchSkill();
    }, [id]);
    
    if (loading) {
       return (
            <div className="container mx-auto py-4 md:py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center">
                    <Card className="w-full max-w-2xl">
                        <div className="hidden md:block">
                            <CardHeader>
                                 <Skeleton className="h-8 w-40 mb-2" />
                                 <Skeleton className="h-4 w-full" />
                            </CardHeader>
                        </div>
                        <CardContent className="pt-6 md:pt-0">
                           <div className="space-y-8">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="flex justify-end">
                                    <Skeleton className="h-10 w-32" />
                                </div>
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!skill) {
        notFound();
    }


    return (
        <div className="container mx-auto py-4 md:py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
                 <Card className="w-full max-w-2xl">
                     <div className="hidden md:block">
                        <CardHeader>
                            <CardTitle>Edit Skill</CardTitle>
                            <CardDescription>
                                Update the details of the job predetermined skill.
                            </CardDescription>
                        </CardHeader>
                    </div>
                    <CardContent className="pt-6 md:pt-0">
                        <SkillForm skill={skill} onSuccess={() => router.push('/admin/skills')} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
