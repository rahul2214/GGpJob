import { NextRequest, NextResponse } from "next/server"
import { resolveResumeUrl } from "@/lib/resolve-resume"
import { parsePDF } from "@/lib/parse-pdf"
import { supabaseAdmin } from "@/lib/supabase-admin"

// Force nodejs runtime for pdf-parse compatibility
export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const resumeUrl = formData.get("resumeUrl") as string | null
    const jobDescription = formData.get("jobDescription") as string | null
    const userId = formData.get("userId") as string | null

    if (!file && !resumeUrl) {
      return NextResponse.json({ error: "No file or resume URL provided" }, { status: 400 })
    }

    if (file && file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 2MB limit." }, { status: 413 })
    }

    // Credits & usage tracking
    let isFirstTime = true
    let jobseekerRecord: any = null

    if (userId) {
      const { data: jobseeker, error: dbErr } = await supabaseAdmin
        .from('jobseekers')
        .select('id, uuid, subscription_credits, purchased_credits, metadata')
        .eq('uuid', userId)
        .maybeSingle()

      if (dbErr) {
        console.error("Database fetch error for jobseeker:", dbErr)
      } else if (jobseeker) {
        jobseekerRecord = jobseeker
        isFirstTime = !jobseeker.metadata?.has_used_ats_checker
        
        // If not first time, check credit balance
        if (!isFirstTime) {
          const totalCredits = (jobseeker.subscription_credits || 0) + (jobseeker.purchased_credits || 0)
          if (totalCredits < 1) {
            return NextResponse.json({ 
              error: "Insufficient credits. Analyzing your resume costs 1 credit.", 
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
    const apiModel = isGroq ? "llama-3.3-70b-versatile" : "grok-2-latest";

    // Convert file to buffer or fetch from URL
    let buffer: Buffer
    if (file) {
      const bytes = await file.arrayBuffer()
      buffer = Buffer.from(bytes)
    } else {
      const resolved = await resolveResumeUrl(resumeUrl)
      if (!resolved) {
        return NextResponse.json({ error: "Invalid resume URL" }, { status: 400 })
      }
      const downloadResponse = await fetch(resolved)
      if (!downloadResponse.ok) {
        return NextResponse.json({ error: "Failed to download resume from storage" }, { status: 400 })
      }
      const bytes = await downloadResponse.arrayBuffer()
      buffer = Buffer.from(bytes)
    }

    // Parse PDF
    let resumeText = "";
    try {
      const data = await parsePDF(buffer);
      resumeText = data.text;
    } catch (pdfError) {
      console.error("PDF Parse Error:", pdfError);
      return NextResponse.json({ 
        error: "Failed to parse PDF. Please ensure it's a valid text-based PDF file." 
      }, { status: 400 });
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json({ 
        error: "Could not extract text from the PDF. Please ensure it's not a scanned/image-based PDF." 
      }, { status: 400 })
    }

    // Truncate text to avoid token limits
    const truncatedResume = resumeText.length > 12000 ? resumeText.substring(0, 12000) + "..." : resumeText;
    const truncatedJobDesc = jobDescription && jobDescription.length > 4000 ? jobDescription.substring(0, 4000) + "..." : jobDescription;

    // Prompt construction
    const prompt = `You are an expert ATS (Applicant Tracking System) simulator and technical recruiter.
Analyze the candidate's resume and provide a compatibility score, detailed category breakdown, missing skills, strengths, feedback, and bullet-point optimizations.

You must reply with ONLY a valid JSON object matching this exact schema:
{
  "score": <number between 0 and 100, overall match>,
  "keywordMatch": <number between 0 and 100>,
  "formattingSafety": <number between 0 and 100>,
  "roleAlignment": <number between 0 and 100>,
  "skillsCoverage": <number between 0 and 100>,
  "experienceImpact": <number between 0 and 100>,
  "recruiterReadability": <number between 0 and 100>,
  "missingSkills": [<array of string, representing required skills from JD missing in resume. empty if no JD>],
  "strengths": [<array of string, up to 3 key strengths or matches>],
  "feedback": [<array of string, 3 to 5 actionable suggestions for improvement>],
  "bulletOptimizations": [
    {
      "original": "<an actual weak or generic bullet point or sentence extracted from the candidate's work history or project details>",
      "improved": "<an optimized, highly professional version of that bullet point incorporating quantified results, active verbs, and matching key requirements from the JD>",
      "reason": "<brief rationale of why this change improves ATS compatibility and recruiter appeal>"
    }
  ]
}

If no Job Description is provided, evaluate the resume based on general ATS best practices (keywords, formatting, action verbs) and make the "bulletOptimizations" suggest general enhancements (e.g. adding metrics, active verbs).

Resume Text:
"""
${truncatedResume}
"""

Job Description:
"""
${truncatedJobDesc || "Not provided. Score based on general ATS best practices such as formatting, keywords, and action verbs."}
"""

IMPORTANT: Return ONLY the JSON object, no markdown code blocks (e.g., no \`\`\`json), no explanations. Ensure it is perfectly valid JSON.`;

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
        ...(isGroq ? { response_format: { type: "json_object" } } : { max_tokens: 1200 })
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

    let parsedResult;
    try {
      parsedResult = JSON.parse(content)
      
      // Ensure score is within bounds
      parsedResult.score = Math.min(100, Math.max(0, typeof parsedResult.score === 'number' ? parsedResult.score : 50))
      
      // Sanitize sub-scores
      parsedResult.keywordMatch = typeof parsedResult.keywordMatch === 'number' ? Math.min(100, Math.max(0, parsedResult.keywordMatch)) : Math.round(parsedResult.score * 0.9)
      parsedResult.formattingSafety = typeof parsedResult.formattingSafety === 'number' ? Math.min(100, Math.max(0, parsedResult.formattingSafety)) : 90
      parsedResult.roleAlignment = typeof parsedResult.roleAlignment === 'number' ? Math.min(100, Math.max(0, parsedResult.roleAlignment)) : Math.round(parsedResult.score * 0.95)
      parsedResult.skillsCoverage = typeof parsedResult.skillsCoverage === 'number' ? Math.min(100, Math.max(0, parsedResult.skillsCoverage)) : Math.round(parsedResult.score * 0.85)
      parsedResult.experienceImpact = typeof parsedResult.experienceImpact === 'number' ? Math.min(100, Math.max(0, parsedResult.experienceImpact)) : Math.round(parsedResult.score * 0.9)
      parsedResult.recruiterReadability = typeof parsedResult.recruiterReadability === 'number' ? Math.min(100, Math.max(0, parsedResult.recruiterReadability)) : 85

      // Sanitize arrays
      parsedResult.missingSkills = Array.isArray(parsedResult.missingSkills) ? parsedResult.missingSkills : []
      parsedResult.strengths = Array.isArray(parsedResult.strengths) ? parsedResult.strengths.slice(0, 3) : ["Good overall formatting"]
      parsedResult.feedback = Array.isArray(parsedResult.feedback) ? parsedResult.feedback.slice(0, 5) : ["Consider adding more metrics"]
      parsedResult.bulletOptimizations = Array.isArray(parsedResult.bulletOptimizations) ? parsedResult.bulletOptimizations : []
      
    } catch (parseError) {
      console.error("Failed to parse JSON from AI:", content)
      // Return a fallback response
      return NextResponse.json({
        score: 50,
        keywordMatch: 50,
        formattingSafety: 85,
        roleAlignment: 50,
        skillsCoverage: 45,
        experienceImpact: 45,
        recruiterReadability: 70,
        missingSkills: [],
        strengths: ["Resume submitted successfully"],
        feedback: ["Unable to perform detailed analysis. Please try again with a different PDF format."],
        bulletOptimizations: []
      })
    }

    if (userId && jobseekerRecord) {
      try {
        if (isFirstTime) {
          const currentMetadata = jobseekerRecord.metadata || {}
          const newMetadata = { ...currentMetadata, has_used_ats_checker: true }
          await supabaseAdmin
            .from('jobseekers')
            .update({ metadata: newMetadata })
            .eq('id', jobseekerRecord.id)
          console.log(`[ATS_SCORE_API] Mark has_used_ats_checker for user: ${userId}`)
        } else {
          // Deduct 1 credit
          let newSubCredits = jobseekerRecord.subscription_credits || 0
          let newPurCredits = jobseekerRecord.purchased_credits || 0
          if (newSubCredits > 0) {
            newSubCredits -= 1
          } else if (newPurCredits > 0) {
            newPurCredits -= 1
          }
          await supabaseAdmin
            .from('jobseekers')
            .update({
              subscription_credits: newSubCredits,
              purchased_credits: newPurCredits
            })
            .eq('id', jobseekerRecord.id)
          console.log(`[ATS_SCORE_API] Charged 1 credit from user: ${userId}`)
        }
      } catch (dbUpdateError) {
        console.error("Failed to charge credit / update user metadata:", dbUpdateError)
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