import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { data, template } = await req.json()

    if (!data) {
      return NextResponse.json({ error: "Missing resume data" }, { status: 400 })
    }

    // Dynamic import to ensure Node-mode resolution (not webpack bundle)
    const React = (await import("react")).default
    const { renderToBuffer } = await import("@react-pdf/renderer")
    const { ResumePdfDocument } = await import("@/components/resume/ResumePdfDocument")

    const element = React.createElement(ResumePdfDocument as any, {
      data,
      template: template || "classic-serif"
    })

    const buffer = await renderToBuffer(element as any)
    const uint8Array = new Uint8Array(buffer)

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(data.name || "resume")}_resume.pdf"`,
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
