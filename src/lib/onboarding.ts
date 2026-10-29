export type OnboardingField = "phone" | "location" | "resume" | "skills";

const nonEmptyArray = (value: unknown) => Array.isArray(value) && value.length > 0;

/**
 * Lists the required onboarding fields a jobseeker has not filled in yet.
 *
 * These are exactly the fields the /onboarding form insists on, so every
 * check (client redirects, login/signup, the OAuth callback) agrees on when
 * a profile is complete. Accepts either the client `User` shape or a raw
 * `jobseekers` row.
 */
export function getMissingOnboardingFields(user: any): OnboardingField[] {
    if (!user) return ["phone", "location", "resume", "skills"];

    const missing: OnboardingField[] = [];

    const phoneDigits = user.phone ? String(user.phone).replace(/\D/g, "") : "";
    if (phoneDigits.length < 7) missing.push("phone");

    const hasCountry = Boolean(user.country || user.countryId || user.current_country_id);
    const hasState = Boolean(user.state || user.stateId || user.current_state_province_id);
    const hasCity = Boolean(user.currentCity || user.cityId || user.current_city || user.current_city_id);
    if (!(hasCountry && hasState && hasCity)) missing.push("location");

    const resume = user.resumeUrl ?? user.resume_url;
    if (!resume || String(resume).trim() === "") missing.push("resume");

    const hasSkills = Boolean(
        user.profileStats?.hasSkills ||
        nonEmptyArray(user.skills) ||
        nonEmptyArray(user.skillIds) ||
        nonEmptyArray(user.skill_ids) ||
        nonEmptyArray(user.jobseeker_skills)
    );
    if (!hasSkills) missing.push("skills");

    return missing;
}

/**
 * A jobseeker's onboarding is complete once they have a phone number,
 * a full location (country, state and city), a resume and at least one skill.
 */
export function isOnboardingComplete(user: any): boolean {
    if (!user) return false;
    return getMissingOnboardingFields(user).length === 0;
}
