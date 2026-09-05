import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
 
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { contactInfo, templateType, experience, projects, skills, education, professionalSummary, languages, achievements, userId } = body

    if (!userId) {
      return NextResponse.json({ 
        error: "Authentication required. Please sign in to generate an ATS resume with AI.", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    // Check user profile & credit balance
    const { data: jobseeker, error: dbErr } = await supabaseAdmin
      .from('jobseekers')
      .select('id, uuid, subscription_credits, purchased_credits, has_used_resume_builder, metadata')
      .eq('uuid', userId)
      .maybeSingle()

    if (dbErr || !jobseeker) {
      console.error("Database fetch error for jobseeker:", dbErr)
      return NextResponse.json({ 
        error: "Jobseeker profile not found. Please sign in with a valid jobseeker account.", 
        code: "USER_NOT_FOUND" 
      }, { status: 404 })
    }

    const isFirstTime = !(jobseeker.has_used_resume_builder ?? jobseeker.metadata?.has_used_resume_builder)

    if (!isFirstTime) {
      const totalCredits = (jobseeker.subscription_credits || 0) + (jobseeker.purchased_credits || 0)
      if (totalCredits < 1) {
        return NextResponse.json({ 
          error: "Insufficient credits. Generating an ATS resume with AI costs 1 credit.", 
          code: "INSUFFICIENT_CREDITS" 
        }, { status: 402 })
      }
    }

    const apiKey = process.env.GROK_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key (GROK_API_KEY or GROQ_API_KEY) is missing. Please configure it in your environment." }, { status: 500 })
    }
    const isGroq = apiKey.startsWith("gsk_");
    const apiUrl = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.x.ai/v1/chat/completions";
    const apiModel = isGroq ? "openai/gpt-oss-120b" : "grok-2-latest";

    const prompt = `You are an expert resume writer and technical recruiter. Create an optimized, ATS-safe resume based on the user's details and the selected template guidelines.
Synthesize raw bullet points/descriptions into powerful, quantified achievements using active verbs.
In bullet points, wrap the single most impactful metric or key achievement in **double asterisks** (e.g., **reduced latency by 30%**) to mark for bold emphasis. Only 1-2 bold spans per bullet max.

Template Type Selected: ${templateType || "Software Engineer / General"}
Guidelines for Template Type:
- Software Engineer: Emphasize tech stack, coding achievements, performance tuning (latency, throughput, scaling), and tool usages.
- Product Manager: Emphasize business impact (revenue, conversion rates, user growth), cross-functional leadership, product launches, and roadmap execution.
- Fresher: Focus heavily on projects, academic achievements, core engineering subjects, open-source work, and quick learning indicators. Keep to 1 page.
- Experienced: Emphasize senior leadership, system architecture, mentoring, project lifecycle management, and clear multi-year career progression.
- US Format: Standard single-column, standard formatting, black/white, list GPA only if outstanding, no personal profile photos or age details.
- India Format: Include current location/city, standard headers, structured format.

Input Details:
- Contact Info: ${JSON.stringify(contactInfo || {})}
- Raw Professional Summary: ${professionalSummary || ""}
- Raw Experience: ${JSON.stringify(experience || [])}
- Raw Projects: ${JSON.stringify(projects || [])}
- Raw Skills: ${JSON.stringify(skills || [])}
- Raw Languages: ${JSON.stringify(languages || [])}
- Raw Achievements: ${JSON.stringify(achievements || [])}
- Raw Education: ${JSON.stringify(education || [])}

You must reply with ONLY a valid JSON object matching this exact schema:
{
  "name": "<candidate name>",
  "role": "<candidate professional title/role, e.g. Software Engineer (derived from input role if provided, otherwise matching experience/templateType)>",
  "contact": {
    "email": "<email>",
    "phone": "<phone>",
    "linkedin": "<linkedin url or empty string>",
    "github": "<github url or empty string>",
    "portfolio": "<portfolio url or empty string>",
    "location": "<location/city, e.g. Bengaluru, India or empty string>"
  },
  "summary": "<a powerful, 3-line professional summary matching the target template type, refined using the raw summary if provided>",
  "skills": [
    {
      "category": "<e.g., Languages, Frameworks, Databases, Tools>",
      "skills": ["<skill 1>", "<skill 2>"]
    }
  ],
  "languages": [<array of formatted languages, e.g. ["English (Fluent)", "Spanish (Conversational)"] or simply ["English", "Spanish"]>],
  "achievements": [<array of formatted quantified achievements, awards or certifications, refined using raw achievements if provided>],
  "experience": [
    {
      "company": "<company name>",
      "role": "<job title / role>",
      "dates": "<start date - end date>",
      "location": "<job location (e.g., City, State or Remote) or empty string>",
      "bullets": [
        "<quantified accomplishment bullet point starting with a strong active verb, including metrics where possible (e.g., 'Improved performance by 30%')>"
      ]
    }
  ],
  "projects": [
    {
      "name": "<project name>",
      "techStack": "<technologies used (e.g. React, Node.js, AWS)>",
      "projectLink": "<the project URL link from the input raw projects, or empty string if not provided>",
      "bullets": [
        "<strong descriptive achievement bullet point starting with an action verb, highlighting tech and outcomes>"
      ]
    }
  ],
  "education": [
    {
      "institution": "<school / university name>",
      "degree": "<degree and major (e.g., Bachelor of Technology in Computer Science)>",
      "dates": "<graduation year or start - end dates>",
      "grade": "<grade / CGPA / percentage or empty string if not provided>"
    }
  ],
  "referralCard": "<a short AI-generated referral blurb (150-200 words) written in the first person from the perspective of an employee referee (colleague or alumnus). It should summarize the candidate's core strengths, projects, and impact, serving as a ready-to-use template for submitting a referral internally.>"
}

IMPORTANT: Return ONLY the JSON object, no markdown code blocks, no explanations. Ensure it is perfectly valid JSON.`;

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
        temperature: 0.3,
        ...(isGroq ? { response_format: { type: "json_object" } } : { max_tokens: 2500 })
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Grok API Error:", errorText)
      return NextResponse.json({ 
        error: `AI resume generation failed: ${response.status}` 
      }, { status: 500 })
    }

    const grokData = await response.json()
    let content = grokData.choices[0].message.content.trim()
    
    content = content.replace(/```json\s*/g, '')
    content = content.replace(/```\s*/g, '')
    content = content.trim()

    let parsedResult;
    try {
      parsedResult = JSON.parse(content)
    } catch (parseError) {
      console.error("Failed to parse JSON from generator AI:", content)
      return NextResponse.json({ error: "Failed to generate structured resume JSON from AI." }, { status: 500 })
    }

    // Deduct 1 credit if not first-time, or mark first-time used
    let creditsDeducted = 0
    try {
      if (isFirstTime) {
        const { error: updateErr } = await supabaseAdmin
          .from('jobseekers')
          .update({
            has_used_resume_builder: true
          })
          .eq('id', jobseeker.id)

        if (updateErr) {
          console.error("Failed to mark has_used_resume_builder for jobseeker:", updateErr)
        } else {
          console.log(`[RESUME_GENERATE_API] First-time free use completed for user: ${userId}`)
        }
      } else {
        let newSubCredits = jobseeker.subscription_credits || 0
        let newPurCredits = jobseeker.purchased_credits || 0
        if (newSubCredits > 0) {
          newSubCredits -= 1
        } else if (newPurCredits > 0) {
          newPurCredits -= 1
        }
        creditsDeducted = 1

        const { error: updateErr } = await supabaseAdmin
          .from('jobseekers')
          .update({
            subscription_credits: newSubCredits,
            purchased_credits: newPurCredits,
            has_used_resume_builder: true
          })
          .eq('id', jobseeker.id)

        if (updateErr) {
          console.error("Failed to deduct credit from jobseeker:", updateErr)
        } else {
          console.log(`[RESUME_GENERATE_API] Deducted 1 credit for user: ${userId}. Remaining credits: ${newSubCredits + newPurCredits}`)
        }
      }
    } catch (creditErr) {
      console.error("Failed to charge credit for resume generation:", creditErr)
    }

    return NextResponse.json({
      ...parsedResult,
      _creditsDeducted: creditsDeducted,
      _isFirstTime: isFirstTime
    })

  } catch (error: any) {
    console.error("Resume Generate API Error:", error)
    return NextResponse.json({ 
      error: "Internal Server Error",
      message: error.message 
    }, { status: 500 })
  }
}
