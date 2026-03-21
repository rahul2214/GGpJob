
"use client";

import { useState, useEffect } from "react";
import useSWR from 'swr';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { Job } from '@/lib/types';
import axiosInstance from "@/lib/axios";

// Axios-based fetcher with explicit typing for SWR
const fetcher = (url: string) => axiosInstance.get(url) as any;

export function useJobs(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
  const { data, error, isLoading } = useSWR<Job[]>(`/jobs${queryString}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });

  return {
    jobs: data,
    isLoading,
    isError: error
  }
}

export function useDashboardJobs(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
  const { data, error, isLoading } = useSWR<{ recommended: Job[], referral: Job[] }>(`/jobs${queryString}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  return {
    data: data,
    isLoading,
    isError: error
  }
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



export function useNotifications(userId?: string) {
    const [notifications, setNotifications] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId) {
            setNotifications(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const q = query(
            collection(db, "notifications"),
            where("userId", "==", userId)
            // Temporarily removing orderBy to test if it's an index issue
            // orderBy("createdAt", "desc")
        );


        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                const notificationsData = snapshot.docs.map(doc => {
                    const data = doc.data();
                    // Convert Firestore Timestamp to Date/String
                    let timestamp = new Date().toISOString();
                    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                        timestamp = data.createdAt.toDate().toISOString();
                    } else if (data.timestamp) {
                        // Handle legacy timestamp format or if already a string
                        timestamp = data.timestamp;
                    }

                    return {
                        id: doc.id,
                        ...data,
                        timestamp: timestamp
                    };
                });

                // Manually sort since we removed orderBy
                notificationsData.sort((a: any, b: any) => {
                    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                });
                setNotifications(notificationsData);
                setIsLoading(false);
            },
            (err) => {
                console.error("Firestore notification listener error:", err);
                setError(err as Error);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId]);

    return {
        notifications,
        isLoading,
        isError: error,
        // No longer need manual mutate with real-time listener
        mutateNotifications: () => {} 
    };
}
