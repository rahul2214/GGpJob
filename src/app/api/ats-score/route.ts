import { NextRequest, NextResponse } from "next/server"
import { resolveResumeUrl } from "@/lib/resolve-resume"
import { parseResumeDocument } from "@/lib/parse-document"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAuth, isOwnerOrAdmin } from "@/lib/auth-server"
import { safeFetch, SsrfBlockedError } from "@/lib/ssrf-guard"
import { validateFileContent, RESUME_FILE_RULES } from "@/lib/upload-validation"
import { runDeterministicAtsChecks, buildAtsEvaluationPrompt, sanitizeAtsResult } from "@/lib/ats-engine"

// Force nodejs runtime for parser compatibility
export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(req)
    if (errorResponse) return errorResponse

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const resumeUrl = formData.get("resumeUrl") as string | null
    const jobDescription = formData.get("jobDescription") as string | null
    const userId = formData.get("userId") as string | null

    if (!file && !resumeUrl) {
      return NextResponse.json({ error: "No file or resume URL provided" }, { status: 400 })
    }

    if (file && file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit." }, { status: 413 })
    }

    if (userId && !isOwnerOrAdmin(authUser!, userId)) {
      return NextResponse.json({ error: "Forbidden: Cannot analyse another user's resume." }, { status: 403 })
    }

    if (jobDescription && jobDescription.length > 20000) {
      return NextResponse.json({ error: "Job description is too long." }, { status: 400 })
    }

    // Credits & usage tracking
    let isFirstTime = true
    let jobseekerRecord: any = null

    if (userId) {
      const { data: jobseeker, error: dbErr } = await supabaseAdmin
        .from('jobseekers')
        .select('id, uuid, subscription_credits, purchased_credits, has_used_ats_checker, metadata')
        .eq('uuid', userId)
        .maybeSingle()

      if (dbErr) {
        console.error("Database fetch error for jobseeker:", dbErr)
      } else if (jobseeker) {
        jobseekerRecord = jobseeker
        isFirstTime = !(jobseeker.has_used_ats_checker ?? jobseeker.metadata?.has_used_ats_checker)
        
        // If not first time, check credit balance
        if (!isFirstTime) {
          const totalCredits = (jobseeker.subscription_credits || 0) + (jobseeker.purchased_credits || 0)
          if (totalCredits < 2) {
            return NextResponse.json({ 
              error: "Insufficient credits. Analyzing your resume costs 2 credits.", 
              code: "INSUFFICIENT_CREDITS" 
            }, { status: 402 })
          }
        }
      }
    }

    const apiKey = process.env.GROK_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key (GROK_API_KEY or GROQ_API_KEY) is missing. Please configure it in your environment." }, { status: 500 })
    }
    const isGroq = apiKey.startsWith("gsk_");
    const apiUrl = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.x.ai/v1/chat/completions";
    const apiModel = isGroq ? "openai/gpt-oss-120b" : "grok-2-latest";

    // Convert file to buffer or fetch from URL
    let buffer: Buffer
    let fileName = file?.name || ""
    let mimeType = file?.type || ""
    if (file) {
      const bytes = await file.arrayBuffer()
      buffer = Buffer.from(bytes)
      const fileCheck = validateFileContent(buffer, file.name, file.type, RESUME_FILE_RULES)
      if (!fileCheck.ok) {
        return NextResponse.json({ error: fileCheck.error }, { status: 400 })
      }
      mimeType = fileCheck.contentType
    } else {
      // `resumeUrl` arrives from the client, so it is never fetched directly.
      // It must be a storage URI that this account actually owns; anything else
      // would let a caller aim the server at an arbitrary address.
      if (!resumeUrl!.startsWith("r2://")) {
        return NextResponse.json({ error: "Invalid resume URL" }, { status: 400 })
      }

      const { data: ownerRow } = await supabaseAdmin
        .from('jobseekers')
        .select('id, resume_url')
        .eq(String(authUser!.uuid).includes('-') ? 'uuid' : 'id', String(authUser!.uuid).includes('-') ? authUser!.uuid : authUser!.id)
        .maybeSingle()

      if (!ownerRow || ownerRow.resume_url !== resumeUrl) {
        return NextResponse.json({ error: "Forbidden: That resume does not belong to this account." }, { status: 403 })
      }

      const resolved = await resolveResumeUrl(resumeUrl)
      if (!resolved) {
        return NextResponse.json({ error: "Invalid resume URL" }, { status: 400 })
      }

      let downloadResponse: Response
      try {
        // Signed storage URLs are still fetched through the SSRF guard so a
        // redirect cannot walk the request into the internal network.
        downloadResponse = await safeFetch(resolved, { maxBytes: 5 * 1024 * 1024 })
      } catch (err) {
        if (err instanceof SsrfBlockedError) {
          return NextResponse.json({ error: "Invalid resume URL" }, { status: 400 })
        }
        throw err
      }

      if (!downloadResponse.ok) {
        return NextResponse.json({ error: "Failed to download resume from storage" }, { status: 400 })
      }
      const bytes = await downloadResponse.arrayBuffer()
      buffer = Buffer.from(bytes)
      fileName = resumeUrl || ""
    }

    // Parse Document
    let resumeText = "";
    try {
      const data = await parseResumeDocument(buffer, fileName, mimeType);
      resumeText = data.text;
    } catch (docError: any) {
      console.error("Resume Document Parse Error:", docError);
      return NextResponse.json({ 
        error: "Failed to parse resume document. Please ensure it is a valid text-based PDF, DOC, or DOCX file.",
        details: docError?.message || String(docError)
      }, { status: 400 });
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json({ 
        error: "Could not extract text from the document. Please ensure it's not an image/scanned document." 
      }, { status: 400 })
    }

    // Truncate text to avoid token limits
    const truncatedResume = resumeText.length > 12000 ? resumeText.substring(0, 12000) + "..." : resumeText;
    const truncatedJobDesc = jobDescription && jobDescription.length > 4000 ? jobDescription.substring(0, 4000) + "..." : jobDescription;

    // Perform deterministic pre-analysis and anti-cheat scan
    const preAnalysis = runDeterministicAtsChecks(resumeText, jobDescription || undefined)

    // Prompt construction with prompt injection protection & ATS rules
    const prompt = buildAtsEvaluationPrompt(truncatedResume, truncatedJobDesc, preAnalysis)

    // Call AI API (x.ai or Groq)
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: apiModel,
        messages: [
          {
            role: "system",
            content: "You are a precise API that returns only valid JSON objects. Never include markdown formatting, code blocks, or explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        ...(isGroq ? { response_format: { type: "json_object" } } : { max_tokens: 1400 })
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Grok API Error:", errorText)
      return NextResponse.json({ 
        error: `AI analysis failed: ${response.status}` 
      }, { status: 500 })
    }

    const grokData = await response.json()
    let content = grokData.choices[0].message.content.trim()
    
    // Clean up any markdown formatting
    content = content.replace(/```json\s*/g, '')
    content = content.replace(/```\s*/g, '')
    content = content.trim()

    let parsedRaw: any = null
    try {
      parsedRaw = JSON.parse(content)
    } catch (parseError) {
      console.error("Failed to parse JSON from AI:", content)
    }

    const parsedResult = sanitizeAtsResult(parsedRaw, preAnalysis)

    if (userId && jobseekerRecord) {
      try {
        if (isFirstTime) {
          await supabaseAdmin
            .from('jobseekers')
            .update({ 
              has_used_ats_checker: true,
            })
            .eq('id', jobseekerRecord.id)
          console.log(`[ATS_SCORE_API] Mark has_used_ats_checker for user: ${userId}`)
        } else {
          // Deduct 2 credits
          let creditsToDeduct = 2
          let newSubCredits = jobseekerRecord.subscription_credits || 0
          let newPurCredits = jobseekerRecord.purchased_credits || 0
          if (newSubCredits >= creditsToDeduct) {
            newSubCredits -= creditsToDeduct
          } else {
            creditsToDeduct -= newSubCredits
            newSubCredits = 0
            newPurCredits = Math.max(0, newPurCredits - creditsToDeduct)
          }
          await supabaseAdmin
            .from('jobseekers')
            .update({
              subscription_credits: newSubCredits,
              purchased_credits: newPurCredits
            })
            .eq('id', jobseekerRecord.id)
          console.log(`[ATS_SCORE_API] Charged 2 credits from user: ${userId}. Remaining credits: ${newSubCredits + newPurCredits}`)
        }

        // Store analysis in Supabase (upsert)
        const { error: upsertErr } = await supabaseAdmin
          .from('ats_analyses')
          .upsert({
            user_id: jobseekerRecord.id,
            score: parsedResult.score,
            result_json: parsedResult,
            analyzed_at: new Date().toISOString()
          }, { onConflict: 'user_id' })
        
        if (upsertErr) {
          console.error("Failed to save ATS history:", upsertErr)
        } else {
          console.log(`[ATS_SCORE_API] Successfully stored analysis history for user: ${userId}`)
        }
      } catch (dbUpdateError) {
        console.error("Failed to charge credit / update user metadata / save history:", dbUpdateError)
      }
    }

    return NextResponse.json(parsedResult)

  } catch (error: any) {
    console.error("ATS Score API Error:", error)
    return NextResponse.json({ 
      error: "Internal Server Error",
      message: error.message 
    }, { status: 500 })
  }
}

// GET method to fetch single cached analysis for a user
export async function GET(req: NextRequest) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(req)
    if (errorResponse) return errorResponse

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    if (!isOwnerOrAdmin(authUser!, userId)) {
      return NextResponse.json({ error: "Forbidden: Cannot read another user's analysis." }, { status: 403 })
    }

    // Resolve UUID to bigint id first
    const { data: jobseeker, error: jsError } = await supabaseAdmin
      .from('jobseekers')
      .select('id')
      .eq('uuid', userId)
      .maybeSingle()

    if (jsError) {
      console.error("Database fetch error for jobseeker:", jsError)
      return NextResponse.json({ error: "Failed to fetch jobseeker" }, { status: 500 })
    }

    if (!jobseeker) {
      return NextResponse.json(null)
    }

    const { data, error } = await supabaseAdmin
      .from('ats_analyses')
      .select('*')
      .eq('user_id', jobseeker.id)
      .maybeSingle()

    if (error) {
      console.error("Database fetch error for ATS history:", error)
      return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
    }

    return NextResponse.json(data || null)
  } catch (error: any) {
    console.error("ATS Score History GET Error:", error)
    return NextResponse.json({ 
      error: "Internal Server Error",
      message: error.message 
    }, { status: 500 })
  }
}