/**
 * Helper to check if a jobseeker's onboarding is complete.
 * Complete if user has a valid phone number and any core profile data (resume, skills, experience, education, headline, or referral status).
 */
export function isOnboardingComplete(user: any): boolean {
    if (!user) return false;
    
    const hasSkills = Boolean(
        user.profileStats?.hasSkills ||
        (Array.isArray(user.skills) && user.skills.length > 0) ||
        (Array.isArray(user.skill_ids) && user.skill_ids.length > 0)
    );

    const hasProfileDetails = Boolean(
        user.resumeUrl ||
        hasSkills ||
        user.workStatus ||
        user.headline ||
        (Array.isArray(user.experience) && user.experience.length > 0) ||
        (Array.isArray(user.education) && user.education.length > 0)
    );

    return Boolean(
        user.phone &&
        user.phone.length >= 10 &&
        hasProfileDetails
    );
}