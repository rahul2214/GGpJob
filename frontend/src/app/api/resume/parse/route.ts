import { NextRequest, NextResponse } from "next/server"
import { parsePDF } from "@/lib/parse-pdf"

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

const GROK_API_URL = "https://api.x.ai/v1/chat/completions"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 2MB limit." }, { status: 413 })
    }

    const apiKey = process.env.GROK_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key (GROK_API_KEY or GROQ_API_KEY) is missing. Please configure it in your environment." }, { status: 500 })
    }
    const isGroq = apiKey.startsWith("gsk_");
    const apiUrl = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.x.ai/v1/chat/completions";
    const apiModel = isGroq ? "llama-3.3-70b-versatile" : "grok-2-latest";

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

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

    const truncatedResume = resumeText.length > 12000 ? resumeText.substring(0, 12000) + "..." : resumeText;

    const prompt = `You are an expert resume parser. Extract structured profile data from the candidate's resume.
Extract the phone number, standard professional domain, linkedin url, github url, and key skills.

You must reply with ONLY a valid JSON object matching this exact schema:
{
  "phone": "<extracted 10-digit phone number, containing only numbers. Empty string if not found or invalid>",
  "domain": "<most suitable job domain, choose exactly one from: Software Engineering, Product Management, Marketing, Sales, Data Science, Design, Finance, Human Resources, Operations. Default to Software Engineering if uncertain>",
  "linkedinUrl": "<extracted linkedin profile url, empty string if not found>",
  "githubUrl": "<extracted github profile url, empty string if not found>",
  "skills": [<array of strings representing key skills/technologies found, up to 15 items>]
}

Resume Text:
"""
${truncatedResume}
"""

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
        temperature: 0.1,
        ...(isGroq ? { response_format: { type: "json_object" } } : { max_tokens: 600 })
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Grok API Error:", errorText)
      return NextResponse.json({ 
        error: `AI parsing failed: ${response.status}` 
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
      
      // Clean up phone (remove non-digits, take last 10 characters)
      if (parsedResult.phone) {
        const digits = parsedResult.phone.replace(/\D/g, "")
        parsedResult.phone = digits.length >= 10 ? digits.slice(-10) : digits
      } else {
        parsedResult.phone = ""
      }
      
      parsedResult.domain = parsedResult.domain || "Software Engineering"
      parsedResult.linkedinUrl = parsedResult.linkedinUrl || ""
      parsedResult.githubUrl = parsedResult.githubUrl || ""
      parsedResult.skills = Array.isArray(parsedResult.skills) ? parsedResult.skills : []

    } catch (parseError) {
      console.error("Failed to parse JSON from parser AI:", content)
      return NextResponse.json({
        phone: "",
        domain: "Software Engineering",
        linkedinUrl: "",
        githubUrl: "",
        skills: []
      })
    }

    return NextResponse.json(parsedResult)

  } catch (error: any) {
    console.error("Resume Parse API Error:", error)
    return NextResponse.json({ 
      error: "Internal Server Error",
      message: error.message 
    }, { status: 500 })
  }
}
