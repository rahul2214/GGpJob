import { describe, it, expect } from "vitest"
import React from "react"
import { renderToBuffer } from "@react-pdf/renderer"
import { ResumePdfDocument } from "@/components/resume/ResumePdfDocument"
import { DUMMY_RESUME_DATA } from "@/app/resume-builder/resume-builder-client"

const ALL_TEMPLATE_IDS = [
  // Original 12 templates
  "classic-serif",
  "modern-minimal",
  "executive-navy",
  "compact-tech",
  "two-column",
  "creative-bold",
  "elegant-sidebar",
  "ats-clean",
  "photo-modern-sidebar",
  "photo-executive",
  "photo-creative",
  "photo-minimal",
  // 6 New premier ATS templates
  "ats-ivy-league",
  "ats-tech-faang",
  "ats-executive-modern",
  "ats-modern-swiss",
  "ats-emerald-professional",
  "ats-compact-onepage",
] as const

const SAMPLE_RESUME_DATA = {
  name: "Alex Morgan",
  role: "Senior Staff Software Engineer",
  contact: {
    email: "alex.morgan@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexmorgan",
    github: "github.com/alexmorgan",
    portfolio: "alexmorgan.dev",
  },
  summary:
    "High-impact systems engineer with 8+ years architecting fault-tolerant distributed platforms and cloud microservices processing 50M+ daily events.",
  skills: [
    {
      category: "Languages",
      skills: ["TypeScript", "Go", "Python", "Rust", "SQL"],
    },
    {
      category: "Cloud & Infrastructure",
      skills: ["AWS", "Kubernetes", "Docker", "Terraform", "Kafka"],
    },
    {
      category: "Frameworks & Databases",
      skills: ["React", "Next.js", "Node.js", "PostgreSQL", "Redis"],
    },
  ],
  experience: [
    {
      company: "Stripe",
      role: "Staff Infrastructure Engineer",
      dates: "2022 - Present",
      location: "San Francisco, CA",
      bullets: [
        "Led migration of payment routing pipeline reducing p99 latency by **42%** across 12 regions.",
        "Architected multi-tenant rate-limiter handling **120k requests/sec** with 99.999% availability.",
        "Mentored 6 senior engineers and standardized team CI/CD deployment verification procedures.",
      ],
    },
    {
      company: "DoorDash",
      role: "Senior Backend Engineer",
      dates: "2019 - 2022",
      location: "San Francisco, CA",
      bullets: [
        "Designed dispatch matching engine optimization that saved **$4.2M annually** in delivery delays.",
        "Scaled dispatch event streams using Apache Kafka and Redis cluster caching.",
      ],
    },
  ],
  projects: [
    {
      name: "Distributed Consensus Engine",
      techStack: "Go, Raft, gRPC",
      projectLink: "github.com/alexmorgan/consensus-raft",
      bullets: [
        "Implemented Raft consensus algorithm with cluster leader election and log replication.",
        "Achieved 10,000 commits per second benchmark across 5 distributed nodes.",
      ],
    },
  ],
  education: [
    {
      institution: "Stanford University",
      degree: "B.S. in Computer Science",
      fieldOfStudy: "Systems & Distributed Networks",
      dates: "2015 - 2019",
      grade: "3.92 GPA",
    },
  ],
  achievements: [
    "AWS Certified Solutions Architect – Professional (2024)",
    "Winner of Stripe Global Hackathon 2023 for Autonomous Infrastructure Recovery",
  ],
  languages: ["English (Native)", "Spanish (Professional)"],
}

