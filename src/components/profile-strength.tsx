
"use client";

import { useMemo } from 'react';
import type { User } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Lightbulb } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';

interface ProfileStrengthProps {
    user: User;
}

export function ProfileStrength({ user }: ProfileStrengthProps) {
    const { completion, missingSections } = useMemo(() => {
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

        // 3. Stats from profileStats (calculated on server)
        if (user.profileStats) {
            if (user.profileStats.hasEducation) score++; else missing.push('education');
            if (user.profileStats.hasEmployment) score++; else missing.push('work experience');
            if (user.profileStats.hasProjects) score++;
            if (user.profileStats.hasSkills) score++; else missing.push('skills');
        } else {
            // Fallback for missing stats (shouldn't happen with updated API)
            missing.push('profile details');
        }

        return {
            completion: Math.round((score / totalPoints) * 100),
            missingSections: missing
        };
    }, [user]);

    const getStrengthInfo = (percentage: number) => {
        if (percentage < 50) return { text: "Beginner", color: "bg-red-500 text-red-800 border-red-200" };
        if (percentage < 80) return { text: "Intermediate", color: "bg-blue-100 text-blue-800 border-blue-200" };
        return { text: "All-Star", color: "bg-green-100 text-green-800 border-green-200" };
    };

    const strengthInfo = getStrengthInfo(completion);
    
    const getTipMessage = () => {
        if (completion >= 100) return 'Your profile is complete and looking great!';

        const nextLevel = completion < 85 ? 85 : 100;
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

    return (
        <Card className="border-0 border-t-4 border-blue-500 shadow-md">
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
