
"use client";

import { useState, useEffect } from 'react';
import type { User, Education, Employment, Project, Language, Skill } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from './ui/skeleton';
import { Lightbulb, TrendingUp, User as UserIcon } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';

interface ProfileStrengthProps {
    user: User;
}

export function ProfileStrength({ user }: ProfileStrengthProps) {
    const [completion, setCompletion] = useState(0);
    const [loading, setLoading] = useState(true);
    const [missingSections, setMissingSections] = useState<string[]>([]);

    useEffect(() => {
        const calculateCompletion = async () => {
            if (!user) return;
            setLoading(true);

            let score = 0;
            const totalPoints = 11;
            const missing: string[] = [];

            // 1. Basic info from user object
            if (user.name) score++;
            if (user.email) score++;
            if (user.phone) score++;
            if (user.headline) score++; else missing.push('headline');
            if (user.locationId) score++; else missing.push('location');
            if (user.domainId) score++; else missing.push('domain');
            
            // 2. Resume
            if (user.resumeUrl) score++; else missing.push('resume');

            // 3. Subcollections
            try {
                const res = await fetch(`/api/users/${user.id}/profile`);
                if(res.ok) {
                    const profileData: {
                        education: Education[],
                        employment: Employment[],
                        projects: Project[],
                        languages: Language[],
                        skills: Skill[],
                    } = await res.json();
                    
                    if (profileData.education?.length > 0) score++; else missing.push('education');
                    if (profileData.employment?.length > 0) score++; else missing.push('work experience');
                    if (profileData.projects?.length > 0) score++;
                    if (profileData.skills?.length > 0) score++; else missing.push('skills');
                }

            } catch (error) {
                console.error("Failed to fetch profile details for strength calculation", error);
            }

            setCompletion(Math.round((score / totalPoints) * 100));
            setMissingSections(missing);
            setLoading(false);
        };

        calculateCompletion();
    }, [user]);

    const getStrengthInfo = (percentage: number) => {
        if (percentage < 50) return { text: "Beginner", color: "bg-red-500 text-red-800 border-red-200" };
        if (percentage < 80) return { text: "Intermediate", color: "bg-blue-100 text-blue-800 border-blue-200" };
        return { text: "All-Star", color: "bg-green-100 text-green-800 border-green-200" };
    };

    const strengthInfo = getStrengthInfo(completion);
    
    const getTipMessage = () => {
        if (completion >= 100) return 'Your profile is complete and looking great!';

        const nextLevel = completion < 80 ? 85 : 100;
        let suggestions: string[] = [];

        if (missingSections.includes('skills')) suggestions.push('skills');
        if (missingSections.includes('education')) suggestions.push('education');
        if (missingSections.includes('work experience')) suggestions.push('work experience');
        if (missingSections.includes('headline')) suggestions.push('headline');
        if (missingSections.includes('resume')) suggestions.push('resume');
        
        if (suggestions.length > 0) {
            return `Add your ${suggestions.slice(0, 3).join(', ')} to reach ${nextLevel}% completion.`;
        }
        
        return `Add more details to your profile to reach ${nextLevel}% completion.`
    }

    if (loading) {
        return (
             <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex justify-between items-end">
                       <Skeleton className="h-8 w-16" />
                       <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-none border-t-4 border-blue-500">
            <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Profile Strength</h3>
                    <Badge variant="secondary" className={cn("font-medium", strengthInfo.color)}>{strengthInfo.text}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">A complete profile increases your visibility to recruiters.</p>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <span className="text-2xl font-bold text-primary">{completion}%</span>
                        <span className="text-sm text-muted-foreground">Complete</span>
                    </div>
                    <Progress value={completion} className="h-2" />
                </div>
                
                 {completion < 100 && (
                    <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3 border border-blue-200 text-blue-800">
                        <Lightbulb className="h-5 w-5 mt-0.5 shrink-0" />
                        <p className="text-sm"><span className="font-semibold">Tip:</span> {getTipMessage()}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
