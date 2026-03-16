
"use client"

import { useUser } from "@/contexts/user-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ProfileSections } from "@/components/profile-sections";
import type { User as UserType } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AtSign, Phone, MapPin, Linkedin, FileText, User as UserIcon, Calendar, HeartHandshake } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { format } from "date-fns";

export default function PublicProfilePage() {
    const { user: currentUser, loading: currentUserLoading } = useUser();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [profileUser, setProfileUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);

    const isOwnProfile = currentUser?.id === id;

    const fetchUser = useCallback(async () => {
        if (id) {
            setLoading(true);
            try {
                const res = await fetch(`/api/users/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProfileUser(data);
                } else {
                   setProfileUser(null);
                }
            } catch (error) {
                console.error("Failed to fetch user data", error);
                setProfileUser(null);
            } finally {
                setLoading(false);
            }
        }
    }, [id]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) {
          return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
        }
        return `${name.charAt(0)}`.toUpperCase();
    }
    
    if (loading || currentUserLoading) {
        return (
            <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-6 space-y-0">
                            <Skeleton className="h-20 w-20 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-7 w-48" />
                                <Skeleton className="h-5 w-64" />
                            </div>
                        </CardHeader>
                        <CardContent>
                           <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-24" />
                           </div>
                        </CardContent>
                    </Card>
                    <Separator />
                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                           <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-1/3" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-16 w-full" />
                                </CardContent>
                           </Card>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
    
    if (!profileUser) {
        return <div className="container mx-auto p-4">User not found.</div>;
    }

    const hasPersonalDetails = profileUser.gender || profileUser.maritalStatus || profileUser.dateOfBirth || profileUser.category;
    const hasDiversityDetails = profileUser.disabilityStatus || profileUser.militaryExperience || profileUser.careerBreak;

    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                 <Card>
                    <CardHeader className="flex flex-row items-center gap-6 space-y-0">
                        <Avatar className="h-20 w-20">
                            <AvatarFallback className="text-2xl">
                                {getInitials(profileUser.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl">{profileUser.name}</CardTitle>
                            <CardDescription className="text-md">{profileUser.headline}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                               <AtSign className="h-4 w-4"/> {profileUser.email}
                            </div>
                             <div className="flex items-center gap-2">
                               <Phone className="h-4 w-4"/> {profileUser.phone}
                            </div>
                            {profileUser.location && (
                                 <div className="flex items-center gap-2">
                                   <MapPin className="h-4 w-4"/> {profileUser.location}
                                </div>
                            )}
                             {profileUser.linkedinUrl && (
                                <Link href={profileUser.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                                    <Linkedin className="h-4 w-4"/> LinkedIn
                                </Link>
                            )}
                        </div>
                    </CardContent>
                    {isOwnProfile && (
                        <CardFooter>
                           <button onClick={() => router.push('/profile')} className="text-primary hover:underline text-sm">
                                Edit My Profile
                            </button>
                        </CardFooter>
                    )}
                </Card>

                {profileUser.role === 'Job Seeker' && (
                    <>
                        {hasPersonalDetails && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <UserIcon className="h-5 w-5 text-primary" />
                                        Personal Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                                        {profileUser.gender && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-semibold w-24">Gender:</span>
                                                <span className="text-muted-foreground">{profileUser.gender}</span>
                                            </div>
                                        )}
                                        {profileUser.maritalStatus && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-semibold w-24">Marital Status:</span>
                                                <span className="text-muted-foreground">{profileUser.maritalStatus}</span>
                                            </div>
                                        )}
                                        {profileUser.dateOfBirth && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-semibold w-24">Date of Birth:</span>
                                                <span className="text-muted-foreground">{format(new Date(profileUser.dateOfBirth), "PPP")}</span>
                                            </div>
                                        )}
                                        {profileUser.category && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-semibold w-24">Category:</span>
                                                <span className="text-muted-foreground">{profileUser.category}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {hasDiversityDetails && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <HeartHandshake className="h-5 w-5 text-primary" />
                                        Diversity and Inclusion
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                                        {profileUser.disabilityStatus && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-semibold w-32">Disability:</span>
                                                <span className="text-muted-foreground">{profileUser.disabilityStatus}</span>
                                            </div>
                                        )}
                                        {profileUser.militaryExperience && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-semibold w-32">Military Service:</span>
                                                <span className="text-muted-foreground">{profileUser.militaryExperience}</span>
                                            </div>
                                        )}
                                        {profileUser.careerBreak && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-semibold w-32">Career Break:</span>
                                                <span className="text-muted-foreground">{profileUser.careerBreak}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {profileUser.summary && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-primary" />
                                        Professional Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                        {profileUser.summary}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                        <Separator />
                        <ProfileSections userId={profileUser.id} isEditable={isOwnProfile} />
                    </>
                )}
            </div>
        </div>
    );
}
