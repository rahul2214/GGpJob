
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Briefcase, Eye, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-jobs";

interface Notification {
    id: string;
    jobTitle: string;
    jobId: string;
    message: string;
    statusName: string;
    timestamp: string;
}

export default function NotificationsPage() {
    const { user, setUser, loading: userLoading } = useUser();
    const router = useRouter();
    const { notifications, isLoading: notificationsLoading } = useNotifications(user?.id);

    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        }
    }, [user, userLoading, router]);

    // Mark notifications as read when the component mounts and notifications are loaded
    useEffect(() => {
        if (user && notifications && notifications.length > 0) {
            const latestTimestamp = notifications[0].timestamp; // Notifications are sorted desc
            
            // Only update if the latest notification is newer than what we last recorded
            if (!user.notificationLastViewedAt || new Date(latestTimestamp).getTime() > new Date(user.notificationLastViewedAt).getTime()) {
                const updateNotificationViewed = async () => {
                    try {
                        const response = await fetch(`/api/users/${user.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                ...user,
                                notificationLastViewedAt: latestTimestamp,
                            }),
                        });
                        
                        if (response.ok) {
                            const updatedUser = await response.json();
                            setUser(updatedUser);
                        }
                    } catch (error) {
                        console.error("Failed to update notification view status", error);
                    }
                };
                
                updateNotificationViewed();
            }
        }
    }, [user, notifications, setUser]);

    const renderIcon = (status: string) => {
        switch (status) {
            case 'Profile Viewed':
                return <Eye className="h-5 w-5 text-blue-500" />;
            case 'Selected':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'Not Suitable':
                return <XCircle className="h-5 w-5 text-destructive" />;
            default:
                return <Briefcase className="h-5 w-5 text-gray-500" />;
        }
    };
    
    if (notificationsLoading || userLoading) {
        return (
            <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Skeleton className="h-8 w-8 rounded-full" />
                           <Skeleton className="h-7 w-48" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                           <div key={i} className="flex items-start space-x-4 p-4 border-b">
                                <Skeleton className="h-10 w-10 rounded-full mt-1" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                           </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
         <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-6 w-6"/>
                        Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {notifications && notifications.length > 0 ? (
                        <div className="space-y-2">
                            {notifications.map((notif: Notification) => (
                                <Link key={notif.id} href={`/jobs/${notif.jobId}`} className="block">
                                    <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-muted/50 border-b">
                                        <div className="bg-muted p-2 rounded-full mt-1">
                                            {renderIcon(notif.statusName)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm sm:text-base">
                                                {notif.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-12">
                             <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">No notifications yet</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                We'll let you know when your application status changes.
                            </p>
                            <Button asChild className="mt-6">
                                <Link href="/jobs">
                                    Browse Jobs
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
