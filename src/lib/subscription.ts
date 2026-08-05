// Subscription status helpers for recruiter expiry flow
// Used by both API routes and frontend

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  planType: string;
  planExpiresAt: string | null;
  gracePeriodEnd: string | null;
  isInGracePeriod: boolean;
  graceDaysRemaining: number;
  daysUntilExpiry: number;
  isExpired: boolean;
  isGracePeriodOver: boolean;
}

/** Compute subscription info from a recruiter DB row */
export function getSubscriptionInfo(recruiter: {
  plan_type?: string;
  plan_expires_at?: string | null;
  subscription_status?: string;
  grace_period_end?: string | null;
}): SubscriptionInfo {
  const now = new Date();
  const planType = recruiter.plan_type || 'none';
  const planExpiresAt = recruiter.plan_expires_at || null;
  const gracePeriodEnd = recruiter.grace_period_end || null;

  const expiryDate = planExpiresAt ? new Date(planExpiresAt) : null;
  const graceDate = gracePeriodEnd ? new Date(gracePeriodEnd) : null;

  const isExpired = !expiryDate || expiryDate < now || planType === 'none';
  const isGracePeriodOver = isExpired && (!graceDate || graceDate < now);
  const isInGracePeriod = isExpired && !!graceDate && graceDate >= now;

  const daysUntilExpiry = expiryDate
    ? Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const graceDaysRemaining = graceDate && isInGracePeriod
    ? Math.max(0, Math.ceil((graceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  let status: SubscriptionStatus = 'active';
  if (recruiter.subscription_status === 'cancelled') {
    status = 'cancelled';
  } else if (isExpired) {
    status = 'expired';
  }

  return {
    status,
    planType,
    planExpiresAt,
    gracePeriodEnd,
    isInGracePeriod,
    graceDaysRemaining,
    daysUntilExpiry,
    isExpired,
    isGracePeriodOver,
  };
}

/** Compute subscription info from frontend User object (camelCase) */
export function getSubscriptionInfoFromUser(user: {
  planType?: string;
  planExpiresAt?: string | null;
  subscriptionStatus?: string;
  gracePeriodEnd?: string | null;
}): SubscriptionInfo {
  return getSubscriptionInfo({
    plan_type: user.planType,
    plan_expires_at: user.planExpiresAt,
    subscription_status: user.subscriptionStatus,
    grace_period_end: user.gracePeriodEnd,
  });
}

/** List of restricted actions for expired recruiters */
export const RESTRICTED_ACTIONS = [
  'post_job',
  'edit_job',
  'duplicate_job',
  'republish_job',
  'boost_job',
  'premium_filters',
  'ai_ranking',
  'ai_resume',
  'ai_interview',
  'premium_messaging',
  'invite_candidate',
  'download_reports',
] as const;

export type RestrictedAction = typeof RESTRICTED_ACTIONS[number];

/** Check if action is blocked for an expired subscription */
export function isActionRestricted(subInfo: SubscriptionInfo, _action: RestrictedAction): boolean {
  return subInfo.isExpired;
}

/** Standard 403 response body for subscription-expired API calls */
export function expiredResponse() {
  return {
    success: false,
    error: 'SUBSCRIPTION_EXPIRED',
    message: 'Renew your subscription to continue using this feature.',
  };
}
