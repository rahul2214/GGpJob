import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { section, role, skills, rawText } = body

    if (!section || !role) {
      return NextResponse.json({ error: "Missing required fields: section and role" }, { status: 400 })
    }

    const apiKey = process.env.GROK_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key is missing. Please configure it in your environment." }, { status: 500 })
    }
    const isGroq = apiKey.startsWith("gsk_");
    const apiUrl = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.x.ai/v1/chat/completions";
    const apiModel = isGroq ? "llama-3.3-70b-versatile" : "grok-2-latest";

    let prompt = "";
    if (section === 'experience') {
      prompt = `You are an expert resume writer. Help a candidate optimize their work experience accomplishments.
Job Title / Role: ${role}
Candidate Skills: ${skills || "Not provided"}
Current Accomplishment Bullet (if any): "${rawText || ""}"

Generate 3 high-impact, quantified resume bullet points for this role that incorporate the candidate's skills where appropriate. 
Each bullet point MUST start with a strong action verb and follow the Action-Context-Result structure, including clear metrics (e.g. percentages, times, or amounts like "reduced latency by 30%").
Also provide a list of 5 powerful, context-appropriate action verbs.

Return ONLY a valid JSON object matching this schema:
{
  "suggestions": [
    "bullet point 1",
    "bullet point 2",
    "bullet point 3"
  ],
  "actionVerbs": [
    "verb 1",
    "verb 2",
    "verb 3",
    "verb 4",
    "verb 5"
  ]
}`;
    } else {
      prompt = `You are an expert resume writer. Help a candidate write their professional summary.
Job Title / Role: ${role}
Candidate Skills: ${skills || "Not provided"}
Current Summary draft (if any): "${rawText || ""}"

Generate 3 high-impact, professional summaries (about 2-3 sentences each) tailored to this role and highlighting relevant skills and achievements. Include metrics or numbers if appropriate.
Also provide a list of 5 strong adjectives or keywords to describe the candidate (e.g. "results-driven", "innovative").

Return ONLY a valid JSON object matching this schema:
{
  "suggestions": [
    "summary option 1",
    "summary option 2",
    "summary option 3"
  ],
  "actionVerbs": [
    "adjective 1",
    "adjective 2",
    "adjective 3",
    "adjective 4",
    "adjective 5"
  ]
}`;
    }

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
        ...(isGroq ? { response_format: { type: "json_object" } } : { max_tokens: 1000 })
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("AI Assist API Error:", errorText)
      return NextResponse.json({ error: "Failed to generate suggestions" }, { status: response.status })
    }

    const grokData = await response.json()
    let content = grokData.choices[0].message.content.trim()

    content = content.replace(/```json\s*/g, '')
    content = content.replace(/```\s*/g, '')
    content = content.trim()

    let parsedResult = JSON.parse(content)
    return NextResponse.json(parsedResult)

  } catch (error: any) {
    console.error("AI Assist API handler error:", error)
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 })
  }
}
