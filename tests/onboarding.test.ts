import { describe, expect, it } from "vitest";
import { getMissingOnboardingFields, isOnboardingComplete } from "@/lib/onboarding";

const completeUser = {
  phone: "+919876543210",
  country: "India",
  state: "Telangana",
  currentCity: "Hyderabad",
  resumeUrl: "r2://resumes/abc.pdf",
  skills: [{ id: "1", name: "React" }],
};

describe("onboarding completeness", () => {
  it("treats a fully filled profile as complete", () => {
    expect(isOnboardingComplete(completeUser)).toBe(true);
  });

  it("is incomplete right after signup (phone only)", () => {
    expect(getMissingOnboardingFields({ phone: "+919876543210" })).toEqual(["location", "resume", "skills"]);
  });

  it("is incomplete when only the resume was saved", () => {
    const user = { phone: "+919876543210", resumeUrl: "r2://x.pdf" };
    expect(isOnboardingComplete(user)).toBe(false);
    expect(getMissingOnboardingFields(user)).toEqual(["location", "skills"]);
  });

  it("requires country, state and city", () => {
    expect(getMissingOnboardingFields({ ...completeUser, state: null })).toEqual(["location"]);
    expect(getMissingOnboardingFields({ ...completeUser, currentCity: null, cityId: 42 })).toEqual([]);
  });

  it("rejects short phone numbers", () => {
    expect(getMissingOnboardingFields({ ...completeUser, phone: "+91 12" })).toEqual(["phone"]);
  });

  it("accepts a raw jobseekers row", () => {
    const row = {
      phone: "9876543210",
      current_country_id: 1,
      current_state_province_id: 2,
      current_city_id: 3,
      resume_url: "r2://x.pdf",
      jobseeker_skills: [{ id: 9 }],
    };
    expect(isOnboardingComplete(row)).toBe(true);
    expect(isOnboardingComplete({ ...row, jobseeker_skills: [] })).toBe(false);
  });

  it("handles a missing user", () => {
    expect(isOnboardingComplete(null)).toBe(false);
  });
});
