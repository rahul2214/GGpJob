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
    } catch (pdfError: any) {
      console.error("PDF Parse Error:", pdfError);
      return NextResponse.json({ 
        error: "Failed to parse PDF. Please ensure it's a valid text-based PDF file.",
        details: pdfError?.message || String(pdfError)
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
  "sectionScores": {
    "summary": <number between 0 and 100, score for Summary/Objective section>,
    "experience": <number between 0 and 100, score for Work History/Experience section>,
    "skills": <number between 0 and 100, score for Skills/Core Competencies section>,
    "education": <number between 0 and 100, score for Education section>
  },
  "weakestSection": "<Exactly one of: Summary, Experience, Skills, Education, representing the section with the lowest score>",
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

      // Sanitize section scores
      if (!parsedResult.sectionScores || typeof parsedResult.sectionScores !== 'object') {
        parsedResult.sectionScores = {
          summary: Math.round(parsedResult.score * 0.9),
          experience: Math.round(parsedResult.score * 0.85),
          skills: Math.round(parsedResult.score * 0.95),
          education: 90
        }
      } else {
        parsedResult.sectionScores.summary = typeof parsedResult.sectionScores.summary === 'number' ? Math.min(100, Math.max(0, parsedResult.sectionScores.summary)) : Math.round(parsedResult.score * 0.9)
        parsedResult.sectionScores.experience = typeof parsedResult.sectionScores.experience === 'number' ? Math.min(100, Math.max(0, parsedResult.sectionScores.experience)) : Math.round(parsedResult.score * 0.85)
        parsedResult.sectionScores.skills = typeof parsedResult.sectionScores.skills === 'number' ? Math.min(100, Math.max(0, parsedResult.sectionScores.skills)) : Math.round(parsedResult.score * 0.95)
        parsedResult.sectionScores.education = typeof parsedResult.sectionScores.education === 'number' ? Math.min(100, Math.max(0, parsedResult.sectionScores.education)) : 90
      }

      // Sanitize weakest section
      const allowedSections = ["Summary", "Experience", "Skills", "Education"]
      if (typeof parsedResult.weakestSection !== 'string' || !allowedSections.includes(parsedResult.weakestSection)) {
        const scores = parsedResult.sectionScores;
        let minScore = 101;
        let weakest = "Experience";
        for (const [sec, val] of Object.entries(scores)) {
          if (typeof val === 'number' && val < minScore) {
            minScore = val;
            weakest = sec.charAt(0).toUpperCase() + sec.slice(1);
          }
        }
        parsedResult.weakestSection = weakest;
      }

      // Sanitize arrays
      parsedResult.missingSkills = Array.isArray(parsedResult.missingSkills) ? parsedResult.missingSkills : []
      parsedResult.strengths = Array.isArray(parsedResult.strengths) ? parsedResult.strengths.slice(0, 3) : ["Good overall formatting"]
      parsedResult.feedback = Array.isArray(parsedResult.feedback) ? parsedResult.feedback.slice(0, 5) : ["Consider adding more metrics"]
      parsedResult.bulletOptimizations = Array.isArray(parsedResult.bulletOptimizations) ? parsedResult.bulletOptimizations : []
      
    } catch (parseError) {
      console.error("Failed to parse JSON from AI:", content)
      // Return a fallback response
      parsedResult = {
        score: 50,
        keywordMatch: 50,
        formattingSafety: 85,
        roleAlignment: 50,
        skillsCoverage: 45,
        experienceImpact: 45,
        recruiterReadability: 70,
        sectionScores: {
          summary: 50,
          experience: 45,
          skills: 50,
          education: 70
        },
        weakestSection: "Experience",
        missingSkills: [],
        strengths: ["Resume submitted successfully"],
        feedback: ["Unable to perform detailed analysis. Please try again with a different PDF format."],
        bulletOptimizations: []
      }
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
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
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