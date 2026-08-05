const fs = require('fs');
const path = require('path');
const pdfModule = require('pdf-parse');
const PDFParseClass = pdfModule.PDFParse;
async function parsePDF(buffer) {
  const parser = new PDFParseClass({ data: buffer });
  const res = await parser.getText();
  return { text: res.text };
}
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env' });

async function runLocalAts() {
  const pdfPath = 'C:\\Users\\Rahul Naik G\\OneDrive - Dhruv Compusoft Consultancy Pvt Ltd\\Desktop\\sample\\design\\AutoJobApply\\resume.pdf';
  if (!fs.existsSync(pdfPath)) {
    console.error("PDF file not found at " + pdfPath);
    return;
  }
  
  const buffer = fs.readFileSync(pdfPath);
  console.log("Parsing PDF file...");
  
  let resumeText = "";
  try {
    const data = await parsePDF(buffer);
    resumeText = data.text;
    console.log("Parsed text length:", resumeText.length);
    console.log("First 300 characters of parsed text:\n", resumeText.substring(0, 300));
  } catch (err) {
    console.error("PDF parse failed:", err);
    return;
  }
  
  if (!resumeText || resumeText.trim().length === 0) {
    console.error("No text extracted from PDF!");
    return;
  }

  const apiKey = process.env.GROK_API_KEY || process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("No GROK_API_KEY or GROQ_API_KEY found in .env file.");
    return;
  }
  const isGroq = apiKey.startsWith("gsk_");
  const apiUrl = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.x.ai/v1/chat/completions";
  const apiModel = isGroq ? "llama-3.3-70b-versatile" : "grok-2-latest";
  
  console.log(`Using API model: ${apiModel} via URL: ${apiUrl}`);

  const truncatedResume = resumeText.length > 12000 ? resumeText.substring(0, 12000) + "..." : resumeText;
  const jobDescription = 'Looking for a Software Engineer with experience in React, Next.js, Node.js, and TypeScript.';
  
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
${jobDescription}
"""

IMPORTANT: Return ONLY the JSON object, no markdown code blocks (e.g., no \`\`\`json), no explanations. Ensure it is perfectly valid JSON.`;

  console.log("Calling completions API...");
  try {
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
        temperature: 0.2
      })
    });

    console.log("Response status:", response.status);
    const text = await response.text();
    console.log("Raw Response Content:\n", text);
  } catch (err) {
    console.error("API Call failed:", err);
  }
}

runLocalAts();
