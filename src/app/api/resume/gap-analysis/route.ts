import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { resumeData, jobDescription } = body

    if (!resumeData || !jobDescription) {
      return NextResponse.json({ error: "Missing required fields: resumeData and jobDescription" }, { status: 400 })
    }

    const apiKey = process.env.GROK_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key is missing. Please configure it in your environment." }, { status: 500 })
    }
    const isGroq = apiKey.startsWith("gsk_");
    const apiUrl = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.x.ai/v1/chat/completions";
    const apiModel = isGroq ? "llama-3.3-70b-versatile" : "grok-2-latest";

    const prompt = `You are an expert ATS (Applicant Tracking System) algorithm simulator and technical recruiter.
Analyze the candidate's resume and compare it against the target Job Description to identify keyword gaps, formatting alignment, and section completeness.

Candidate Resume Data:
${JSON.stringify(resumeData)}

Target Job Description:
"""
${jobDescription}
"""

Evaluate compatibility and return a JSON object with:
- score: overall compatibility score (number between 0 and 100).
- keywordMatch: keyword match rate percentage (number between 0 and 100).
- missingKeywords: array of string (up to 8 high-priority missing technical/soft skills or keywords from the JD).
- suggestedAdditions: array of object, where each object explains how/where to incorporate a missing skill:
  {
    "keyword": "<the missing skill/keyword>",
    "suggestion": "<actionable advice on where to include it in the resume (e.g., 'Add Python to your skills list and mention developing data pipelines under Experience')>"
  }

Return ONLY a valid JSON object matching this schema:
{
  "score": <number>,
  "keywordMatch": <number>,
  "missingKeywords": [<array of string>],
  "suggestedAdditions": [
    {
      "keyword": "string",
      "suggestion": "string"
    }
  ]
}`;

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
      console.error("Gap Analysis API Error:", errorText)
      return NextResponse.json({ error: "Failed to perform gap analysis" }, { status: response.status })
    }

    const grokData = await response.json()
    let content = grokData.choices[0].message.content.trim()

    content = content.replace(/```json\s*/g, '')
    content = content.replace(/```\s*/g, '')
    content = content.trim()

    let parsedResult = JSON.parse(content)
    return NextResponse.json(parsedResult)

  } catch (error: any) {
    console.error("Gap Analysis handler error:", error)
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 })
  }
}
