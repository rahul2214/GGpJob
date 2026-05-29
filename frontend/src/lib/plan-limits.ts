export type JobseekerPlanType = 'none' | 'basic' | 'premium' | 'talent' | 'pro' | 'free' | 'jobseeker_basic' | 'jobseeker_premium' | 'jobseeker_pro';

export interface PlanLimits {
    referralAppliesPerMonth: number;
    activePendingReferrals: number;
    referralUnlocksPerMonth: number;
    includedCredits: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
    free: {
        referralAppliesPerMonth: 5,
        activePendingReferrals: 2,
        referralUnlocksPerMonth: 0,
        includedCredits: 2
    },
    none: {
        referralAppliesPerMonth: 5,
        activePendingReferrals: 2,
        referralUnlocksPerMonth: 0,
        includedCredits: 2
    },
    basic: {
        referralAppliesPerMonth: 10,
        activePendingReferrals: 3,
        referralUnlocksPerMonth: 10,
        includedCredits: 4
    },
    jobseeker_basic: {
        referralAppliesPerMonth: 10,
        activePendingReferrals: 3,
        referralUnlocksPerMonth: 10,
        includedCredits: 4
    },
    premium: {
        referralAppliesPerMonth: 25,
        activePendingReferrals: 5,
        referralUnlocksPerMonth: 20,
        includedCredits: 20
    },
    jobseeker_premium: {
        referralAppliesPerMonth: 25,
        activePendingReferrals: 5,
        referralUnlocksPerMonth: 20,
        includedCredits: 20
    },
    pro: {
        referralAppliesPerMonth: 75,
        activePendingReferrals: 10,
        referralUnlocksPerMonth: 60,
        includedCredits: 60
    },
    jobseeker_pro: {
        referralAppliesPerMonth: 75,
        activePendingReferrals: 10,
        referralUnlocksPerMonth: 60,
        includedCredits: 60
    },
    talent: { // Recruiter plan mapped to pro limits if jobseeker somehow has it
        referralAppliesPerMonth: 75,
        activePendingReferrals: 10,
        referralUnlocksPerMonth: 60,
        includedCredits: 60
    }
};

export function getPlanLimits(planType?: JobseekerPlanType | null): PlanLimits {
    const type = (planType || 'free').toLowerCase();
    return PLAN_LIMITS[type] || PLAN_LIMITS['free'];
}
