
/**
 * Helper to check if a jobseeker's onboarding is complete.
 * A profile is considered complete if domain, resume, phone, and skills are present.
 */
export function isOnboardingComplete(user: any): boolean {
    return !!(
        user?.domainId &&
        user?.resumeUrl &&
        user?.phone &&
        user?.phone.length >= 10 &&
        user?.profileStats?.hasSkills
    );
}