describe("Resume Templates & PDF Rendering Pipeline", () => {
  it("includes all 18 templates including the 6 new premier ATS templates", () => {
    expect(ALL_TEMPLATE_IDS).toHaveLength(18)
    expect(ALL_TEMPLATE_IDS).toContain("ats-ivy-league")
    expect(ALL_TEMPLATE_IDS).toContain("ats-tech-faang")
    expect(ALL_TEMPLATE_IDS).toContain("ats-executive-modern")
    expect(ALL_TEMPLATE_IDS).toContain("ats-modern-swiss")
    expect(ALL_TEMPLATE_IDS).toContain("ats-emerald-professional")
    expect(ALL_TEMPLATE_IDS).toContain("ats-compact-onepage")
  })

  describe("Server-Side PDF Buffer Generation for all 18 templates", () => {
    for (const templateId of ALL_TEMPLATE_IDS) {
      it(`renders valid PDF buffer for template "${templateId}"`, async () => {
        const element = React.createElement(ResumePdfDocument, {
          data: SAMPLE_RESUME_DATA,
          template: templateId,
        })

        const buffer = await renderToBuffer(element as any)
        expect(buffer).toBeDefined()
        expect(buffer.length).toBeGreaterThan(1000)

        // PDF files must begin with %PDF magic bytes (%PDF-1.3 to %PDF-1.7)
        const header = buffer.subarray(0, 5).toString("ascii")
        expect(header).toBe("%PDF-")
      }, 15000)
    }
  })

  it("handles string array skills as well as categorized skills without throwing", async () => {
    const flatSkillsData = {
      ...SAMPLE_RESUME_DATA,
      skills: ["React", "TypeScript", "Node.js", "GraphQL", "Tailwind CSS"],
    }

    const element = React.createElement(ResumePdfDocument, {
      data: flatSkillsData,
      template: "ats-tech-faang",
    })

    const buffer = await renderToBuffer(element as any)
    expect(buffer).toBeDefined()
    expect(buffer.length).toBeGreaterThan(1000)
  })

  it("handles minimal resume data without throwing", async () => {
    const minimalData = {
      name: "Jane Doe",
      contact: {
        email: "jane@example.com",
        phone: "+1 234 567 890",
        linkedin: "",
        github: "",
      },
      summary: "",
      skills: [],
      experience: [],
      projects: [],
      education: [],
    }

    const element = React.createElement(ResumePdfDocument, {
      data: minimalData,
      template: "ats-ivy-league",
    })

    const buffer = await renderToBuffer(element as any)
    expect(buffer).toBeDefined()
    expect(buffer.length).toBeGreaterThan(500)
  })

  it("renders default template (classic-serif) with complete DUMMY_RESUME_DATA fallback", async () => {
    expect(DUMMY_RESUME_DATA.name).toBe("Alex Morgan")
    expect(DUMMY_RESUME_DATA.role).toBe("Senior Software Engineer")
    expect(DUMMY_RESUME_DATA.contact.email).toBe("alex.morgan@email.com")
    expect(DUMMY_RESUME_DATA.contact.phone).toBe("+1 (555) 019-2834")
    expect(DUMMY_RESUME_DATA.contact.location).toBe("San Francisco, CA")
    expect(DUMMY_RESUME_DATA.summary).toBeTruthy()
    expect(DUMMY_RESUME_DATA.skills.length).toBe(4)
    expect(DUMMY_RESUME_DATA.experience.length).toBe(2)
    expect(DUMMY_RESUME_DATA.projects.length).toBe(2)
    expect(DUMMY_RESUME_DATA.education.length).toBe(1)
    expect(DUMMY_RESUME_DATA.achievements.length).toBe(3)
    expect(DUMMY_RESUME_DATA.languages.length).toBe(2)

    const element = React.createElement(ResumePdfDocument, {
      data: DUMMY_RESUME_DATA,
      template: "classic-serif",
    })

    const buffer = await renderToBuffer(element as any)
    expect(buffer).toBeDefined()
    expect(buffer.length).toBeGreaterThan(1000)
  })

  describe("Custom Style Configuration (Fonts, Density Scales, Colors)", () => {
    it("renders valid PDF with custom sans font, compact scale, and emerald primary color", async () => {
      const element = React.createElement(ResumePdfDocument, {
        data: SAMPLE_RESUME_DATA,
        template: "ats-executive-modern",
        styleConfig: {
          fontFamily: "sans",
          fontSizeScale: "compact",
          primaryColor: "#047857",
          textColor: "#111827",
        },
      })

      const buffer = await renderToBuffer(element as any)
      expect(buffer).toBeDefined()
      expect(buffer.length).toBeGreaterThan(1000)
      const header = buffer.subarray(0, 5).toString("ascii")
      expect(header).toBe("%PDF-")
    })

    it("renders valid PDF with custom monospace font, spacious scale, and burgundy primary color", async () => {
      const element = React.createElement(ResumePdfDocument, {
        data: SAMPLE_RESUME_DATA,
        template: "classic-serif",
        styleConfig: {
          fontFamily: "mono",
          fontSizeScale: "spacious",
          primaryColor: "#881337",
          textColor: "#000000",
        },
      })

      const buffer = await renderToBuffer(element as any)
      expect(buffer).toBeDefined()
      expect(buffer.length).toBeGreaterThan(1000)
      const header = buffer.subarray(0, 5).toString("ascii")
      expect(header).toBe("%PDF-")
    })

    it("renders valid PDF with serif font, standard scale, and executive navy color", async () => {
      const element = React.createElement(ResumePdfDocument, {
        data: SAMPLE_RESUME_DATA,
        template: "creative-bold",
        styleConfig: {
          fontFamily: "serif",
          fontSizeScale: "normal",
          primaryColor: "#1e3a8a",
        },
      })

      const buffer = await renderToBuffer(element as any)
      expect(buffer).toBeDefined()
      expect(buffer.length).toBeGreaterThan(1000)
      const header = buffer.subarray(0, 5).toString("ascii")
      expect(header).toBe("%PDF-")
    })
  })
})

