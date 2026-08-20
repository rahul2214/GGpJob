const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

const apiKey = process.env.GROQ_API_KEY;

async function testFullParse() {
  const resumeText = `Rahul Naik
  Phone: +91 6302806154
  Email: dyrahulnaik22@gmail.com
  Domain: Software Engineering
  Skills: React, Next.js, Node.js, TypeScript, PostgreSQL, Supabase, Tailwind CSS
  Experience:
    - Junior Software Engineer at Dhruv Technology Solutions (2024-Present)
      Built AI resume parser and job portal web application.
    - Full Stack Developer Intern at 24HR7 Commerce (2023-2024)
  Education:
    - B.Tech in Computer Science, JNTU (2020-2024), Grade 8.2 CGPA
  Projects:
    - JobsDart Portal: Full-stack recruitment platform
  Achievements:
    - Won Hackathon 2024
  Certifications:
    - AWS Certified Cloud Practitioner
  `;

  const prompt = `You are an expert resume parser. Extract structured profile data from the candidate's resume.
  You must reply with ONLY a valid JSON object matching this exact schema:
  {
    "phone": "6302806154",
    "domain": "Software Engineering",
    "linkedinUrl": "",
    "githubUrl": "",
    "portfolioUrl": "",
    "skills": ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "Supabase", "Tailwind CSS"],
    "education": [
      {
        "institution": "JNTU",
        "degree": "B.Tech",
        "fieldOfStudy": "Computer Science",
        "startDate": "2020-01",
        "endDate": "2024-05",
        "grade": "8.2 CGPA",
        "description": "",
        "isCurrent": false
      }
    ],
    "experience": [
      {
        "company": "Dhruv Technology Solutions",
        "title": "Junior Software Engineer",
        "location": "",
        "employmentType": "Full-time",
        "startDate": "2024-01",
        "endDate": "",
        "isCurrent": true,
        "description": "Built AI resume parser and job portal web application."
      }
    ],
    "projects": [
      {
        "name": "JobsDart Portal",
        "description": "Full-stack recruitment platform",
        "url": "",
        "startDate": "",
        "endDate": ""
      }
    ],
    "achievements": ["Won Hackathon 2024"],
    "certifications": ["AWS Certified Cloud Practitioner"]
  }

  Resume Text:
  """
  ${resumeText}
  """`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
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
      response_format: { type: "json_object" }
    })
  });

  console.log("Response status:", response.status);
  if (response.ok) {
    const grokData = await response.json();
    console.log("🎉 SUCCESS! AI Resume Parsing Output:\n", grokData.choices[0].message.content);
  } else {
    console.error("API error:", await response.text());
  }
}

testFullParse();
