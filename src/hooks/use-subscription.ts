'use client';

import { useMemo } from 'react';
import { useUser } from '@/contexts/user-context';
import { getSubscriptionInfoFromUser, SubscriptionInfo, isActionRestricted, RestrictedAction } from '@/lib/subscription';

/**
 * Hook to get subscription status for the current recruiter user.
 * Returns null if user is not a recruiter.
 */
export function useSubscription(): SubscriptionInfo | null {
  const { user } = useUser();

  return useMemo(() => {
    if (!user || user.role !== 'Recruiter') return null;
    return getSubscriptionInfoFromUser(user);
  }, [user]);
}

/**
 * Hook to check if a specific action is restricted.
 */
export function useIsRestricted(action: RestrictedAction): boolean {
  const sub = useSubscription();
  if (!sub) return false;
  return isActionRestricted(sub, action);
}
