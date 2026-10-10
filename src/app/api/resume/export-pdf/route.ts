import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const { data, template, styleConfig, userId, isDummy } = await req.json()

    if (!data) {
      return NextResponse.json({ error: "Missing resume data" }, { status: 400 })
    }

    const targetUserId = authUser!.uuid || userId;

    // Detect if this is dummy/sample template data:
    const isDummyData = Boolean(
      isDummy ||
      !data.name ||
      data.name.trim() === "Alex Morgan" ||
      data.name.trim() === "Your Name" ||
      data.contact?.email === "alex.morgan@email.com" ||
      data.contact?.email === "alex.morgan@example.com" ||
      (Array.isArray(data.experience) && data.experience[0]?.company === "Apex Solutions")
    );

    // Credit check and deduction for PDF download (costs 1 credit, FREE for sample/dummy data)
    if (!isDummyData) {
      const { data: jobseeker, error: dbErr } = await supabaseAdmin
        .from('jobseekers')
        .select('id, uuid, subscription_credits, purchased_credits')
        .eq('uuid', targetUserId)
        .maybeSingle()

      if (dbErr) {
        console.error("Database fetch error for jobseeker in export-pdf:", dbErr)
      }

      if (jobseeker) {
        const totalCredits = (jobseeker.subscription_credits || 0) + (jobseeker.purchased_credits || 0)
        if (totalCredits < 1) {
          return NextResponse.json({
            error: "Insufficient credits. Downloading your resume costs 1 credit.",
            code: "INSUFFICIENT_CREDITS"
          }, { status: 402 })
        }

        let newSubCredits = jobseeker.subscription_credits || 0
        let newPurCredits = jobseeker.purchased_credits || 0
        if (newSubCredits > 0) {
          newSubCredits -= 1
        } else if (newPurCredits > 0) {
          newPurCredits -= 1
        }

        const { error: updateErr } = await supabaseAdmin
          .from('jobseekers')
          .update({
            subscription_credits: newSubCredits,
            purchased_credits: newPurCredits
          })
          .eq('id', jobseeker.id)

        if (updateErr) {
          console.error("Failed to deduct credit for PDF export:", updateErr)
        } else {
          console.log(`[PDF_EXPORT_API] Deducted 1 credit for user: ${targetUserId}. Remaining: ${newSubCredits + newPurCredits}`)
        }
      }
    } else {
      console.log(`[PDF_EXPORT_API] Free sample/dummy resume PDF export for user: ${targetUserId} (0 credits charged).`)
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
