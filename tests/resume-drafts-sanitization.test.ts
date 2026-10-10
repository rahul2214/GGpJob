import { describe, it, expect, vi } from "vitest"
import { NextRequest } from "next/server"

let upsertPayload: any = null

vi.mock("@/lib/auth-server", () => ({
  requireAuth: vi.fn(async () => ({
    user: { uuid: "00000000-0000-4000-8000-000000000001", role: "jobseeker" },
    errorResponse: null,
  })),
  isOwnerOrAdmin: vi.fn(() => true),
}))

vi.mock("@/lib/supabase-admin", () => ({
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      if (table === "jobseekers") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 123 },
            error: null,
          }),
        }
      }
      if (table === "resume_drafts") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              user_id: 123,
              title: "Test Resume",
              template_type: "Software Engineer",
              updated_at: new Date().toISOString(),
              resume_data: {
                name: "Alex",
                photoUrl: "data:image/png;base64,OLDIMAGE",
                contact: { email: "alex@example.com", photoUrl: "data:image/png;base64,OLDIMAGE" },
              },
            },
            error: null,
          }),
          upsert: vi.fn((payload: any) => {
            upsertPayload = payload
            return {
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    user_id: payload.user_id,
                    title: payload.title,
                    template_type: payload.template_type,
                    resume_data: payload.resume_data,
                    updated_at: payload.updated_at,
                  },
                  error: null,
                }),
              }),
            }
          }),
        }
      }
      return {}
    }),
  },
}))

describe("Resume Drafts DB Image Data Sanitization", () => {
  it("POST /api/resume/drafts strips photoUrl from top-level and contact before saving to database", async () => {
    const { POST } = await import("@/app/api/resume/drafts/route")

    const req = new NextRequest("http://localhost/api/resume/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "00000000-0000-4000-8000-000000000001",
        title: "Alex Morgan's Resume",
        templateType: "Software Engineer",
        resumeData: {
          name: "Alex Morgan",
          role: "Senior Engineer",
          photoUrl: "data:image/png;base64,HUGEBASE64IMAGESTRING...",
          contact: {
            email: "alex@example.com",
            phone: "1234567890",
            photoUrl: "data:image/png;base64,HUGEBASE64IMAGESTRING...",
          },
        },
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    // Verify upsertPayload sent to database
    expect(upsertPayload).toBeDefined()
    expect(upsertPayload.resume_data.photoUrl).toBeUndefined()
    expect(upsertPayload.resume_data.contact.photoUrl).toBeUndefined()
    expect(upsertPayload.resume_data.name).toBe("Alex Morgan")
    expect(upsertPayload.resume_data.contact.email).toBe("alex@example.com")
  })

  it("GET /api/resume/drafts ensures photoUrl is stripped even if old drafts in DB had images", async () => {
    const { GET } = await import("@/app/api/resume/drafts/route")

    const req = new NextRequest("http://localhost/api/resume/drafts?userId=00000000-0000-4000-8000-000000000001")
    const res = await GET(req)
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.length).toBe(1)
    expect(json[0].resume_data.photoUrl).toBeUndefined()
    expect(json[0].resume_data.contact.photoUrl).toBeUndefined()
    expect(json[0].resume_data.name).toBe("Alex")
  })
})
