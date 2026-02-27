
"use client";

import useSWR from 'swr';
import type { Job } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) {
        throw new Error('An error occurred while fetching the data.');
    }
    return res.json();
});

export function useJobs(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
  const { data, error, isLoading } = useSWR<Job[]>(`/api/jobs${queryString}`, fetcher, {
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
  const { data, error, isLoading } = useSWR<{ recommended: Job[], referral: Job[] }>(`/api/jobs${queryString}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  return {
    data: data,
    isLoading,
    isError: error
  }
}

export function useSavedJobs(userId?: string) {
    const { data, error, isLoading, mutate } = useSWR<string[]>(
        userId ? `/api/users/${userId}/saved-jobs` : null, 
        async (url) => {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch saved jobs');
            const savedJobsData: { jobId: string }[] = await res.json();
            return savedJobsData.map(item => item.jobId);
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        }
    );

    return {
        savedJobs: data,
        isLoading,
        isError: error,
        mutateSavedJobs: mutate,
    };
}

export function useNotifications(userId?: string) {
    const { data, error, isLoading, mutate } = useSWR<any[]>(
        userId ? `/api/notifications?userId=${userId}` : null,
        fetcher,
        {
            refreshInterval: 30000, // Refresh every 30 seconds
            revalidateOnFocus: true,
        }
    );

    return {
        notifications: data,
        isLoading,
        isError: error,
        mutateNotifications: mutate,
    };
}
