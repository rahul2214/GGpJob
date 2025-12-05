
"use client";

import { useState, useEffect } from 'react';
import type { User, Education, Employment, Project, Language, Skill } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from './ui/button';
import Link from 'next/link';
import { Skeleton } from './ui/skeleton';

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

    const getStrengthText = (percentage: number) => {
        if (percentage < 50) return "Beginner";
        if (percentage < 80) return "Intermediate";
        if (percentage < 100) return "All-Star!";
        return "All-Star!";
    };
    
    if (loading) {
        return (
             <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-48 mb-1" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Strength: <span className="text-primary">{getStrengthText(completion)}</span></CardTitle>
                <CardDescription>
                    A complete profile increases your visibility to recruiters.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                    <Progress value={completion} className="w-full" />
                    <span className="font-bold text-base text-primary">{completion}%</span>
                </div>
                {completion < 100 && (
                     <Button asChild variant="secondary">
                        <Link href="/profile">
                            Complete Your Profile
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
