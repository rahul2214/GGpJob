/**
 * Helper to check if a jobseeker's onboarding is complete.
 * Requires: resume URL, phone, skills, country, and preferred job titles.
 */
export function isOnboardingComplete(user: any): boolean {
    return !!(
        user?.resumeUrl &&
        user?.phone &&
        user?.phone.length >= 10 &&
        user?.profileStats?.hasSkills
    );
}