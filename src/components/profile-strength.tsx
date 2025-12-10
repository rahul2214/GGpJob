
"use client";

import { useState, useEffect } from 'react';
import type { User, Education, Employment, Project, Language, Skill } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Button } from './ui/button';
import Link from 'next/link';
import { Skeleton } from './ui/skeleton';
import { TrendingUp, User as UserIcon } from 'lucide-react';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';

interface ProfileStrengthProps {
    user: User;
}

export function ProfileStrength({ user }: ProfileStrengthProps) {
    const [completion, setCompletion] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const calculateCompletion = async () => {
            if (!user) return;
            setLoading(true);

            let score = 0;
            const totalPoints = 11;

            // 1. Basic info from user object
            if (user.name) score++;
            if (user.email) score++;
            if (user.phone) score++;
            if (user.headline) score++;
            if (user.locationId) score++;
            if (user.domainId) score++;
            
            // 2. Resume
            if (user.resumeUrl) score++;

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
                    
                    if (profileData.education?.length > 0) score++;
                    if (profileData.employment?.length > 0) score++;
                    if (profileData.projects?.length > 0) score++;
                    if (profileData.skills?.length > 0) score++;
                }

            } catch (error) {
                console.error("Failed to fetch profile details for strength calculation", error);
            }

            setCompletion(Math.round((score / totalPoints) * 100));
            setLoading(false);
        };

        calculateCompletion();
    }, [user]);

    const getStrengthInfo = (percentage: number) => {
        if (percentage < 50) return { text: "Beginner", color: "bg-red-500" };
        if (percentage < 80) return { text: "Intermediate", color: "bg-yellow-500" };
        return { text: "All-Star", color: "bg-green-500" };
    };

    const strengthInfo = getStrengthInfo(completion);
    
    if (loading) {
        return (
             <div className="p-4 border rounded-lg bg-card">
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-6" />
                </div>
                <Separator />
                <div className="mt-4 space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                     <div className="flex justify-between text-sm text-muted-foreground">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                     <Skeleton className="h-10 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 border rounded-lg bg-card space-y-4">
            <div className="flex items-center justify-between">
                <p className="font-semibold text-lg">Profile Strength</p>
                <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <Separator />
            <div>
                 <p className="text-sm text-muted-foreground mb-4">
                    A complete profile increases your visibility to recruiters.
                </p>
                <Progress value={completion} className="w-full h-2 mb-2" indicatorClassName={strengthInfo.color} />
                 <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{strengthInfo.text}</span>
                    <span>{completion}%</span>
                </div>
            </div>
            {completion < 100 && (
                <Button asChild className="w-full">
                    <Link href="/profile">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Complete Your Profile
                    </Link>
                </Button>
            )}
        </div>
    );
}
