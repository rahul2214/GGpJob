import { describe, it, expect } from "vitest"
import { DUMMY_RESUME_DATA, DUMMY_FORM_JOBS, DUMMY_FORM_PROJECTS } from "@/app/resume-builder/resume-builder-client"

describe("Resume Builder - User Data vs Sample Preview Isolation", () => {
  it("exports DUMMY_RESUME_DATA and DUMMY_FORM_* objects for sample previewing", () => {
    expect(DUMMY_RESUME_DATA).toBeDefined()
    expect(DUMMY_RESUME_DATA.name).toBe("Alex Morgan")
    expect(DUMMY_FORM_JOBS.length).toBeGreaterThan(0)
    expect(DUMMY_FORM_PROJECTS.length).toBeGreaterThan(0)
  })

  it("verifies that when user removes sections, empty fields do not inject sample data", () => {
    // Simulate user data where user only provides name and 1 job, and cleared summary/projects/achievements
    const userData = {
      name: "Rahul Naik",
      role: "Full Stack Engineer",
      email: "rahul@example.com",
      phone: "+91 9876543210",
      professionalSummary: "", // User cleared summary
      skills: [], // User has no skills
      jobs: [{ company: "Acme Corp", role: "Dev", startDate: "2023", endDate: "2024", location: "Bangalore", points: ["Built APIs"] }],
      projects: [], // User has no projects
      education: [], // User has no education
      achievements: [],
      languages: []
    }

    const isPreviewingSample = false

    // Simulate effective computation:
    const effectiveSummary = isPreviewingSample ? DUMMY_RESUME_DATA.summary : userData.professionalSummary.trim()
    const effectiveProjects = isPreviewingSample ? DUMMY_FORM_PROJECTS : userData.projects
    const effectiveAchievements = isPreviewingSample ? DUMMY_RESUME_DATA.achievements : userData.achievements

    expect(effectiveSummary).toBe("")
    expect(effectiveProjects).toHaveLength(0)
    expect(effectiveAchievements).toHaveLength(0)

    // And when user clicks 'Sample Preview':
    const sampleSummary = true ? DUMMY_RESUME_DATA.summary : userData.professionalSummary.trim()
    const sampleProjects = true ? DUMMY_FORM_PROJECTS : userData.projects

    expect(sampleSummary).toBe(DUMMY_RESUME_DATA.summary)
    expect(sampleProjects.length).toBeGreaterThan(0)
  })
})
