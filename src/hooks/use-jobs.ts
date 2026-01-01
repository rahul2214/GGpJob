
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
