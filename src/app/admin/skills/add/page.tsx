"use client";

import { SkillForm } from "@/components/skill-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";


export default function AddSkillPage() {
    const router = useRouter();
    return (
        <div className="container mx-auto py-4 md:py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
                 <Card className="w-full max-w-2xl">
                     <div className="hidden md:block">
                        <CardHeader>
                            <CardTitle>Add New Skill</CardTitle>
                            <CardDescription>
                                Enter the name for the new predefined skill.
                            </CardDescription>
                        </CardHeader>
                    </div>
                    <CardContent className="pt-6 md:pt-0">
                        <SkillForm skill={null} onSuccess={() => router.push('/admin/skills')} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
