import { NextRequest, NextResponse } from "next/server"
import { parseResumeDocument } from "@/lib/parse-document"
import { getAuthenticatedUser } from "@/lib/auth-server"
import { validateFileContent, RESUME_FILE_RULES } from "@/lib/upload-validation"

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Authenticated user if available, otherwise anonymous callers (governed by middleware rate limiter)
    const authUser = await getAuthenticatedUser(req);

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded. Please select a resume file." }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit. Please upload a smaller file." }, { status: 413 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Security validation against magic bytes and allowed resume extensions (.pdf, .docx, .doc)
    const fileCheck = validateFileContent(buffer, file.name, file.type, RESUME_FILE_RULES)
    if (!fileCheck.ok) {
      return NextResponse.json({ error: fileCheck.error }, { status: 400 })
    }

    // Parse Document (PDF / DOCX / DOC)
    let resumeText = "";
    try {
      const data = await parseResumeDocument(buffer, file.name, fileCheck.contentType);
      resumeText = data.text;
    } catch (docError: any) {
      console.error("Document Parse Error:", docError);
      return NextResponse.json({ 
        error: "Failed to parse document. Please ensure it is a valid text-based PDF or Word (.docx, .doc) document.",
        details: docError?.message || String(docError)
      }, { status: 400 });
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json({ 
        error: "Could not extract text from the file. Please ensure it is not an empty or scanned image document." 
      }, { status: 400 })
    }

    const apiKey = process.env.GROK_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn("GROK/GROQ API key not found. Using heuristic extraction.");
      const fallbackData = extractHeuristicFallback(resumeText);
      return NextResponse.json(fallbackData);
    }

    const isGroq = apiKey.startsWith("gsk_");
    const apiUrl = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.x.ai/v1/chat/completions";
    const apiModel = isGroq ? "openai/gpt-oss-120b" : "grok-2-latest";

    const truncatedResume = resumeText.length > 12000 ? resumeText.substring(0, 12000) + "..." : resumeText;

    const prompt = `You are an expert resume parser. Extract structured profile data from the candidate's resume.
Extract the candidate's full name, current/target professional role, email address, phone number, location (city, state/country), professional summary/objective, standard professional domain, linkedin url, github url, personal portfolio/website url, key skills, skill categories, languages known, education details, experience details, project details, achievements, and certifications.

Resumes may contain hyperlinks that are extracted and appended as '[Hyperlinks in PDF: ...]'. Look at these hyperlinks carefully to resolve the full URLs for linkedin, github, portfolio, and projects.

You must reply with ONLY a valid JSON object matching this exact schema:
{
  "name": "<candidate's full name, empty string if not found>",
  "role": "<candidate's target or current job title/role, e.g. Full Stack Developer, Product Manager, Data Scientist, empty string if not found>",
  "email": "<candidate's email address, empty string if not found>",
  "phone": "<extracted phone number, containing only numbers. Empty string if not found or invalid>",
  "location": "<candidate's location, e.g. City, State or City, Country, empty string if not found>",
  "summary": "<candidate's professional summary or bio/objective paragraph, empty string if not found>",
  "domain": "<most suitable job domain, choose exactly one from: Software Engineering, Product Management, Marketing, Sales, Data Science, Design, Finance, Human Resources, Operations. Default to Software Engineering if uncertain>",
  "linkedinUrl": "<extracted linkedin profile url, empty string if not found>",
  "githubUrl": "<extracted github profile url, empty string if not found>",
  "portfolioUrl": "<extracted personal portfolio or website url, empty string if not found>",
  "skills": [<array of strings representing key skills/technologies found, up to 25 items>],
  "skillCategories": [
    {
      "category": "<e.g., Languages, Frameworks/Libraries, Databases, Tools/DevOps>",
      "skills": ["<skill 1>", "<skill 2>"]
    }
  ],
  "languages": [<array of strings representing languages known, e.g. ["English", "Spanish", "Hindi"]>],
  "education": [
    {
      "institution": "<school/university name>",
      "degree": "<degree, e.g. B.Tech, BS, MS, High School>",
      "fieldOfStudy": "<field of study or major, e.g. Computer Science>",
      "startDate": "<start date in YYYY-MM format, or YYYY format if month not available, empty if not found>",
      "endDate": "<end date in YYYY-MM format, or YYYY format, empty if current or not found>",
      "grade": "<CGPA/percentage/grade, empty if not found>",
      "description": "<optional notes, descriptions or details about this education, empty if not found>",
      "isCurrent": <true if currently studying here, false otherwise>
    }
  ],
  "experience": [
    {
      "company": "<company name>",
      "title": "<job title / designation>",
      "location": "<location/city, empty if not found>",
      "employmentType": "<choose one from: Full-time, Part-time, Contract, Internship. Default to Full-time if uncertain>",
      "startDate": "<start date in YYYY-MM format, or YYYY format, empty if not found>",
      "endDate": "<end date in YYYY-MM format, or YYYY format, empty if current or not found>",
      "isCurrent": <true if currently working here, false otherwise>,
      "description": "<detailed description of duties/responsibilities/achievements, empty if not found>",
      "bullets": [<array of strings where each element is an individual accomplishment bullet point>]
    }
  ],
  "projects": [
    {
      "name": "<project name>",
      "techStack": "<technologies/frameworks used in this project, e.g. React, Node.js, PostgreSQL>",
      "description": "<short description of the project, what was built>",
      "url": "<project URL/link, e.g. github repo, live link, or matching hyperlink from the document, empty if not found>",
      "startDate": "<start date in YYYY-MM format, or YYYY format, empty if not found>",
      "endDate": "<end date in YYYY-MM format, or YYYY format, empty if not found>",
      "bullets": [<array of strings where each element is a bullet point describing the project work and impact>]
    }
  ],
  "achievements": [<array of strings representing key achievements, awards, or key highlights found in the resume>],
  "certifications": [<array of strings representing names of certifications, licenses, or courses completed>]
}

Resume Text:
\"\"\"
${truncatedResume}
\"\"\"

IMPORTANT: Return ONLY the JSON object, no markdown code blocks, no explanations. Ensure it is perfectly valid JSON.`;

    let response = await fetch(apiUrl, {
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
        ...(isGroq ? { response_format: { type: "json_object" } } : { max_tokens: 2500 })
      })
    });

    if (!response.ok && isGroq) {
      console.warn(`Primary model ${apiModel} failed (${response.status}). Trying fallback llama-3.3-70b-versatile / gpt-oss-20b...`);
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content: "You are a precise API that returns only valid JSON objects."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }
        })
      });
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error("AI Parser API Error:", errorText)
      // Fallback to heuristic parser instead of returning 500 error
      const fallbackData = extractHeuristicFallback(resumeText);
      return NextResponse.json(fallbackData);
    }

    const aiData = await response.json()
    let content = aiData.choices?.[0]?.message?.content?.trim() || "{}"
    
    content = content.replace(/```json\s*/gi, '')
    content = content.replace(/```\s*/g, '')
    content = content.trim()

    let parsedResult: any;
    try {
      parsedResult = JSON.parse(content)
    } catch (parseError) {
      console.error("Failed to parse JSON from AI, attempting heuristic fallback:", content)
      parsedResult = extractHeuristicFallback(resumeText);
    }

    // Clean and normalize all extracted fields
    const sanitized = sanitizeParsedResume(parsedResult, resumeText);
    return NextResponse.json(sanitized);

  } catch (error: any) {
    console.error("Resume Parse API Error:", error)
    return NextResponse.json({ 
      error: "Internal Server Error",
      message: error.message 
    }, { status: 500 })
  }
}

