import { NextRequest, NextResponse } from "next/server"

// Force nodejs runtime for pdf-parse compatibility
export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

const GROK_API_URL = "https://api.x.ai/v1/chat/completions"

// Helper function to load pdf-parse
async function loadPDFParse() {
  // Use createRequire approach
  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  
  try {
    const pdfParse = require('pdf-parse');
    return pdfParse;
  } catch (error) {
    console.error("Failed to load pdf-parse:", error);
    throw new Error("PDF parsing library not available");
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const jobDescription = formData.get("jobDescription") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (!process.env.GROK_API_KEY) {
      return NextResponse.json({ error: "Grok API Key is missing. Please configure GROK_API_KEY." }, { status: 500 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Load pdf-parse dynamically
    const pdfParse = await loadPDFParse();
    
    // Parse PDF
    let resumeText = "";
    try {
      const data = await pdfParse(buffer);
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
Analyze the candidate's resume and provide a compatibility score and feedback.

You must reply with ONLY a valid JSON object matching this exact schema:
{
  "score": <number between 0 and 100>,
  "strengths": [<array of string, up to 3 key strengths or matches>],
  "feedback": [<array of string, 3 to 5 actionable suggestions for improvement>]
}

Resume Text:
"""
${truncatedResume}
"""

Job Description:
"""
${truncatedJobDesc || "Not provided. Score based on general ATS best practices such as formatting, keywords, and action verbs."}
"""

IMPORTANT: Return ONLY the JSON object, no markdown, no explanations.`

    // Call Grok API
    const response = await fetch(GROK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: "grok-2-latest",
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
        max_tokens: 800,
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
      
      // Validate the response structure
      if (typeof parsedResult.score !== 'number' || 
          !Array.isArray(parsedResult.strengths) || 
          !Array.isArray(parsedResult.feedback)) {
        throw new Error('Invalid response structure')
      }
      
      // Ensure score is within bounds
      parsedResult.score = Math.min(100, Math.max(0, parsedResult.score))
      
      // Limit arrays to reasonable sizes
      parsedResult.strengths = parsedResult.strengths.slice(0, 3)
      parsedResult.feedback = parsedResult.feedback.slice(0, 5)
      
    } catch (parseError) {
      console.error("Failed to parse JSON from AI:", content)
      // Return a fallback response
      return NextResponse.json({
        score: 50,
        strengths: ["Resume submitted successfully"],
        feedback: ["Unable to perform detailed analysis. Please try again with a different PDF format."]
      })
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