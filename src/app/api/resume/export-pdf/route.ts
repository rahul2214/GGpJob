import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { apiCache } from '@/lib/cache';
import crypto from 'crypto';

export const dynamic = "force-dynamic"

// Concurrency gate to prevent Node process OOM crash under massive simultaneous traffic (50k user scale)
let activePdfRenders = 0;
const MAX_CONCURRENT_PDF_RENDERS = 6;

async function acquirePdfRenderSlot(timeoutMs = 15000): Promise<() => void> {
  const start = Date.now();
  while (activePdfRenders >= MAX_CONCURRENT_PDF_RENDERS) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("Server is currently handling high PDF export volume. Please try again shortly.");
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  activePdfRenders++;
  return () => {
    activePdfRenders = Math.max(0, activePdfRenders - 1);
  };
}

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

    // Credit check and deduction with optimistic locking (prevents double-spending race conditions under high concurrency)
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

        // Optimistic locking condition: credits must match what was read, avoiding race condition exploit
        const { data: updatedRows, error: updateErr } = await supabaseAdmin
          .from('jobseekers')
          .update({
            subscription_credits: newSubCredits,
            purchased_credits: newPurCredits
          })
          .eq('id', jobseeker.id)
          .eq('subscription_credits', jobseeker.subscription_credits || 0)
          .eq('purchased_credits', jobseeker.purchased_credits || 0)
          .select('id')

        if (updateErr || !updatedRows || updatedRows.length === 0) {
          return NextResponse.json({
            error: "Credit balance updated concurrently. Please retry your request.",
            code: "CONCURRENT_CONFLICT"
          }, { status: 409 })
        }

        console.log(`[PDF_EXPORT_API] Securely deducted 1 credit for user: ${targetUserId}. Remaining: ${newSubCredits + newPurCredits}`)
      }
    } else {
      console.log(`[PDF_EXPORT_API] Free sample/dummy resume PDF export for user: ${targetUserId} (0 credits charged).`)
    }

    // Hash data payload to check if identical PDF was already generated recently (CPU & RAM saver)
    const pdfCacheKey = `pdf:${crypto.createHash('sha256').update(JSON.stringify({ data, template, styleConfig })).digest('hex')}`
    let uint8Array = apiCache.get<Uint8Array>(pdfCacheKey)

    if (!uint8Array) {
      // Throttle CPU-intensive PDF rendering through concurrency gate
      const releaseSlot = await acquirePdfRenderSlot()
      try {
        const React = (await import("react")).default
        const { renderToBuffer } = await import("@react-pdf/renderer")
        const { ResumePdfDocument } = await import("@/components/resume/ResumePdfDocument")

        const element = React.createElement(ResumePdfDocument as any, {
          data,
          template: template || "classic-serif",
          styleConfig,
        })

        const buffer = await renderToBuffer(element as any)
        uint8Array = new Uint8Array(buffer)
        // Cache rendered buffer for 5 minutes (300,000ms)
        apiCache.set(pdfCacheKey, uint8Array, 300000)
      } finally {
        releaseSlot()
      }
    }

    const rawName = (data.name && data.name.trim() && data.name !== "Your Name")
      ? data.name.trim()
      : "Resume"
    const cleanName = rawName.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "_")

    return new NextResponse(uint8Array as any, {
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