/**
 * Sanitizes and formats the raw JSON response to guarantee all properties
 * conform to the schema required by both the onboarding flow and resume builder.
 */
function sanitizeParsedResume(data: any, originalText: string): Record<string, any> {
  const result: Record<string, any> = { ...data };

  // Candidate Name
  result.name = typeof result.name === 'string' ? result.name.trim() : "";
  if (!result.name) {
    const firstLine = originalText.split(/\r?\n/).map(l => l.trim()).find(l => l.length > 2 && l.length < 50 && !l.includes("@") && !l.includes("http"));
    if (firstLine) result.name = firstLine.replace(/[^a-zA-Z\s.-]/g, "").trim();
  }

  // Candidate Role
  result.role = typeof result.role === 'string' ? result.role.trim() : "";

  // Email
  result.email = typeof result.email === 'string' ? result.email.trim() : "";
  if (!result.email) {
    const emailMatch = originalText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) result.email = emailMatch[0];
  }

  // Phone
  if (result.phone && typeof result.phone === 'string') {
    const digits = result.phone.replace(/\D/g, "");
    result.phone = digits.length >= 10 ? digits.slice(-10) : digits;
  } else {
    const phoneMatch = originalText.match(/(?:(?:\+?(\d{1,3}))?[-.\s]?)?(?:\(?(\d{3})\)?[-.\s]?)?(\d{3})[-.\s]?(\d{4})/);
    result.phone = phoneMatch ? phoneMatch[0].replace(/\D/g, "").slice(-10) : "";
  }

  // Location
  result.location = typeof result.location === 'string' ? result.location.trim() : "";

  // Summary
  result.summary = typeof result.summary === 'string' ? result.summary.trim() : "";

  // Domain
  result.domain = typeof result.domain === 'string' && result.domain.trim() ? result.domain.trim() : "Software Engineering";

  // Social Links
  result.linkedinUrl = typeof result.linkedinUrl === 'string' ? result.linkedinUrl.trim() : "";
  result.githubUrl = typeof result.githubUrl === 'string' ? result.githubUrl.trim() : "";
  result.portfolioUrl = typeof result.portfolioUrl === 'string' ? result.portfolioUrl.trim() : "";

  // Skills (Flat list)
  result.skills = Array.isArray(result.skills) ? result.skills.filter((s: any) => typeof s === 'string' && s.trim().length > 0) : [];

  // Skill Categories
  if (Array.isArray(result.skillCategories) && result.skillCategories.length > 0) {
    result.skillCategories = result.skillCategories.map((cat: any) => ({
      category: typeof cat.category === 'string' && cat.category.trim() ? cat.category.trim() : "Skills",
      skills: Array.isArray(cat.skills) ? cat.skills.filter((s: any) => typeof s === 'string' && s.trim().length > 0) : []
    })).filter((cat: any) => cat.skills.length > 0);
  } else if (result.skills.length > 0) {
    result.skillCategories = [{ category: "Skills", skills: result.skills }];
  } else {
    result.skillCategories = [];
  }

  // Languages
  result.languages = Array.isArray(result.languages) ? result.languages.filter((l: any) => typeof l === 'string' && l.trim().length > 0) : [];

  // Education
  result.education = Array.isArray(result.education) ? result.education.map((edu: any) => ({
    institution: edu.institution || edu.school || "",
    degree: edu.degree || "",
    fieldOfStudy: edu.fieldOfStudy || edu.field_of_study || "",
    startDate: edu.startDate || "",
    endDate: edu.isCurrent ? "" : (edu.endDate || ""),
    grade: edu.grade || "",
    description: edu.description || "",
    isCurrent: !!edu.isCurrent
  })) : [];

  // Experience
  result.experience = Array.isArray(result.experience) ? result.experience.map((exp: any) => {
    let bullets: string[] = [];
    if (Array.isArray(exp.bullets) && exp.bullets.length > 0) {
      bullets = exp.bullets.filter((b: any) => typeof b === 'string' && b.trim().length > 0);
    } else if (exp.description) {
      bullets = String(exp.description).split(/\r?\n/).map(s => s.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
    }
    return {
      company: exp.company || "",
      title: exp.title || exp.role || "",
      location: exp.location || "",
      employmentType: ["Full-time", "Part-time", "Contract", "Internship"].includes(exp.employmentType) ? exp.employmentType : "Full-time",
      startDate: exp.startDate || "",
      endDate: exp.isCurrent ? "" : (exp.endDate || ""),
      isCurrent: !!exp.isCurrent,
      description: exp.description || bullets.join("\n"),
      bullets: bullets
    };
  }) : [];

  // Projects
  result.projects = Array.isArray(result.projects) ? result.projects.map((proj: any) => {
    let bullets: string[] = [];
    if (Array.isArray(proj.bullets) && proj.bullets.length > 0) {
      bullets = proj.bullets.filter((b: any) => typeof b === 'string' && b.trim().length > 0);
    } else if (proj.description) {
      bullets = String(proj.description).split(/\r?\n/).map(s => s.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
    }
    return {
      name: proj.name || "",
      techStack: proj.techStack || proj.technologies || "",
      description: proj.description || bullets.join("\n"),
      url: proj.url || proj.projectLink || "",
      startDate: proj.startDate || "",
      endDate: proj.endDate || "",
      bullets: bullets
    };
  }) : [];

  // Achievements & Certifications
  result.achievements = Array.isArray(result.achievements) ? result.achievements.filter((a: any) => typeof a === 'string' && a.trim().length > 0) : [];
  result.certifications = Array.isArray(result.certifications) ? result.certifications.filter((c: any) => typeof c === 'string' && c.trim().length > 0) : [];

  return result;
}

/**
 * Heuristic fallback extraction in case of AI outage or rate limit.
 */
function extractHeuristicFallback(text: string): Record<string, any> {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "";

  // Phone
  const phoneMatch = text.match(/(?:(?:\+?(\d{1,3}))?[-.\s]?)?(?:\(?(\d{3})\)?[-.\s]?)?(\d{3})[-.\s]?(\d{4})/);
  const phone = phoneMatch ? phoneMatch[0].replace(/\D/g, "").slice(-10) : "";

  // Social URLs
  const linkedinMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i) || text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = text.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i) || text.match(/github\.com\/[a-zA-Z0-9_-]+/i);
  const portfolioMatch = text.match(/https?:\/\/(?!(?:www\.)?(?:linkedin|github)\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i);

  // Name (candidate name is usually top line)
  let name = "";
  if (lines.length > 0 && lines[0].length < 40 && !lines[0].includes("@") && !lines[0].includes("http")) {
    name = lines[0].replace(/[^a-zA-Z\s.-]/g, "").trim();
  }

  // Role (second line often has the headline)
  let role = "";
  if (lines.length > 1 && lines[1].length < 50 && !lines[1].includes("@") && !lines[1].includes("http")) {
    role = lines[1].trim();
  }

  return {
    name,
    role,
    email,
    phone,
    location: "",
    summary: "",
    domain: "Software Engineering",
    linkedinUrl: linkedinMatch ? (linkedinMatch[0].startsWith("http") ? linkedinMatch[0] : `https://${linkedinMatch[0]}`) : "",
    githubUrl: githubMatch ? (githubMatch[0].startsWith("http") ? githubMatch[0] : `https://${githubMatch[0]}`) : "",
    portfolioUrl: portfolioMatch ? (portfolioMatch[0].startsWith("http") ? portfolioMatch[0] : `https://${portfolioMatch[0]}`) : "",
    skills: [],
    skillCategories: [],
    languages: [],
    education: [],
    experience: [],
    projects: [],
    achievements: [],
    certifications: []
  };
}
