
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Briefcase, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Notification {
    id: string;
    jobTitle: string;
    jobId: string;
    statusName: string;
    timestamp: string;
}

export default function NotificationsPage() {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        } else if (user) {
            setLoading(true);
            fetch(`/api/notifications?userId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    setNotifications(Array.isArray(data) ? data : []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch notifications", err);
                    setLoading(false);
                });
        }
    }, [user, userLoading, router]);

    const renderIcon = (status: string) => {
        switch (status) {
            case 'Profile Viewed':
                return <Eye className="h-5 w-5 text-blue-500" />;
            default:
                return <Briefcase className="h-5 w-5 text-gray-500" />;
        }
    };
    
    if (loading || userLoading) {
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
                    {notifications.length > 0 ? (
                        <div className="space-y-2">
                            {notifications.map(notif => (
                                <Link key={notif.id} href={`/jobs/${notif.jobId}`} className="block">
                                    <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-muted/50 border-b">
                                        <div className="bg-muted p-2 rounded-full mt-1">
                                            {renderIcon(notif.statusName)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                Your profile was viewed for the <span className="text-primary">{notif.jobTitle}</span> position.
                                            </p>
                                            <p className="text-sm text-muted-foreground">
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
                                We'll let you know when there's something new.
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
