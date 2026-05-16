"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { supabase } from "@/lib/supabase-client";
import type { Job } from '@/lib/types';
import axiosInstance from "@/lib/axios";


// Axios-based fetcher with explicit typing for SWR
const fetcher = (url: string) => axiosInstance.get(url) as any;

export function useJobs(params?: Record<string, any>) {
  const { data, error, isLoading } = useSWR<Job[]>(() => {
    if (!params) return '/jobs';
    
    // Skip fetching recommended or referral jobs if userId isn't available yet
    if ((params.view === 'recommended' || params.isReferral === 'true') && !params.userId) return null;
    
    const queryString = new URLSearchParams(params).toString();
    return `/jobs?${queryString}`;
  }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, 
  });

  return {
    jobs: data,
    isLoading,
    isError: error
  };
}

export function useDashboardJobs(params?: Record<string, any>) {
  const { data, error, isLoading } = useSWR<{ recommended: Job[], referral: Job[] }>(() => {
    if (!params) return null; // Dashboard always needs params
    
    // Dashboard requires userId to filter applied jobs and provide recommendations
    if (params.dashboard === 'true' && !params.userId) return null;
    
    const queryString = new URLSearchParams(params).toString();
    return `/jobs?${queryString}`;
  }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  return {
    data: data,
    isLoading,
    isError: error
  };
}


export function useApplications(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
  const { data, error, isLoading, mutate } = useSWR<any[]>(
      `/applications${queryString}`, 
      fetcher,
      {
          revalidateOnFocus: false,
          dedupingInterval: 60000,
      }
  );

  return {
      applications: data || [],
      isLoading,
      isError: error,
      mutateApplications: mutate,
  };
}



export function useNotifications(userId?: string, options: { skip?: boolean } = {}) {
    const [notifications, setNotifications] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId || options.skip) {
            setNotifications(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const fetchInitialNotifications = async () => {
            if (!userId) return;
            try {
                const res = await fetch(`/api/notifications?userId=${userId}`);
                const data = await res.json();
                setNotifications(data);
                setIsLoading(false);
                
                // 2. Setup Real-time Subscription for all resolved PKs
                if (data && Array.isArray(data)) {
                    const uniquePks = Array.from(new Set(data.map((n: any) => n.userPk).filter(Boolean))) as number[];
                    
                    if (uniquePks.length > 0) {
                        const channelName = `notifications_${userId}_${Date.now()}`;
                        const channel = supabase
                            .channel(channelName)
                            .on(
                                'postgres_changes',
                                {
                                    event: '*',
                                    schema: 'public',
                                    table: 'notifications',
                                },
                                (payload: any) => {
                                    // Client-side filtering to support multi-role PKs
                                    if (!uniquePks.includes(payload.new?.user_pk || payload.old?.user_pk)) return;

                                    if (payload.eventType === 'INSERT') {
                                        setNotifications(prev => {
                                            const newNotif = {
                                                id: payload.new.id,
                                                ...payload.new,
                                                timestamp: payload.new.created_at,
                                                userPk: payload.new.user_pk // Map for consistency
                                            };
                                            return [newNotif, ...(prev || [])];
                                        });
                                    } else if (payload.eventType === 'UPDATE') {
                                        setNotifications(prev => 
                                            (prev || []).map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n)
                                        );
                                    } else if (payload.eventType === 'DELETE') {
                                        setNotifications(prev => 
                                            (prev || []).filter(n => n.id !== payload.old.id)
                                        );
                                    }
                                }
                            )
                            .subscribe();
                            
                        (window as any)._notifChannel = channel; // For cleanup
                    }
                }
            } catch (err: any) {
                console.error("Notifications fetch error:", err);
                setError(err);
                setIsLoading(false);
            }
        };

        fetchInitialNotifications();

        return () => {
            const channel = (window as any)._notifChannel;
            if (channel) {
                supabase.removeChannel(channel);
                delete (window as any)._notifChannel;
            }
        };
    }, [userId, options.skip]);

    return {
        notifications,
        isLoading,
        isError: error,
        mutateNotifications: () => {} 
    };
}
