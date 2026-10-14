import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  "slug": "how-to-create-an-ats-friendly-resume-2026",
  "tint": "indigo",
  "title": "How to Create an ATS-Friendly Resume in 2026 (Format, Template & Rules)",
  "heading": "How to create an ATS-friendly resume in 2026",
  "description": "Learn how to build a 100% ATS-compliant resume in 2026: safe fonts, single-column formatting, section headings, and keyword matching that passes applicant tracking systems.",
  "keywords": [
    "ATS-friendly resume",
    "how to make resume ATS compliant",
    "ATS resume format 2026",
    "applicant tracking system resume template",
    "pass ATS test"
  ],
  "publishedAt": "2026-10-14",
  "updatedAt": "2026-10-14",
  "author": "JobsDart Editorial",
  "readingMinutes": 8,
  "category": "Resume & ATS",
  "anchors": [
    "create an ATS-friendly resume",
    "ATS-friendly resume format"
  ],
  "excerpt": "Over 70% of resumes are rejected by applicant tracking systems before a human recruiter reads them. Here is the exact technical formatting required to pass modern ATS parsers in 2026.",
  "keyTakeaways": [
    "Two-column formats, text boxes, and embedded graphical icons frequently scramble ATS text extraction.",
    "Use standard reverse-chronological layout with unambiguous headings: Experience, Education, Skills, and Projects.",
    "Match exact keywords from the target job posting in natural context within your bullet points.",
    "Always export to clean text-based PDF or docx; never submit scanned image files."
  ],
  "sections": [
    {
      "heading": "How modern applicant tracking systems parse candidate resumes",
      "paragraphs": [
        "An Applicant Tracking System (such as Workday, Greenhouse, Taleo, or Lever) does not read your resume with human aesthetic eyes. It uses an automated text extraction pipeline: parsing layout streams, tokenizing words, and categorizing blocks into structured relational records (candidate name, contact information, work history dates, job titles, and verified skill tokens).",
        "When candidates use fancy graphic design templates with sidebars, progress bars for skills (like \"Python: 80%\"), or text boxes, the parsing engine frequently extracts words out of order. A candidate with ten years of experience may appear to have zero because their dates were embedded in an unreadable float box."
      ],
      "bullets": [
        "Standard single-column layouts achieve 99%+ text extraction accuracy across all ATS engines",
        "Multi-column layouts risk merging left and right column text into nonsensical sentences",
        "Header and footer text is often ignored by older enterprise parsers; keep contact info in the main body"
      ]
    },
    {
      "heading": "Formatting rules that guarantee ATS compliance",
      "paragraphs": [
        "Adhering to these structural rules ensures that your resume is parsed cleanly by any screening algorithm."
      ],
      "table": {
        "caption": "ATS Safe Formatting Checklist",
        "columns": [
          "Resume Element",
          "ATS Safe Choice",
          "Dangerous (Avoid)"
        ],
        "rows": [
          [
            "Layout",
            "Single-column top-to-bottom flow",
            "Two-column split, floating sidebars"
          ],
          [
            "File Format",
            "Text-based PDF or .docx",
            "Scanned image PDF, .pages, .png"
          ],
          [
            "Fonts",
            "Calibri, Arial, Inter, Roboto (10–12pt)",
            "Custom decorative fonts, script fonts"
          ],
          [
            "Section Titles",
            "Experience, Education, Skills, Projects",
            "Clever titles like \"Where I’ve Been\", \"Toolbox\""
          ],
          [
            "Skills Representation",
            "Comma-separated text list",
            "Graphical skill meters, rating stars, logos"
          ],
          [
            "Contact Information",
            "Top of page, plain body text",
            "Inside header/footer margins, embedded in image"
          ]
        ]
      }
    },
    {
      "heading": "How to inject keywords without sounding like spam",
      "paragraphs": [
        "Passing the ATS keyword filter requires matching the specific taxonomy used in the job description. If a job posting requires \"PostgreSQL\", having only \"SQL\" on your resume may score lower in algorithmic matching.",
        "However, never engage in keyword stuffing or hiding white text. Modern ATS algorithms detect keyword stuffing and penalize submissions. Instead, weave keywords directly into impact bullet points following the STAR (Situation, Task, Action, Result) methodology."
      ],
      "bullets": [
        "Include the exact tool name (e.g., \"Docker\", \"TypeScript\", \"AWS S3\") in your experience descriptions",
        "Quantify outcomes: mention percentages, latency reductions, user scale, and revenue impact",
        "Run your completed resume through the JobsDart ATS Resume Checker to verify your score before submitting"
      ]
    }
  ],
  "faqs": [
    {
      "q": "Is PDF or Word (.docx) better for ATS?",
      "a": "Both are widely supported. A text-based PDF is preferred because it preserves formatting across different operating systems. Just ensure you can highlight and copy the text inside your PDF viewer."
    },
    {
      "q": "Do ATS systems automatically reject resumes with low match scores?",
      "a": "Most systems sort candidates by match score rather than auto-rejecting. However, recruiters usually only review the top 10–20% of ranked candidates, making a high score crucial."
    }
  ],
  "related": [
    "why-is-your-resume-getting-rejected-12-mistakes",
    "how-to-improve-your-ats-resume-score-before-applying",
    "best-resume-format-for-freshers-with-no-experience"
  ],
  "references": [
    {
      "title": "W3C Document Formatting and Text Semantics Standards",
      "url": "https://www.w3.org",
      "publisher": "W3C",
      "note": "International web and document formatting accessibility recommendations."
    },
    {
      "title": "Schema.org Occupation and Resume Vocabulary",
      "url": "https://schema.org",
      "publisher": "Schema.org",
      "note": "Structured metadata schemas used by search engines and enterprise recruiters to categorize resumes."
    }
  ]
};

export default post;
