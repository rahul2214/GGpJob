import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const { data, template, styleConfig } = await req.json()

    if (!data) {
      return NextResponse.json({ error: "Missing resume data" }, { status: 400 })
    }

    // Dynamic import to ensure Node-mode resolution (not webpack bundle)
    const React = (await import("react")).default
    const { renderToBuffer } = await import("@react-pdf/renderer")
    const { ResumePdfDocument } = await import("@/components/resume/ResumePdfDocument")

    const element = React.createElement(ResumePdfDocument as any, {
      data,
      template: template || "classic-serif",
      styleConfig,
    })

    const buffer = await renderToBuffer(element as any)
    const uint8Array = new Uint8Array(buffer)

    const rawName = (data.name && data.name.trim() && data.name !== "Your Name")
      ? data.name.trim()
      : "Resume"
    const cleanName = rawName.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "_")

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cleanName}.pdf"`,
      },
    })
  } catch (err: any) {
    console.error("PDF export route error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to render PDF" },
      { status: 500 }
    )
  }
}
